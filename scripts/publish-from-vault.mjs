#!/usr/bin/env node
// Publish notes from the main Obsidian vault into this site's content/ folder.
//
// Allow-list model: only notes whose frontmatter has `publish: true` are copied.
// Nothing else in the vault is read into the site. Destination comes from
// `publish_to: <folder>` (e.g. posts, projects, missions, stack, wiki) or, when
// absent, from `type:` (post -> posts, mission -> missions, project -> projects),
// falling back to wiki/. Attachments embedded as ![[file.png]] are copied to
// content/_attachments/.
//
//   node scripts/publish-from-vault.mjs            # dry run: report what would change
//   node scripts/publish-from-vault.mjs --write    # copy files
//   VAULT=/path/to/vault node scripts/publish-from-vault.mjs
//
// The script never deletes anything in content/. A note that loses `publish: true`
// is reported as "orphan" so you can remove it by hand.

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync } from "node:fs"
import { join, basename, dirname, relative } from "node:path"
import { globbySync } from "globby"
import { parseNote, stringifyNote } from "./lib/frontmatter.mjs"

const VAULT = process.env.VAULT ?? "/home/jbi/Obsidian/obsidian-vault"
const CONTENT = "content"
const WRITE = process.argv.includes("--write")
const TYPE_TO_FOLDER = { post: "posts", mission: "missions", project: "projects" }
const ATTACHMENT_EXT = /\.(png|jpe?g|gif|webp|svg|pdf)$/i

if (!existsSync(VAULT)) {
  console.error(`Vault not found: ${VAULT}`)
  process.exit(2)
}

const vaultNotes = globbySync("**/*.md", {
  cwd: VAULT,
  ignore: ["**/.obsidian/**", "**/_System/**", "**/_to_delete/**", "**/node_modules/**"],
})

const attachmentIndex = new Map()
for (const f of globbySync("**/*", { cwd: VAULT, ignore: ["**/.obsidian/**", "**/.git/**"] })) {
  if (ATTACHMENT_EXT.test(f)) attachmentIndex.set(basename(f), f)
}

const plan = []
for (const rel of vaultNotes) {
  const src = join(VAULT, rel)
  let parsed
  try {
    parsed = parseNote(readFileSync(src, "utf8"))
  } catch {
    continue
  }
  const fm = parsed.data
  if (fm.publish !== true) continue

  const lang = typeof fm.lang === "string" && fm.lang.startsWith("es") ? "es/" : ""
  const folder = fm.publish_to ?? TYPE_TO_FOLDER[fm.type] ?? "wiki"
  const dest = join(CONTENT, lang, String(folder), basename(rel))

  // Strip vault-only keys, keep everything Quartz understands.
  const { publish, publish_to, local_path, git_location, ...keep } = fm
  const out = stringifyNote(parsed.content, { ...keep, source: "vault" })

  const embeds = [...parsed.content.matchAll(/!\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)]
    .map((m) => m[1].trim())
    .filter((n) => ATTACHMENT_EXT.test(n))

  const current = existsSync(dest) ? readFileSync(dest, "utf8") : null
  plan.push({ rel, dest, out, changed: current !== out, embeds })
}

// Orphans: site notes that came from the vault (marked with `source: vault`) but are no longer published.
const published = new Set(plan.map((p) => p.dest))
const orphans = globbySync(`${CONTENT}/**/*.md`, {
  ignore: ["**/.obsidian/**", "**/_templates/**"],
}).filter((f) => {
  try {
    return parseNote(readFileSync(f, "utf8")).data.source === "vault" && !published.has(f)
  } catch {
    return false
  }
})

let copied = 0
let attachments = 0
for (const p of plan) {
  const flag = p.changed ? (existsSync(p.dest) ? "update" : "new") : "same"
  console.log(`${flag.padEnd(7)} ${p.rel} -> ${p.dest}`)
  if (WRITE && p.changed) {
    mkdirSync(dirname(p.dest), { recursive: true })
    writeFileSync(p.dest, p.out)
    copied++
  }
  for (const name of p.embeds) {
    const from = attachmentIndex.get(name)
    const to = join(CONTENT, "_attachments", name)
    if (!from) {
      console.log(`  missing attachment: ${name}`)
      continue
    }
    const stale = !existsSync(to) || statSync(join(VAULT, from)).mtimeMs > statSync(to).mtimeMs
    if (stale) {
      console.log(`  attachment ${name}`)
      if (WRITE) {
        mkdirSync(dirname(to), { recursive: true })
        copyFileSync(join(VAULT, from), to)
        attachments++
      }
    }
  }
}
for (const o of orphans)
  console.log(`orphan  ${relative(".", o)} (no longer published in the vault)`)

console.log(
  WRITE
    ? `\nWrote ${copied} note(s) and ${attachments} attachment(s).`
    : `\nDry run: ${plan.filter((p) => p.changed).length} of ${plan.length} published note(s) would change. Add --write to apply.`,
)
