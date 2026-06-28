import type { ContentLang } from './types';

export type LiteratureItem = {
  id: string;
  title: string;
  author: string;
  type: string;
  why: string;
  url: string;
  level: 'beginner' | 'intermediate' | 'advanced';
};

const LITERATURE_RU: LiteratureItem[] = [
  { id: 'fatf', title: 'FATF Recommendations (2023)', author: 'FATF', type: 'Нормативка', why: '40 рекомендаций — фундамент AML/KYC во всех юрисдикциях', url: 'https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html', level: 'beginner' },
  { id: 'wolfsberg', title: 'Wolfsberg Group — PEP Guidance', author: 'Wolfsberg Group', type: 'Guidance', why: 'PEP-риск, EDD, family/associates — must-read для KYC/EDD', url: 'https://www.wolfsberg-principles.com/', level: 'intermediate' },
  { id: 'bcbs', title: 'BCBS CDD Guidance', author: 'Basel Committee', type: 'Guidance', why: 'Customer due diligence для банков — risk-based approach', url: 'https://www.bis.org/bcbs/publ/d285.htm', level: 'intermediate' },
  { id: 'acams', title: 'ACAMS — CAMS Study Guide', author: 'ACAMS', type: 'Сертификация', why: 'Industry standard для AML analyst; часто оплачивает работодатель', url: 'https://www.acams.org/', level: 'beginner' },
  { id: 'ica', title: 'ICA Diplomas in AML', author: 'ICA', type: 'Сертификация', why: 'Альтернатива CAMS, сильна в UK/EU', url: 'https://www.int-comp.org/', level: 'beginner' },
  { id: 'ml-guide', title: 'Money Laundering: A Guide for Criminal Investigators', author: 'Madamala & Kuhlhorn', type: 'Книга', why: 'Классика по стадиям отмывания и red flags', url: '', level: 'intermediate' },
  { id: 'compliance-handbook', title: 'The Compliance Handbook (KYC/AML)', author: 'Wiley', type: 'Книга', why: 'Практический обзор KYC, TM, sanctions для банков', url: '', level: 'intermediate' },
  { id: 'bellingcat', title: 'Bellingcat OSINT Techniques', author: 'Bellingcat', type: 'OSINT', why: 'Методология открытых источников для EDD/adverse media', url: 'https://www.bellingcat.com/resources/how-tos/', level: 'intermediate' },
  { id: 'osint-fw', title: 'OSINT Framework', author: 'osintframework.com', type: 'OSINT', why: 'Каталог инструментов для корпоративного и people OSINT', url: 'https://osintframework.com/', level: 'beginner' },
  { id: 'eu-amla', title: 'EU AML Regulation (AMLA package)', author: 'European Commission', type: 'Нормативка', why: 'Единый AML-regime EU — актуально для EU banks/fintech', url: 'https://finance.ec.europa.eu/financial-crime/anti-money-laundering-and-countering-financing-terrorism_en', level: 'advanced' },
  { id: 'fincen', title: 'FinCEN SAR Activity Review', author: 'FinCEN', type: 'Практика', why: 'Реальные паттерны SAR в US — учит формулировкам', url: 'https://www.fincen.gov/', level: 'intermediate' },
  { id: 'chainalysis', title: 'Chainalysis Crypto Crime Report', author: 'Chainalysis', type: 'Crypto AML', why: 'Ежегодный обзор crypto ML typologies', url: 'https://www.chainalysis.com/', level: 'intermediate' },
  { id: 'opensanctions', title: 'OpenSanctions Handbook', author: 'OpenSanctions', type: 'Sanctions', why: 'Практика screening и entity resolution', url: 'https://www.opensanctions.org/docs/', level: 'beginner' },
  { id: 'ffiec', title: 'FFIEC BSA/AML Manual', author: 'FFIEC (US)', type: 'Manual', why: 'Детальный BSA manual — эталон для US AML programs', url: 'https://bsaaml.ffiec.gov/', level: 'advanced' },
  { id: 'ti-cpi', title: 'Transparency International — CPI', author: 'TI', type: 'Research', why: 'Corruption risk by country — для HRJ/PEP assessment', url: 'https://www.transparency.org/', level: 'beginner' },
  { id: 'edd-handbook', title: 'EDD Handbook (FATF Guidance)', author: 'FATF', type: 'Guidance', why: 'Углублённая проверка высокорисковых клиентов', url: 'https://www.fatf-gafi.org/', level: 'intermediate' },
  { id: 'travel-rule', title: 'FATF Guidance on Virtual Assets', author: 'FATF', type: 'Crypto AML', why: 'VASP, Travel Rule, risk indicators для crypto', url: 'https://www.fatf-gafi.org/en/topics/virtual-assets.html', level: 'intermediate' },
  { id: 'ofac', title: 'OFAC Sanctions Compliance Guidance', author: 'US Treasury', type: 'Sanctions', why: 'Практика compliance программ под OFAC', url: 'https://ofac.treasury.gov/', level: 'intermediate' },
  { id: 'uk-mlr', title: 'UK Money Laundering Regulations 2017', author: 'UK Gov', type: 'Нормативка', why: 'Базовый UK framework для MLRO и аналитиков', url: 'https://www.gov.uk/', level: 'intermediate' },
  { id: 'goaml', title: 'goAML User Guide', author: 'UNODC', type: 'Reporting', why: 'Как FIU принимают STR/SAR в 100+ странах', url: 'https://goaml.unodc.org/', level: 'advanced' },
  { id: 'risk-based', title: 'FATF Risk-Based Approach Guidance', author: 'FATF', type: 'Guidance', why: 'RBA — язык, который ждут на собеседовании', url: 'https://www.fatf-gafi.org/', level: 'beginner' },
  { id: 'adverse-media', title: 'Wolfsberg — Adverse Media Guidance', author: 'Wolfsberg', type: 'OSINT', why: 'Как оценивать негативные новости о клиенте', url: 'https://www.wolfsberg-principles.com/', level: 'intermediate' },
  { id: 'tbml', title: 'FATF Trade-Based ML Report', author: 'FATF', type: 'Research', why: 'TBML typologies — over/under invoicing', url: 'https://www.fatf-gafi.org/', level: 'advanced' },
  { id: 'mlro', title: 'MLRO Handbook (ICA)', author: 'ICA', type: 'Книга', why: 'Роль MLRO, SAR decisions, governance', url: 'https://www.int-comp.org/', level: 'advanced' },
];

