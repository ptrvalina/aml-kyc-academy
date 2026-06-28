import type { ContentLang } from './types';

export type NewsItem = {
  id: string;
  date: string;
  region: string;
  title: string;
  summary: string;
  impact: string;
  url: string;
  tags: string[];
  quiz?: { question: string; options: string[]; correct: number };
};

const NEWS_RU: NewsItem[] = [
  { id: 'n1', date: '2024-05', region: 'EU', title: 'EU AMLA — единый AML-регулятор', summary: 'Создание AML Authority (AMLA) во Франкфурте: прямой надзор за крупными банками, единые стандарты EU.', impact: 'Банки EU усилят TM и reporting; спрос на AML-аналитиков в EU растёт.', url: 'https://finance.ec.europa.eu/', tags: ['AMLA', 'EU', 'regulation'], quiz: { question: 'Где будет базироваться EU AMLA?', options: ['Лондон', 'Франкфурт', 'Брюссель'], correct: 1 } },
  { id: 'n2', date: '2024-06', region: 'Global', title: 'FATF grey/black list updates', summary: 'FATF регулярно обновляет списки юрисдикций с недостаточными мерами AML/CFT.', impact: 'HRJ-клиенты → автоматический EDD; пересмотр risk scoring.', url: 'https://www.fatf-gafi.org/', tags: ['FATF', 'HRJ'], quiz: { question: 'Клиент из grey list FATF требует:', options: ['SDD', 'CDD', 'EDD'], correct: 2 } },
  { id: 'n3', date: '2024-08', region: 'US', title: 'OFAC crypto sanctions expansion', summary: 'OFAC добавляет wallet addresses и mixers (Tornado Cash и др.) в SDN list.', impact: 'Crypto exchanges и банки обязаны screen on-chain exposure.', url: 'https://ofac.treasury.gov/', tags: ['OFAC', 'crypto', 'sanctions'] },
  { id: 'n4', date: '2024-09', region: 'UK', title: 'UK Economic Crime Act — усиление UBO', summary: 'Companies House reforms: верификация директоров, штрафы за false filing.', impact: 'KYB/EDD аналитики проверяют UK entities строже.', url: 'https://www.gov.uk/', tags: ['UK', 'UBO', 'KYB'] },
  { id: 'n5', date: '2024-10', region: 'EU', title: 'MiCA + AML для crypto VASP', summary: 'Markets in Crypto-Assets: лицензирование VASP, Travel Rule enforcement в EU.', impact: 'Новые роли Crypto Compliance Analyst в EU exchanges.', url: 'https://finance.ec.europa.eu/', tags: ['MiCA', 'crypto', 'Travel Rule'] },
  { id: 'n6', date: '2024-11', region: 'Global', title: 'AI в AML: регуляторные ожидания', summary: 'FATF и нац. регуляторы публикуют guidance по AI/ML в TM — explainability обязательна.', impact: 'Аналитик должен понимать model output, не слепо закрывать alerts.', url: 'https://www.fatf-gafi.org/', tags: ['AI', 'TM', 'governance'] },
  { id: 'n7', date: '2024-12', region: 'US', title: 'FinCEN CDD Final Rule updates', summary: 'Уточнения по beneficial ownership и customer identification program.', impact: 'KYC refresh cycles и BO forms обновляются в US banks.', url: 'https://www.fincen.gov/', tags: ['FinCEN', 'CDD', 'UBO'] },
  { id: 'n8', date: '2025-01', region: 'EU', title: 'Санкции РФ/Беларусь — 14-й пакет+', summary: 'Расширение sectoral sanctions, diamond ban, circumvention typologies.', impact: 'Trade finance и correspondent banking — повышенный скрининг.', url: 'https://www.sanctionsmap.eu/', tags: ['sanctions', 'EU', 'circumvention'] },
  { id: 'n9', date: '2025-02', region: 'APAC', title: 'Singapore MAS TRM Notice updates', summary: 'MAS ужесточает требования к fintech TM и fraud-AML convergence.', impact: 'APAC neobanks нанимают hybrid Fraud/AML analysts.', url: 'https://www.mas.gov.sg/', tags: ['Singapore', 'TM', 'fintech'] },
  { id: 'n10', date: '2025-03', region: 'Global', title: 'ESG + AML convergence', summary: 'Регуляторы связывают greenwashing и AML через shell companies и opaque flows.', impact: 'EDD включает ESG red flags в corporate clients.', url: 'https://www.fatf-gafi.org/', tags: ['ESG', 'EDD'] },
  { id: 'n11', date: '2025-04', region: 'US', title: 'Real-time payments fraud surge', summary: 'FedNow/RTP рост APP fraud → банки объединяют fraud и AML queues.', impact: 'Навык mule detection критичен для junior analysts.', url: 'https://www.fincen.gov/', tags: ['fraud', 'mule', 'RTP'] },
  { id: 'n12', date: '2025-05', region: 'EU', title: 'Instant Payments Regulation + AML', summary: 'SEPA instant mandatory → меньше времени на hold, больше pre-screening.', impact: 'Sanctions и TM до исполнения платежа.', url: 'https://finance.ec.europa.eu/', tags: ['SEPA', 'instant payments'] },
  { id: 'n13', date: '2025-06', region: 'Global', title: 'DeFi AML guidance', summary: 'FATF уточняет VASP scope для DEX, bridges, unhosted wallets.', impact: 'Crypto analysts trace on-chain до fiat off-ramp.', url: 'https://www.fatf-gafi.org/', tags: ['DeFi', 'crypto', 'VASP'] },
  { id: 'n14', date: '2025-07', region: 'UK', title: 'FCA Consumer Duty + financial crime', summary: 'FCA связывает fair treatment с AML controls при vulnerable customers.', impact: 'Коммуникация RFI без tipping off — ключевой навык.', url: 'https://www.fca.org.uk/', tags: ['UK', 'FCA', 'RFI'] },
  { id: 'n15', date: '2025-08', region: 'LATAM', title: 'Brazil PIX AML rules', summary: 'Bacen усиливает monitoring PIX instant transfers.', impact: 'LATAM fintechs массово нанимают TM analysts.', url: 'https://www.bcb.gov.br/', tags: ['Brazil', 'PIX', 'TM'] },
  { id: 'n16', date: '2025-09', region: 'Global', title: 'Beneficial ownership registries go live', summary: 'EU и UK публичные UBO-реестры; US Corporate Transparency Act.', impact: 'OSINT + registry cross-check — daily EDD task.', url: 'https://www.fatf-gafi.org/', tags: ['UBO', 'registry'] },
  { id: 'n17', date: '2025-10', region: 'US', title: 'AML Act whistleblower program', summary: 'FinCEN whistleblower awards за сообщения о BSA violations.', impact: 'Банки усиливают internal audit и QA кейсов.', url: 'https://www.fincen.gov/', tags: ['US', 'whistleblower'] },
  { id: 'n18', date: '2025-11', region: 'EU', title: 'AMLR single rulebook draft', summary: 'Единый EU AML Regulation заменяет директивы — прямое применение.', impact: 'Гармонизация SAR/STR форматов в EU.', url: 'https://finance.ec.europa.eu/', tags: ['AMLR', 'EU'] },
  { id: 'n19', date: '2025-12', region: 'Global', title: 'Stablecoin AML standards', summary: 'FATF + national laws: issuer licensing, reserve audit, TM on mint/burn.', impact: 'EMI и crypto firms ищут stablecoin compliance specialists.', url: 'https://www.fatf-gafi.org/', tags: ['stablecoin', 'crypto'] },
  { id: 'n20', date: '2026-01', region: 'Global', title: 'Cross-border data sharing for AML', summary: 'FATF R.17 и EU frameworks: безопасный обмен KYC data между FI.', impact: 'Меньше duplicate KYC, больше network analytics.', url: 'https://www.fatf-gafi.org/', tags: ['data', 'KYC', 'privacy'] },
];

