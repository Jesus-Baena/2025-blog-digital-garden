import { FilePath, FullSlug, joinSegments, resolveRelative, slugifyFilePath } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { i18n, ValidLocale } from "../i18n"

/** Language prefix of a slug: "es/" for Spanish pages, "" for the default language. */
export function langPrefix(slug: string): string {
  const m = slug.match(/^([a-z]{2})\//)
  return m ? `${m[1]}/` : ""
}

const STATUS_CLASSES: Record<string, string> = {
  production: "production",
  producción: "production",
  development: "development",
  desarrollo: "development",
  planning: "planning",
  planificación: "planning",
  ongoing: "ongoing",
  "en curso": "ongoing",
  testing: "testing",
  pruebas: "testing",
  archived: "archived",
  archivado: "archived",
}

export function statusClass(status: string): string {
  return STATUS_CLASSES[status.trim().toLowerCase()] ?? "ongoing"
}

export function toDate(v: unknown): Date | undefined {
  if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v
  if (typeof v === "string" && v.trim()) {
    const s = v.trim()
    const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s)
    return isNaN(d.getTime()) ? undefined : d
  }
  return undefined
}

export function toMonthYear(v: unknown, locale: ValidLocale): string | undefined {
  const d = toDate(v)
  if (!d) return typeof v === "string" && v.trim() ? v : undefined
  const s = d.toLocaleDateString(locale, { year: "numeric", month: "long" })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Resolve an attachment name (or absolute URL) from frontmatter into a relative URL. */
export function resolveImage(
  image: string | undefined,
  currentSlug: FullSlug,
  attachmentFolder: string,
): string | undefined {
  if (!image) return undefined
  const v = image.replace(/^!?\[\[(.+?)\]\]$/, "$1").trim()
  if (/^https?:\/\//.test(v)) return v
  const path = v.includes("/") ? v : joinSegments(attachmentFolder, v)
  return resolveRelative(currentSlug, slugifyFilePath(path as FilePath))
}

/** Resolve a `[[wikilink]]` or plain URL to something an <a href> can use. */
export function resolveLink(
  value: string,
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
): { href: string; external: boolean } | undefined {
  const v = value.trim()
  if (!v) return undefined
  const wiki = v.match(/^\[\[(.+?)(?:\|.*)?\]\]$/)
  if (!wiki) return { href: v, external: /^https?:\/\//.test(v) }
  const name = wiki[1].split("#")[0]
  const target = slugifyFilePath(`${name}.md` as FilePath)
  const prefix = langPrefix(fileData.slug!)
  const candidates = allFiles.filter((f) => f.slug === target || f.slug!.endsWith(`/${target}`))
  const match = candidates.find((f) => langPrefix(f.slug!) === prefix) ?? candidates[0]
  if (!match) return undefined
  return { href: resolveRelative(fileData.slug!, match.slug!), external: false }
}

export interface ProjectStrings {
  status: string
  started: string
  lastUpdated: string
  timeline: string
  tags: string
  stack: string
  note: string
  with: string
  briefing: string
  demo: string
  article: string
  github: string
  post: string
}

const EN: ProjectStrings = {
  status: "Status",
  started: "Started",
  lastUpdated: "Last updated",
  timeline: "Timeline",
  tags: "Tags",
  stack: "Stack",
  note: "Note",
  with: "with",
  briefing: "📋 Project briefing",
  demo: "🔗 Live demo",
  article: "📄 Read article",
  github: "⚙️ View on GitHub",
  post: "📱 Social post",
}

export function projectStrings(locale: ValidLocale): ProjectStrings {
  const fromLocale = (i18n(locale).components as any).projectMeta as
    | Partial<ProjectStrings>
    | undefined
  return { ...EN, ...(fromLocale ?? {}) }
}

export interface ProjectLink {
  kind: "briefing" | "demo" | "article" | "github" | "social"
  label: string
  href: string
  attrs: Record<string, string>
}

export function projectLinks(
  fm: Record<string, any>,
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
  t: ProjectStrings,
): ProjectLink[] {
  const spec: Array<[string, ProjectLink["kind"], string]> = [
    ["briefing", "briefing", t.briefing],
    ["link", "demo", t.demo],
    ["article", "article", t.article],
    ["github", "github", t.github],
    ["post", "social", t.post],
  ]
  const out: ProjectLink[] = []
  for (const [key, kind, label] of spec) {
    const raw = fm[key]
    if (typeof raw !== "string" || !raw.trim()) continue
    // allow markdown-style "[label](url)"
    const md = raw.trim().match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    const resolved = resolveLink(md ? md[2] : raw, fileData, allFiles)
    if (!resolved) continue
    out.push({
      kind,
      label: md ? md[1] : label,
      href: resolved.href,
      attrs: resolved.external ? { target: "_blank", rel: "noopener noreferrer" } : {},
    })
  }
  return out
}

export function stackItems(stack: unknown): string[] {
  const arr = Array.isArray(stack) ? stack : typeof stack === "string" ? [stack] : []
  return arr
    .map((s) =>
      String(s)
        .replace(/^\[\[(.+?)(?:\|.*)?\]\]$/, "$1")
        .trim(),
    )
    .filter(Boolean)
}
