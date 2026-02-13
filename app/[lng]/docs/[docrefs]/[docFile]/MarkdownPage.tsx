'use client';

import { GitHubAPI } from "@/lib/github";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';

const MarkdownPage: React.FC<{ file: string }> = async ({ file }) => {
    const githubApi = new GitHubAPI();
    const page_metadata = await githubApi.getGitTreePath(file);
    const fileContent = await githubApi.getGitBlob(page_metadata!.sha);

    const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
    return (
        <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
    )
}

export default MarkdownPage
