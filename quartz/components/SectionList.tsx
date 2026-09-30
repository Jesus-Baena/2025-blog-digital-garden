import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date as DateEl, getDate } from "./Date"
import { getEffectiveLocale } from "../i18n"
import { classNames } from "../util/lang"
import {
  langPrefix,
  projectLinks,
  projectStrings,
  statusClass,
  toMonthYear,
  resolveImage,
} from "./projectMeta.util"

/**
 * SectionList renders a list of notes driven purely by frontmatter.
 *
 * Put `list: post | mission | project` in the frontmatter of an index page and every
 * note in the same language whose frontmatter has `type: <that value>` is listed,
 * newest first. No HTML is needed in the vault.
 */
type ListType = "post" | "mission" | "project"

interface Options {
  attachmentFolder: string
}

const defaultOptions: Options = {
  attachmentFolder: "00. STOCK",
}

const byDateDesc =
  (cfg: QuartzComponentProps["cfg"]) => (a: QuartzPluginData, b: QuartzPluginData) => {
    const da = getDate(cfg, a)?.getTime() ?? 0
    const db = getDate(cfg, b)?.getTime() ?? 0
    if (da !== db) return db - da
    return (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "")
  }

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const SectionList: QuartzComponent = ({
    cfg,
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const kind = fileData.frontmatter?.list as ListType | undefined
    if (!kind) return null

    const locale = getEffectiveLocale(cfg.locale, fileData.frontmatter?.lang)
    const t = projectStrings(locale)
    const prefix = langPrefix(fileData.slug!)
    const items = allFiles
      .filter((f) => f.frontmatter?.type === kind && langPrefix(f.slug!) === prefix)
      .sort(byDateDesc(cfg))

    if (items.length === 0) return null

    const tagLinks = (page: QuartzPluginData) =>
      (page.frontmatter?.tags ?? []).map((tag: string) => (
        <a
          class="internal tag-link"
          href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
        >
          {tag}
        </a>
      ))

    if (kind === "project") {
      return (
        <div class={classNames(displayClass, "section-list", "project-cards")}>
          {items.map((page) => {
            const fm: Record<string, any> = page.frontmatter ?? {}
            const image = resolveImage(
              fm.image as string | undefined,
              fileData.slug!,
              opts.attachmentFolder,
            )
            const started = getDate(cfg, page)
            const updated = toMonthYear(fm.lastUpdated, locale)
            return (
              <div class="project-card">
                <div class="project-content">
                  <h3>
                    <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                      {fm.title}
                    </a>
                  </h3>
                  {fm.subtitle && <p class="project-subtitle">{fm.subtitle as string}</p>}
                  {fm.description && <p class="project-description">{fm.description as string}</p>}
                  <div class="project-meta">
                    {fm.status && (
                      <div class="meta-row">
                        <span class="meta-label">{t.status}</span>
                        <span
                          class={classNames(
                            undefined,
                            "status-badge",
                            statusClass(fm.status as string),
                          )}
                        >
                          {fm.status as string}
                        </span>
                      </div>
                    )}
                    {(started || updated) && (
                      <div class="meta-row">
                        <span class="meta-label">{t.timeline}</span>
                        <span class="meta-value">
                          {started && `${t.started}: ${toMonthYear(started, locale)}`}
                          {started && updated && " · "}
                          {updated && `${t.lastUpdated}: ${updated}`}
                        </span>
                      </div>
                    )}
                    {fm.note && (
                      <div class="meta-row">
                        <span class="meta-label">{t.note}</span>
                        <span class="meta-value">{fm.note as string}</span>
                      </div>
                    )}
                    <div class="meta-links">
                      {projectLinks(fm, fileData, allFiles, t).map((l) => (
                        <a
                          href={l.href}
                          class={classNames(undefined, "meta-link", l.kind)}
                          {...l.attrs}
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                {image && (
                  <div class="project-image">
                    <img src={image} alt={fm.title as string} loading="lazy" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )
    }

    if (kind === "mission") {
      return (
        <div class={classNames(displayClass, "section-list", "card-grid", "left-align")}>
          <ul>
            {items.map((page) => {
              const fm: Record<string, any> = page.frontmatter ?? {}
              const who = [fm.icon, fm.role, fm.org ? `${t.with} ${fm.org}` : undefined]
                .filter(Boolean)
                .join(" ")
              const meta = [fm.period, fm.emergency, who].filter(Boolean).join(" | ")
              return (
                <li>
                  <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                    {fm.title}
                  </a>
                  <span class="meta-date">{meta}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )
    }

    // posts (default)
    return (
      <div class={classNames(displayClass, "section-list", "card-grid")}>
        <ul>
          {items.map((page) => {
            const date = getDate(cfg, page)
            return (
              <li>
                <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                  {page.frontmatter?.title}
                </a>
                {date && (
                  <span class="meta-date">
                    <DateEl date={date} locale={locale} />
                  </span>
                )}
                {tagLinks(page)}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  SectionList.css = `
.section-list.card-grid ul li > a.internal:first-child {
  font-weight: 700;
  font-size: 1.2rem;
  display: block;
  text-align: left;
  padding-bottom: 1rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray);
}
.section-list.card-grid ul li .meta-date time {
  font-family: var(--codeFont);
}
.project-cards .project-subtitle {
  margin: 0;
  font-style: italic;
  color: var(--gray);
}
`
  return SectionList
}) satisfies QuartzComponentConstructor
