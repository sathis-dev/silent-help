'use client';

import { useEffect } from 'react';

/**
 * Registers the offline service worker in production builds only.
 * Dev is skipped to avoid HMR + precache conflicts.
 */
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof navigator === 'undefined') return;
        if (!('serviceWorker' in navigator)) return;
        if (process.env.NODE_ENV !== 'production') return;
        const onLoad = () => {
            navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        };
        if (document.readyState === 'complete') onLoad();
        else window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);
    return null;
}
