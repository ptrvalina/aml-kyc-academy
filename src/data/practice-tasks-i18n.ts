import type { PracticeTask } from './course-modules';
import type { ContentLang } from '../i18n/types';

type TaskLocale = Pick<PracticeTask, 'title' | 'description' | 'deliverable' | 'exampleAnswer'>;

export const PRACTICE_TASKS_EN: Record<string, TaskLocale> = {
  'm1-t1': {
    title: 'News analysis',
    description: 'Find any open-source news about a financial crime. Identify the ML stage (Placement/Layering/Integration) and who investigates (bank, FIU, police).',
    deliverable: '5–7 sentences: facts, stage, AML analyst role',
    exampleAnswer: 'Scheme with cash-out via shell sole traders — Placement+Layering. Bank could catch structuring; FIU receives SAR from the bank.',
  },
  'm1-t2': {
    title: 'Roles quiz',
    description: 'Pass the module test and explain the difference between AML, KYC and CFT in your own words in notes.',
    deliverable: 'Free-form answer in Investigation Notes of any case',
  },
  'm2-t1': {
    title: 'Three clients — three DD levels',
    description: 'For each describe: (1) EU freelancer, (2) PEP official, (3) charity NGO — which DD and why.',
    deliverable: 'Table: client | CDD/EDD/SDD | 3 risk factors',
    exampleAnswer: 'PEP → EDD due to corruption risk; freelancer → CDD; NGO → CDD with charity status verification.',
  },
  'm2-t2': {
    title: 'EDD documents for offshore',
    description: 'Client — BVI holding, transfers to EU. Compile an EDD request list.',
    deliverable: 'Bullet list of documents + 2 RFI questions',
  },
  'm3-t1': {
    title: 'Sanctions hit 87%',
    description: 'Hit on Ivan Petrov, 87%. Client: different DOB and passport. Describe verification steps and decision.',
    deliverable: 'Step-by-step resolution + True/False match conclusion',
    exampleAnswer: 'Compare DOB, passport, nationality — no match → false positive, documented, closed.',
  },
  'm3-t2': {
    title: 'Adverse media OSINT',
    description: 'Find open-source information on a fictional director (use a Case Manager case). Assess risk.',
    deliverable: 'Short adverse media summary with sources',
  },
  'm4-t1': {
    title: 'Full EDD investigation',
    description: 'Complete a Case Manager case (UBO/Corporate category). Prepare an EDD summary for MLRO.',
    deliverable: 'Structure: Summary | UBO | Risks | Recommendation',
    exampleAnswer: 'Medium-high risk: unclear UBO + offshore flows without matching contracts → EDD ongoing + MLRO review.',
  },
  'm5-t1': {
    title: 'SAR draft',
    description: 'Based on the module 4 case, write a SAR draft: facts, suspicion, no emotion.',
    deliverable: '200–400 words in SAR structure',
    exampleAnswer: 'Subject: EU IT Ltd. Suspicion: unexplained offshore outflows inconsistent with IT revenue...',
  },
  'm5-t2': {
    title: 'Regulator response',
    description: 'Draft a brief FIU response (5 sentences) listing attached documents.',
    deliverable: 'Formal tone, no tipping off',
  },
  'm6-t1': {
    title: 'Crypto case',
    description: 'Client withdraws EUR 50k to an exchange; KYT shows mixer exposure. Describe steps and decision.',
    deliverable: 'KYT → RFI → escalate/close',
  },
  'm7-t1': {
    title: 'Workday simulation',
    description: 'In Case Manager complete a full alert cycle with audit trail (all action buttons).',
    deliverable: 'Screenshot/description of timeline from Overview',
  },
  'm7-t2': {
    title: 'Customer response',
    description: 'Customer asks "why was my transfer blocked?". Write a neutral reply without tipping off.',
    deliverable: '3–5 sentences',
    exampleAnswer: 'We are conducting a routine compliance review and require additional information to process your transaction...',
  },
  'm8-t1': {
    title: '5 target companies',
    description: 'List 5 banks/fintechs you will apply to + why each.',
    deliverable: 'Table: company | role | why',
  },
  'm8-t2': {
    title: 'Cover letter',
    description: 'Write a cover letter for Junior AML Analyst (150–200 words, EN).',
    deliverable: 'Text in notes + check in interview trainer',
  },
};

export function localizePracticeTasks(tasks: PracticeTask[], lang: ContentLang): PracticeTask[] {
  if (lang === 'ru') return tasks;
  return tasks.map((task) => {
    const en = PRACTICE_TASKS_EN[task.id];
    if (!en) return task;
    return { ...task, ...en };
  });
}
