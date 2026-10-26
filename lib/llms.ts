/**
 * Helpers for the llms.txt files and the Markdown versions of the pages.
 * See https://llmstxt.org/ for the format.
 */

/** Rewrite site-relative Markdown links (`](/en/docs/...)`) to absolute URLs */
export function absolutizeLinks(markdown: string, siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? ''): string {
    return markdown.replace(/\]\(\/(?!\/)/g, `](${siteUrl}/`);
}

/** Convert a short HTML description (plugins database) to plain text */
export function htmlToText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|li|div)>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Markdown list item `- [title](url): notes` */
export function linkItem(title: string, url: string, notes?: string): string {
    return `- [${title}](${url})${notes ? `: ${notes}` : ''}`;
}

/** Static response of a llms.txt (plain text) or Markdown file */
export function textResponse(body: string, type: 'text/plain' | 'text/markdown' = 'text/plain'): Response {
    return new Response(body.replace(/\n{3,}/g, '\n\n').trim() + '\n', {
        headers: { 'Content-Type': `${type}; charset=utf-8` },
    });
}
