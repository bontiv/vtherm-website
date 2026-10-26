import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { absolutizeLinks, htmlToText, linkItem, textResponse } from '@/lib/llms';
import { deviceConfigSections } from '@/lib/devicecontent';
import type { DeviceDefinition } from '@/lib/devicedb';
import sonoffTrvzb from '@/devicesdb/sonoff-trvzb/config.json';

/** Translation stub returning the key, followed by the interpolated values */
const t = ((key: string, options?: Record<string, unknown>) => options ? `${key} ${JSON.stringify(options)}` : key) as unknown as TFunction;

describe('absolutizeLinks', () => {
    it('prefixes site-relative links with the site URL', () => {
        expect(absolutizeLinks('See [docs](/en/docs/self-regulation/#direct) and [TRV](/fr/devices/trv-no-valve/).', 'https://example.org'))
            .toBe('See [docs](https://example.org/en/docs/self-regulation/#direct) and [TRV](https://example.org/fr/devices/trv-no-valve/).');
    });

    it('keeps absolute and protocol-relative links', () => {
        const md = '[a](https://github.com/x) [b](//cdn.example.org/img.png) [c](#anchor)';
        expect(absolutizeLinks(md, 'https://example.org')).toBe(md);
    });
});

describe('htmlToText', () => {
    it('turns paragraphs into plain text', () => {
        expect(htmlToText('<p>First sentence.</p><p>Second &amp; last.</p>')).toBe('First sentence. Second & last.');
    });

    it('removes nested and escaped tags', () => {
        expect(htmlToText('<<b>script>alert(1)<</b>/script> &lt;i&gt;text')).not.toMatch(/<\/?[a-z]/i);
    });

    it('removes i18next Trans placeholders', () => {
        expect(htmlToText('by <0>jmcollin78</0>')).toBe('by jmcollin78');
    });
});

describe('linkItem', () => {
    it('formats a llms.txt list item', () => {
        expect(linkItem('Title', 'https://example.org/')).toBe('- [Title](https://example.org/)');
        expect(linkItem('Title', 'https://example.org/', 'notes')).toBe('- [Title](https://example.org/): notes');
    });
});

describe('textResponse', () => {
    it('collapses blank lines and sets the content type', async () => {
        const response = textResponse('# Title\n\n\n\nBody\n\n', 'text/markdown');
        expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
        expect(await response.text()).toBe('# Title\n\nBody\n');
    });
});

describe('deviceConfigSections', () => {
    it('describes an over_climate valve with direct valve control', () => {
        const sections = deviceConfigSections((sonoffTrvzb as DeviceDefinition).config, t);
        expect(sections.map(s => s.title)).toEqual(['conf.step1.title', 'conf.step2.title', 'conf.step3.title']);
        expect(sections[0].paragraphs).toEqual(['conf.step1.section', 'conf.step1.over_climate']);
        expect(sections[2].items).toEqual(['conf.step3.over_climate', 'conf.step3.use_regulation']);
    });

    it('adds the temperature step and TPI delays when configured', () => {
        const sections = deviceConfigSections({
            thermostat_type: 'thermostat_over_switch',
            underlying_entity_ids: [],
            step_temperature: 0.5,
            minimal_activation_delay: 30,
        }, t);
        expect(sections[1].items).toContain('conf.step2.step_temperature {"step":0.5}');
        expect(sections[3].title).toBe('conf.step4.title');
        expect(sections[3].items).toEqual(['conf.step4.activation_delay {"delay":30}']);
    });
});
