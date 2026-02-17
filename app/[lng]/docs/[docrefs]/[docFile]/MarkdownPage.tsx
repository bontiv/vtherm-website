'use client';

import { GitHubAPI } from "@/lib/github";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { useState, useMemo, memo } from "react";

const MarkdownPage: React.FC<{ file: string }> = ({ file }) => {
    const [content, setContent] = useState<string | null>(null)

    useMemo(async () => {
        const githubApi = GitHubAPI.getInstance();
        const page_metadata = await githubApi.getGitTreePath(file);
        const fileContent = await githubApi.getGitBlob(page_metadata!.sha);
        setContent(Buffer.from(fileContent.content, 'base64').toString('utf-8'));
    }, [file])
    return (
        <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]} urlTransform={x => x.startsWith('http') ? x : `https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/main/documentation/fr/${x}`}>{content}</Markdown>
        </div>
    )
};

export default MarkdownPage
