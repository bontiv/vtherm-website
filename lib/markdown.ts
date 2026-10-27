/**
 * Helpers extracting SEO metadata from the documentation Markdown sources.
 */

/** Returns the text of the first level 1 heading, if any */
export function markdownTitle(md: string): string | undefined {
    return md.match(/^#[ \t]+(.+?)[ \t#]*$/m)?.[1].trim();
}

/** Removes inline Markdown/HTML formatting from a line of text */
function stripInline(text: string): string {
    // Repeat until stable, so that nested fragments such as `<scr<b>ipt>` cannot rebuild a tag
    let previous: string;
    do {
        previous = text;
        text = text.replace(/<[^>]*>/g, '');
    } while (text !== previous);

    return text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')       // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links
        .replace(/`([^`]*)`/g, '$1')                 // inline code
        .replace(/(\*\*|__)(.+?)\1/g, '$2')          // strong emphasis
        .replace(/(^|\W)([*_])(\S(?:.*?\S)?)\2(?!\w)/g, '$1$3') // emphasis, keeping snake_case words
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Builds a meta description from the first prose paragraphs of a Markdown document.
 * Headings, lists, tables, quotes, images and code blocks are skipped.
 * Returns undefined when the document has no usable prose.
 */
export function markdownDescription(md: string, maxLength = 155): string | undefined {
    const paragraphs: string[] = [];
    let current: string[] = [];
    let inCode = false;

    const flush = () => {
        const text = stripInline(current.join(' '));
        if (text.length > 0) paragraphs.push(text);
        current = [];
    };

    for (const line of md.split(/\r?\n/)) {
        if (/^\s*(```|~~~)/.test(line)) {
            inCode = !inCode;
            flush();
            continue;
        }
        if (inCode) continue;
        if (line.trim() === '' || /^\s*(#|[-*+] |\d+\. |\||>|!\[|<)/.test(line)) {
            flush();
            continue;
        }
        current.push(line.trim());
    }
    flush();

    let description = '';
    for (const p of paragraphs) {
        description = description ? `${description} ${p}` : p;
        if (description.length >= 70) break;
    }
    if (description.length === 0) return undefined;
    if (description.length <= maxLength) return description;

    const cut = description.slice(0, maxLength - 1);
    return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,;:.]+$/, '')}…`;
}

type HastNode = { type: string, tagName?: string, children?: HastNode[] };

/**
 * Rehype plugin keeping a single `h1` per document: the following ones become `h2`.
 */
export function rehypeSingleH1() {
    return (tree: HastNode) => {
        let seen = false;
        const walk = (node: HastNode) => {
            if (node.type === 'element' && node.tagName === 'h1') {
                if (seen) node.tagName = 'h2';
                seen = true;
            }
            node.children?.forEach(walk);
        };
        walk(tree);
    };
}

/**
 * Rewrites a link of a documentation Markdown file.
 * Links to sibling `.md` files (`page.md`, `./page.md`) target the matching site page,
 * other relative links (images…) are resolved against the source file on GitHub.
 * @param url link found in the Markdown document
 * @param lng language of the site page
 * @param source raw URL of the Markdown document
 */
export function docUrlTransform(url: string, lng: string, source: string): string {
    if (url.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(url)) {
        return url
    }

    const resolved = new URL(url, source)
    const directory = new URL('.', source)
    if (resolved.origin === directory.origin && resolved.pathname.startsWith(directory.pathname)) {
        const page = resolved.pathname.slice(directory.pathname.length).match(/^([\w-]+)\.md$/)
        if (page) {
            // Keep the anchor as written: URL would percent-encode accented anchors
            return `/${lng}/docs/${page[1]}/${url.match(/#.*$/)?.[0] ?? ''}`
        }
    }

    return resolved.href
}
