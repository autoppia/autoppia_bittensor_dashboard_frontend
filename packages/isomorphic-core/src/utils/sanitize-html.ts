/**
 * Sanitize HTML for safe display (e.g. when rendering content from Quill getHTML()/getSemanticHTML()).
 * Mitigates CVE-2025-15056 (Quill XSS via HTML export). Always use SafeQuillHtml or this when
 * rendering Quill output; we also use quill override to @lufrai/quill@2.0.4 for defense in depth.
 */
import DOMPurify from "isomorphic-dompurify";

const QUILL_ALLOWED_TAGS = [
  "p", "br", "span", "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li", "a", "sub", "sup", "h1", "h2", "h3", "h4", "h5", "h6",
  "div",
];

export function sanitizeQuillHtml(html: string): string {
  if (typeof html !== "string") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: QUILL_ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
    ADD_ATTR: ["target"],
  });
}
