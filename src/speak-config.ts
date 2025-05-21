import type { SpeakConfig } from 'qwik-speak';

export const config: SpeakConfig = {
  defaultLocale: { lang: 'en', currency: 'USD', timeZone: 'America/Los_Angeles' },
  supportedLocales: [
    { lang: 'it', currency: 'EUR', timeZone: 'Europe/Rome' },
    { lang: 'en', currency: 'USD', timeZone: 'America/Los_Angeles' }
  ],
  // Translations available in the whole app
  assets: [
    'app',
    'login',
    'admin',
    'dashboard',
    'dialog',
    'sidebar',
    'table',
    'client',
    'site',
    'network'
  ],
  // Translations with dynamic keys available in the whole app
  runtimeAssets: [
    "runtime"
  ]
};