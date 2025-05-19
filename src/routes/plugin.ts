import type { RequestHandler } from '@builder.io/qwik-city';
import { config } from '../speak-config';
import { setSpeakContext, validateLocale } from 'qwik-speak';

/**
 * This middleware function must only contain the logic to set the locale,
 * because it is invoked on every request to the server.
 * Avoid redirecting or throwing errors here, and prefer layouts or pages
 */
export const onRequest: RequestHandler = ({ request, locale, params }) => {
    const acceptLanguage = request.headers.get('accept-language');

    let lang: string | undefined = undefined;

     // Try to use user language
    if (acceptLanguage) {
        lang = acceptLanguage.split(';')[0]?.split(',')[0];
    }

    if (params.lang && validateLocale(params.lang)) {
        // Check supported locales
        lang = config.supportedLocales.find(value => value.lang === params.lang)?.lang;
    } else {
        lang = config.defaultLocale.lang;
    }

    // Check supported locales
    lang = config.supportedLocales.find(value => value.lang === lang)?.lang || config.defaultLocale.lang;
    // Set Speak context (optional: set the configuration on the server)
    setSpeakContext(config);
    // Set Qwik locale
    locale(lang);
};