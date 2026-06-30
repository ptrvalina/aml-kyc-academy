import { COURSE_MODULES, COURSE_MODULE_META, COURSE_TITLE, COURSE_SUBTITLE } from './course-modules';
import type { CourseModule } from './course-modules';
import type { ContentLang } from '../i18n/types';
import { localizeExam } from './exams-i18n';
import { localizePracticeTasks } from './practice-tasks-i18n';
import { COURSE_LESSONS_EN, COURSE_LESSON_TITLES_EN } from './course-lessons-en';

export const COURSE_TITLE_EN = 'AML/KYC Analyst: From Theory to Practice';
export const COURSE_SUBTITLE_EN = '8 modules · 10–12 hours · tests · cases · progress report';

const EN_META: Record<string, { objectives: string[]; takeaways: string[]; proTip: string }> = {
  m1: { objectives: ['Understand ML/CFT and 3 stages', 'Know FATF/OFAC/EU', 'See career path'], takeaways: ['AML ≠ police', 'Placement→Layering→Integration', 'Analyst→MLRO'], proTip: 'Start a glossary from day one.' },
  m2: { objectives: ['Distinguish KYC/CDD/EDD/SDD', 'Apply RBA', 'Collect EDD documents'], takeaways: ['PEP = EDD', 'SDD is rare', 'UBO mandatory'], proTip: 'Risk table is your best interview tool.' },
  m3: { objectives: ['Resolve sanctions hits', 'Spot TM red flags', 'Assess adverse media'], takeaways: ['Hit ≠ guilt', 'Combine flags', 'Tier 1 sources'], proTip: 'Always document disambiguation at 87% match.' },
  m4: { objectives: ['Run EDD end-to-end', 'Write MLRO report', 'Use OSINT'], takeaways: ['Facts + sources', 'Specific RFI', 'No tipping off'], proTip: 'Write executive summary last, show it first.' },
  m5: { objectives: ['SAR structure', 'MLRO/FIU workflow', 'Chain of custody'], takeaways: ['SAR = suspicion', 'Audit trail', 'MLRO approves'], proTip: 'SAR narrative — facts and timeline only.' },
  m6: { objectives: ['Crypto red flags', 'Travel Rule', 'Sanctions & AI trends'], takeaways: ['Mixer = red flag', 'Human reviews AI', 'Sanctions evolve'], proTip: 'Follow OFAC crypto address listings.' },
  m7: { objectives: ['Alert workflow', 'Communication', 'Regulator crises'], takeaways: ['SLA first', 'Neutral RFI', '2nd line role'], proTip: 'Complete full cycle in Case Manager.' },
  m8: { objectives: ['CV & cover letter', 'Interview prep', 'Career plan'], takeaways: ['CAMS path', 'EN bullets', '5 target firms'], proTip: 'Add metrics to CV: cases reviewed, languages.' },
};

const EN_TITLES: Record<string, { title: string; subtitle: string }> = {
  m1: { title: 'Module 1: Introduction to AML/CFT', subtitle: 'Who is an AML analyst' },
  m2: { title: 'Module 2: KYC, CDD, EDD, SDD', subtitle: 'How customers are verified' },
  m3: { title: 'Module 3: Screening & monitoring', subtitle: 'Sanctions, PEP, adverse media' },
  m4: { title: 'Module 4: EDD investigations', subtitle: 'End-to-end case work' },
  m5: { title: 'Module 5: Reporting & regulators', subtitle: 'SAR, MLRO, FIU' },
  m6: { title: 'Module 6: Crypto, AI & sanctions', subtitle: 'Modern threats' },
  m7: { title: 'Module 7: Day-to-day AML work', subtitle: 'Alerts, teams, communication' },
  m8: { title: 'Module 8: Career in AML', subtitle: 'CV, interview, certifications' },
};

function localizeModule(mod: CourseModule): CourseModule {
  const meta = EN_TITLES[mod.id];
  if (!meta) return mod;

  const titles = COURSE_LESSON_TITLES_EN[mod.id] ?? [];
  const bodies = COURSE_LESSONS_EN[mod.id] ?? [];

  return {
    ...mod,
    title: meta.title,
    subtitle: meta.subtitle,
    lessons: mod.lessons.map((lesson, i) => ({
      title: titles[i] ?? lesson.title,
      body: bodies[i] ?? lesson.body,
    })),
    exam: localizeExam(mod.exam, 'en'),
    practiceTasks: localizePracticeTasks(mod.practiceTasks, 'en'),
  };
}

export function getCourseTitle(lang: ContentLang): string {
  return lang === 'ru' ? COURSE_TITLE : COURSE_TITLE_EN;
}

export function getCourseSubtitle(lang: ContentLang): string {
  return lang === 'ru' ? COURSE_SUBTITLE : COURSE_SUBTITLE_EN;
}

export function getCourseModules(lang: ContentLang): CourseModule[] {
  if (lang === 'ru') return COURSE_MODULES;
  return COURSE_MODULES.map(localizeModule);
}

export function getCourseModuleMeta(lang: ContentLang): Record<string, { objectives: string[]; takeaways: string[]; proTip: string }> {
  return lang === 'ru' ? COURSE_MODULE_META : EN_META;
}
