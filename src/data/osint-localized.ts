import type { Module } from '../types';
import type { ContentLang } from '../i18n/types';
import { localizeExam } from './exams-i18n';

const OSINT_TITLES_EN: Record<string, { title: string; subtitle: string }> = {
  o1: { title: 'OSINT 1: Methodology & Ethics', subtitle: 'OPSEC, sources, chain of custody, AML context' },
  o2: { title: 'OSINT 2: Search & Google Dorking', subtitle: 'Operators, reverse search, archives' },
  o3: { title: 'OSINT 3: Corporate registries & UBO', subtitle: 'OpenCorporates, Companies House, shell detection' },
  o4: { title: 'OSINT 4: Adverse Media', subtitle: 'News, courts, sanctions-adjacent, weighting' },
  o5: { title: 'OSINT 5: People & Social OSINT', subtitle: 'LinkedIn, profiles, lifestyle mismatch' },
  o6: { title: 'OSINT 6: EDD Report & Delivery', subtitle: 'Structure, executive summary, recommendations' },
};

const OSINT_LESSONS_EN: Record<string, Array<{ title: string; body: string }>> = {
  o1: [
    {
      title: 'What is OSINT in AML',
      body: 'Open Source Intelligence — collecting and analysing public data for KYC, EDD, adverse media, UBO. Not hacking: legal sources only. Your deliverable — verifiable facts with URL, date, screenshot.',
    },
    {
      title: 'OPSEC and compliance',
      body: 'Do not use fake accounts to bypass paywalls without permission. GDPR: personal data only for legitimate interest (AML). Document methodology. No tipping off — OSINT findings stay in internal case file only.',
    },
    {
      title: 'OSINT cycle',
      body: 'Planning → Collection → Processing → Analysis → Dissemination. In AML: hypothesis (red flag) → sources → cross-reference → risk rating → EDD report. Minimum 2 independent sources for material facts.',
    },
  ],
  o2: [
    {
      title: 'Advanced search operators',
      body: 'site:, filetype:, intitle:, inurl:, OR, -exclude, "exact phrase". Example: site:reuters.com "company name" fraud. For adverse media — search in multiple languages (original + English).',
    },
    {
      title: 'Reverse image & email',
      body: 'Reverse image search to verify photos, fake profiles. Email in breaches (Have I Been Pwned) — not for AML decision alone, but signal for ATO/fraud. Phone OSINT — careful with GDPR.',
    },
    {
      title: 'Web archives',
      body: 'Wayback Machine — deleted pages, old company claims. Client website "10 years in business" but domain 2 weeks old = red flag. Compare archived vs current statements.',
    },
  ],
  o3: [
    {
      title: 'Corporate registries',
      body: 'Companies House (UK), OpenCorporates (global), local registries (LT, PL, BY). Check: active/dissolved status, directors, filing history, registered address, SIC codes.',
    },
    {
      title: 'Shell company indicators',
      body: 'Mass address (100+ companies same office), nominee directors, no employees, recent incorporation + large wire, bearer-shares jurisdictions, circular ownership.',
    },
    {
      title: 'UBO mapping',
      body: 'Build ownership chain to natural person. 25% threshold (EU), 10% (UK sometimes). Trusts — identify settlor, trustee, beneficiaries. Document each hop with registry extract.',
    },
  ],
  o4: [
    {
      title: 'Source tiers',
      body: 'Tier 1: Reuters, Bloomberg, court records, regulators. Tier 2: National quality press. Tier 3: Blogs, forums — corroborate only. Assess: conviction vs accusation vs acquittal.',
    },
    {
      title: 'Weighting framework',
      body: 'Recency (last 24 months heavier), severity (fraud > tax dispute), outcome (convicted > ongoing > acquitted), relevance to role (director fraud vs employee theft). One Tier-3 article ≠ auto-decline.',
    },
    {
      title: 'Local language media',
      body: 'Arabic, Chinese, Russian local press — use translation + native keyword search. Regional court databases. FATF grey-list country media may need local source.',
    },
  ],
  o5: [
    {
      title: 'LinkedIn verification',
      body: 'Cross-check: title vs registry, employment dates, connections pattern, endorsements. Fake profiles: stock photo, few connections, recent creation. PEP self-declaration vs OSINT find.',
    },
    {
      title: 'Lifestyle vs declared income',
      body: 'Public Instagram/Facebook luxury vs EUR 2K/mo declared — not proof of crime, but EDD trigger. Document screenshots with timestamp. SOF/SOW RFI if material.',
    },
    {
      title: 'Professional networks',
      body: 'Conference speaker lists, patent filings, academic papers, court party names. Connect people to companies without registry link (hidden influence).',
    },
  ],
  o6: [
    {
      title: 'EDD report structure',
      body: '1 Executive Summary (1 page) 2 Subject profile 3 Methodology 4 Findings (sourced) 5 Risk assessment 6 Recommendation (approve/EDD ongoing/reject/escalate). Every fact: [Source, Date, URL].',
    },
    {
      title: 'Writing for non-OSINT readers',
      body: 'MLRO and QA will not repeat your search. Write plain language, highlight material risks first. Separate facts vs analyst inference. "Recommend EDD ongoing" — justify it.',
    },
    {
      title: 'Handoff to AML workflow',
      body: 'OSINT report → case system attachment → risk score update → RFI if gaps → senior review if high risk → SAR if suspicion after full picture. OSINT does not replace screening/TM.',
    },
  ],
};

