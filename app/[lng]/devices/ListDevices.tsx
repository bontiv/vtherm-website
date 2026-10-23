'use client';

import { InformationCircleIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import './state-color.css';
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { LinkLocale } from "@/components/LinkLocale";
import { useT } from "@/app/i18n/client";
import { Button } from "@/components/ui/Button";
import { replaceUrl, subscribeToLocation } from "@/lib/location";

type AffiliateLinks = {
    fr?: string,
    de?: string,
    en?: string
}

type DeviceSpec = {
    manufacturer: string,
    model: string,
    slug: string,
    state: string,
    img: string,
    title?: string,
    type: string,
    affiliate?: AffiliateLinks
}

const DeviceCard: React.FC<{ device: DeviceSpec }> = ({ device }) => {
    const { t } = useT('devices')
    const lng = useParams()?.lng
    const affiliateUrl = typeof lng === 'string' ? device.affiliate?.[lng as keyof AffiliateLinks] : undefined

    return <div className="bg-white rounded border-2 border-solid border-slate-300 text-gray-700 w-3xs flex flex-col">
        <LinkLocale href={`/devices/${device.slug}/`} className="grow flex flex-col">
            <h3 className="text-center text-lg font-bold py-2 bg-slate-100">{device.title ? device.title : `${device.manufacturer} - ${device.model}`}</h3>
            <div className="p-1 relative grow">
                <Image className="mx-auto" src={device.img} alt={`${device.manufacturer} ${device.model}`} width={256} height={256} />
                <p className={`px-4 py-1 text-sm font-bold badge ${device.state} absolute bottom-0 left-0 rounded-tr-lg`}>{t('states.' + device.state)}</p>
            </div>
        </LinkLocale>
        {affiliateUrl && <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2 border-t border-solid border-slate-300 text-gray-700 hover:bg-slate-100 transition-colors rounded-b">
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">{t('buy')}</span>
        </a>}
    </div>
}

const deviceStates = ['supported', 'community', 'partially', 'unsupported'];
const deviceTypes = ['trv', 'climate', 'electric', 'sensor'];

interface Filters {
    manufacturer: string,
    model: string,
    state: string,
    type: string
}

type TextFilters = Pick<Filters, 'manufacturer' | 'model'>;

// Unknown values are ignored, so that a hand-edited or outdated link still shows a valid page.
const parseFilters = (search: string): Filters => {
    const params = new URLSearchParams(search);
    const state = params.get('state') ?? '';
    const type = params.get('type') ?? '';
    return {
        manufacturer: params.get('manufacturer') ?? '',
        model: params.get('model') ?? '',
        state: deviceStates.includes(state) ? state : '',
        type: deviceTypes.includes(type) ? type : '',
    };
};

// Empty filters are left out and parameters keep the form order, so that a given selection always gives the same URL.
const serializeFilters = (filters: Filters): string => {
    const params = (['manufacturer', 'model', 'state', 'type'] as const)
        .filter(name => filters[name] !== '')
        .map(name => `${name}=${encodeURIComponent(filters[name])}`);
    return params.length > 0 ? `?${params.join('&')}` : '';
};

// The filters are kept in the query string (e.g. ?state=supported&type=trv) so that a selection can be shared.
// Changes are applied to the filters currently in the URL rather than to a render-time copy,
// so that a delayed update (the text inputs) does not revert a filter changed in the meantime.
const updateFilters = (changes: Partial<Filters>) =>
    replaceUrl(window.location.pathname + serializeFilters({ ...parseFilters(window.location.search), ...changes }) + window.location.hash);

const ListDevices: React.FC<{ devices: DeviceSpec[] }> = ({ devices }) => {
    const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => '');
    const filters = useMemo(() => parseFilters(search), [search]);

    // The text inputs are filtered on immediately but written to the URL once typing pauses,
    // as browsers throttle replaceState. They follow the URL when it is changed from elsewhere.
    const [text, setText] = useState<TextFilters>({ manufacturer: filters.manufacturer, model: filters.model });
    const [urlText, setUrlText] = useState<TextFilters>(text);
    if (filters.manufacturer !== urlText.manufacturer || filters.model !== urlText.model) {
        const next = { manufacturer: filters.manufacturer, model: filters.model };
        setUrlText(next);
        setText(next);
    }

    useEffect(() => {
        if (text.manufacturer === filters.manufacturer && text.model === filters.model) {
            return;
        }
        const timer = setTimeout(() => updateFilters(text), 300);
        return () => clearTimeout(timer);
    }, [text, filters.manufacturer, filters.model]);

    const user_filter = { ...filters, ...text };

    const { t } = useT('devices')

    return <div>
        <div className="bg-slate-200 dark:bg-vtherm-primary px-2 py-2 rounded text-gray-500 dark:text-vtherm-light">
            <form className="flex gap-2 flex-wrap" onSubmit={(evt) => evt.preventDefault()}>
                <input name="manufacturer" value={text.manufacturer} onChange={(evt) => setText({ ...text, manufacturer: evt.target.value })} type="text" className="bg-slate-50 dark:bg-vtherm-secondary/60 flex-1 px-2 py-1" placeholder={t('manufacturer')} />
                <input name="model" value={text.model} onChange={(evt) => setText({ ...text, model: evt.target.value })} type="text" className="bg-slate-50 dark:bg-vtherm-secondary/60 flex-1 px-2 py-1" placeholder={t('model')} />
                <select name="support" value={filters.state} onChange={(evt) => updateFilters({ state: evt.target.value })} className="bg-slate-50 dark:bg-vtherm-secondary/60 flex-1 px-2 py-1">
                    <option value=''>{t('all-devices')}</option>
                    <option className="text-green-500" value='supported'>{t('states.supported')}</option>
                    <option className="text-blue-500" value='community'>{t('states.community')}</option>
                    <option className="text-yellow-500" value='partially'>{t('states.partially')}</option>
                    <option className="text-red-500" value='unsupported'>{t('states.unsupported')}</option>
                </select>
                <select name="type" value={filters.type} onChange={(evt) => updateFilters({ type: evt.target.value })} className="bg-slate-50 dark:bg-vtherm-secondary/60 flex-1 px-2 py-1">
                    <option value=''>{t('all-types')}</option>
                    <option value='trv'>{t('types.trv')}</option>
                    <option value='climate'>{t('types.climate')}</option>
                    <option value='electric'>{t('types.electric')}</option>
                    <option value='sensor'>{t('types.sensor')}</option>
                </select>
                {/* <button type="submit" className="text-blue-900 duration-300 transition-all hover:text-blue-600 cursor-pointer">
                    <MagnifyingGlassCircleIcon className="w-7.5 " />
                </button> */}
            </form>
        </div>
        <div className="bg-sky-100 dark:bg-vtherm-tertiary dark:text-vtherm-light  mt-4 rounded-2xl text-blue-900 px-6 py-3 flex flex-col gap-6 md:flex-row items-center">
            <div className="flex items-center py-3 gap-6">
                <InformationCircleIcon className="h-8 min-w-8" />
                <p>{t('notice')}</p>
            </div>
            <Button variant="secondary" className="text-nowrap"><a href="https://github.com/bontiv/vtherm-website/issues/new?template=new_device.yml" target="_blank">{t('contributing')}</a></Button>
        </div>
        <h2 className="hidden">{t('all-devices')}</h2>
        <div className="flex flex-wrap gap-3 justify-center my-5">
            {devices.filter(x =>
                (user_filter.manufacturer.length == 0 || x.manufacturer.toLowerCase().includes(user_filter.manufacturer.toLowerCase()))
                && (user_filter.model.length == 0 || x.model.toLowerCase().includes(user_filter.model.toLowerCase()))
                && (user_filter.state.length == 0 || x.state == user_filter.state)
                && (user_filter.type.length == 0 || x.type == user_filter.type)
            ).map((x, i) => <DeviceCard key={i} device={x} />)}
        </div>
    </div>
}

export default ListDevices;