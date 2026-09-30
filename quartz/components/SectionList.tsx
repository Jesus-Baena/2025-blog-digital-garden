import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date as DateEl, getDate } from "./Date"
import { getEffectiveLocale, i18n } from "../i18n"
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
type ListType = "post" | "mission" | "project" | "home"

interface Options {
  attachmentFolder: string
  homePosts: number
}

const defaultOptions: Options = {
  attachmentFolder: "_attachments",
  homePosts: 5,
}

const HOME_EN = {
  latestPosts: "Latest posts",
  activeProjects: "Active projects",
  allPosts: "All posts →",
  allProjects: "All projects →",
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

    const tagLinks = (page: QuartzPluginData) =>
      (page.frontmatter?.tags ?? []).map((tag: string) => (
        <a
          class="internal tag-link"
          href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
        >
          {tag}
        </a>
      ))
    const items = allFiles
      .filter((f) => f.frontmatter?.type === kind && langPrefix(f.slug!) === prefix)
      .sort(byDateDesc(cfg))

    if (kind === "home") {
      const h = { ...HOME_EN, ...((i18n(locale).components as any).home ?? {}) }
      const posts = allFiles
        .filter((f) => f.frontmatter?.type === "post" && langPrefix(f.slug!) === prefix)
        .sort(byDateDesc(cfg))
        .slice(0, opts.homePosts)
      const active = allFiles
        .filter(
          (f) =>
            f.frontmatter?.type === "project" &&
            langPrefix(f.slug!) === prefix &&
            ["production", "ongoing", "development"].includes(
              statusClass(String(f.frontmatter?.status ?? "")),
            ),
        )
        .sort(byDateDesc(cfg))
      return (
        <div class={classNames(displayClass, "section-list", "home-sections")}>
          {posts.length > 0 && (
            <section>
              <h2>{h.latestPosts}</h2>
              <div class="card-grid">
                <ul>
                  {posts.map((page) => {
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
              <p class="see-all">
                <a
                  href={resolveRelative(fileData.slug!, `${prefix}posts/index` as FullSlug)}
                  class="internal"
                >
                  {h.allPosts}
                </a>
              </p>
            </section>
          )}
          {active.length > 0 && (
            <section>
              <h2>{h.activeProjects}</h2>
              <ul class="home-projects">
                {active.map((page) => {
                  const fm: Record<string, any> = page.frontmatter ?? {}
                  return (
                    <li>
                      <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                        {fm.title}
                      </a>
                      {fm.status && (
                        <span class={classNames(undefined, "status-badge", statusClass(fm.status))}>
                          {fm.status}
                        </span>
                      )}
                      {fm.description && <p>{fm.description}</p>}
                    </li>
                  )
                })}
              </ul>
              <p class="see-all">
                <a
                  href={resolveRelative(fileData.slug!, `${prefix}projects/index` as FullSlug)}
                  class="internal"
                >
                  {h.allProjects}
                </a>
              </p>
            </section>
          )}
        </div>
      )
    }

    if (items.length === 0) return null

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
.home-sections h2 {
  margin-top: 2.5rem;
}
.home-sections .see-all {
  text-align: right;
  margin: 0.5rem 0 0 0;
}
.home-sections .card-grid ul {
  margin: 1rem 0;
}
.home-projects {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}
.home-projects li {
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--lightgray);
}
.home-projects li > a.internal {
  font-weight: 700;
  font-size: 1.1rem;
}
.home-projects .status-badge {
  display: inline-block;
  margin-left: 0.6rem;
  padding: 0.1rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  vertical-align: middle;
}
.home-projects .status-badge.production { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
.home-projects .status-badge.development { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
.home-projects .status-badge.ongoing { background: rgba(234, 179, 8, 0.15); color: #ca8a04; }
.home-projects p {
  margin: 0.3rem 0 0 0;
  color: var(--darkgray);
  font-size: 0.95rem;
}
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
