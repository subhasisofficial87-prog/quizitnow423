'use client';
import { useState, useEffect, useCallback } from 'react';

export type Lang = 'english' | 'hindi' | 'odia';

const translations: Record<Lang, Record<string, unknown>> = {
  english: {},
  hindi: {},
  odia: {},
};

async function loadTranslations(lang: Lang) {
  if (Object.keys(translations[lang]).length > 0) return;
  let mod: { default: Record<string, unknown> };
  if (lang === 'english') {
    mod = await import('@/i18n/en.json');
  } else if (lang === 'hindi') {
    mod = await import('@/i18n/hi.json');
  } else {
    mod = await import('@/i18n/od.json');
  }
  Object.assign(translations[lang], mod.default);
}

export function useTranslation() {
  const [lang, setLang] = useState<Lang>('english');
  const [t, setT] = useState<Record<string, unknown>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('qin_lang') ?? 'english') as Lang;
    setLang(saved);
  }, []);

  useEffect(() => {
    loadTranslations(lang).then(() => {
      setT({ ...translations[lang] });
      setLoaded(true);
    });
  }, [lang]);

  const changeLang = useCallback((newLang: Lang) => {
    localStorage.setItem('qin_lang', newLang);
    setLang(newLang);
  }, []);

  const get = useCallback(
    (key: string, fallback = ''): string => {
      const parts = key.split('.');
      let current: unknown = t;
      for (const part of parts) {
        if (typeof current !== 'object' || current === null) return fallback;
        current = (current as Record<string, unknown>)[part];
      }
      return typeof current === 'string' ? current : fallback;
    },
    [t]
  );

  return { lang, changeLang, get, loaded, t };
}