const LITERATURE_EN: LiteratureItem[] = [
  { id: 'fatf', title: 'FATF Recommendations (2023)', author: 'FATF', type: 'Regulation', why: '40 recommendations — AML/KYC foundation in every jurisdiction', url: 'https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html', level: 'beginner' },
  { id: 'wolfsberg', title: 'Wolfsberg Group — PEP Guidance', author: 'Wolfsberg Group', type: 'Guidance', why: 'PEP risk, EDD, family/associates — must-read for KYC/EDD', url: 'https://www.wolfsberg-principles.com/', level: 'intermediate' },
  { id: 'bcbs', title: 'BCBS CDD Guidance', author: 'Basel Committee', type: 'Guidance', why: 'Customer due diligence for banks — risk-based approach', url: 'https://www.bis.org/bcbs/publ/d285.htm', level: 'intermediate' },
  { id: 'acams', title: 'ACAMS — CAMS Study Guide', author: 'ACAMS', type: 'Certification', why: 'Industry standard; employers often pay for CAMS', url: 'https://www.acams.org/', level: 'beginner' },
  { id: 'ica', title: 'ICA Diplomas in AML', author: 'ICA', type: 'Certification', why: 'CAMS alternative, strong in UK/EU', url: 'https://www.int-comp.org/', level: 'beginner' },
  { id: 'ml-guide', title: 'Money Laundering: A Guide for Criminal Investigators', author: 'Madamala & Kuhlhorn', type: 'Book', why: 'Classic on ML stages and red flags', url: '', level: 'intermediate' },
  { id: 'compliance-handbook', title: 'The Compliance Handbook (KYC/AML)', author: 'Wiley', type: 'Book', why: 'Practical KYC, TM, sanctions overview for banks', url: '', level: 'intermediate' },
  { id: 'bellingcat', title: 'Bellingcat OSINT Techniques', author: 'Bellingcat', type: 'OSINT', why: 'Open-source methodology for EDD/adverse media', url: 'https://www.bellingcat.com/resources/how-tos/', level: 'intermediate' },
  { id: 'osint-fw', title: 'OSINT Framework', author: 'osintframework.com', type: 'OSINT', why: 'Tool catalog for corporate and people OSINT', url: 'https://osintframework.com/', level: 'beginner' },
  { id: 'eu-amla', title: 'EU AML Regulation (AMLA package)', author: 'European Commission', type: 'Regulation', why: 'Unified EU AML regime — critical for EU banks/fintech', url: 'https://finance.ec.europa.eu/financial-crime/anti-money-laundering-and-countering-financing-terrorism_en', level: 'advanced' },
  { id: 'fincen', title: 'FinCEN SAR Activity Review', author: 'FinCEN', type: 'Practice', why: 'Real SAR patterns in the US — teaches narrative style', url: 'https://www.fincen.gov/', level: 'intermediate' },
  { id: 'chainalysis', title: 'Chainalysis Crypto Crime Report', author: 'Chainalysis', type: 'Crypto AML', why: 'Annual crypto ML typologies report', url: 'https://www.chainalysis.com/', level: 'intermediate' },
  { id: 'opensanctions', title: 'OpenSanctions Handbook', author: 'OpenSanctions', type: 'Sanctions', why: 'Screening and entity resolution practice', url: 'https://www.opensanctions.org/docs/', level: 'beginner' },
  { id: 'ffiec', title: 'FFIEC BSA/AML Manual', author: 'FFIEC (US)', type: 'Manual', why: 'Detailed BSA manual — US AML program benchmark', url: 'https://bsaaml.ffiec.gov/', level: 'advanced' },
  { id: 'ti-cpi', title: 'Transparency International — CPI', author: 'TI', type: 'Research', why: 'Corruption risk by country for HRJ/PEP assessment', url: 'https://www.transparency.org/', level: 'beginner' },
  { id: 'edd-handbook', title: 'EDD Handbook (FATF Guidance)', author: 'FATF', type: 'Guidance', why: 'Enhanced due diligence for high-risk customers', url: 'https://www.fatf-gafi.org/', level: 'intermediate' },
  { id: 'travel-rule', title: 'FATF Guidance on Virtual Assets', author: 'FATF', type: 'Crypto AML', why: 'VASP, Travel Rule, crypto risk indicators', url: 'https://www.fatf-gafi.org/en/topics/virtual-assets.html', level: 'intermediate' },
  { id: 'ofac', title: 'OFAC Sanctions Compliance Guidance', author: 'US Treasury', type: 'Sanctions', why: 'OFAC compliance program practice', url: 'https://ofac.treasury.gov/', level: 'intermediate' },
  { id: 'uk-mlr', title: 'UK Money Laundering Regulations 2017', author: 'UK Gov', type: 'Regulation', why: 'Core UK framework for MLRO and analysts', url: 'https://www.gov.uk/', level: 'intermediate' },
  { id: 'goaml', title: 'goAML User Guide', author: 'UNODC', type: 'Reporting', why: 'How FIUs receive STR/SAR in 100+ countries', url: 'https://goaml.unodc.org/', level: 'advanced' },
  { id: 'risk-based', title: 'FATF Risk-Based Approach Guidance', author: 'FATF', type: 'Guidance', why: 'RBA — the language interviewers expect', url: 'https://www.fatf-gafi.org/', level: 'beginner' },
  { id: 'adverse-media', title: 'Wolfsberg — Adverse Media Guidance', author: 'Wolfsberg', type: 'OSINT', why: 'How to assess negative news about a customer', url: 'https://www.wolfsberg-principles.com/', level: 'intermediate' },
  { id: 'tbml', title: 'FATF Trade-Based ML Report', author: 'FATF', type: 'Research', why: 'TBML typologies — over/under invoicing', url: 'https://www.fatf-gafi.org/', level: 'advanced' },
  { id: 'mlro', title: 'MLRO Handbook (ICA)', author: 'ICA', type: 'Book', why: 'MLRO role, SAR decisions, governance', url: 'https://www.int-comp.org/', level: 'advanced' },
];

export function getLiterature(lang: ContentLang): LiteratureItem[] {
  return lang === 'ru' ? LITERATURE_RU : LITERATURE_EN;
}