const NEWS_EN: NewsItem[] = NEWS_RU.map((n) => ({
  ...n,
  title: n.id === 'n1' ? 'EU AMLA — unified AML supervisor' :
    n.id === 'n2' ? 'FATF grey/black list updates' :
    n.id === 'n3' ? 'OFAC crypto sanctions expansion' :
    n.id === 'n4' ? 'UK Economic Crime Act — stronger UBO' :
    n.id === 'n5' ? 'MiCA + AML for crypto VASP' :
    n.id === 'n6' ? 'AI in AML: regulatory expectations' :
    n.id === 'n7' ? 'FinCEN CDD Final Rule updates' :
    n.id === 'n8' ? 'Russia/Belarus sanctions — package 14+' :
    n.id === 'n9' ? 'Singapore MAS TRM Notice updates' :
    n.id === 'n10' ? 'ESG + AML convergence' :
    n.id === 'n11' ? 'Real-time payments fraud surge' :
    n.id === 'n12' ? 'Instant Payments Regulation + AML' :
    n.id === 'n13' ? 'DeFi AML guidance' :
    n.id === 'n14' ? 'FCA Consumer Duty + financial crime' :
    n.id === 'n15' ? 'Brazil PIX AML rules' :
    n.id === 'n16' ? 'Beneficial ownership registries go live' :
    n.id === 'n17' ? 'AML Act whistleblower program' :
    n.id === 'n18' ? 'AMLR single rulebook draft' :
    n.id === 'n19' ? 'Stablecoin AML standards' :
    'Cross-border data sharing for AML',
  summary: n.id === 'n1' ? 'AMLA in Frankfurt: direct supervision of major banks, unified EU standards.' :
    n.id === 'n2' ? 'FATF updates jurisdictions with insufficient AML/CFT measures.' :
    n.id === 'n3' ? 'OFAC adds wallet addresses and mixers to SDN list.' :
    n.summary,
  impact: n.id === 'n1' ? 'EU banks strengthen TM and reporting; demand for AML analysts grows.' :
    n.id === 'n2' ? 'HRJ clients → automatic EDD; risk scoring review required.' :
    n.impact,
  quiz: n.quiz ? {
    ...n.quiz,
    question: n.id === 'n1' ? 'Where will EU AMLA be based?' : n.id === 'n2' ? 'FATF grey list client requires:' : n.quiz.question,
    options: n.id === 'n1' ? ['London', 'Frankfurt', 'Brussels'] : n.id === 'n2' ? ['SDD', 'CDD', 'EDD'] : n.quiz.options,
  } : undefined,
}));

export function getNews(lang: ContentLang): NewsItem[] {
  return lang === 'ru' ? NEWS_RU : NEWS_EN;
}
