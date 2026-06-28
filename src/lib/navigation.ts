import type { Lang } from '../i18n/types';
import type { Module } from '../types';

export type ViewMeta = {
  section: 'home' | 'course' | 'osint' | 'practice' | 'library' | 'profile' | 'exam';
  label: string;
  parent?: { view: string; label: string };
};

export function isCourseModuleView(view: string, modules: Module[]): boolean {
  return modules.some((m) => m.id === view);
}

export function isOsintModuleView(view: string, modules: Module[]): boolean {
  return modules.some((m) => m.id === view);
}

export function resolveViewMeta(
  view: string,
  lang: Lang,
  t: (lang: Lang, key: string) => string,
  courseModules: Module[],
  osintModules: Module[],
  getModuleMeta: (lang: Lang, mod: Module) => { title: string },
  getOsintMeta: (lang: Lang, mod: Module) => { title: string },
): ViewMeta {
  const courseMod = courseModules.find((m) => m.id === view);
  if (courseMod) {
    return {
      section: 'course',
      label: getModuleMeta(lang, courseMod).title,
      parent: { view: 'home', label: t(lang, 'navHome') },
    };
  }
  const osintMod = osintModules.find((m) => m.id === view);
  if (osintMod) {
    return {
      section: 'osint',
      label: getOsintMeta(lang, osintMod).title,
      parent: { view: 'osint-home', label: t(lang, 'navOsintTrack') },
    };
  }

  const map: Record<string, ViewMeta> = {
    home: { section: 'home', label: t(lang, 'navHome') },
    'my-progress': { section: 'profile', label: t(lang, 'navMyProgress') },
    'osint-home': { section: 'osint', label: t(lang, 'navOsintTrack') },
    'osint-final-exam': { section: 'exam', label: t(lang, 'osintFinalExam'), parent: { view: 'osint-home', label: t(lang, 'navOsintTrack') } },
    'final-exam': { section: 'exam', label: t(lang, 'finalExamTitle'), parent: { view: 'home', label: t(lang, 'navHome') } },
    polygone: { section: 'practice', label: t(lang, 'navPolygone') },
    'osint-practice': { section: 'practice', label: t(lang, 'navOsintCases') },
    'interview-trainer': { section: 'practice', label: t(lang, 'navInterview') },
    literature: { section: 'library', label: t(lang, 'navLiterature') },
    trainers: { section: 'library', label: t(lang, 'navTrainers') },
    news: { section: 'library', label: t(lang, 'navNews') },
    glossary: { section: 'library', label: t(lang, 'navGlossary') },
    regulations: { section: 'library', label: t(lang, 'navRegulations') },
    english: { section: 'library', label: t(lang, 'navEnglish') },
    software: { section: 'library', label: t(lang, 'navSoftware') },
    'crypto-checks': { section: 'library', label: t(lang, 'navCrypto') },
    resources: { section: 'library', label: t(lang, 'navResources') },
  };

  return map[view] ?? { section: 'home', label: view };
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
