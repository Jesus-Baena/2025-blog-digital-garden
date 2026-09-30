import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

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
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.ProjectMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
        { Component: Component.LangSwitcher() },
      ],
    }),
    Component.Explorer({
      filterFn: (node) => {
        // Hide "00. STOCK" and "content" folders from the explorer
        return node.displayName !== "00. STOCK" && node.displayName !== "content"
      },
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
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.Graph({
      localGraph: {
        scale: 0.9,
        depth: 2,
        repelForce: 0.8,
        centerForce: 0.2,
        linkDistance: 40,
        fontSize: 0.5,
      },
      globalGraph: {
        scale: 0.9,
      },
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.LangSwitcher() },
      ],
    }),
    Component.Explorer({
      filterFn: (node) => {
        // Hide "00. STOCK" and "content" folders from the explorer
        return node.displayName !== "00. STOCK" && node.displayName !== "content"
      },
    }),
  ],
  right: [],
}
