import { Root as HTMLRoot, Element, ElementContent } from "hast"
import { visit } from "unist-util-visit"
import { QuartzTransformerPlugin } from "../types"

/**
 * Turns a paragraph that contains only an image with meaningful alt text into
 * <figure><img/><figcaption>alt</figcaption></figure>.
 *
 * In Obsidian: ![[photo.jpg|A caption for the photo]] or ![A caption](photo.jpg).
 * Alt text that is just a file name, a size, or empty produces no caption.
 */
const FILE_LIKE = /^(pasted image|screenshot|img_|image)|\.(png|jpe?g|gif|webp|svg|avif)$/i
const SIZE_LIKE = /^\d+(x\d+)?$/

function captionFor(img: Element): string | undefined {
  const alt = typeof img.properties?.alt === "string" ? img.properties.alt.trim() : ""
  if (!alt || FILE_LIKE.test(alt) || SIZE_LIKE.test(alt)) return undefined
  return alt
}

export const ImageCaptions: QuartzTransformerPlugin = () => ({
  name: "ImageCaptions",
  htmlPlugins() {
    return [
      () => (tree: HTMLRoot) => {
        visit(tree, "element", (node: Element, index, parent) => {
          if (node.tagName !== "p" || !parent || index === undefined) return
          const children = node.children.filter(
            (c) => !(c.type === "text" && c.value.trim() === ""),
          )
          if (children.length !== 1) return
          const only = children[0]
          if (only.type !== "element" || only.tagName !== "img") return
          const caption = captionFor(only)
          if (!caption) return
          const figure: Element = {
            type: "element",
            tagName: "figure",
            properties: { className: ["image-figure"] },
            children: [
              only,
              {
                type: "element",
                tagName: "figcaption",
                properties: {},
                children: [{ type: "text", value: caption }],
              },
            ] as ElementContent[],
          }
          ;(parent as Element).children[index] = figure
        })
      },
    ]
  },
})
