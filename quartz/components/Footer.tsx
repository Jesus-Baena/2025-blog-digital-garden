import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    // 1. We split the email parts so simple bots/scrapers don't see the full address
    const user = "jesus"
    const domain = "jbaena.net"
    
    // 2. We separate your custom links from the hardcoded email logic
    const links = opts?.links ?? {}

    return (
      <footer class={`${displayClass ?? ""}`}>
        <ul>
          {/* 3. The Protected Email Link 
              We use a simple React event to build the link only when clicked.
              This prevents bots from scraping it from the HTML href attribute. 
          */}
          <li>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `mailto:${user}@${domain}`;
              }}
              title="Send me an email"
            >
              Email
            </a>
          </li>

          {/* 4. Your other links (Github, Twitter, etc.) */}
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
        <p class="quartz-attribution">
          {i18n(cfg.locale).components.footer.createdWith}
        </p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
