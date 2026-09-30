import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"
import { getEffectiveLocale } from "../i18n"
import { getDate } from "./Date"
import {
  projectLinks,
  projectStrings,
  stackItems,
  statusClass,
  toMonthYear,
} from "./projectMeta.util"

/**
 * Project header rendered from frontmatter only. Shown on any note with
 * `type: project` (or, for backwards compatibility, a `status` field).
 */
const ProjectMeta: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
  displayClass,
}: QuartzComponentProps) => {
  const fm: Record<string, any> = fileData.frontmatter ?? {}
  if (fm.type !== "project" && !fm.status) return null

  const locale = getEffectiveLocale(cfg.locale, fm.lang)
  const t = projectStrings(locale)
  const started = toMonthYear(getDate(cfg, fileData), locale)
  const updated = toMonthYear(fm.lastUpdated, locale)
  const tags: string[] = fm.tags ?? []
  const stack = stackItems(fm.stack)
  const links = projectLinks(fm, fileData, allFiles, t)

  return (
    <div class={classNames(displayClass, "project-header-meta")}>
      {(fm.subtitle || fm.description) && (
        <div class="project-title-section">
          {fm.subtitle && <div class="subtitle">{fm.subtitle as string}</div>}
          {fm.description && <div class="description">{fm.description as string}</div>}
        </div>
      )}

      <div class="meta-grid">
        {fm.status && (
          <div class="meta-item">
            <span class="meta-label">{t.status}</span>
            <span class={classNames(undefined, "status-badge", statusClass(fm.status as string))}>
              {fm.status as string}
            </span>
          </div>
        )}
        {started && (
          <div class="meta-item">
            <span class="meta-label">{t.started}</span>
            <span class="meta-value">{started}</span>
          </div>
        )}
        {updated && (
          <div class="meta-item">
            <span class="meta-label">{t.lastUpdated}</span>
            <span class="meta-value">{updated}</span>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div class="meta-grid full-width">
          <div class="meta-item wide">
            <span class="meta-label">{t.tags}</span>
            <div class="tag-list">
              {tags.map((tag) => (
                <a
                  href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                  class="tag internal tag-link"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {stack.length > 0 && (
        <div class="meta-grid full-width">
          <div class="meta-item wide">
            <span class="meta-label">{t.stack}</span>
            <div class="stack-list">
              {stack.map((s) => (
                <span class="stack-item">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {fm.note && (
        <div class="meta-grid full-width">
          <div class="meta-item wide">
            <span class="meta-label">{t.note}</span>
            <span class="meta-value">{fm.note as string}</span>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div class="meta-links-section">
          {links.map((l) => (
            <a href={l.href} class={classNames(undefined, "meta-link", l.kind)} {...l.attrs}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

ProjectMeta.css = `
.project-header-meta .stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.project-header-meta .stack-item {
  font-family: var(--codeFont);
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  color: var(--darkgray);
}
`

export default (() => ProjectMeta) satisfies QuartzComponentConstructor
