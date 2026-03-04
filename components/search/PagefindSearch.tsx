'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import './pagefind.css';
import { push } from '@socialgouv/matomo-next';

interface PagefindUI {
    new(options: {
        element: string;
        showSubResults?: boolean;
        translations?: Record<string, string>;
        debounceTimeoutMs?: number;
        processTerm?: (term: string) => string;
    }): void;
}

declare global {
    interface Window {
        PagefindUI?: PagefindUI;
    }
}

export const PagefindSearch: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const params = useParams();
    const lng = (params?.lng as string) || 'en';

    useEffect(() => {
        // Charger les styles Pagefind
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/pagefind/pagefind-ui.css';
        document.head.appendChild(link);

        // Charger le script Pagefind
        const script = document.createElement('script');
        script.src = '/pagefind/pagefind-ui.js';
        script.async = true;

        script.onload = () => {
            setIsLoaded(true);
        };

        document.body.appendChild(script);

        return () => {
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (isLoaded && containerRef.current && window.PagefindUI) {
            // Traductions personnalisées par langue
            const translations: Record<string, Record<string, string>> = {
                en: {
                    placeholder: 'Search documentation...',
                    clear_search: 'Clear',
                    load_more: 'Load more results',
                    search_label: 'Search this site',
                    filters_label: 'Filters',
                    zero_results: 'No results for [SEARCH_TERM]',
                    many_results: '[COUNT] results for [SEARCH_TERM]',
                    one_result: '[COUNT] result for [SEARCH_TERM]',
                    alt_search: 'No results for [SEARCH_TERM]. Showing results for [DIFFERENT_TERM] instead',
                    search_suggestion: 'No results for [SEARCH_TERM]. Try one of the following searches:',
                    searching: 'Searching for [SEARCH_TERM]...'
                },
                fr: {
                    placeholder: 'Rechercher dans la documentation...',
                    clear_search: 'Effacer',
                    load_more: 'Charger plus de résultats',
                    search_label: 'Rechercher sur ce site',
                    filters_label: 'Filtres',
                    zero_results: 'Aucun résultat pour [SEARCH_TERM]',
                    many_results: '[COUNT] résultats pour [SEARCH_TERM]',
                    one_result: '[COUNT] résultat pour [SEARCH_TERM]',
                    alt_search: 'Aucun résultat pour [SEARCH_TERM]. Résultats affichés pour [DIFFERENT_TERM]',
                    search_suggestion: 'Aucun résultat pour [SEARCH_TERM]. Essayez l\'une des recherches suivantes:',
                    searching: 'Recherche de [SEARCH_TERM]...'
                },
                de: {
                    placeholder: 'Dokumentation durchsuchen...',
                    clear_search: 'Löschen',
                    load_more: 'Mehr Ergebnisse laden',
                    search_label: 'Diese Seite durchsuchen',
                    filters_label: 'Filter',
                    zero_results: 'Keine Ergebnisse für [SEARCH_TERM]',
                    many_results: '[COUNT] Ergebnisse für [SEARCH_TERM]',
                    one_result: '[COUNT] Ergebnis für [SEARCH_TERM]',
                    alt_search: 'Keine Ergebnisse für [SEARCH_TERM]. Zeige Ergebnisse für [DIFFERENT_TERM]',
                    search_suggestion: 'Keine Ergebnisse für [SEARCH_TERM]. Versuchen Sie eine der folgenden Suchen:',
                    searching: 'Suche nach [SEARCH_TERM]...'
                }
            };

            new window.PagefindUI({
                element: '#pagefind-search',
                showSubResults: true,
                translations: translations[lng] || translations.en,
                debounceTimeoutMs: 500,
                processTerm: (therm => {
                    push(['trackSiteSearch', therm])
                    return therm;
                }),
            });
        }
    }, [isLoaded, lng]);

    return (
        <div
            ref={containerRef}
            id="pagefind-search"
            className="pagefind-container"
        />
    );
};
