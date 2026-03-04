'use client';

import { trackAppRouter, push } from "@socialgouv/matomo-next";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

const Statistics: React.FC = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (MATOMO_URL && MATOMO_SITE_ID) {
            trackAppRouter({
                url: MATOMO_URL,
                siteId: MATOMO_SITE_ID,
                pathname,
                searchParams,
                disableCookies: true,
                onInitialization: () => {
                    push(["setRequestMethod", "POST"])
                    push(['disableAlwaysUseSendBeacon'])
                }
            });
        }
    }, [pathname, searchParams]);
    return null;
}

export default Statistics;