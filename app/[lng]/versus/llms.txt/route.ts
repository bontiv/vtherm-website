import { getT } from "@/app/i18n";
import { languages } from "@/app/i18n/settings";
import { linkItem, textResponse } from "@/lib/llms";
import { VERSUS_PAGES, VERSUS_SHARED_STRENGTHS, VersusPage } from "@/lib/pages";
import { pageUrl } from "@/lib/semantic";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

/** Markdown table cell content */
const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

/** Full content of the comparison pages */
export async function GET(_request: Request, { params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t: vs_t } = await getT('versus', { lng });
    /** Optional `versus.<page>.name_note`, explaining that the competitor name is a proper name */
    const nameNote = (page: VersusPage): string => vs_t(`${page.key}.name_note`, { defaultValue: '' });

    const parts: string[] = [
        `# ${vs_t('index.title')}`,
        `> ${vs_t('index.intro')}`,
        VERSUS_PAGES.map(page => linkItem(vs_t(`${page.key}.title`), pageUrl(lng, `/versus/${page.slug}/`), vs_t(`${page.key}.meta.description`))).join('\n'),
        // Disambiguation of competitor names that read like a judgement ("Better Thermostat")
        ...VERSUS_PAGES.map(nameNote).filter(Boolean).map(note => `> [!IMPORTANT]\n> ${note}`),
    ];

    for (const page of VERSUS_PAGES) {
        const { t } = await getT('versus', { lng, keyPrefix: page.key });
        const competitor = { competitor: page.competitor, interpolation: { escapeValue: false } };
        const support = (value: string) => vs_t(`common.support.${value}`);

        parts.push(
            `## ${t('title')}`,
            pageUrl(lng, `/versus/${page.slug}/`),
            nameNote(page) && `> [!IMPORTANT]\n> ${nameNote(page)}`,
            t('intro'),
            `### ${vs_t('common.about', competitor)}`,
            t('about'),
            `${vs_t('common.official', competitor)}: ${page.competitorUrl}`,
            `### ${vs_t('common.table_title')}`,
            [
                `| ${vs_t('common.feature')} | Versatile Thermostat | ${page.competitor} | |`,
                '| --- | --- | --- | --- |',
                ...page.features.map(row => `| ${cell(vs_t(`features.${row.key}`))} | ${support(row.vtherm)} | ${support(row.competitor)} | ${cell(t(`notes.${row.key}`, { defaultValue: '' }))} |`),
            ].join('\n'),
            vs_t('common.disclaimer', { ...competitor, version: page.checkedVersion }),
            `### ${vs_t('common.strengths_title')}`,
            [
                ...page.strengths.map(key => `- **${t(`strengths.${key}.title`)}**: ${t(`strengths.${key}.desc`)}`),
                ...VERSUS_SHARED_STRENGTHS.map(({ key, href }) => `- **${vs_t(`common.strengths.${key}.title`)}**: ${vs_t(`common.strengths.${key}.desc`)} (${pageUrl(lng, href)})`),
            ].join('\n'),
            `### ${vs_t('common.when_competitor', competitor)}`,
            page.whenCompetitor.map(key => `- ${t(`when_competitor.${key}`)}`).join('\n'),
            `### ${vs_t('common.migration_title', competitor)}`,
            t('migration'),
        );
    }

    return textResponse(parts.join('\n\n'));
}
