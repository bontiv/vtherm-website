'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { useState, memo, useEffect, useRef } from "react";
import rehypeSlug from 'rehype-slug';
import type { Mermaid } from 'mermaid';

const rehypePlugins: object[] = [rehypeSlug]

const MarkdownPageBase: React.FC<{ file: string, lng: string, version: string, default_page?: string }> = ({ file, lng, version, default_page }) => {
    const [content, setContent] = useState<string | undefined>(default_page)
    const initialized = useRef(false);
    const mermaid = useRef<Mermaid | undefined>(undefined);
    const [isDark, setDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        return document.documentElement.classList.contains('dark') || mq.matches
    });

    function urlTransform(url: string): string {
        if (url.startsWith('http')) {
            return url
        }

        if (url.startsWith('#')) {
            return url
        }

        const page = url.match(/^([\w-]+)\.md$/)
        if (page) {
            return `/${lng}/docs/${page[1]}/`
        }


        return `https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/main/documentation/fr/${url}`
    }

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            fetch(`https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/${version}${file}`,
                {
                    cache: "force-cache"
                }
            ).then(x => x.text().then(x => setContent(x)))
        }
    }, [file, version])

    useEffect(() => {
        async function init() {
            if (!mermaid.current) {
                mermaid.current = (await import('mermaid')).default
                mermaid.current.initialize({
                    startOnLoad: false,
                    theme: isDark ? 'dark' : 'neutral'
                })
            }
            mermaid.current.run({
                querySelector: '.language-mermaid',
            })
        }
        init()
    }, [content, isDark])

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => setDark(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, []);

    return (
        <div className="markdown-body" data-pagefind-body>
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} urlTransform={urlTransform}>{content}</Markdown>
        </div>
    )
};

const MarkdownPage = memo(MarkdownPageBase);
export default MarkdownPage;
