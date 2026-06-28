import type { ContentLang } from '../i18n/types';

export type Regulation = {
  id: string;
  region: string;
  country: string;
  flag: string;
  name: string;
  authority: string;
  summary: string;
  detail: string;
  keyRules: string[];
  sarName: string;
  fiu: string;
  englishTerms: string[];
};

const REGIONS_RU = ['Все', 'Мир', 'Европа', 'Америка', 'СНГ', 'Ближний Восток', 'Азия'] as const;
const REGIONS_EN = ['All', 'Global', 'Europe', 'Americas', 'CIS', 'Middle East', 'Asia'] as const;

const REGION_MAP_RU_TO_EN: Record<string, string> = {
  Мир: 'Global',
  Европа: 'Europe',
  Америка: 'Americas',
  СНГ: 'CIS',
  'Ближний Восток': 'Middle East',
  Азия: 'Asia',
};

export function getRegulationRegions(lang: ContentLang): string[] {
  return lang === 'ru' ? [...REGIONS_RU] : [...REGIONS_EN];
}

export function mapRegulationRegion(region: string, lang: ContentLang): string {
  if (lang === 'ru') return region;
  return REGION_MAP_RU_TO_EN[region] ?? region;
}

const REGULATIONS_EN: Record<string, Omit<Regulation, 'id' | 'flag' | 'englishTerms'>> = {
  'fatf-global': {
    region: 'Global',
    country: 'FATF (39 member countries)',
    name: '40 FATF Recommendations',
    authority: 'Financial Action Task Force',
    summary: 'Global gold standard for AML/CFT. Basis of all national laws.',
    detail: 'Recommendations 1–10: AML/CFT policies. 10–21: transparency measures (UBO, PEP, records). 22–40: powers and international cooperation. Grey/black lists published 3 times per year. All banks worldwide align with FATF.',
    keyRules: ['Risk-based approach (RBA)', 'UBO identification 25%+', 'PEP enhanced measures', 'STR/SAR reporting', 'International cooperation'],
    sarName: 'STR (Suspicious Transaction Report)',
    fiu: 'National FIU per country',
  },
  'eu-amld6': {
    region: 'Europe',
    country: 'European Union',
    name: 'AMLD6 (6th AML Directive)',
    authority: 'European Commission / EBA',
    summary: 'EU AML framework: obligations for banks, fintech, crypto. Transposed into member state law.',
    detail: 'AMLD6 expanded: crypto assets, art dealers, tax crimes as predicate offences, higher fines. EBA Guidelines — detailed instructions for financial institutions. EU/UK licensed firms follow EU/UK rules.',
    keyRules: ['CDD/EDD mandatory', 'UBO registry access', 'PEP screening', 'STR to FIU within 24–48h', 'Travel Rule for crypto'],
    sarName: 'STR',
    fiu: 'National FIUs (FIU-NL, SEPBLAC, etc.)',
  },
  'uk-mlr': {
    region: 'Europe',
    country: 'United Kingdom',
    name: 'Money Laundering Regulations 2017 + POCA 2002',
    authority: 'FCA / HMRC / NCA',
    summary: 'UK — one of the strictest AML regimes. FCA-regulated firms.',
    detail: 'POCA (Proceeds of Crime Act) — primary law. MLR 2017 — obligations for regulated firms. FCA Handbook SYSC 3/6/7 — governance. MLRO mandatory. JMLIT — intelligence sharing between banks.',
    keyRules: ['MLRO appointment', 'Tipping off offence', 'SAR to NCA (UKFIU)', 'PEP + sanctions screening', 'FCA enforcement'],
    sarName: 'SAR (Suspicious Activity Report)',
    fiu: 'NCA — UK Financial Intelligence Unit',
  },
  'lt-fiu': {
    region: 'Europe',
    country: 'Lithuania',
    name: 'AML Law (LT) + Bank of Lithuania',
    authority: 'Bank of Lithuania / FNTT',
    summary: 'Lithuanian AML framework under EU. Bank of Lithuania supervision. Remote compliance roles often on LT entity.',
    detail: 'Lithuania — EU member, full AMLD compliance. FNTT — FIU. LB supervises banks. Fines up to 10% of annual turnover.',
    keyRules: ['EU AMLD transposition', 'STR to FNTT', 'LB supervisory review', 'PEP/UBO per EU standard', 'GDPR compliance'],
    sarName: 'STR',
    fiu: 'FNTT (Lithuania)',
  },
  'us-bsa': {
    region: 'Americas',
    country: 'United States',
    name: 'Bank Secrecy Act (BSA) + USA PATRIOT Act',
    authority: 'FinCEN / OCC / FDIC / Federal Reserve',
    summary: 'Strictest AML system. OFAC sanctions globally affect all banks.',
    detail: 'BSA (1970) + PATRIOT Act (2001) after 9/11. FinCEN — FIU. CTR (>$10K cash), SAR (suspicious). OFAC — separate sanctions regime. BSA Officer mandatory. Largest civil/criminal penalties worldwide.',
    keyRules: ['CTR $10,000 threshold', 'SAR within 30 days', 'OFAC SDN screening', 'BSA Officer', 'Customer Identification Program (CIP)'],
    sarName: 'SAR',
    fiu: 'FinCEN',
  },
  'by-aml': {
    region: 'CIS',
    country: 'Belarus',
    name: 'Law on measures to prevent money laundering',
    authority: 'National Bank of Belarus / SC / FRPZ',
    summary: 'National AML framework. For EU fintech work — focus on EU/UK rules, not BY alone.',
    detail: 'BY law harmonized with FATF, but enforcement differs. FRPZ receives STRs. For remote compliance at EU entity: employer jurisdiction rules apply. BY knowledge useful for local clients.',
    keyRules: ['Customer identification', 'STR to FRPZ', 'National Bank supervision', 'BY + UN sanctions lists', 'FATF compliance'],
    sarName: 'Suspicious transaction report',
    fiu: 'FRPZ (Financial Intelligence)',
  },
  'uae-cbuae': {
    region: 'Middle East',
    country: 'UAE',
    name: 'Federal AML Law + CBUAE Guidelines',
    authority: 'Central Bank of UAE / UAE FIU',
    summary: 'UAE — frequent high-risk jurisdiction in TM alerts. Strict tightening after FATF grey list 2022.',
    detail: 'UAE left FATF grey list in 2024, but banks still apply EDD for UAE operations. goAML system for STR. DNFBPs (lawyers, realtors) also under AML. Dubai real estate — classic ML vector.',
    keyRules: ['STR via goAML', 'EDD for high-risk', 'Targeted Financial Sanctions', 'DNFBP obligations', 'UBO identification'],
    sarName: 'STR',
    fiu: 'UAE FIU (goAML)',
  },
  'sg-mas': {
    region: 'Asia',
    country: 'Singapore',
    name: 'MAS Notice 626 + Corruption, Drug Trafficking Act',
    authority: 'Monetary Authority of Singapore',
    summary: 'Leading Asian financial centre. Strict AML regime.',
    detail: 'MAS Notice 626 — for banks. Notice 824 — for finance companies. STR to STRO. Singapore — FATF member, high standards. Many Asian PEP and trade-based ML cases.',
    keyRules: ['MAS Notice 626 compliance', 'STR to STRO', 'CDD/EDD', 'Sanctions screening', 'Trade finance monitoring'],
    sarName: 'STR',
    fiu: 'STRO (Suspicious Transaction Reporting Office)',
  },
  'ch-finma': {
    region: 'Europe',
    country: 'Switzerland',
    name: 'AMLA (Anti-Money Laundering Act) + FINMA',
    authority: 'FINMA / MROS (FIU)',
    summary: 'Traditional banking centre. Strict UBO and PEP controls.',
    detail: 'Switzerland — FATF member. MROS — FIU. FINMA — regulator. Form A (UBO declaration) mandatory. Banking secrecy does not override AML obligations. Art. 305bis Swiss Criminal Code — money laundering offence.',
    keyRules: ['Form A UBO declaration', 'STR to MROS', 'FINMA circulars', 'PEP screening', 'Cross-border reporting'],
    sarName: 'STR (meldung)',
    fiu: 'MROS',
  },
  'un-sc': {
    region: 'Global',
    country: 'United Nations',
    name: 'UN Security Council Sanctions',
    authority: 'UN Security Council / UNSC Committees',
    summary: 'Global sanctions: terrorism, WMD, country programmes.',
    detail: 'All UN members must implement UN sanctions. Consolidated UN List. Overlap with OFAC/EU lists. Terrorist financing lists updated regularly. Banks screen UN list alongside domestic lists.',
    keyRules: ['Asset freeze', 'Travel ban', 'Arms embargo', 'Mandatory implementation', 'Consolidated list screening'],
    sarName: 'N/A (sanctions compliance)',
    fiu: 'National FIU',
  },
};

export function localizeRegulation(reg: Regulation, lang: ContentLang): Regulation {
  if (lang === 'ru') return reg;
  const en = REGULATIONS_EN[reg.id];
  if (!en) return { ...reg, region: mapRegulationRegion(reg.region, lang) };
  return { ...reg, ...en };
}

export function localizeRegulations(regs: Regulation[], lang: ContentLang): Regulation[] {
  return regs.map((r) => localizeRegulation(r, lang));
}

export function regionFilterValue(regionLabel: string, lang: ContentLang): string {
  if (lang === 'ru') return regionLabel;
  const idx = REGIONS_EN.indexOf(regionLabel as (typeof REGIONS_EN)[number]);
  if (idx > 0) {
    const ruKey = REGIONS_RU[idx];
    return ruKey;
  }
  if (regionLabel === 'All') return 'Все';
  return regionLabel;
}

export function regionDisplayLabel(ruRegion: string, lang: ContentLang): string {
  if (lang === 'ru') return ruRegion;
  if (ruRegion === 'Все') return 'All';
  return mapRegulationRegion(ruRegion, lang);
}
