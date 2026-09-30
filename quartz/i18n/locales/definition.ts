import { FullSlug } from "../../util/path"

export interface CalloutTranslation {
  note: string
  abstract: string
  info: string
  todo: string
  tip: string
  success: string
  question: string
  warning: string
  failure: string
  danger: string
  bug: string
  example: string
  quote: string
}

export interface Translation {
  propertyDefaults: {
    title: string
    description: string
  }
  components: {
    callout: CalloutTranslation
    backlinks: {
      title: string
      noBacklinksFound: string
    }
    themeToggle: {
      lightMode: string
      darkMode: string
    }
    readerMode: {
      title: string
    }
    explorer: {
      title: string
    }
    footer: {
      createdWith: string
      emailTitle: string
    }
    graph: {
      title: string
      globalGraph: string
    }
    breadcrumbs: {
      home: string
    }
    langSwitcher: {
      switchTo: string
      english: string
      spanish: string
    }
    propertyMeta: {
      header: string
      empty: string
      description: string
      lastUpdated: string
      tags: string
      status: string
      link: string
      article: string
      github: string
      post: string
    }
    nav?: {
      posts: string
      projects: string
      missions: string
      stack: string
      about: string
    }
    home?: {
      latestPosts: string
      activeProjects: string
      allPosts: string
      allProjects: string
    }
    projectMeta?: {
      status: string
      started: string
      lastUpdated: string
      timeline: string
      tags: string
      stack: string
      note: string
      with: string
      briefing: string
      demo: string
      article: string
      github: string
      post: string
    }
    recentNotes: {
      title: string
      seeRemainingMore: (variables: { remaining: number }) => string
    }
    transcludes: {
      transcludeOf: (variables: { targetSlug: FullSlug }) => string
      linkToOriginal: string
    }
    search: {
      title: string
      searchBarPlaceholder: string
      noResults: string
    }
    tableOfContents: {
      title: string
    }
    contentMeta: {
      readingTime: (variables: { minutes: number }) => string
    }
  }
  pages: {
    rss: {
      recentNotes: string
      lastFewNotes: (variables: { count: number }) => string
    }
    error: {
      title: string
      notFound: string
      home: string
    }
    folderContent: {
      folder: string
      itemsUnderFolder: (variables: { count: number }) => string
    }
    tagContent: {
      tag: string
      tagIndex: string
      itemsUnderTag: (variables: { count: number }) => string
      showingFirst: (variables: { count: number }) => string
      totalTags: (variables: { count: number }) => string
    }
  }
}
