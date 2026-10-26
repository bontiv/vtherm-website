import { getT } from "@/app/i18n";
import { languages } from "@/app/i18n/settings";
import { getOrderedDocFiles } from "@/lib/docs";
import { docSourceUrl } from "@/lib/github";
import { linkItem, textResponse } from "@/lib/llms";
import { pageUrl } from "@/lib/semantic";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

/** Index of the documentation pages, with their Markdown source on GitHub */
export async function GET(_request: Request, { params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('common', { lng });
    const docFiles = await getOrderedDocFiles(lng);

    return textResponse([
        `# Versatile Thermostat - ${t('menu.docs')}`,
        `> ${t('description')}`,
        `## ${t('menu.docs')}`,
        docFiles.map(doc => linkItem(t(`docs.${doc}`, { defaultValue: doc }), pageUrl(lng, `/docs/${doc}/`), `Markdown source: ${docSourceUrl(lng, doc)}`)).join('\n'),
    ].join('\n\n'));
}
