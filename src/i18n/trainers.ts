import type { ContentLang } from './types';

export type TrainerItem = {
  id: string;
  name: string;
  provider: string;
  category: 'certification' | 'simulation' | 'screening' | 'crypto' | 'osint' | 'case';
  description: string;
  whyBest: string;
  url: string;
  free: boolean;
  difficulty: 'beginner' | 'mid' | 'senior';
};

const TRAINERS_RU: TrainerItem[] = [
  { id: 'acams', name: 'ACAMS CAMS Practice Exams', provider: 'ACAMS', category: 'certification', description: 'Официальные материалы и пробные тесты CAMS — золотой стандарт сертификации AML.', whyBest: 'Признаётся банками и финтехами глобально; часто требуют на senior ролях.', url: 'https://www.acams.org/', free: false, difficulty: 'mid' },
  { id: 'ica', name: 'ICA AML Diploma Sandbox', provider: 'ICA', category: 'certification', description: 'Дипломы ICA с кейсами по SAR, PEP, TM — сильный UK/EU трек.', whyBest: 'Практико-ориентированные задания ближе к реальной работе аналитика.', url: 'https://www.int-comp.org/', free: false, difficulty: 'mid' },
  { id: 'opensanctions', name: 'OpenSanctions Screening Lab', provider: 'OpenSanctions', category: 'screening', description: 'Бесплатная база санкций + API для тренировки hit resolution.', whyBest: 'Реальные entity graphs, fuzzy match, disambiguation — как в World-Check.', url: 'https://www.opensanctions.org/', free: true, difficulty: 'beginner' },
  { id: 'opencorporates', name: 'OpenCorporates KYB Trainer', provider: 'OpenCorporates', category: 'osint', description: 'Поиск компаний, директоров, UBO-цепочек в 200+ юрисдикциях.', whyBest: 'Must-have для EDD: тренирует корпоративный OSINT без платных баз.', url: 'https://opencorporates.com/', free: true, difficulty: 'beginner' },
  { id: 'chainalysis-academy', name: 'Chainalysis Academy', provider: 'Chainalysis', category: 'crypto', description: 'Курсы по blockchain tracing, KYT, sanctions exposure.', whyBest: 'Лучший вход в crypto compliance для банков и VASP.', url: 'https://www.chainalysis.com/free-cryptocurrency-fundamentals-course/', free: true, difficulty: 'mid' },
  { id: 'elliptic-learn', name: 'Elliptic Learn', provider: 'Elliptic', category: 'crypto', description: 'Модули по wallet screening, cross-chain, VASP due diligence.', whyBest: 'Практика crypto red flags параллельно с fiat TM.', url: 'https://www.elliptic.co/', free: false, difficulty: 'mid' },
  { id: 'bsa-ffiec', name: 'FFIEC BSA/AML Simulator', provider: 'FFIEC', category: 'simulation', description: 'Интерактивный US BSA manual с сценариями exam для банков.', whyBest: 'Эталон regulatory expectations — полезен даже для EU аналитиков.', url: 'https://bsaaml.ffiec.gov/', free: true, difficulty: 'senior' },
  { id: 'fincen-eg', name: 'FinCEN SAR Filing Examples', provider: 'FinCEN', category: 'case', description: 'Примеры SAR narratives и typologies из реальных обзоров.', whyBest: 'Учит писать SAR без эмоций — только факты и хронология.', url: 'https://www.fincen.gov/', free: true, difficulty: 'mid' },
  { id: 'aml-kyc-academy', name: 'AML/KYC Academy Case Manager', provider: 'This platform', category: 'case', description: '350+ алертов: KYC, TM, sanctions, crypto, OSINT — полный workflow Assign→RFI→MLRO→SAR.', whyBest: 'Единственный бесплатный полигон с audit trail и semantic scoring ответов.', url: 'https://ptrvalina.github.io/aml-kyc-academy/', free: true, difficulty: 'beginner' },
  { id: 'osint-framework', name: 'OSINT Framework Labs', provider: 'OSINT Framework', category: 'osint', description: 'Каталог 500+ OSINT-инструментов с гайдами для EDD.', whyBest: 'Структурирует adverse media и people search для новичков.', url: 'https://osintframework.com/', free: true, difficulty: 'beginner' },
  { id: 'bellingcat', name: 'Bellingcat OSINT Challenges', provider: 'Bellingcat', category: 'osint', description: 'Пошаговые расследования: геолокация, соцсети, корпоративные связи.', whyBest: 'Развивает мышление investigator — transferable в EDD.', url: 'https://www.bellingcat.com/resources/how-tos/', free: true, difficulty: 'mid' },
  { id: 'kyc360', name: 'KYC360 Knowledge Hub', provider: 'KYC360', category: 'simulation', description: 'Статьи, webinars, case studies по KYC/CDD/EDD.', whyBest: 'Актуальные regulatory updates + практические чеклисты.', url: 'https://www.kyc360.com/', free: true, difficulty: 'beginner' },
  { id: 'sanctions-search', name: 'EU Sanctions Map Trainer', provider: 'EU Council', category: 'screening', description: 'Официальная EU sanctions map — тренировка EU restrictive measures.', whyBest: 'Прямой источник для EU sanctions analyst.', url: 'https://www.sanctionsmap.eu/', free: true, difficulty: 'beginner' },
  { id: 'ofac-search', name: 'OFAC Sanctions List Search', provider: 'US Treasury', category: 'screening', description: 'SDN search, program tags, secondary sanctions context.', whyBest: 'Обязательный навык для global sanctions screening.', url: 'https://sanctionssearch.ofac.treas.gov/', free: true, difficulty: 'beginner' },
  { id: 'interview', name: 'Interview Trainer (встроенный)', provider: 'AML/KYC Academy', category: 'case', description: '20+ типовых вопросов собеседования AML с подсказками.', whyBest: 'Готовит к junior/mid интервью сразу после курса.', url: '#interview-trainer', free: true, difficulty: 'beginner' },
];

