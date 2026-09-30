# baena.blog — a bilingual digital garden

**Live site:** https://baena.blog · Spanish: https://baena.blog/es/

This repository is my personal blog and digital garden: opinions, drafts, raw notes,
field learnings and the inner workings of my projects. The finished, polished pieces
live on my portfolio at [baena.ai](https://baena.ai); this site shows the process
behind them.

It is written in [Obsidian](https://obsidian.md), built with
[Quartz 4](https://quartz.jzhao.xyz/) and served by Cloudflare. Everything on the
site is driven by note frontmatter; there is no HTML to maintain and no index page
to edit by hand.

---

## How publishing works

```
Obsidian (content/ opened as a vault)
   │  write a note, fill in a few frontmatter fields
   ▼
git commit + push to main
   │
   ├─► GitHub Actions "Content check": frontmatter lint, typecheck, build
   │
   └─► Cloudflare builds `npx quartz build` and deploys to baena.blog
              ▲
              └── a weekly workflow rebuilds the site so git-derived dates
                  and the RSS feeds stay fresh even with no new commits
```

The whole dynamic is:

1. **A note is a page.** Every Markdown file under `content/` becomes a page unless
   it has `draft: true`. Its URL is its path: `content/posts/My note.md` becomes
   `/posts/My-note`.
2. **Frontmatter decides where a note shows up.** A note with `type: post` appears on
   the Posts page, `type: mission` on Missions, `type: project` on Projects, and the
   home page lists the five latest posts and the active projects. Section pages carry
   `list: post | mission | project | home` and render themselves.
3. **Projects render their own header** (status badge, dates, tags, stack, resource
   buttons) from frontmatter. The note body is the project's working notes.
4. **Push is publish.** Cloudflare deploys on every push to `main`. A note is public
   the moment it is committed without `draft: true`.
5. **Old links keep working.** When a note moves or is renamed, its old path goes into
   `aliases:` and Quartz emits a redirect page.

---

## Working in Obsidian

Open the `content/` folder as an Obsidian vault. It is plain Markdown with
wikilinks, so any editor works, but Obsidian gives you templates, link
autocompletion and image pasting.

### Folder map

```
content/
  index.md          home page (list: home)
  about.md
  posts/            type: post      → /posts/
  projects/         type: project   → /projects/   (sub-folders hold project notes)
  missions/         type: mission   → /missions/
  stack/            tools and infrastructure notes
  wiki/             everything else in the garden
  _attachments/     images and PDFs (set as the Obsidian attachment folder)
  _templates/       Obsidian templates (never published)
  es/               Spanish mirror with the same layout
```

Recommended vault settings (the `.obsidian/` folder is not committed):
attachment folder `_attachments`, new notes in `posts`, templates folder `_templates`.

### Writing a post

Create a note in `posts/` from `_templates/template-note.md`:

```yaml
---
title: Ghost Terminals and Broken Symlinks on Omarchy
type: post
date: 2026-01-18
tags:
  - tutorial
  - stack
draft: true # remove or set to false when it is ready
---
```

That is all. The post appears on the Posts page and the home page, sorted by `date`,
with its tags linking to tag pages. An optional `description:` becomes the summary in
search results, social cards and the RSS feed; without it the first sentences are used.

### Adding a project

Create a note in `projects/` from `_templates/template-project.md`:

| Field                                           | Purpose                                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `type: project`                                 | lists it on Projects and on the home page when active                                                    |
| `subtitle`, `description`                       | shown in the header and on the project card                                                              |
| `date`, `lastUpdated`                           | start date and last update, shown as month and year                                                      |
| `status`                                        | `Planning`, `Development`, `Testing`, `Production`, `Ongoing`, `Archived` (Spanish equivalents work too) |
| `tags`, `stack`                                 | tag pills and a list of technologies                                                                     |
| `briefing`, `link`, `article`, `github`, `post` | resource buttons; a URL or a `[[wikilink]]`                                                              |
| `image`                                         | file name in `_attachments/`, shown on the project card                                                  |
| `note`                                          | a short remark, e.g. "documentation in progress"                                                         |

Notes that belong to a project (analysis, metrics, chapters) live in a sub-folder
named after it, for example `projects/Humanitarian Jobs Dashboard/`. Link them from
the project note with `[[wikilinks]]`.

### Adding a mission

Create a note in `missions/` from `_templates/template-mission.md`:

```yaml
---
title: Feb 2025 - Field Coordinator with Doctors of the World in UKRAINE
type: mission
date: 2025-02-01 # first day of the month the mission started; used for ordering
period: "Feb 2025" # displayed as written
emergency: "Conflict in Ukraine"
icon: "⚕️"
role: "Field Coordinator"
org: "Doctors of the World"
---
```

The Missions page renders one card per mission, newest first, with the line
`period | emergency | icon role with org`.

### Images, links and captions

- Paste images in Obsidian; they land in `_attachments/` and embed as `![[file.png]]`.
- `![[photo.jpg|A caption]]` produces a figure with that caption. Alt text that is only
  a file name or a size is ignored.
- Link notes with `[[Note title]]`; link folders with `[[posts/index|Posts]]`.
- Callouts (`> [!note]`), Mermaid diagrams, LaTeX and code blocks work as in Obsidian.

### Drafts and dates

- `draft: true` keeps a note out of the build entirely.
- `date` is the date shown and used for sorting. `created` and `modified` are optional;
  when a note was modified more than 30 days after it was written, the page shows
  "Updated <date>".
- Dates are `YYYY-MM-DD`. The content check fails on anything else.

### Before pushing

```bash
npm run lint:content      # invalid dates, leftover template comments, missing fields
npx quartz build --serve  # preview at http://localhost:8080
```

---

## The Spanish mirror

Every page can exist in Spanish at the same path under `content/es/`, with
`lang: es-ES` in its frontmatter. The language switcher in the sidebar links the two
versions, the navigation and labels translate themselves, and each language has its
own RSS feed (`/index.xml` and `/es/index.xml`).

Keeping a mirror in sync by hand is the part that stalled this blog for months, so it
is tracked: every Spanish note carries `source_hash`, a fingerprint of the English
note it was translated from.

```bash
npm run translations                        # current / stale / missing per note
npm run translate -- --dry-run              # what would be translated
npm run translate                           # translate missing and stale notes with Claude
npm run translate -- content/posts/x.md     # one note
npm run translations -- --stamp content/es/posts/x.md   # mark a hand-edited translation current
```

The translation script uses the Anthropic SDK and expects `ANTHROPIC_API_KEY` in the
environment. Locally the key comes from a password manager through the secret-free
`.env.refs` file (`pass-cli run --env-file .env.refs -- npm run translate`); no key is
stored in the repository. Translations are drafts: read them before committing.
Notes you do not want in Spanish can simply be left untranslated.

This also runs on its own: when English content lands on `main`, the
`Translate to Spanish` workflow drafts the missing or stale translations and opens a
pull request for review (it needs the `ANTHROPIC_API_KEY` repository secret; without
it the job only logs a warning).

---

## Publishing from another vault (optional)

Notes can also be written in a private Obsidian vault and copied here with an
allow-list. Add `publish: true` to a note (and optionally
`publish_to: posts|projects|missions|stack|wiki`), then run:

```bash
VAULT=/path/to/your/vault npm run publish:vault             # dry run: report only
VAULT=/path/to/your/vault npm run publish:vault -- --write  # copy notes and attachments
```

Only notes with `publish: true` are read into the site. The script never deletes site
content; notes that stop being published are listed as orphans for you to remove.
Embedded images and PDFs are copied to `_attachments/`.

---

## Site structure and automation

| Piece                                           | Where                                             |
| ----------------------------------------------- | ------------------------------------------------- |
| Section lists (Posts, Projects, Missions, home) | `quartz/components/SectionList.tsx`               |
| Project header                                  | `quartz/components/ProjectMeta.tsx`               |
| Sidebar navigation and tagline                  | `quartz/components/NavBar.tsx`, `SiteTagline.tsx` |
| Previous / next links                           | `quartz/components/PostNav.tsx`                   |
| Image captions                                  | `quartz/plugins/transformers/imageCaptions.ts`    |
| Palette, fonts, site title                      | `quartz.config.ts`                                |
| Design tokens, cards, badges                    | `quartz/styles/custom.scss`                       |
| Page layouts                                    | `quartz.layout.ts`                                |
| Frontmatter check                               | `scripts/lint-frontmatter.mjs`                    |
| CI on push and pull request                     | `.github/workflows/content-check.yaml`            |
| Weekly rebuild                                  | `.github/workflows/weekly-rebuild.yaml`           |

Local development:

```bash
npm ci
npx quartz build --serve
```

---

## License & attribution

- The content of this site is © Jesús Baena.
- The generator is a fork of [Quartz](https://github.com/jackyzha0/quartz) by
  [Jacky Zhao](https://github.com/jackyzha0), licensed under the MIT License.
