import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import { getEffectiveLocale, i18n } from "../i18n"
import { langPrefix } from "./projectMeta.util"

/** Site navigation: one link per top-level section, language-aware. */
interface Section {
  key: "posts" | "projects" | "missions" | "stack" | "about"
  target: string // slug without language prefix
}

const SECTIONS: Section[] = [
  { key: "posts", target: "posts/index" },
  { key: "projects", target: "projects/index" },
  { key: "missions", target: "missions/index" },
  { key: "stack", target: "stack/index" },
  { key: "about", target: "about" },
]

const EN_LABELS = {
  posts: "Posts",
  projects: "Projects",
  missions: "Missions",
  stack: "Stack",
  about: "About",
}

export default (() => {
  const NavBar: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    const locale = getEffectiveLocale(cfg.locale, fileData.frontmatter?.lang)
    const labels = { ...EN_LABELS, ...((i18n(locale).components as any).nav ?? {}) }
    const prefix = langPrefix(fileData.slug!)
    const current = fileData.slug!.slice(prefix.length)

    return (
      <nav class={classNames(displayClass, "site-nav")} aria-label="Sections">
        {SECTIONS.map((s) => {
          const active =
            current === s.target || current.startsWith(s.target.replace(/\/index$/, "/"))
          return (
            <a
              href={resolveRelative(fileData.slug!, `${prefix}${s.target}` as FullSlug)}
              class={classNames(undefined, "site-nav-link", active ? "active" : "")}
              aria-current={active ? "page" : undefined}
            >
              {labels[s.key]}
            </a>
          )
        })}
      </nav>
    )
  }

  NavBar.css = `
.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
  width: 100%;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--lightgray);
  font-family: var(--headerFont);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.site-nav-link {
  color: var(--darkgray);
  text-decoration: none;
  padding: 0.2rem 0;
  border-bottom: 2px solid transparent;
}
.site-nav-link:hover {
  color: var(--secondary);
}
.site-nav-link.active {
  color: var(--secondary);
  border-bottom-color: var(--secondary);
}
`
  return NavBar
}) satisfies QuartzComponentConstructor
