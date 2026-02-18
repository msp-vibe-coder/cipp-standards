/**
 * Format a date string (YYYY-MM-DD) to M/DD/YYYY
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}

/**
 * Check if a date string is within the last N days
 */
export function isWithinDays(dateStr: string, days: number): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= days * 24 * 60 * 60 * 1000 && diff >= 0;
}

/**
 * Parse markdown-style links [text](url) and **bold** text, return JSX-safe segments
 */
export interface TextSegment {
  type: "text" | "link" | "bold";
  content: string;
  href?: string;
}

export function parseMarkdown(text: string): TextSegment[] {
  if (!text) return [];
  const segments: TextSegment[] = [];
  // Match links [text](url) or bold **text**
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      // Link match
      segments.push({ type: "link", content: match[1], href: match[2] });
    } else {
      // Bold match
      segments.push({ type: "bold", content: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}

/** @deprecated Use parseMarkdown instead */
export const parseMarkdownLinks = parseMarkdown;

/**
 * Truncate text to a max length, adding ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
