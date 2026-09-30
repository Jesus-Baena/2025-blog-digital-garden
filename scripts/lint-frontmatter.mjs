#!/usr/bin/env node
// Fails the build when a note's frontmatter would render wrongly on the site.
import { readFileSync } from "node:fs"
import { globbySync } from "globby"
import matter from "gray-matter"

const TYPES = new Set(["post", "mission", "project"])
const DATE_KEYS = ["date", "created", "modified", "lastUpdated", "published"]
const files = globbySync("content/**/*.md", { ignore: ["**/.obsidian/**", "**/_templates/**"] })
const problems = []

const validDate = (v) => {
  if (v instanceof Date) return !isNaN(v.getTime())
  if (typeof v !== "string") return false
  const s = v.trim()
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return false
  return !isNaN(new Date(s).getTime())
}

for (const file of files) {
  let data
  try {
    data = matter(readFileSync(file, "utf8")).data
  } catch (e) {
    problems.push(`${file}: unparsable frontmatter (${e.message.split("\n")[0]})`)
    continue
  }
  for (const key of DATE_KEYS) {
    const v = data[key]
    if (v === undefined || v === null || v === "") continue
    if (!validDate(v))
      problems.push(`${file}: ${key} is not a YYYY-MM-DD date (${JSON.stringify(v)})`)
  }
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" && v.trimStart().startsWith("#"))
      problems.push(`${file}: ${k} looks like a leftover template comment`)
  }
  if (data.type !== undefined && !TYPES.has(data.type))
    problems.push(`${file}: unknown type "${data.type}"`)
  if (data.list !== undefined && !TYPES.has(data.list) && data.list !== "home")
    problems.push(`${file}: unknown list "${data.list}"`)
  if (data.draft !== undefined && typeof data.draft !== "boolean")
    problems.push(`${file}: draft must be true or false`)
  if (data.type === "mission" && !data.period) problems.push(`${file}: mission is missing "period"`)
  if (data.type === "project" && !data.status) problems.push(`${file}: project is missing "status"`)
}

if (problems.length) {
  console.error(
    `Frontmatter check failed (${problems.length}):\n` + problems.map((p) => `  - ${p}`).join("\n"),
  )
  process.exit(1)
}
console.log(`Frontmatter OK (${files.length} notes)`)
