/**
 * sort-plugins.mjs
 *
 * Sorts pluginsdb/plugins.json by certification level (official → recommended → community),
 * then a-z by name.
 *
 * Usage:
 *   node scripts/sort-plugins.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PLUGINS_PATH = 'pluginsdb/plugins.json';

/** Certification sort order – lower index = higher priority */
export const CERT_ORDER = ['official', 'recommended', 'community'];

/**
 * Sort a plugin array: official → recommended → community, then a-z by name.
 *
 * @param {object[]} plugins
 * @returns {object[]}
 */
export function sortPlugins(plugins) {
    return [...plugins].sort((a, b) => {
        const certA = CERT_ORDER.indexOf(a.certification);
        const certB = CERT_ORDER.indexOf(b.certification);
        if (certA !== certB) return certA - certB;
        return (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' });
    });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pluginsFilePath = path.join(__dirname, '..', PLUGINS_PATH);
    const plugins = JSON.parse(fs.readFileSync(pluginsFilePath, 'utf8'));

    const unknownCerts = plugins.filter(plugin => !CERT_ORDER.includes(plugin.certification));
    if (unknownCerts.length > 0) {
        console.error(`❌  Unknown certification for: ${unknownCerts.map(plugin => plugin.name).join(', ')}`);
        process.exit(1);
    }

    fs.writeFileSync(pluginsFilePath, JSON.stringify(sortPlugins(plugins), null, 4) + '\n');
    console.log(`✅  Sorted ${plugins.length} plugins in ${PLUGINS_PATH}.`);
}
