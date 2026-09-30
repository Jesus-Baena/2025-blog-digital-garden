import { Translation } from "./definition"

export default {
  propertyDefaults: {
    title: "Sin título",
    description: "Sin descripción",
  },
  components: {
    callout: {
      note: "Nota",
      abstract: "Resumen",
      info: "Información",
      todo: "Por hacer",
      tip: "Consejo",
      success: "Éxito",
      question: "Pregunta",
      warning: "Advertencia",
      failure: "Fallo",
      danger: "Peligro",
      bug: "Error",
      example: "Ejemplo",
      quote: "Cita",
    },
    backlinks: {
      title: "Retroenlaces",
      noBacklinksFound: "No se han encontrado retroenlaces",
    },
    themeToggle: {
      lightMode: "Modo claro",
      darkMode: "Modo oscuro",
    },
    readerMode: {
      title: "Modo lector",
    },
    explorer: {
      title: "Explorador",
    },
    footer: {
      createdWith: "Creado con",
      emailTitle: "Envíame un correo",
    },
    graph: {
      title: "Vista Gráfica",
      globalGraph: "Grafo Global",
    },
    breadcrumbs: {
      home: "Inicio",
    },
    langSwitcher: {
      switchTo: "Cambiar idioma",
      english: "Inglés",
      spanish: "Español",
    },
    propertyMeta: {
      header: "PROPIEDADES",
      empty: "Vacío",
      description: "descripción",
      lastUpdated: "última actualización",
      tags: "etiquetas",
      status: "estado",
      link: "enlace",
      article: "artículo",
      github: "github",
      post: "publicación",
    },
    nav: {
      posts: "Artículos",
      projects: "Proyectos",
      missions: "Misiones",
      stack: "Stack",
      about: "Sobre mí",
    },
    home: {
      latestPosts: "Últimos artículos",
      activeProjects: "Proyectos activos",
      allPosts: "Todos los artículos →",
      allProjects: "Todos los proyectos →",
    },
    projectMeta: {
      status: "Estado",
      started: "Inicio",
      lastUpdated: "Última actualización",
      timeline: "Cronología",
      tags: "Etiquetas",
      stack: "Stack",
      note: "Nota",
      with: "con",
      briefing: "📋 Resumen del proyecto",
      demo: "🔗 Demo en vivo",
      article: "📄 Leer artículo",
      github: "⚙️ Ver en GitHub",
      post: "📱 Publicación",
    },
    recentNotes: {
      title: "Notas Recientes",
      seeRemainingMore: ({ remaining }) => `Vea ${remaining} más →`,
    },
    transcludes: {
      transcludeOf: ({ targetSlug }) => `Transcluido de ${targetSlug}`,
      linkToOriginal: "Enlace al original",
    },
    search: {
      title: "Buscar",
      searchBarPlaceholder: "Busca algo",
      noResults: "Sin resultados.",
    },
    tableOfContents: {
      title: "Tabla de Contenidos",
    },
    contentMeta: {
      readingTime: ({ minutes }) => `Se lee en ${minutes} min`,
    },
  },
  pages: {
    rss: {
      recentNotes: "Notas recientes",
      lastFewNotes: ({ count }) => `Últimas ${count} notas`,
    },
    error: {
      title: "No se ha encontrado.",
      notFound: "Esta página es privada o no existe.",
      home: "Regresa a la página principal",
    },
    folderContent: {
      folder: "Carpeta",
      itemsUnderFolder: ({ count }) =>
        count === 1 ? "1 artículo en esta carpeta." : `${count} artículos en esta carpeta.`,
    },
    tagContent: {
      tag: "Etiqueta",
      tagIndex: "Índice de Etiquetas",
      itemsUnderTag: ({ count }) =>
        count === 1 ? "1 artículo con esta etiqueta." : `${count} artículos con esta etiqueta.`,
      showingFirst: ({ count }) => `Mostrando las primeras ${count} etiquetas.`,
      totalTags: ({ count }) => `Se han encontrado ${count} etiquetas en total.`,
    },
  },
} as const satisfies Translation
