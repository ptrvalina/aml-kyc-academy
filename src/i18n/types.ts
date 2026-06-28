export type Lang = 'ru' | 'en' | 'lt' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it' | 'pt';
export type ContentLang = 'ru' | 'en';

export function contentLang(lang: Lang): ContentLang {
  return lang === 'ru' ? 'ru' : 'en';
}
