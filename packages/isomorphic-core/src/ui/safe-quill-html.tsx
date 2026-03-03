"use client";

import { sanitizeQuillHtml } from "../utils/sanitize-html";
import cn from "../utils/class-names";

interface SafeQuillHtmlProps {
  /** HTML from Quill getHTML() or getSemanticHTML(); will be sanitized before render (CVE-2025-15056). */
  readonly html: string;
  readonly className?: string;
  readonly tag?: keyof JSX.IntrinsicElements;
}

/**
 * Renders Quill-origin HTML safely. Use this whenever displaying content that came from
 * QuillEditor (e.g. getHTML() / getSemanticHTML()) to mitigate XSS (CVE-2025-15056).
 */
export default function SafeQuillHtml({
  html,
  className,
  tag: Tag = "div",
}: SafeQuillHtmlProps) {
  const sanitized = sanitizeQuillHtml(html);
  if (!sanitized) return null;
  return (
    <Tag
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
