# Jesus Baena - Digital Garden & Personal Knowledge Management

Welcome to the repository for my personal digital garden. This is a collection of my working notes, thoughts, and technical learnings, published as a static site.

**Live Site:** https://baena.blog

## 🚀 About This Project

This repository serves as my "Second Brain" or Personal Knowledge Management (PKM) system. Unlike a polished blog, a digital garden is a space for evolving ideas.

I use this space to document my learning process and work in:
* **Humanitarian Data Analysis:** Information management and data modeling for the humanitarian sector.
* **Tech Stack Learning:** My experiments with **Nuxt, n8n, Flowise**, and **Figma**.
* **Self-Hosting:** Notes on managing server infrastructure and open-source tools.
* **AI & Automation:** Exploring how AI agents can support humanitarian workflows.

## 🛠️ Built With

This site is generated using **Quartz v4**, a tool for publishing Obsidian vaults to the web.

* **Content:** Written in Markdown (Obsidian)
* **Generator:** [Quartz v4](https://quartz.jzhao.xyz/)
* **Hosting:** GitHub Pages

## ✍️ Publishing workflow

Everything on the site is driven by frontmatter. There is no HTML to maintain in the vault.

| I want to… | Do this |
| --- | --- |
| Publish a post | New note in `posts/` from `template-note`, fill `title`, `date`, `tags`, set `draft: false`. It appears on **Posts** automatically. |
| Add a project | New note in `projects/` from `template-project` (`type: project`, `status`, `description`, links). The header and the **Projects** card are generated. |
| Add a mission | New note in `missions/` from `template-mission` (`type: mission`, `date`, `period`, `emergency`, `icon`, `role`, `org`). It appears on **Missions**. |
| Add a Spanish version | Same file name under `content/es/`, add `lang: es-ES`. |

```
content/
  index.md          home (list: home → latest posts + active projects)
  about.md
  posts/            type: post
  projects/         type: project (+ sub-folders for project notes)
  missions/         type: mission
  stack/            tools and infrastructure notes
  wiki/             everything else in the garden
  _attachments/     images and PDFs (Obsidian attachment folder)
  _templates/       Obsidian templates (not published)
  es/               Spanish mirror with the same layout, notes carry lang: es-ES
```

Old `00. STOCK/…` and `1. POSTs` URLs redirect through `aliases` in each note's frontmatter.

Index pages carry `list: post | mission | project` and are rendered by `quartz/components/SectionList.tsx`.
Project headers come from `quartz/components/ProjectMeta.tsx`. Links accept URLs or `[[wikilinks]]`.

Check content before pushing:

```bash
npm run lint:content
```

### Publishing from the main vault

Notes can live in the main Obsidian vault and be copied here with an allow-list:
add `publish: true` (and optionally `publish_to: posts|projects|missions|stack|wiki`)
to a note, then run:

```bash
npm run publish:vault -- --write
```

Without `--write` the script only reports. It never deletes site content; notes that
stop being published are listed as orphans. Embedded images and PDFs are copied to
`_attachments/`. The vault path defaults to `~/Obsidian/obsidian-vault` (override with `VAULT=`).

### Spanish translations

Every Spanish note carries `source_hash`, a fingerprint of its English source.

```bash
npm run translations          # current / stale / missing per note
npm run translate -- --dry-run
npm run translate             # translate missing and stale notes with Claude (needs ANTHROPIC_API_KEY)
npm run translate -- content/posts/some-note.md
```

Translations are drafts: read them before committing. Metric snippets and other notes
you do not want in Spanish can simply be left untranslated.

## ⚖️ License & Attribution

* This website content is © Jesus Baena.
* The source code for the generator is a fork of [Quartz](https://github.com/jackyzha0/quartz) created by [Jacky Zhao](https://github.com/jackyzha0), licensed under the MIT License.