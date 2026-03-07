import { GitHubAPI } from "@/lib/github";
import React from "react";
import MarkDownPage from "./MarkdownPage";

import { getAlternatesMetadata, getT } from "@/app/i18n";
import { Metadata } from "next";
import { opengraph_defaults } from "@/lib/opengraph";

const decodeEntity = (str: string) => str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

export async function generateMetadata({ params }: { params: Promise<{ lng: string, docFile: string }> }): Promise<Metadata> {
    const { lng, docFile } = await params
    const { t } = await getT('common', { lng })
    const content = await fetch(`https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/main/documentation/${lng}/${docFile}.md`)

    const title = (await content.text()).match(/^# (.*)\n/)
    const web_title = decodeEntity(t('title_doc', { title: title ? title[1] : docFile }))
    const path = `/docs/${docFile}/`
    const alternates = getAlternatesMetadata(path, lng);

    return {
        title: web_title,
        openGraph: {
            title: web_title,
            type: "website",
            siteName: "Versatile Thermostat",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}${path}`,
            ...opengraph_defaults,
        },
        alternates,
    }
}

const DocPage: React.FC<{ params: Promise<{ lng: string, docFile: string, docContent: string }> }> = async ({ params }) => {
    const { lng, docFile } = await params;
    const content = await fetch(`https://raw.githubusercontent.com/jmcollin78/versatile_thermostat/main/documentation/${lng}/${docFile}.md`)

    return (
        <div className="space-y-12" lang={lng}>
            <MarkDownPage lng={lng} version={'main'} file={`/documentation/${lng}/${docFile}.md`} default_page={await content?.text()} />
        </div>
    )
}

export default DocPage;

export async function generateStaticParams({ params }: { params: { lng: string, docFile: string } }) {
    const { lng }: { lng: string } = params;
    const githubApi = GitHubAPI.getInstance();

    const rootDir = await githubApi.getGitTree('main');
    const docSha = rootDir.tree.find((item) => item.path === 'documentation')?.sha;
    if (!docSha) {
        console.error(`No 'documentations' directory found in the root of the repository for tag: main`);
        return [];
    }

    const docLangs = await githubApi.getGitTree(docSha);
    const docLangSha = docLangs.tree.find((item) => item.path === lng)?.sha;
    if (!docLangSha) {
        console.error(`No directory for language '${lng}' found in 'documentation' for tag: main`);
        return [];
    }

    const docFiles = await githubApi.getGitTree(docLangSha);
    const paramsList = []

    for (const file of docFiles.tree.filter(x => x.path.endsWith('.md'))) {
        paramsList.push({
            lng,
            docFile: file.path.slice(0, -3), // remove .md and lowercase first letter
        })
    }
    return paramsList;
}

