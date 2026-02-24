'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { useState, memo, useEffect, useRef } from "react";
import rehypeSlug from 'rehype-slug';

const MarkdownPageBase: React.FC<{ file: string, lng: string, version: string, default_page?: string }> = ({ file, lng, version, default_page }) => {
    const [content, setContent] = useState<string | undefined>()
    const initialized = useRef(false);

    function urlTransform(url: string): string {
        if (url.startsWith('http')) {
            return url
        }

        if (url.startsWith('#')) {
            return url
        }

        const page = url.match(/^([\w-]+)\.md$/)
        if (page) {
            return `/${lng}/docs/${version}/${page[1]}/`
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

    return (
        <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} urlTransform={urlTransform}>{content ?? default_page}</Markdown>
        </div>
    )
};

const MarkdownPage = memo(MarkdownPageBase);
export default MarkdownPage;
