import { GitHubAPI } from "@/lib/github";
import React from "react";
import MarkDownPage from "./MarkdownPage";

export const DocPage: React.FC<{ params: Promise<any> }> = async ({ params }) => {
    const { lng, docrefs, docFile }: { lng: string, docrefs: string, docFile: string } = await params;
    console.log('Rendering DocPage with params:', lng, docrefs, docFile);
    return (
        <div className="space-y-12">
            <MarkDownPage file={`${docrefs}/documentation/${lng}/${docFile}.md`} />
        </div>
    )
}

export default DocPage;

export async function generateStaticParams({ params }: any) {
    const { lng, docrefs }: { lng: string, docrefs: string } = params;
    const githubApi = GitHubAPI.getInstance();

    const rootDir = await githubApi.getGitTree(docrefs);
    const docSha = rootDir.tree.find((item: any) => item.path === 'documentation')?.sha;
    if (!docSha) {
        console.error(`No 'documentations' directory found in the root of the repository for tag: ${docrefs}`);
        return [];
    }

    const docLangs = await githubApi.getGitTree(docSha);
    const docLangSha = docLangs.tree.find((item: any) => item.path === lng)?.sha;
    if (!docLangSha) {
        console.error(`No directory for language '${lng}' found in 'documentation' for tag: ${docrefs}`);
        return [];
    }

    const docFiles = await githubApi.getGitTree(docLangSha);
    return docFiles.tree.filter(x => x.path.endsWith('.md')).map((file: any) => ({
        lng,
        docrefs,
        docFile: file.path.slice(0, -3) // remove .md and lowercase first letter
    }));
}

