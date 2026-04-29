'use client';

import { useT } from "@/app/i18n/client";
import Script from "next/script";

export default function Buymeacoffee({ name }: { name?: string }) {
    const { t } = useT('common');

    function onLoadDispatcher() {
        const evt = document.createEvent("Event");
        evt.initEvent("DOMContentLoaded", false, false);
        window.dispatchEvent(evt);
    }

    return <>
        <Script src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" async strategy="lazyOnload"
            data-id={name ?? "jmcollin78"}
            data-position="Right"
            data-x_margin="18"
            data-y_margin="18"
            data-name="BMC-Widget"
            data-color="#FFDD00"
            data-description={t('bmc.description')}
            data-message={t('bmc.message')}
            onLoad={onLoadDispatcher}
        />
        <div id="supportByBMC" />
    </>;
}