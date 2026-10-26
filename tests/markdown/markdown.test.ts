import { describe, expect, it } from 'vitest';
import { markdownDescription, markdownTitle, rehypeSingleH1 } from '@/lib/markdown';

describe('markdownTitle', () => {
    it('finds the first level 1 heading after a table of contents', () => {
        expect(markdownTitle('- [A](#a)\n- [B](#b)\n\n# Choosing Basic Attributes\n\nText\n# Other')).toBe('Choosing Basic Attributes');
    });

    it('handles CRLF line endings and ignores lower headings', () => {
        expect(markdownTitle('## Sub\r\n# Title \r\n')).toBe('Title');
    });

    it('returns undefined without level 1 heading', () => {
        expect(markdownTitle('## Only a subtitle')).toBeUndefined();
    });
});

describe('markdownDescription', () => {
    it('skips headings, lists, images and code to keep the prose', () => {
        const md = '# Title\n- [TOC](#toc)\n![image](a.png)\n```yaml\ncode: here\n```\nThis thermostat can control **3 types** of [equipment](over-switch.md) in `Home Assistant`, with many features and a smart algorithm.\n';
        expect(markdownDescription(md)).toBe('This thermostat can control 3 types of equipment in Home Assistant, with many features and a smart algorithm.');
    });

    it('keeps underscores of identifiers while removing emphasis', () => {
        expect(markdownDescription('The `over_climate` type is *very* useful with __any__ thermostat_over_switch device you already own at home.'))
            .toBe('The over_climate type is very useful with any thermostat_over_switch device you already own at home.');
    });

    it('joins short paragraphs until the description is long enough', () => {
        expect(markdownDescription('Short one.\n\nSecond paragraph with enough words to reach the minimum length of a description.'))
            .toBe('Short one. Second paragraph with enough words to reach the minimum length of a description.');
    });

    it('truncates on a word boundary', () => {
        const description = markdownDescription('word '.repeat(100), 50)!;
        expect(description.length).toBeLessThanOrEqual(50);
        expect(description).toMatch(/word…$/);
    });

    it('returns undefined without prose', () => {
        expect(markdownDescription('# Title\n- item\n| a | b |')).toBeUndefined();
    });
});

describe('rehypeSingleH1', () => {
    it('turns every h1 but the first into h2', () => {
        const tree = {
            type: 'root', children: [
                { type: 'element', tagName: 'h1' },
                { type: 'element', tagName: 'div', children: [{ type: 'element', tagName: 'h1' }] },
                { type: 'element', tagName: 'h1' },
            ]
        };
        rehypeSingleH1()(tree);
        expect(tree.children.map(x => x.tagName)).toEqual(['h1', 'div', 'h2']);
        expect(tree.children[1].children![0].tagName).toBe('h2');
    });
});
