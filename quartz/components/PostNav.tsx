import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { getDate } from "./Date"
import { getEffectiveLocale, i18n } from "../i18n"
import { classNames } from "../util/lang"
import { langPrefix } from "./projectMeta.util"

/** Previous / next links at the end of posts and missions, ordered by date. */
const NAV_TYPES = new Set(["post", "mission"])
const EN = { newer: "Newer", older: "Older" }

export default (() => {
  const PostNav: QuartzComponent = ({
    cfg,
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const type = fileData.frontmatter?.type as string | undefined
    if (!type || !NAV_TYPES.has(type)) return null

    const locale = getEffectiveLocale(cfg.locale, fileData.frontmatter?.lang)
    const t = { ...EN, ...((i18n(locale).components as any).postNav ?? {}) }
    const prefix = langPrefix(fileData.slug!)
    const time = (f: QuartzPluginData) => getDate(cfg, f)?.getTime() ?? 0
    const siblings = allFiles
      .filter((f) => f.frontmatter?.type === type && langPrefix(f.slug!) === prefix)
      .sort((a, b) => time(b) - time(a) || (a.slug ?? "").localeCompare(b.slug ?? ""))
    const i = siblings.findIndex((f) => f.slug === fileData.slug)
    if (i === -1) return null
    const newer = siblings[i - 1]
    const older = siblings[i + 1]
    if (!newer && !older) return null

    const link = (page: QuartzPluginData, label: string, cls: string) => (
      <a
        href={resolveRelative(fileData.slug!, page.slug!)}
        class={classNames(undefined, "internal", cls)}
      >
        <span class="post-nav-label">{label}</span>
        <span class="post-nav-title">{page.frontmatter?.title}</span>
      </a>
    )

    return (
      <nav class={classNames(displayClass, "post-nav")} aria-label="Post navigation">
        {newer ? link(newer, `← ${t.newer}`, "post-nav-newer") : <span />}
        {older ? link(older, `${t.older} →`, "post-nav-older") : <span />}
      </nav>
    )
  }

  PostNav.css = `
.post-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 1.5rem 0 2rem 0;
}
.post-nav a {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-width: 48%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--lightgray);
  border-radius: var(--radius, 10px);
  text-decoration: none;
  transition: border-color 0.2s ease;
}
.post-nav a:hover {
  border-color: var(--accent-border, var(--secondary));
}
.post-nav .post-nav-older {
  text-align: right;
  margin-left: auto;
}
.post-nav-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray);
}
.post-nav-title {
  font-weight: 600;
  color: var(--dark);
  line-height: 1.3;
}
@media all and (max-width: 800px) {
  .post-nav {
    flex-direction: column;
  }
  .post-nav a {
    max-width: 100%;
  }
}
`
  return PostNav
}) satisfies QuartzComponentConstructor
