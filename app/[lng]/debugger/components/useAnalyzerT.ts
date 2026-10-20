'use client';

import { useCallback } from "react";
import { useT } from "@/app/i18n/client";

/**
 * Translation hook of the analyzer namespace.
 * Interpolated values (dates, entity ids…) are rendered as React text,
 * which is already escaped: i18next must not HTML-escape them again.
 */
export function useAnalyzerT() {
    const { t, i18n } = useT('analyzer');
    const translate = useCallback(
        (key: string, options?: Record<string, unknown>): string =>
            t(key, { ...options, interpolation: { escapeValue: false } }) as string,
        [t]
    );
    return { t: translate, i18n };
}
