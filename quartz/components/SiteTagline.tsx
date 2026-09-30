import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { getEffectiveLocale, i18n } from "../i18n"

const DEFAULT = "Field notes on humanitarian data, infrastructure and AI"

/** One-line tagline under the site title in the sidebar. */
export default (() => {
  const SiteTagline: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    const locale = getEffectiveLocale(cfg.locale, fileData.frontmatter?.lang)
    const tagline = (i18n(locale).components as any).home?.tagline ?? DEFAULT
    return <p class={classNames(displayClass, "site-tagline")}>{tagline}</p>
  }

  SiteTagline.css = `
.site-tagline {
  margin: 0.2rem 0 0.8rem 0;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gray);
}
`
  return SiteTagline
}) satisfies QuartzComponentConstructor
