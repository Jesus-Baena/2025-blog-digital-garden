#!/usr/bin/env node
// Translate English notes into Spanish with Claude, keeping frontmatter and links intact.
//
//   node scripts/translate.mjs                      # translate every missing or stale note
//   node scripts/translate.mjs content/posts/x.md   # translate one note
//   node scripts/translate.mjs --dry-run            # list what would be translated
//   node scripts/translate.mjs --model claude-sonnet-5
//
// Credentials: ANTHROPIC_API_KEY, or a profile from `ant auth login`.
// Output goes to content/es/<same path>, with `lang: es-ES` and `source_hash` set so
// translation-status.mjs can tell when the English source changes again.
// Review the Spanish text before committing: it is a draft, not a final translation.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"
import Anthropic from "@anthropic-ai/sdk"
import { parseNote, stringifyNote } from "./lib/frontmatter.mjs"
import { status, sourceHash } from "./translation-status.mjs"

const args = process.argv.slice(2)
const DRY = args.includes("--dry-run")
const modelIdx = args.indexOf("--model")
const MODEL = modelIdx >= 0 ? args[modelIdx + 1] : "claude-opus-5"
const files = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--model")

// Frontmatter values that are prose and should be translated too.
const TRANSLATE_KEYS = [
  "title",
  "subtitle",
  "description",
  "note",
  "period",
  "emergency",
  "role",
  "org",
]
// Frontmatter values that must stay verbatim (identifiers, links, dates).
const KEEP_KEYS = new Set([
  "type",
  "list",
  "date",
  "created",
  "modified",
  "lastUpdated",
  "draft",
  "tags",
  "aliases",
  "project_ID",
  "status",
  "briefing",
  "link",
  "article",
  "github",
  "post",
  "stack",
  "image",
  "icon",
  "publish",
  "source",
])

const SYSTEM = `You translate Markdown notes from English into natural, professional Spanish (Spain).
Rules:
- Preserve every Markdown structure: headings, lists, tables, code blocks, callouts, front matter is handled separately.
- Never translate or alter anything inside [[wikilinks]] before a "|" (the link target). Translate only the display text after "|" when present. Leave ![[embeds]] untouched.
- Never translate URLs, code, inline code, file names, tag names (#tag), or product names.
- Keep the same paragraph breaks and blank lines.
- Return only the translated Markdown, no preamble.`

const client = new Anthropic()

async function translateText(text) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: text }],
  })
  const message = await stream.finalMessage()
  if (message.stop_reason === "refusal") {
    throw new Error(`Refused: ${message.stop_details?.explanation ?? "no explanation"}`)
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("Output truncated (max_tokens); split the note or raise max_tokens")
  }
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
}

async function translateNote(src, target, hash) {
  const parsed = parseNote(readFileSync(src, "utf8"))
  const data = { ...parsed.data }

  // Translate prose frontmatter values in one call, as a small JSON object.
  const prose = Object.fromEntries(
    TRANSLATE_KEYS.filter((k) => typeof data[k] === "string" && data[k].trim()).map((k) => [
      k,
      data[k],
    ]),
  )
  let translatedProse = {}
  if (Object.keys(prose).length) {
    const raw = await translateText(
      `Translate the JSON string values below into Spanish. Return the same JSON object with translated values and nothing else.\n\n${JSON.stringify(prose, null, 2)}`,
    )
    try {
      translatedProse = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""))
    } catch {
      console.warn(`  could not parse translated frontmatter for ${src}; keeping English values`)
    }
  }
  for (const k of Object.keys(translatedProse)) {
    if (typeof translatedProse[k] === "string" && !KEEP_KEYS.has(k)) data[k] = translatedProse[k]
  }

  const body = parsed.content.trim() ? await translateText(parsed.content) : ""
  data.lang = "es-ES"
  data.source_hash = hash
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, stringifyNote(body ? body + "\n" : "", data))
}

const rows = status().filter((r) => r.src)
const todo = files.length
  ? rows.filter((r) => files.includes(r.src))
  : rows.filter((r) => r.state === "missing" || r.state === "stale")

if (files.length && todo.length !== files.length) {
  const known = new Set(todo.map((r) => r.src))
  for (const f of files) if (!known.has(f)) console.warn(`not an English note under content/: ${f}`)
}

if (todo.length === 0) {
  console.log("Nothing to translate.")
  process.exit(0)
}

for (const r of todo) {
  console.log(`${r.state.padEnd(8)} ${r.src} -> ${r.target}`)
  if (DRY) continue
  try {
    await translateNote(r.src, r.target, r.hash ?? sourceHash(r.src))
    console.log("  done")
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error(
        "  no valid Anthropic credentials (set ANTHROPIC_API_KEY or run `ant auth login`)",
      )
      process.exit(1)
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error("  rate limited; re-run later to continue")
      process.exit(1)
    } else if (err instanceof Anthropic.APIError) {
      console.error(`  API error ${err.status}: ${err.message}`)
    } else {
      console.error(`  ${err.message}`)
    }
  }
}
if (DRY) console.log(`\nDry run: ${todo.length} note(s) would be translated with ${MODEL}.`)
