/* Analytics bootstrap. Placeholder IDs remain in local dummy mode. */
(function () {
    const gtmId = window.CHAMELEON_GTM_ID || '';
    const isConfiguredGtm = /^GTM-[A-Z0-9]+$/i.test(gtmId) && !gtmId.includes('XXXX');
    const maxLength = 160;
    const seenErrors = new Set();
    window.dataLayer = window.dataLayer || [];

    const clean = value => String(value || '').replace(/[\r\n]+/g, ' ').replace(/https?:\/\/\S+/gi, '[url]').slice(0, maxLength);
    const track = (event, params = {}) => window.dataLayer.push({ event, ...params });
    const reportError = (feature, error) => {
        const message = clean(error && error.message ? error.message : error);
        const errorType = clean(error && error.name ? error.name : 'Error');
        const key = `${feature}:${errorType}:${message}`;
        if (!message || seenErrors.has(key)) return;
        seenErrors.add(key);
        track('app_error', { feature: clean(feature), error_type: errorType, error_message: message });
    };

    window.CHAMELEON_ANALYTICS = { track, error: reportError };
    track('analytics_ready', { analytics_mode: isConfiguredGtm ? 'gtm' : 'dummy' });
    window.addEventListener('error', event => {
        if (event.error) return reportError('window_error', event.error);
        const tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : 'resource';
        reportError('resource_load', new Error(`${tag} failed to load`));
    }, true);
    window.addEventListener('unhandledrejection', event => reportError('unhandled_rejection', event.reason || new Error('Unhandled promise rejection')));

    if (!isConfiguredGtm) return;
    track('gtm.js', { 'gtm.start': Date.now() });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    script.onerror = () => reportError('gtm_loader', new Error('GTM script failed to load'));
    document.head.appendChild(script);
})();
