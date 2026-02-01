import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { Date as DateComponent, getDate } from "./Date"

const ProjectMeta: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
  const frontmatter = fileData.frontmatter
  const description = frontmatter?.description
  const status = frontmatter?.status
  const link = frontmatter?.link
  const article = frontmatter?.article
  const github = frontmatter?.github
  const post = frontmatter?.post
  const lastUpdated = frontmatter?.lastUpdated
  const tags = frontmatter?.tags

  // Only show if at least one project property exists
  if (!description && !status && !link && !article && !github && !post && !lastUpdated && (!tags || tags.length === 0)) {
    return null
  }

  return (
    <div class={classNames(displayClass, "project-meta")}>
      <div class="project-meta-header">PROPERTIES</div>
      <div class="project-meta-table">
        <div class="project-meta-row">
          <div class="project-meta-label">
            <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M2.5 3.5h11v1h-11v-1zm0 3h11v1h-11v-1zm0 3h11v1h-11v-1zm0 3h11v1h-11v-1z"></path></svg>
            <span>description</span>
          </div>
          <div class="project-meta-value">{description || "Empty"}</div>
        </div>

        {lastUpdated && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 13a5 5 0 110-10 5 5 0 010 10zm.5-8v3.793l2.646 2.647-.707.707L7.5 9.207V5h1z"></path></svg>
              <span>lastUpdated</span>
            </div>
            <div class="project-meta-value project-date">
              📅 {lastUpdated}
            </div>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M2 4.5l6-2.5 6 2.5v7l-6 2.5-6-2.5v-7zm1 .72v5.56l5 2.08v-5.56l-5-2.08zm6 7.64l5-2.08V5.22l-5 2.08v5.56z"></path></svg>
              <span>tags</span>
            </div>
            <div class="project-meta-value project-tags">
              {tags.map((tag: string) => (
                <span class="project-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {status && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 13a5 5 0 110-10 5 5 0 010 10z"></path></svg>
              <span>status</span>
            </div>
            <div class="project-meta-value">{status}</div>
          </div>
        )}

        {link && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M7.5 10.5l-3 3a2.12 2.12 0 11-3-3l3-3a2.12 2.12 0 013 0M8.5 5.5l3-3a2.12 2.12 0 113 3l-3 3a2.12 2.12 0 01-3 0"></path></svg>
              <span>link</span>
            </div>
            <div class="project-meta-value">
              <a href={link} class="project-link-url" target="_blank" rel="noopener noreferrer">{link} ↗</a>
            </div>
          </div>
        )}

        {article && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M7.5 10.5l-3 3a2.12 2.12 0 11-3-3l3-3a2.12 2.12 0 013 0M8.5 5.5l3-3a2.12 2.12 0 113 3l-3 3a2.12 2.12 0 01-3 0"></path></svg>
              <span>article</span>
            </div>
            <div class="project-meta-value">
              <a href={article} class="project-link-url" target="_blank" rel="noopener noreferrer">{article} ↗</a>
            </div>
          </div>
        )}

        {github && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M7.5 10.5l-3 3a2.12 2.12 0 11-3-3l3-3a2.12 2.12 0 013 0M8.5 5.5l3-3a2.12 2.12 0 113 3l-3 3a2.12 2.12 0 01-3 0"></path></svg>
              <span>github</span>
            </div>
            <div class="project-meta-value">
              <a href={github} class="project-link-url" target="_blank" rel="noopener noreferrer">{github} ↗</a>
            </div>
          </div>
        )}

        {post && (
          <div class="project-meta-row">
            <div class="project-meta-label">
              <svg class="property-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M7.5 10.5l-3 3a2.12 2.12 0 11-3-3l3-3a2.12 2.12 0 013 0M8.5 5.5l3-3a2.12 2.12 0 113 3l-3 3a2.12 2.12 0 01-3 0"></path></svg>
              <span>post</span>
            </div>
            <div class="project-meta-value">
              {(() => {
                const markdownLinkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/
                const match = post.match(markdownLinkRegex)
                if (match) {
                  const [_, text, url] = match
                  return <a href={url} class="project-link-url" target="_blank" rel="noopener noreferrer">{text} ↗</a>
                } else if (post.startsWith('http')) {
                  return <a href={post} class="project-link-url" target="_blank" rel="noopener noreferrer">{post} ↗</a>
                } else {
                  return post
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

ProjectMeta.css = `
.project-meta {
  margin: 1.5rem 0 2rem 0;
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  background-color: var(--highlight);
  overflow: hidden;
}

.project-meta-header {
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: var(--light);
  border-bottom: 1px solid var(--lightgray);
}

.project-meta-table {
  display: flex;
  flex-direction: column;
}

.project-meta-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--lightgray);
  font-size: 0.9rem;
  align-items: start;
}

.project-meta-row:last-child {
  border-bottom: none;
}

.project-meta-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--gray);
  font-size: 0.85rem;
}

.property-icon {
  flex-shrink: 0;
  opacity: 0.6;
  fill: currentColor;
}

.project-meta-value {
  color: var(--dark);
  word-break: break-word;
  line-height: 1.5;
}

.project-empty {
  color: var(--gray);
  opacity: 0.5;
  font-style: italic;
}

.project-date {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.project-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background-color: var(--secondary);
  color: var(--light);
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.project-link-url {
  color: var(--secondary);
  text-decoration: none;
  word-break: break-all;
}

.project-link-url:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .project-meta-row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
  
  .project-meta-label {
    font-weight: 600;
  }
}
`

export default (() => ProjectMeta) satisfies QuartzComponentConstructor
