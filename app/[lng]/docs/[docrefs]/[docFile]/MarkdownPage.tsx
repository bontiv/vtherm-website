'use client';

import { GitHubAPI } from "@/lib/github";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';
import { useState, memo } from "react";

const MarkdownPageBase: React.FC<{ file: string }> = ({ file }) => {
    const [content, setContent] = useState<string | null>(null)

    if (!content) {
        const githubApi = GitHubAPI.getInstance();
        githubApi.getGitTreePath(file).then(
            page_metadata => {
                githubApi.getGitBlob(page_metadata!.sha).then(
                    fileContent => {
                        setContent(Buffer.from(fileContent.content, 'base64').toString('utf-8'));
                    }
                );
            }
        );
    }

    return (
        <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]} urlTransform={x => x.startsWith('http') ? x : `https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/main/documentation/fr/${x}`}>{content}</Markdown>
        </div>
    )
};

const MarkdownPage = memo(MarkdownPageBase);
export default MarkdownPage;
