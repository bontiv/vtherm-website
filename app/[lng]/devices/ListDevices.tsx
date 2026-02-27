'use client';

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import './state-color.css';
import { useState } from "react";
import { LinkLocale } from "@/components/LinkLocale";
import { useT } from "@/app/i18n/client";

type DeviceSpec = {
    manufacturer: string,
    model: string,
    slug: string,
    state: string,
    img: string,
    title?: string,
    type: string
}

const DeviceCard: React.FC<{ device: DeviceSpec }> = ({ device }) => {
    const { t } = useT('devices')

    return <LinkLocale href={`/devices/${device.slug}/`} className="bg-slate-100 rounded border-2 border-solid border-slate-300 text-gray-700 w-3xs">
        <h3 className="text-center font-bold py-2">{device.title ? device.title : `${device.manufacturer} - ${device.model}`}</h3>
        <div className="p-1 relative bg-white">
            <Image className="mx-auto" src={device.img} alt={`${device.manufacturer} ${device.model}`} width={256} height={256} />
            <p className={`px-4 py-1 text-sm font-bold badge ${device.state} absolute bottom-0 left-0 rounded-tr-lg`}>{t('states.' + device.state)}</p>
        </div>
    </LinkLocale>
}

const ListDevices: React.FC<{ devices: DeviceSpec[] }> = ({ devices }) => {
    const [user_filter, setUserFilter] = useState<{
        manufacturer: string,
        model: string,
        state: string,
        type: string
    }>({
        manufacturer: '',
        model: '',
        state: '',
        type: ''
    })

    const { t } = useT('devices')

    return <div>
        <div className="bg-slate-200 px-2 py-2 rounded text-gray-500">
            <form className="flex gap-2 flex-wrap" onSubmit={(evt) => evt.preventDefault()}>
                <input name="manufacturer" onChange={(evt) => setUserFilter({ ...user_filter, manufacturer: evt.target.value })} type="text" className="bg-slate-50 flex-1 px-2 py-1" placeholder={t('manufacturer')} />
                <input name="model" onChange={(evt) => setUserFilter({ ...user_filter, model: evt.target.value })} type="text" className="bg-slate-50 flex-1 px-2 py-1" placeholder={t('model')} />
                <select name="support" onChange={(evt) => setUserFilter({ ...user_filter, state: evt.target.value })} className="bg-slate-50 flex-1 px-2 py-1">
                    <option value=''>{t('all-devices')}</option>
                    <option className="text-green-500" value='supported'>{t('states.supported')}</option>
                    <option className="text-blue-500" value='community'>{t('states.community')}</option>
                    <option className="text-yellow-500" value='partially'>{t('states.partially')}</option>
                </select>
                <select name="type" onChange={(evt) => setUserFilter({ ...user_filter, type: evt.target.value })} className="bg-slate-50 flex-1 px-2 py-1">
                    <option value=''>{t('all-types')}</option>
                    <option value='trv'>{t('types.trv')}</option>
                    <option value='climate'>{t('types.climate')}</option>
                    <option value='electric'>{t('types.electric')}</option>
                </select>
                {/* <button type="submit" className="text-blue-900 duration-300 transition-all hover:text-blue-600 cursor-pointer">
                    <MagnifyingGlassCircleIcon className="w-7.5 " />
                </button> */}
            </form>
        </div>
        <div className="bg-sky-100 flex gap-6 mt-4 rounded-2xl text-blue-900 px-6 py-3 items-center">
            <InformationCircleIcon className="h-8" />
            <p>
                {t('notice')}
            </p>
        </div>
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