#!/usr/bin/env node
// Report which Spanish notes are missing or stale compared with their English source.
//
// Each Spanish note under content/es/ mirrors the English note at the same relative
// path. The Spanish frontmatter carries `source_hash`, a short SHA-256 of the English
// note (frontmatter + body, minus volatile keys) at the time it was translated.
//
//   node scripts/translation-status.mjs            # report: current / stale / missing / extra
//   node scripts/translation-status.mjs --stamp    # write source_hash into Spanish notes that lack it
//   node scripts/translation-status.mjs --json     # machine-readable output (used by translate.mjs)
//
// Exit code is always 0: the report is informational. Use `translate.mjs` to fix.

import { readFileSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { createHash } from "node:crypto"
import { globbySync } from "globby"
import { parseNote, setScalar } from "./lib/frontmatter.mjs"

const STAMP = process.argv.includes("--stamp")
const JSON_OUT = process.argv.includes("--json")
const VOLATILE = new Set(["modified", "source_hash", "lang", "translation_of"])

export function sourceHash(file) {
  const parsed = parseNote(readFileSync(file, "utf8"))
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([k]) => !VOLATILE.has(k)))
  const stable = JSON.stringify(data, Object.keys(data).sort()) + "\n" + parsed.content.trim()
  return createHash("sha256").update(stable).digest("hex").slice(0, 12)
}

export function status() {
  const en = globbySync("content/**/*.md", {
    ignore: ["content/es/**", "**/.obsidian/**", "**/_templates/**"],
  })
  const es = new Set(globbySync("content/es/**/*.md"))
  const rows = []
  for (const src of en) {
    const target = src.replace(/^content\//, "content/es/")
    const hash = sourceHash(src)
    if (!es.has(target)) {
      rows.push({ src, target, state: "missing", hash })
      continue
    }
    es.delete(target)
    const stamped = parseNote(readFileSync(target, "utf8")).data.source_hash
    rows.push({
      src,
      target,
      state: !stamped ? "unstamped" : stamped === hash ? "current" : "stale",
      hash,
    })
  }
  for (const extra of es) rows.push({ src: null, target: extra, state: "extra" })
  return rows
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
const rows = isCli ? status() : []

if (isCli && STAMP) {
  let n = 0
  for (const r of rows) {
    if (r.state !== "unstamped") continue
    writeFileSync(r.target, setScalar(readFileSync(r.target, "utf8"), "source_hash", r.hash))
    n++
  }
  console.log(`Stamped ${n} Spanish note(s) with their current source hash.`)
}

if (!isCli) {
  // imported as a library: no report
} else if (JSON_OUT) {
  console.log(JSON.stringify(rows, null, 2))
} else {
  const counts = {}
  for (const r of rows) counts[r.state] = (counts[r.state] ?? 0) + 1
  for (const r of rows.filter((r) => r.state !== "current")) {
    console.log(`${r.state.padEnd(9)} ${r.target}${r.src ? `  <- ${r.src}` : ""}`)
  }
  console.log(
    "\n" +
      Object.entries(counts)
        .map(([k, v]) => `${k}: ${v}`)
        .join("  "),
  )
}
