"use client";

import { parseMarkdown } from "@/lib/utils";

interface MarkdownTextProps {
  text: string;
  className?: string;
}

export default function MarkdownText({ text, className }: MarkdownTextProps) {
  const segments = parseMarkdown(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "link" ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary underline hover:text-brand-primary-hover"
          >
            {seg.content}
          </a>
        ) : seg.type === "bold" ? (
          <strong key={i}>{seg.content}</strong>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </span>
  );
}
