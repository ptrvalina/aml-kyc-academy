import { useMemo, useState } from 'react';
import { Row, Stack } from '../lib/ui';
import type { Lang } from '../i18n/types';
import type { ContentLang } from '../i18n/types';
import { tc } from '../i18n/content-strings';
import type { Module } from '../types';
import { isCourseModuleView, isOsintModuleView } from '../lib/navigation';

type UiT = (lang: Lang, key: string) => string;

type AppNavProps = {
  lang: Lang;
  cl: ContentLang;
  view: string;
  onNavigate: (view: string) => void;
  t: UiT;
  courseModules: Module[];
  osintModules: Module[];
  allModulesPassed: boolean;
  allOsintPassed: boolean;
};

function navActive(view: string, id: string, courseModules: Module[], osintModules: Module[]): boolean {
  if (view === id) return true;
  if (id === 'home' && isCourseModuleView(view, courseModules)) return true;
  if (id === 'osint-home' && (isOsintModuleView(view, osintModules) || view === 'osint-final-exam' || view === 'osint-practice')) return true;
  if (id === 'library' && ['literature', 'trainers', 'news', 'glossary', 'regulations', 'english', 'software', 'crypto-checks', 'resources'].includes(view)) return true;
  return false;
}

export function AppNav({
  lang,
  cl,
  view,
  onNavigate,
  t,
  courseModules,
  osintModules,
  allModulesPassed,
  allOsintPassed,
}: AppNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = useMemo(
    () => [
      { id: 'home', label: t(lang, 'navHome') },
      { id: 'osint-home', label: t(lang, 'navOsintTrack') },
      { id: 'polygone', label: t(lang, 'navPolygone') },
      { id: 'news', label: t(lang, 'navNews') },
      { id: 'my-progress', label: t(lang, 'navMyProgress') },
    ],
    [lang, t],
  );

  const moreItems = useMemo(
    () => [
      { id: 'literature', label: t(lang, 'navLiterature') },
      { id: 'trainers', label: t(lang, 'navTrainers') },
      { id: 'glossary', label: t(lang, 'navGlossary') },
      { id: 'regulations', label: t(lang, 'navRegulations') },
      { id: 'english', label: t(lang, 'navEnglish') },
      { id: 'software', label: t(lang, 'navSoftware') },
      { id: 'crypto-checks', label: t(lang, 'navCrypto') },
      { id: 'interview-trainer', label: t(lang, 'navInterview') },
      { id: 'osint-practice', label: t(lang, 'navOsintCases') },
      { id: 'resources', label: t(lang, 'navResources') },
      ...(allModulesPassed ? [{ id: 'final-exam', label: t(lang, 'finalExamTitle') }] : []),
      ...(allOsintPassed ? [{ id: 'osint-final-exam', label: t(lang, 'osintFinalExam') }] : []),
    ],
    [lang, t, allModulesPassed, allOsintPassed],
  );

  const libraryActive = navActive(view, 'library', courseModules, osintModules);

  return (
    <nav className="app-nav" aria-label={cl === 'ru' ? 'Навигация' : 'Navigation'}>
      <div className="nav-tabs">
        {primary.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-tab${navActive(view, item.id, courseModules, osintModules) ? ' nav-tab--active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div className="nav-more-wrap">
          <button
            type="button"
            className={`nav-tab nav-tab--more${libraryActive || moreOpen ? ' nav-tab--active' : ''}`}
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
          >
            {tc(cl, 'navMore')} ▾
          </button>
          {moreOpen && (
            <div className="nav-more-menu" role="menu">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={`nav-more-item${view === item.id ? ' nav-more-item--active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    setMoreOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export function AppBreadcrumb({
  meta,
  onNavigate,
  cl,
}: {
  meta: { label: string; parent?: { view: string; label: string } };
  onNavigate: (view: string) => void;
  cl: ContentLang;
}) {
  if (!meta.parent && meta.label) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {meta.parent && (
        <>
          <button type="button" className="breadcrumb-link" onClick={() => onNavigate(meta.parent!.view)}>
            ← {meta.parent.label}
          </button>
          <span className="breadcrumb-sep">/</span>
        </>
      )}
      <span className="breadcrumb-current">{meta.label}</span>
    </nav>
  );
}
