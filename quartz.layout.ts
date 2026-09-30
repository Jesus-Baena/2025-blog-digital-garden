import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const isIndexPage = (page: { fileData: { frontmatter?: Record<string, any> } }) =>
  Boolean(page.fileData.frontmatter?.list)

const isKitPage = (page: { fileData: { slug?: string } }) =>
  (page.fileData.slug ?? "").includes("Field-Management-Kit")

const sidebarTools = Component.Flex({
  components: [
    { Component: Component.Search(), grow: true },
    { Component: Component.Darkmode() },
    { Component: Component.ReaderMode() },
    { Component: Component.LangSwitcher() },
  ],
})

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.SectionList()],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/Jesus-Baena",
      Linkedin: "https://linkedin.com/in/jbaenanet",
      WebPage: "https://baena.ai",
      RSS: "/index.xml",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index" && page.fileData.slug !== "es/index",
    }),
    Component.ArticleTitle(),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isIndexPage(page),
    }),
    Component.ProjectMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.SiteTagline(),
    Component.MobileOnly(Component.Spacer()),
    sidebarTools,
    Component.NavBar(),
    // The file tree is only useful inside the Field Management Kit chapters.
    Component.ConditionalRender({
      component: Component.Explorer({
        title: "Field Management Kit",
        folderDefaultState: "open",
        filterFn: (node) => {
          const slug = node.slug as string
          return (
            slug.includes("Field-Management-Kit") ||
            slug === "projects" ||
            slug === "es" ||
            slug === "es/projects"
          )
        },
      }),
      condition: isKitPage,
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [Component.PageTitle(), Component.MobileOnly(Component.Spacer()), sidebarTools],
  right: [],
}
