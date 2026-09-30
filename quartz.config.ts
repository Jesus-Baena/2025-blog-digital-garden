import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "baena.blog",
    pageTitleSuffix: " · baena.blog",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "umami",
      host: "https://analytics.baena.ai",
      websiteId: "9a7b84ba-5149-4a51-be57-0e3b390de517",
    },
    locale: "en-US",
    baseUrl: "baena.blog",
    ignorePatterns: ["private", "templates", "_templates/**", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Inter",
        code: "IBM Plex Mono",
      },
      colors: {
        // Shared with baena.ai: cream paper, deep blue-teal night, one teal accent.
        lightMode: {
          light: "#faf6f0",
          lightgray: "#e3dbd0",
          gray: "#8b9497",
          darkgray: "#2b3a40",
          dark: "#14212a",
          secondary: "#2f7f84",
          tertiary: "#5ac3c7",
          highlight: "rgba(47, 127, 132, 0.12)",
          textHighlight: "#f6e27a88",
        },
        darkMode: {
          light: "#14212a",
          lightgray: "#2c4049",
          gray: "#7d8c93",
          darkgray: "#c9d2d4",
          dark: "#f2f5f6",
          secondary: "#5ac3c7",
          tertiary: "#8fdadd",
          highlight: "rgba(90, 195, 199, 0.14)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.ImageCaptions(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
