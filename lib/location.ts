// Some pages keep their state in the URL so that it can be shared: the filters in the query string
// and, for plugins, the opened plugin in the hash.
// The URL is updated with replaceState, which fires no event: local listeners are notified explicitly.
const locationListeners = new Set<() => void>();

export const subscribeToLocation = (onChange: () => void) => {
    locationListeners.add(onChange);
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
        locationListeners.delete(onChange);
        window.removeEventListener('hashchange', onChange);
        window.removeEventListener('popstate', onChange);
    };
};

export const replaceUrl = (url: string) => {
    window.history.replaceState(window.history.state, '', url);
    locationListeners.forEach(listener => listener());
};