export const OSINT_META_EN: Record<string, { objectives: string[]; takeaways: string[]; proTip: string }> = {
  o1: {
    objectives: ['Understand OSINT cycle', 'Know OPSEC and GDPR', 'Document chain of custody'],
    takeaways: ['Only public sources', '2+ sources for material facts', 'Internal only — no tipping off'],
    proTip: 'Start each case with written scope: what you search and why.',
  },
  o2: {
    objectives: ['Google dorks', 'Archives', 'Multi-language search'],
    takeaways: ['site: and quotes — your friends', 'Wayback for deleted claims', 'Local language keywords'],
    proTip: 'Save search string in case notes for reproducibility.',
  },
  o3: {
    objectives: ['Registry navigation', 'Shell detection', 'UBO chains'],
    takeaways: ['Registry > social media', 'Mass address = shell signal', 'Map to natural person'],
    proTip: 'OpenCorporates + local registry — always both.',
  },
  o4: {
    objectives: ['Source tiering', 'Weight acquittal vs conviction', 'Deduplicate news'],
    takeaways: ['Tier 1 first', 'Recency + severity', 'One event ≠ 50 flags'],
    proTip: "Translate local media — don't rely on English-only Google.",
  },
  o5: {
    objectives: ['Verify LinkedIn', 'Lifestyle mismatch', 'Evidence screenshots'],
    takeaways: ['Cross-check employment', 'Instagram ≠ proof but triggers EDD', 'Full screenshot with URL/date'],
    proTip: 'PEP hidden in OSINT = same as undeclared PEP.',
  },
  o6: {
    objectives: ['Write EDD report', 'Executive summary', 'Escalation path'],
    takeaways: ['Fact vs inference separated', 'Recommendation upfront', 'Negative findings documented'],
    proTip: 'Write the report for an MLRO who reads it in 5 minutes.',
  },
};

export function localizeOsintModule(mod: Module, lang: ContentLang): Module {
  if (lang === 'ru') return mod;
  const titles = OSINT_TITLES_EN[mod.id];
  const lessons = OSINT_LESSONS_EN[mod.id];
  return {
    ...mod,
    title: titles?.title ?? mod.title,
    subtitle: titles?.subtitle ?? mod.subtitle,
    lessons: lessons ?? mod.lessons.map((l) => ({ title: l.title, body: l.body })),
    exam: localizeExam(mod.exam, lang),
  };
}

export function getOsintModules(modules: Module[], lang: ContentLang): Module[] {
  if (lang === 'ru') return modules;
  return modules.map((m) => localizeOsintModule(m, lang));
}

export function getOsintModuleMeta(lang: ContentLang, modId: string, ruMeta: { objectives: string[]; takeaways: string[]; proTip: string }): {
  objectives: string[];
  takeaways: string[];
  proTip: string;
} {
  if (lang === 'ru') return ruMeta;
  return OSINT_META_EN[modId] ?? ruMeta;
}

export function getOsintModuleTitle(lang: ContentLang, mod: Module): { title: string; subtitle: string } {
  if (lang === 'ru') return { title: mod.title, subtitle: mod.subtitle };
  return OSINT_TITLES_EN[mod.id] ?? { title: mod.title, subtitle: mod.subtitle };
}
