import { Router } from 'express';

export type NewsItem = {
  id: string;
  date: string;
  tag: string;
  title: string;
  summary: string;
  body: string;
  quiz?: { question: string; options: string[]; correctIndex: number };
};

const NEWS_RU: NewsItem[] = [
  {
    id: 'n1',
    date: '2026-06-15',
    tag: 'FATF',
    title: 'FATF обновила рекомендации по виртуальным активам',
    summary: 'Усилен контроль VASP, Travel Rule и риск DeFi-мостов.',
    body: 'FATF опубликовала обновлённое руководство по R.15/R.16: обязательный обмен данными между VASP, усиленный мониторинг unhosted wallets и рисков мостов (bridges). Банки и VASP должны пересмотреть политики EDD для crypto-коридоров.',
    quiz: {
      question: 'Travel Rule относится к:',
      options: ['Передаче данных между VASP', 'Отпуску сотрудников', 'Маркетингу'],
      correctIndex: 0,
    },
  },
  {
    id: 'n2',
    date: '2026-06-08',
    tag: 'Sanctions',
    title: 'Новые пакеты санкций: проверка 50% rule',
    summary: 'Рост сложных корпоративных структур с косвенным владением.',
    body: 'Регуляторы напоминают: при onboarding юрлиц нужно рассчитывать совокупную долю санкционированных лиц в цепочке владения (50% rule). Аналитикам рекомендуют registry OSINT + UBO-граф.',
    quiz: {
      question: '50% rule касается:',
      options: ['Косвенного владения санкционированными лицами', 'Налогов на дивиденды', 'KYC фото'],
      correctIndex: 0,
    },
  },
  {
    id: 'n3',
    date: '2026-05-28',
    tag: 'TM',
    title: 'AI в transaction monitoring: human in the loop',
    summary: 'Модели снижают false positives, но SAR-решение остаётся за аналитиком.',
    body: 'Крупные банки внедряют ML для скоринга алертов. FATF и нацрегуляторы подчёркивают: автоматизация — помощник, не замена MLRO. Документируйте rationale каждого закрытия/эскалации.',
  },
  {
    id: 'n4',
    date: '2026-05-12',
    tag: 'Career',
    title: 'Спрос на Junior AML/KYC вырос на 18%',
    summary: 'FinTech и crypto-VASP активно нанимают entry-level аналитиков.',
    body: 'По данным отраслевых опросов 2026, базовые навыки: sanctions screening, case investigation, SAR drafting, OSINT. Сертификация CAMS остаётся золотым стандартом для карьерного роста.',
  },
];

const NEWS_EN: NewsItem[] = [
  {
    id: 'n1',
    date: '2026-06-15',
    tag: 'FATF',
    title: 'FATF updates virtual asset guidance',
    summary: 'Stronger VASP oversight, Travel Rule, and DeFi bridge risks.',
    body: 'FATF released updated guidance on R.15/R.16: mandatory data exchange between VASPs, enhanced monitoring of unhosted wallets and bridge risks. Banks and VASPs should revisit EDD policies for crypto corridors.',
    quiz: {
      question: 'The Travel Rule relates to:',
      options: ['Data transfer between VASPs', 'Employee vacation', 'Marketing'],
      correctIndex: 0,
    },
  },
  {
    id: 'n2',
    date: '2026-06-08',
    tag: 'Sanctions',
    title: 'New sanctions packages: 50% rule in focus',
    summary: 'Rise of complex ownership with indirect sanctioned control.',
    body: 'Regulators remind firms to aggregate sanctioned ownership across corporate chains (50% rule). Analysts should use registry OSINT and UBO graphs during onboarding.',
    quiz: {
      question: 'The 50% rule concerns:',
      options: ['Indirect ownership by sanctioned persons', 'Dividend taxes', 'KYC photos'],
      correctIndex: 0,
    },
  },
  {
    id: 'n3',
    date: '2026-05-28',
    tag: 'TM',
    title: 'AI in transaction monitoring: human in the loop',
    summary: 'Models cut false positives; SAR decisions stay with analysts.',
    body: 'Major banks deploy ML for alert scoring. FATF and supervisors stress automation assists — it does not replace the MLRO. Document rationale for every closure or escalation.',
  },
  {
    id: 'n4',
    date: '2026-05-12',
    tag: 'Career',
    title: 'Junior AML/KYC hiring up 18%',
    summary: 'FinTech and crypto VASPs actively hire entry-level analysts.',
    body: '2026 industry surveys show core skills: sanctions screening, case investigation, SAR drafting, OSINT. CAMS certification remains the gold standard for career growth.',
  },
];

export const newsRouter = Router();

newsRouter.get('/', (req, res) => {
  const lang = String(req.query.lang ?? 'ru').toLowerCase();
  const items = lang === 'ru' ? NEWS_RU : NEWS_EN;
  res.json({ items, lang: lang === 'ru' ? 'ru' : 'en' });
});