const TRAINERS_EN: TrainerItem[] = TRAINERS_RU.map((t) => ({
  ...t,
  description: t.id === 'acams' ? 'Official CAMS materials and practice exams — AML certification gold standard.' :
    t.id === 'ica' ? 'ICA diplomas with SAR, PEP, TM case work — strong UK/EU track.' :
    t.id === 'opensanctions' ? 'Free sanctions database + API for hit resolution training.' :
    t.id === 'opencorporates' ? 'Company, director and UBO chain search in 200+ jurisdictions.' :
    t.id === 'chainalysis-academy' ? 'Blockchain tracing, KYT, sanctions exposure courses.' :
    t.id === 'elliptic-learn' ? 'Wallet screening, cross-chain, VASP due diligence modules.' :
    t.id === 'bsa-ffiec' ? 'Interactive US BSA manual with bank exam scenarios.' :
    t.id === 'fincen-eg' ? 'SAR narrative examples and typologies from real reviews.' :
    t.id === 'aml-kyc-academy' ? '350+ alerts: KYC, TM, sanctions, crypto, OSINT — full Assign→RFI→MLRO→SAR workflow.' :
    t.id === 'osint-framework' ? '500+ OSINT tools catalog with EDD guides.' :
    t.id === 'bellingcat' ? 'Step-by-step investigations: geolocation, social, corporate links.' :
    t.id === 'kyc360' ? 'Articles, webinars, case studies on KYC/CDD/EDD.' :
    t.id === 'sanctions-search' ? 'Official EU sanctions map for restrictive measures training.' :
    t.id === 'ofac-search' ? 'SDN search, program tags, secondary sanctions context.' :
    '20+ typical AML interview questions with hints.',
  whyBest: t.id === 'acams' ? 'Globally recognized by banks and fintech; often required for senior roles.' :
    t.id === 'aml-kyc-academy' ? 'Only free sandbox with audit trail and semantic answer scoring.' :
    t.id === 'opensanctions' ? 'Real entity graphs, fuzzy match, disambiguation — like World-Check.' :
    t.id === 'opencorporates' ? 'Must-have EDD skill: corporate OSINT without paid databases.' :
    t.whyBest,
  name: t.id === 'interview' ? 'Interview Trainer (built-in)' : t.name,
}));

export function getTrainers(lang: ContentLang): TrainerItem[] {
  return lang === 'ru' ? TRAINERS_RU : TRAINERS_EN;
}

export const TRAINER_CATEGORY_LABELS: Record<ContentLang, Record<TrainerItem['category'], string>> = {
  ru: { certification: 'Сертификация', simulation: 'Симулятор', screening: 'Скрининг', crypto: 'Crypto AML', osint: 'OSINT', case: 'Кейсы' },
  en: { certification: 'Certification', simulation: 'Simulation', screening: 'Screening', crypto: 'Crypto AML', osint: 'OSINT', case: 'Cases' },
};
