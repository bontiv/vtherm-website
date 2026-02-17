'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { useState, memo } from "react";
import rehypeSlug from 'rehype-slug';

const MarkdownPageBase: React.FC<{ file: string, lng: string, version: string }> = ({ file, lng, version }) => {
    const [content, setContent] = useState<string | null>(null)


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

    if (!content) {
        // const githubApi = GitHubAPI.getInstance();
        // githubApi.getGitTreePath(file).then(
        //     page_metadata => {
        //         githubApi.getGitBlob(page_metadata!.sha).then(
        //             fileContent => {
        //                 setContent(Buffer.from(fileContent.content, 'base64').toString('utf-8'));
        //             }
        //         );
        //     }
        // );
        fetch(`https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/${version}${file}`,
            {
                cache: "force-cache"
            }
        ).then(x => x.text().then(x => setContent(x)))
    }

    return (
        <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} urlTransform={urlTransform}>{content}</Markdown>
        </div>
    )
};

const MarkdownPage = memo(MarkdownPageBase);
export default MarkdownPage;
