import { COURSE_MODULES, COURSE_MODULE_META, COURSE_TITLE, COURSE_SUBTITLE } from './course-modules';
import type { CourseModule } from './course-modules';
import type { ContentLang } from '../i18n/types';
import { localizeExam } from './exams-i18n';
import { localizePracticeTasks } from './practice-tasks-i18n';

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

function localizeModule(mod: CourseModule): CourseModule {
  const enTitles: Record<string, { title: string; subtitle: string }> = {
    m1: { title: 'Module 1: Introduction to AML/CFT', subtitle: 'Who is an AML analyst' },
    m2: { title: 'Module 2: KYC, CDD, EDD, SDD', subtitle: 'How customers are verified' },
    m3: { title: 'Module 3: Screening & monitoring', subtitle: 'Sanctions, PEP, adverse media' },
    m4: { title: 'Module 4: EDD investigations', subtitle: 'End-to-end case work' },
    m5: { title: 'Module 5: Reporting & regulators', subtitle: 'SAR, MLRO, FIU' },
    m6: { title: 'Module 6: Crypto, AI & sanctions', subtitle: 'Modern threats' },
    m7: { title: 'Module 7: Day-to-day AML work', subtitle: 'Alerts, teams, communication' },
    m8: { title: 'Module 8: Career in AML', subtitle: 'CV, interview, certifications' },
  };
  const meta = enTitles[mod.id];
  if (!meta) return mod;

  const lessonSummaries: Record<string, string[]> = {
    m1: [
      'Money laundering hides criminal proceeds; CFT targets terror financing. Banks must detect suspicious activity and file SARs. Three stages: Placement, Layering, Integration. You assess risk and document — you are not law enforcement.',
      'FATF 40 Recommendations set global standards. OFAC SDN lists affect USD flows worldwide. EU AMLD strengthens UBO and crypto rules. National law → bank policy → your daily work.',
      'Typical day: alert queue, screening hits, RFI, escalation. Systems: KYC, screening, TM, case management. Document every step; never tip off the customer.',
    ],
    m2: [
      'KYC identifies the customer; CDD is standard due diligence; EDD for high risk; SDD only for proven low risk. Risk-Based Approach scales controls to customer risk.',
      'PEP always triggers EDD. UBO must be identified through registries. SOF/SOW evidence required for high-risk profiles.',
      'Practice: classify three client scenarios as CDD/EDD/SDD and justify with risk factors.',
    ],
    m3: [
      'Sanctions screening: OFAC, EU, UN lists. Hit resolution uses name, DOB, ID, address. False positives are common — document disambiguation.',
      'PEP screening and adverse media from tier-1 sources. TM looks for structuring, rapid movement, profile mismatch.',
      '87% fuzzy match case: verify identifiers before true/false match decision.',
    ],
    m4: [
      'EDD triggered by HRJ, PEP, adverse media, unusual transactions. Sources: internal systems, registries, OSINT.',
      'Ask: who is UBO, source of funds, business model. Request articles, financials, contracts.',
      'Full case: EU IT company, large offshore transfers — registry research and MLRO report.',
    ],
    m5: [
      'SAR filed when suspicion cannot be cleared. Structure: customer, facts, grounds, recommendation.',
      'MLRO approves SAR; FIU may request follow-up. Chain of custody for all evidence.',
      'Practice: draft SAR from Module 4 case; respond to regulator request template.',
    ],
    m6: [
      'Crypto ML: mixers, unhosted wallets, DeFi bridges. Travel Rule for VASP transfers.',
      'AI in AML automates alerts but humans must explain decisions. Sanctions on Russia/Belarus/Iran evolve constantly.',
      'Case: client sends funds to exchange — assess exposure and recommend hold/EDD/SAR.',
    ],
    m7: [
      'Alert → context → RFI → decision → document. Teams: L1 operations, L2 compliance, MLRO.',
      'Business communication: neutral language, no tipping off. Crisis: regulator request or customer complaint.',
      'Simulation: respond to customer RFI challenge professionally.',
    ],
    m8: [
      'Employers: banks, fintech, Big4, crypto exchanges, regulators. CV: tools, languages, CAMS in progress.',
      'ACAMS CAMS and ICA diplomas. Interview: risk-based approach, SAR experience, false positive example.',
      'Practice: 5 target companies, cover letter, 3 interview answers.',
    ],
  };

  const summaries = lessonSummaries[mod.id] ?? [];

  return {
    ...mod,
    title: meta.title,
    subtitle: meta.subtitle,
    lessons: mod.lessons.map((lesson, i) => ({
      title: lesson.title,
      body: summaries[i]
        ? `### ${meta.title}\n\n${summaries[i]}`
        : '### Lesson\n\nStudy materials align with FATF and industry AML practice.',
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
