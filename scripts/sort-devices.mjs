/**
 * sort-devices.mjs
 *
 * Sorts devicesdb/devices.json by support state (supported → community → partially → unsupported),
 * then a-z by the name shown on the device card.
 *
 * Usage:
 *   node scripts/sort-devices.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DEVICES_PATH = 'devicesdb/devices.json';

/** Support state sort order – lower index = higher priority */
const STATE_ORDER = ['supported', 'community', 'partially', 'unsupported'];

/**
 * Same name as the device card (app/[lng]/devices/ListDevices.tsx).
 *
 * @param {object} device
 * @returns {string}
 */
function displayName(device) {
    return device.title ? device.title : `${device.manufacturer} - ${device.model}`;
}

/**
 * Sort a device array: supported → community → partially → unsupported, then a-z by name.
 *
 * @param {object[]} devices
 * @returns {object[]}
 */
function sortDevices(devices) {
    return [...devices].sort((a, b) => {
        const stateA = STATE_ORDER.indexOf(a.state);
        const stateB = STATE_ORDER.indexOf(b.state);
        if (stateA !== stateB) return stateA - stateB;
        return displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' });
    });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devicesFilePath = path.join(__dirname, '..', DEVICES_PATH);
const devices = JSON.parse(fs.readFileSync(devicesFilePath, 'utf8'));

const unknownStates = devices.filter(device => !STATE_ORDER.includes(device.state));
if (unknownStates.length > 0) {
    console.error(`❌  Unknown state for: ${unknownStates.map(displayName).join(', ')}`);
    process.exit(1);
}

fs.writeFileSync(devicesFilePath, JSON.stringify(sortDevices(devices), null, 4) + '\n');
console.log(`✅  Sorted ${devices.length} devices in ${DEVICES_PATH}.`);
