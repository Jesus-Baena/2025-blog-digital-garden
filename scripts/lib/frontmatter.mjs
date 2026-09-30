// Frontmatter helpers that keep dates as plain strings.
// gray-matter's default YAML engine turns `date: 2026-01-18` into a Date object and
// writes it back as an ISO timestamp; CORE_SCHEMA leaves scalars as written.
import yaml from "js-yaml"

const OPTS = { schema: yaml.CORE_SCHEMA }

export function parseNote(text) {
  if (!text.startsWith("---\n")) return { data: {}, content: text, hasFrontmatter: false }
  const end = text.indexOf("\n---", 4)
  if (end === -1) return { data: {}, content: text, hasFrontmatter: false }
  const raw = text.slice(4, end)
  const rest = text.slice(end + 4).replace(/^\r?\n/, "")
  const data = yaml.load(raw, OPTS) ?? {}
  return { data: typeof data === "object" ? data : {}, content: rest, hasFrontmatter: true }
}

export function stringifyNote(content, data) {
  const fm = yaml.dump(data, { ...OPTS, lineWidth: -1, quotingType: '"', noRefs: true }).trimEnd()
  return `---\n${fm}\n---\n${content}`
}

/** Insert or replace one scalar key without re-serialising the rest of the frontmatter. */
export function setScalar(text, key, value) {
  if (!text.startsWith("---\n")) return `---\n${key}: ${value}\n---\n${text}`
  const end = text.indexOf("\n---", 4)
  const head = text.slice(0, end)
  const re = new RegExp(`^${key}:.*$`, "m")
  const line = `${key}: ${value}`
  const newHead = re.test(head) ? head.replace(re, line) : `${head}\n${line}`
  return newHead + text.slice(end)
}
