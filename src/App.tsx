import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CollapsibleSection,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Link,
  Pill,
  Row,
  Select,
  Stack,
  Stat,
  Swatch,
  Table,
  Text,
  TextArea,
  UsageBar,
  computeDAGLayout,
  useCanvasState,
  useHostTheme,
} from './lib/ui';
import { evaluateAnswer } from './lib/evaluator';
import { COURSE_MODULES, COURSE_MODULE_META, COURSE_TITLE, COURSE_SUBTITLE, type PracticeTask, type CourseModule } from './data/course-modules';
import { getCourseModules, getCourseModuleMeta, getCourseTitle, getCourseSubtitle } from './data/course-localized';
import { PracticeTasksPanel, StudentCabinetView } from './components/StudentCabinet';
import { LiteratureView, TrainersView, NewsView, ResourcesHubView } from './components/ContentViews';
import { AuthHeaderButton } from './components/AuthPanel';
import { contentLang } from './i18n/types';
import { tc, getCategoryLabels } from './i18n/content-strings';

type SwatchColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow' | 'gray';
type TermCategory = 'basics' | 'screening' | 'monitoring' | 'investigation' | 'redflags' | 'systems';

type Term = {
  id: string;
  abbr: string;
  full: string;
  category: TermCategory;
  simple: string;
  example: string;
  color: SwatchColor;
  detail?: string;
  english?: string;
};

type Regulation = {
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

type EnglishLesson = {
  id: string;
  topic: string;
  category: 'technical' | 'economic' | 'interview' | 'banking';
  level: 'basic' | 'intermediate' | 'advanced';
  phrases: Array<{ en: string; ru: string; context: string }>;
  vocabulary: Array<{ term: string; meaning: string; example: string }>;
  exercise: string;
};

type RubricCriterion = {
  id: string;
  label: string;
  weight: number;
  required?: boolean;
  patterns?: string[][];
  mistakePatterns?: string[][];
};

type CaseCategory =
  | 'kyc'
  | 'pep'
  | 'sanctions'
  | 'tm'
  | 'fraud'
  | 'crypto'
  | 'trade'
  | 'osint'
  | 'sar'
  | 'ubo'
  | 'hrj'
  | 'cash'
  | 'wire'
  | 'defi';

type PracticeCase = {
  id: string;
  moduleId: string;
  category: CaseCategory;
  difficulty: 'junior' | 'mid' | 'senior';
  caseNum: number;
  title: string;
  scenario: string;
  tasks: string[];
  rubric: RubricCriterion[];
  minWords: number;
};

type SoftwareProvider = {
  id: string;
  name: string;
  category: 'tm' | 'screening' | 'kyc' | 'crypto' | 'case' | 'osint' | 'regtech' | 'network';
  vendor: string;
  summary: string;
  detail: string;
  usedFor: string[];
  typicalUsers: string;
};

type DashboardVariant = 'tm' | 'screening' | 'kyc' | 'crypto' | 'case' | 'network' | 'osint' | 'regtech';
type SoftwareFull = SoftwareProvider & { websiteUrl: string; dashboardVariant: DashboardVariant };

type DetailPanelState =
  | { kind: 'term'; id: string }
  | { kind: 'regulation'; id: string }
  | { kind: 'english'; id: string }
  | { kind: 'software'; id: string }
  | null;

type ExamQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; correct: boolean }>;
  explain: string;
};

type Module = {
  id: string;
  title: string;
  subtitle: string;
  lessons: Array<{ title: string; body: string }>;
  termIds: string[];
  exam: ExamQuestion[];
  passScore: number;
  practiceCaseId?: string;
};

type Verdict = 'correct' | 'partial_ok' | 'partial_bad' | 'incorrect';

type EvalResult = {
  verdict: Verdict;
  score: number;
  maxScore: number;
  percent: number;
  found: Array<{ label: string; matched: string }>;
  missing: string[];
  remarks: string[];
  mistakes: string[];
};

const CATEGORY_LABELS: Record<TermCategory, string> = {
  basics: 'Основы Financial Crime',
  screening: 'Скрининг и проверки',
  monitoring: 'Мониторинг транзакций',
  investigation: 'Расследования и отчёты',
  redflags: 'Red Flags и паттерны',
  systems: 'Системы и регуляторы',
};

const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  kyc: 'KYC / Onboarding',
  pep: 'PEP / EDD',
  sanctions: 'Sanctions Screening',
  tm: 'Transaction Monitoring',
  fraud: 'Fraud / Scam',
  crypto: 'Crypto AML',
  trade: 'Trade-Based ML',
  osint: 'OSINT / Adverse Media',
  sar: 'SAR / Investigation',
  ubo: 'UBO / Corporate',
  hrj: 'High-Risk Jurisdiction',
  cash: 'Cash / MSB',
  wire: 'Wire / Cross-border',
  defi: 'DeFi / Web3',
};

type Lang = 'ru' | 'en' | 'lt' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it' | 'pt';

const LANG_OPTIONS: Array<{ value: Lang; label: string }> = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Українська' },
  { value: 'pl', label: 'Polski' },
  { value: 'lt', label: 'Lietuvių' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
];

const INTL_LANGS: Lang[] = ['en', 'lt', 'uk', 'pl', 'de', 'fr', 'es', 'it', 'pt'];

type UiKey =
  | 'appTitle' | 'appSubtitle' | 'langLabel' | 'navHome' | 'navGlossary' | 'navRegulations'
  | 'navEnglish' | 'navPolygone' | 'navCrypto' | 'navSoftware' | 'navResources'
  | 'modulesPassed' | 'casesCount' | 'systemsCount' | 'englishLessons' | 'status' | 'statusReady' | 'statusStudy'
  | 'consoleBrand' | 'consoleModule' | 'queueTitle' | 'queueCount' | 'analystLabel'
  | 'tabOverview' | 'tabCustomer' | 'tabScreening' | 'tabTransactions' | 'tabInvestigation'
  | 'scenario' | 'tasks' | 'investigationNotes' | 'checkAnswer' | 'aiExpert' | 'aiExpertHint'
  | 'minWordsHint' | 'customerId' | 'riskScore' | 'priority' | 'slaRemaining' | 'alertStatus'
  | 'ruleTriggered' | 'assignToMe' | 'sendRfi' | 'escalateMlro' | 'closeAlert' | 'fileSar'
  | 'filterAll' | 'searchCases' | 'prevPage' | 'nextPage' | 'pageOf' | 'selectCase'
  | 'passed' | 'locked' | 'available' | 'moduleLocked' | 'caseNotFound'
  | 'tabLesson' | 'tabGlossaryMod' | 'tabPractice' | 'tabExam'
  | 'foundInAnswer' | 'missing' | 'mistakes' | 'howToPass'
  | 'verdictCorrect' | 'verdictPartialOk' | 'verdictPartialBad' | 'verdictIncorrect'
  | 'contentEnNote' | 'worldCheck' | 'noHits' | 'screeningPending' | 'mockTxn' | 'profileMismatch'
  | 'swCatalogTitle' | 'swCatalogHint' | 'swUsedFor' | 'swTypicalUsers' | 'swVisitVendor' | 'swDashboards'
  | 'swSelectHint' | 'swWorkflow' | 'swAskAi' | 'swAllCategories' | 'termsLearned' | 'understood' | 'moreDetails' | 'close'
  | 'careerMap' | 'courseSections' | 'jobReadyTitle' | 'jobReadyBody' | 'osintAmlTitle' | 'direction' | 'modulesCol' | 'whereToGo'
  | 'certification' | 'resource' | 'resourceType' | 'resourceWhy' | 'weekPlan' | 'examSubmit' | 'examRetake' | 'examResult'
  | 'regionsIntro' | 'allRegions' | 'englishPractice' | 'checkEnglish' | 'lessonFlowTitle'
  | 'stepLearn' | 'stepExam' | 'stepGlossary' | 'stepPractice' | 'examUnlockTitle' | 'examUnlockBody' | 'goToExam'
  | 'nextModule' | 'finalExamTitle' | 'finalExamTheory' | 'finalExamPractical' | 'finalExamLocked' | 'finalExamUnlocked'
  | 'finalExamPass' | 'certified' | 'optional' | 'moduleObjectives' | 'moduleTakeaways' | 'proTip' | 'courseProgress'
  | 'navOsintTrack' | 'navOsintCases' | 'navInterview' | 'osintTrackTitle' | 'osintFinalExam' | 'osintModulesPassed'
  | 'footerAml' | 'footerOsint' | 'footerPractice' | 'footerOptional' | 'footerCareer' | 'jobSearchTitle' | 'interviewPrep'
  | 'navMyProgress' | 'tabPracticeTasks'
  | 'navLiterature' | 'navTrainers' | 'navNews';

const UI: Record<string, Partial<Record<UiKey, string>>> = {
  ru: {
    appTitle: COURSE_TITLE,
    appSubtitle: COURSE_SUBTITLE,
    langLabel: 'Язык курса',
    navHome: 'Главная', navGlossary: 'Глоссарий', navRegulations: 'Нормативка', navEnglish: 'English + Audio',
    navPolygone: 'Case Manager', navCrypto: 'Crypto AML', navSoftware: 'Каталог софта', navResources: 'Ресурсы',
    modulesPassed: 'Модулей сдано', casesCount: 'Алертов в очереди', systemsCount: 'AML-систем', englishLessons: 'English уроков',
    status: 'Статус', statusReady: 'Ready', statusStudy: 'Study',
    consoleBrand: 'NICE Actimize', consoleModule: 'SAM · Alert & Case Management',
    queueTitle: 'Alert Queue', queueCount: 'в очереди', analystLabel: 'Analyst',
    tabOverview: 'Overview', tabCustomer: 'Customer 360', tabScreening: 'Screening', tabTransactions: 'Transactions', tabInvestigation: 'Investigation',
    scenario: 'Сценарий', tasks: 'Задания расследования', investigationNotes: 'Investigation Notes (audit trail)',
    checkAnswer: 'Submit analysis',
    minWordsHint: 'Мин. слов', customerId: 'Customer ID', riskScore: 'Risk Score', priority: 'Priority', slaRemaining: 'SLA',
    alertStatus: 'Status', ruleTriggered: 'Rule triggered', assignToMe: 'Assign to me', sendRfi: 'Send RFI', escalateMlro: 'Escalate MLRO',
    closeAlert: 'Close alert', fileSar: 'File SAR', filterAll: 'Все категории', searchCases: 'Поиск alert ID, customer, сценарий…',
    prevPage: '← Назад', nextPage: 'Вперёд →', pageOf: 'Стр.', selectCase: 'Выберите alert из очереди слева',
    passed: 'Сдан', locked: 'Заблокирован', available: 'Доступен', moduleLocked: 'Модуль заблокирован',
    caseNotFound: 'Alert не найден', tabLesson: 'Урок', tabGlossaryMod: 'Глоссарий', tabPractice: 'Практика', tabExam: 'Экзамен',
    foundInAnswer: 'Найдено в ответе', missing: 'Не хватает', mistakes: 'Ошибки',
    howToPass: '8 модулей: урок → практика → тест (80%). Следующий открывается после сдачи. Финальный экзамен + отчёт в личном кабинете.',
    navMyProgress: 'Мой прогресс', tabPracticeTasks: 'Задания ТЗ',
    navLiterature: 'Литература', navTrainers: 'Тренажёры', navNews: 'Новости AML',
    verdictCorrect: 'Верно', verdictPartialOk: 'Верно, но…', verdictPartialBad: 'Неверно, но…', verdictIncorrect: 'Неверно',
    contentEnNote: '', worldCheck: 'World-Check One', noHits: 'No PEP/Sanctions hits', screeningPending: 'Review required',
    mockTxn: 'Triggered transactions', profileMismatch: 'Profile vs activity',
  },
  en: {
    appTitle: 'AML/KYC Compliance — Training Sandbox',
    appSubtitle: 'Financial Crime Investigator | AML/KYC Analyst | OSINT & Forensic',
    langLabel: 'Course language',
    navHome: 'Home', navGlossary: 'Glossary', navRegulations: 'Regulations', navEnglish: 'English + Audio',
    navPolygone: 'Case Manager', navCrypto: 'Crypto AML', navSoftware: 'Software catalog', navResources: 'Resources',
    modulesPassed: 'Modules passed', casesCount: 'Alerts in queue', systemsCount: 'AML systems', englishLessons: 'English lessons',
    status: 'Status', statusReady: 'Ready', statusStudy: 'Study',
    consoleBrand: 'NICE Actimize', consoleModule: 'SAM · Alert & Case Management',
    queueTitle: 'Alert Queue', queueCount: 'in queue', analystLabel: 'Analyst',
    tabOverview: 'Overview', tabCustomer: 'Customer 360', tabScreening: 'Screening', tabTransactions: 'Transactions', tabInvestigation: 'Investigation',
    scenario: 'Scenario', tasks: 'Investigation tasks', investigationNotes: 'Investigation Notes (audit trail)',
    checkAnswer: 'Submit analysis',
    minWordsHint: 'Min. words', customerId: 'Customer ID', riskScore: 'Risk Score', priority: 'Priority', slaRemaining: 'SLA',
    alertStatus: 'Status', ruleTriggered: 'Rule triggered', assignToMe: 'Assign to me', sendRfi: 'Send RFI', escalateMlro: 'Escalate MLRO',
    closeAlert: 'Close alert', fileSar: 'File SAR', filterAll: 'All categories', searchCases: 'Search alert ID, customer, scenario…',
    prevPage: '← Prev', nextPage: 'Next →', pageOf: 'Page', selectCase: 'Select an alert from the queue on the left',
    passed: 'Passed', locked: 'Locked', available: 'Available', moduleLocked: 'Module locked',
    caseNotFound: 'Alert not found', tabLesson: 'Lesson', tabGlossaryMod: 'Glossary', tabPractice: 'Practice', tabExam: 'Exam',
    foundInAnswer: 'Found in answer', missing: 'Missing', mistakes: 'Mistakes',
    howToPass: '8 modules: lesson → practice → test (80%). Final exam + progress report in student cabinet.',
    navMyProgress: 'My progress', tabPracticeTasks: 'Practice tasks',
    navLiterature: 'Literature', navTrainers: 'Trainers', navNews: 'AML News',
    verdictCorrect: 'Correct', verdictPartialOk: 'Correct, but…', verdictPartialBad: 'Incorrect, but…', verdictIncorrect: 'Incorrect',
    contentEnNote: '', worldCheck: 'World-Check One', noHits: 'No PEP/Sanctions hits', screeningPending: 'Review required',
    mockTxn: 'Triggered transactions', profileMismatch: 'Profile vs activity',
  },
  lt: {
    appTitle: 'AML/KYC Compliance — mokymų aplinka',
    appSubtitle: 'Financial Crime Investigator | AML/KYC Analyst | OSINT & Forensic',
    langLabel: 'Kurso kalba',
    navHome: 'Pradžia', navGlossary: 'Žodynas', navRegulations: 'Reglamentai', navEnglish: 'English + Audio',
    navPolygone: 'Case Manager', navCrypto: 'Crypto AML', navSoftware: 'Programų katalogas', navResources: 'Resursai',
    modulesPassed: 'Moduliai baigti', casesCount: 'Alertai eilėje', systemsCount: 'AML sistemos', englishLessons: 'English pamokos',
    status: 'Statusas', statusReady: 'Ready', statusStudy: 'Study',
    consoleBrand: 'NICE Actimize', consoleModule: 'SAM · Alert & Case Management',
    queueTitle: 'Alert Queue', queueCount: 'eilėje', analystLabel: 'Analyst',
    tabOverview: 'Overview', tabCustomer: 'Customer 360', tabScreening: 'Screening', tabTransactions: 'Transactions', tabInvestigation: 'Investigation',
    scenario: 'Scenarijus', tasks: 'Tyrimo užduotys', investigationNotes: 'Investigation Notes (audit trail)',
    checkAnswer: 'Pateikti analizę',
    minWordsHint: 'Min. žodžių', customerId: 'Customer ID', riskScore: 'Risk Score', priority: 'Priority', slaRemaining: 'SLA',
    alertStatus: 'Status', ruleTriggered: 'Rule triggered', assignToMe: 'Assign to me', sendRfi: 'Send RFI', escalateMlro: 'Escalate MLRO',
    closeAlert: 'Close alert', fileSar: 'File SAR', filterAll: 'Visos kategorijos', searchCases: 'Ieškoti alert ID, customer…',
    prevPage: '← Atgal', nextPage: 'Pirmyn →', pageOf: 'Psl.', selectCase: 'Pasirinkite alert iš eilės kairėje',
    passed: 'Baigta', locked: 'Užrakinta', available: 'Prieinama', moduleLocked: 'Modulis užrakintas',
    caseNotFound: 'Alert nerastas', tabLesson: 'Pamoka', tabGlossaryMod: 'Žodynas', tabPractice: 'Praktika', tabExam: 'Egzaminas',
    foundInAnswer: 'Rasta atsakyme', missing: 'Trūksta', mistakes: 'Klaidos',
    howToPass: 'Moduliai 1→14: pamoka → žodynas → Case Manager praktika → egzaminas (80%).',
    verdictCorrect: 'Teisingai', verdictPartialOk: 'Teisingai, bet…', verdictPartialBad: 'Neteisingai, bet…', verdictIncorrect: 'Neteisingai',
    contentEnNote: 'Case materials in English (industry standard).',
    worldCheck: 'World-Check One', noHits: 'No PEP/Sanctions hits', screeningPending: 'Review required',
    mockTxn: 'Triggered transactions', profileMismatch: 'Profile vs activity',
  },
  uk: {
    appTitle: 'AML/KYC Compliance — навчальний полігон',
    appSubtitle: 'Financial Crime Investigator | AML/KYC Analyst | OSINT & Forensic',
    langLabel: 'Мова курсу',
    navHome: 'Головна', navGlossary: 'Глосарій', navRegulations: 'Нормативка', navEnglish: 'English + Audio',
    navPolygone: 'Case Manager', navCrypto: 'Crypto AML', navSoftware: 'Каталог софту', navResources: 'Ресурси',
    modulesPassed: 'Модулів здано', casesCount: 'Алертів у черзі', systemsCount: 'AML-систем', englishLessons: 'English уроків',
    status: 'Статус', statusReady: 'Ready', statusStudy: 'Study',
    consoleBrand: 'NICE Actimize', consoleModule: 'SAM · Alert & Case Management',
    queueTitle: 'Alert Queue', queueCount: 'у черзі', analystLabel: 'Analyst',
    tabOverview: 'Overview', tabCustomer: 'Customer 360', tabScreening: 'Screening', tabTransactions: 'Transactions', tabInvestigation: 'Investigation',
    scenario: 'Сценарій', tasks: 'Завдання розслідування', investigationNotes: 'Investigation Notes (audit trail)',
    checkAnswer: 'Submit analysis',
    minWordsHint: 'Мін. слів', customerId: 'Customer ID', riskScore: 'Risk Score', priority: 'Priority', slaRemaining: 'SLA',
    alertStatus: 'Status', ruleTriggered: 'Rule triggered', assignToMe: 'Assign to me', sendRfi: 'Send RFI', escalateMlro: 'Escalate MLRO',
    closeAlert: 'Close alert', fileSar: 'File SAR', filterAll: 'Усі категорії', searchCases: 'Пошук alert ID, customer…',
    prevPage: '← Назад', nextPage: 'Вперед →', pageOf: 'Стор.', selectCase: 'Оберіть alert з черги ліворуч',
    passed: 'Здано', locked: 'Заблоковано', available: 'Доступно', moduleLocked: 'Модуль заблоковано',
    caseNotFound: 'Alert не знайдено', tabLesson: 'Урок', tabGlossaryMod: 'Глосарій', tabPractice: 'Практика', tabExam: 'Іспит',
    foundInAnswer: 'Знайдено у відповіді', missing: 'Не вистачає', mistakes: 'Помилки',
    howToPass: 'Модулі 1→14: урок → глосарій → практика в Case Manager → іспит (80%).',
    verdictCorrect: 'Вірно', verdictPartialOk: 'Вірно, але…', verdictPartialBad: 'Невірно, але…', verdictIncorrect: 'Невірно',
    contentEnNote: 'Матеріали кейсів англійською (industry standard).',
    worldCheck: 'World-Check One', noHits: 'No PEP/Sanctions hits', screeningPending: 'Review required',
    mockTxn: 'Triggered transactions', profileMismatch: 'Profile vs activity',
  },
  pl: {
    appTitle: 'AML/KYC Compliance — środowisko szkoleniowe',
    appSubtitle: 'Financial Crime Investigator | AML/KYC Analyst | OSINT & Forensic',
    langLabel: 'Język kursu',
    navHome: 'Start', navGlossary: 'Słownik', navRegulations: 'Regulacje', navEnglish: 'English + Audio',
    navPolygone: 'Case Manager', navCrypto: 'Crypto AML', navSoftware: 'Katalog oprogramowania', navResources: 'Zasoby',
    modulesPassed: 'Moduły ukończone', casesCount: 'Alerty w kolejce', systemsCount: 'Systemy AML', englishLessons: 'Lekcje English',
    status: 'Status', statusReady: 'Ready', statusStudy: 'Study',
    consoleBrand: 'NICE Actimize', consoleModule: 'SAM · Alert & Case Management',
    queueTitle: 'Alert Queue', queueCount: 'w kolejce', analystLabel: 'Analyst',
    tabOverview: 'Overview', tabCustomer: 'Customer 360', tabScreening: 'Screening', tabTransactions: 'Transactions', tabInvestigation: 'Investigation',
    scenario: 'Scenariusz', tasks: 'Zadania dochodzeniowe', investigationNotes: 'Investigation Notes (audit trail)',
    checkAnswer: 'Submit analysis',
    minWordsHint: 'Min. słów', customerId: 'Customer ID', riskScore: 'Risk Score', priority: 'Priority', slaRemaining: 'SLA',
    alertStatus: 'Status', ruleTriggered: 'Rule triggered', assignToMe: 'Assign to me', sendRfi: 'Send RFI', escalateMlro: 'Escalate MLRO',
    closeAlert: 'Close alert', fileSar: 'File SAR', filterAll: 'Wszystkie kategorie', searchCases: 'Szukaj alert ID, customer…',
    prevPage: '← Wstecz', nextPage: 'Dalej →', pageOf: 'Str.', selectCase: 'Wybierz alert z kolejki po lewej',
    passed: 'Zdany', locked: 'Zablokowany', available: 'Dostępny', moduleLocked: 'Moduł zablokowany',
    caseNotFound: 'Alert nie znaleziony', tabLesson: 'Lekcja', tabGlossaryMod: 'Słownik', tabPractice: 'Praktyka', tabExam: 'Egzamin',
    foundInAnswer: 'Znaleziono w odpowiedzi', missing: 'Brakuje', mistakes: 'Błędy',
    howToPass: 'Moduły 1→14: lekcja → słownik → Case Manager → egzamin (80%).',
    verdictCorrect: 'Poprawnie', verdictPartialOk: 'Poprawnie, ale…', verdictPartialBad: 'Niepoprawnie, ale…', verdictIncorrect: 'Niepoprawnie',
    contentEnNote: 'Materiały case w języku angielskim (industry standard).',
    worldCheck: 'World-Check One', noHits: 'No PEP/Sanctions hits', screeningPending: 'Review required',
    mockTxn: 'Triggered transactions', profileMismatch: 'Profile vs activity',
  },
};

function uiFromEn(overrides: Partial<Record<UiKey, string>>): Record<UiKey, string> {
  return { ...UI.en, ...overrides } as Record<UiKey, string>;
}

const UI_EXTRA: Partial<Record<UiKey, string>> = {
  swCatalogTitle: 'AML/KYC Software Catalog', swCatalogHint: 'Click any system — details, mock dashboards, vendor links open inline.',
  swUsedFor: 'Used for', swTypicalUsers: 'Typical users', swVisitVendor: 'Official vendor website', swDashboards: 'Analyst dashboard previews',
  swSelectHint: 'Select a system from the list on the left', swWorkflow: 'Daily analyst workflow',
  swAllCategories: 'All categories',
  termsLearned: 'Terms learned', understood: 'Got it', moreDetails: 'More details', close: 'Close',
  careerMap: 'Career map (all paths)', courseSections: 'Course sections', jobReadyTitle: 'Congratulations — Job Ready!',
  jobReadyBody: '8/8 modules + final exam passed. Ready for Junior AML/KYC Analyst roles.',
  osintAmlTitle: 'OSINT → AML', direction: 'Direction', modulesCol: 'Modules', whereToGo: 'Where to apply',
  certification: 'Certification & trainers', resource: 'Resource', resourceType: 'Type', resourceWhy: 'Why',
  weekPlan: '4-week plan', examSubmit: 'Submit exam', examRetake: 'Retake', examResult: 'Result',
  regionsIntro: 'Global AML/CFT/Sanctions regulations. Click a country for full details.',
  allRegions: 'All regions', englishPractice: 'Practice answer', checkEnglish: 'Check English', lessonFlowTitle: 'AML investigation flow',
  stepLearn: 'Lesson', stepExam: 'Module test', stepGlossary: 'Glossary', stepPractice: 'Practice case',
  examUnlockTitle: 'Ready for the module test?', examUnlockBody: 'Pass the test (80%) to unlock the next module. Practice tasks and Case Manager cases are optional but recommended.',
  goToExam: 'Take module test →', nextModule: 'Next module →', finalExamTitle: 'Final certification exam',
  finalExamTheory: 'Part 1 — Theory (40 questions)', finalExamPractical: 'Part 2 — Practical (10 cases)',
  finalExamLocked: 'Complete all 8 modules to unlock the final exam.', finalExamUnlocked: 'All modules passed — final exam available!',
  navMyProgress: 'My progress', tabPracticeTasks: 'Practice tasks',
  finalExamPass: 'Certification earned — you are Job Ready!', certified: 'Certified', optional: 'optional',
  moduleObjectives: 'Learning objectives', moduleTakeaways: 'Key takeaways', proTip: 'Pro tip', courseProgress: 'Course progress',
  navOsintTrack: 'OSINT Track', navOsintCases: 'OSINT Practice (50)', navInterview: 'Interview Trainer',
  osintTrackTitle: 'OSINT Investigator Track', osintFinalExam: 'OSINT Final Exam', osintModulesPassed: 'OSINT modules passed',
  footerAml: 'AML Course', footerOsint: 'OSINT Track', footerPractice: 'Practice', footerOptional: 'Optional', footerCareer: 'Career',
  jobSearchTitle: 'How to find a job', interviewPrep: 'Interview preparation',
};

Object.assign(UI.ru, {
  swCatalogTitle: 'Каталог AML/KYC софта', swCatalogHint: 'Нажми на систему слева — описание, mock-дашборды и ссылки откроются здесь.',
  swUsedFor: 'Используется для', swTypicalUsers: 'Типичные пользователи', swVisitVendor: 'Официальный сайт вендора', swDashboards: 'Превью дашбордов аналитика',
  swSelectHint: 'Выберите систему из списка слева', swWorkflow: 'Ежедневный workflow аналитика',
  swAllCategories: 'Все категории',
  termsLearned: 'Терминов изучено', understood: 'Понятно', moreDetails: 'Подробнее', close: 'Закрыть',
  careerMap: 'Карта профессии', courseSections: 'Разделы курса', jobReadyTitle: 'Поздравляем — Job Ready!',
  jobReadyBody: '8/8 модулей + финальный экзамен. Готова к позиции Junior AML/KYC Analyst.',
  osintAmlTitle: 'OSINT → AML', direction: 'Направление', modulesCol: 'Модули', whereToGo: 'Куда идти',
  certification: 'Сертификация и тренажёры', resource: 'Ресурс', resourceType: 'Тип', resourceWhy: 'Зачем',
  weekPlan: '4-недельный план', examSubmit: 'Сдать экзамен', examRetake: 'Пересдать', examResult: 'Результат',
  regionsIntro: 'Мировая нормативная база AML. Нажми «Подробнее» на стране.',
  allRegions: 'Все регионы', englishPractice: 'Практический ответ', checkEnglish: 'Проверить English', lessonFlowTitle: 'Цепочка AML-расследования',
  stepLearn: 'Урок', stepExam: 'Тест модуля', stepGlossary: 'Глоссарий', stepPractice: 'Практика',
  examUnlockTitle: 'Готов к тесту модуля?', examUnlockBody: 'Сдай тест (80%), чтобы открыть следующий модуль. Практические задания и Case Manager — по желанию, но рекомендуются.',
  goToExam: 'Пройти тест модуля →', nextModule: 'Следующий модуль →', finalExamTitle: 'Финальный сертификационный экзамен',
  finalExamTheory: 'Часть 1 — Теория (40 вопросов)', finalExamPractical: 'Часть 2 — Практика (10 кейсов)',
  finalExamLocked: 'Пройди все 8 модулей, чтобы открыть финальный экзамен.', finalExamUnlocked: 'Все модули сданы — финальный экзамен доступен!',
  navMyProgress: 'Мой прогресс', tabPracticeTasks: 'Задания ТЗ',
  finalExamPass: 'Сертификация получена — ты Job Ready!', certified: 'Сертификат', optional: 'опционально',
  moduleObjectives: 'Цели обучения', moduleTakeaways: 'Главное из модуля', proTip: 'Совет профи', courseProgress: 'Прогресс курса',
  navOsintTrack: 'OSINT-трек', navOsintCases: 'OSINT практика (50)', navInterview: 'Тренажёр собеседования',
  osintTrackTitle: 'Трек OSINT Investigator', osintFinalExam: 'Финальный экзамен OSINT', osintModulesPassed: 'OSINT модулей сдано',
  footerAml: 'Курс AML', footerOsint: 'OSINT-трек', footerPractice: 'Практика', footerOptional: 'Опционально', footerCareer: 'Карьера',
  jobSearchTitle: 'Как искать работу', interviewPrep: 'Подготовка к собеседованию',
});

Object.assign(UI.en, UI_EXTRA);
Object.assign(UI.lt, UI_EXTRA);
Object.assign(UI.uk, UI_EXTRA);
Object.assign(UI.pl, UI_EXTRA);

(UI as Record<string, Record<UiKey, string>>).de = uiFromEn({ langLabel: 'Kurssprache', appTitle: COURSE_TITLE, navHome: 'Start', navGlossary: 'Glossar', navRegulations: 'Vorschriften', navSoftware: 'Software-Katalog', navResources: 'Ressourcen', howToPass: '8 Module: Lektion → Praxis → Prüfung (80%).', passed: 'Bestanden', locked: 'Gesperrt', available: 'Verfügbar', navMyProgress: 'Mein Fortschritt' });
(UI as Record<string, Record<UiKey, string>>).fr = uiFromEn({ langLabel: 'Langue du cours', appTitle: COURSE_TITLE, navHome: 'Accueil', navGlossary: 'Glossaire', navRegulations: 'Réglementation', navSoftware: 'Catalogue logiciels', navResources: 'Ressources', howToPass: '8 modules : leçon → pratique → examen (80 %).', passed: 'Réussi', locked: 'Verrouillé', available: 'Disponible', navMyProgress: 'Ma progression' });
(UI as Record<string, Record<UiKey, string>>).es = uiFromEn({ langLabel: 'Idioma del curso', appTitle: COURSE_TITLE, navHome: 'Inicio', navGlossary: 'Glosario', navRegulations: 'Normativa', navSoftware: 'Catálogo de software', navResources: 'Recursos', howToPass: '8 módulos: lección → práctica → examen (80%).', passed: 'Aprobado', locked: 'Bloqueado', available: 'Disponible', navMyProgress: 'Mi progreso' });
(UI as Record<string, Record<UiKey, string>>).it = uiFromEn({ langLabel: 'Lingua del corso', appTitle: COURSE_TITLE, navHome: 'Home', navGlossary: 'Glossario', navRegulations: 'Normativa', navSoftware: 'Catalogo software', navResources: 'Risorse', howToPass: '8 moduli: lezione → pratica → esame (80%).', passed: 'Superato', locked: 'Bloccato', available: 'Disponibile', navMyProgress: 'I miei progressi' });
(UI as Record<string, Record<UiKey, string>>).pt = uiFromEn({ langLabel: 'Idioma do curso', appTitle: COURSE_TITLE, navHome: 'Início', navGlossary: 'Glossário', navRegulations: 'Regulação', navSoftware: 'Catálogo de software', navResources: 'Recursos', howToPass: '8 módulos: lição → prática → exame (80%).', passed: 'Aprovado', locked: 'Bloqueado', available: 'Disponível', navMyProgress: 'Meu progresso' });

function t(lang: Lang, key: UiKey): string {
  const pack = (UI as Record<string, Partial<Record<UiKey, string>>>)[lang];
  return pack?.[key] ?? UI.en[key] ?? UI.ru[key] ?? key;
}

function verdictLabel(lang: Lang, v: Verdict): string {
  const map: Record<Verdict, UiKey> = {
    correct: 'verdictCorrect', partial_ok: 'verdictPartialOk', partial_bad: 'verdictPartialBad', incorrect: 'verdictIncorrect',
  };
  return t(lang, map[v]);
}

const CASE_CAT_I18N: Record<string, Record<CaseCategory, string>> = {
  ru: CASE_CATEGORY_LABELS,
  en: {
    kyc: 'KYC / Onboarding', pep: 'PEP / EDD', sanctions: 'Sanctions Screening', tm: 'Transaction Monitoring',
    fraud: 'Fraud / Scam', crypto: 'Crypto AML', trade: 'Trade-Based ML', osint: 'OSINT / Adverse Media',
    sar: 'SAR / Investigation', ubo: 'UBO / Corporate', hrj: 'High-Risk Jurisdiction', cash: 'Cash / MSB',
    wire: 'Wire / Cross-border', defi: 'DeFi / Web3',
  },
  lt: {
    kyc: 'KYC / Onboarding', pep: 'PEP / EDD', sanctions: 'Sanctions Screening', tm: 'Transaction Monitoring',
    fraud: 'Fraud / Scam', crypto: 'Crypto AML', trade: 'Trade-Based ML', osint: 'OSINT / Adverse Media',
    sar: 'SAR / Investigation', ubo: 'UBO / Corporate', hrj: 'High-Risk Jurisdiction', cash: 'Cash / MSB',
    wire: 'Wire / Cross-border', defi: 'DeFi / Web3',
  },
  uk: {
    kyc: 'KYC / Onboarding', pep: 'PEP / EDD', sanctions: 'Sanctions Screening', tm: 'Transaction Monitoring',
    fraud: 'Fraud / Scam', crypto: 'Crypto AML', trade: 'Trade-Based ML', osint: 'OSINT / Adverse Media',
    sar: 'SAR / Investigation', ubo: 'UBO / Corporate', hrj: 'High-Risk Jurisdiction', cash: 'Cash / MSB',
    wire: 'Wire / Cross-border', defi: 'DeFi / Web3',
  },
  pl: {
    kyc: 'KYC / Onboarding', pep: 'PEP / EDD', sanctions: 'Sanctions Screening', tm: 'Transaction Monitoring',
    fraud: 'Fraud / Scam', crypto: 'Crypto AML', trade: 'Trade-Based ML', osint: 'OSINT / Adverse Media',
    sar: 'SAR / Investigation', ubo: 'UBO / Corporate', hrj: 'High-Risk Jurisdiction', cash: 'Cash / MSB',
    wire: 'Wire / Cross-border', defi: 'DeFi / Web3',
  },
};
const CASE_CAT_EN = CASE_CAT_I18N.en;
CASE_CAT_I18N.de = CASE_CAT_EN;
CASE_CAT_I18N.fr = CASE_CAT_EN;
CASE_CAT_I18N.es = CASE_CAT_EN;
CASE_CAT_I18N.it = CASE_CAT_EN;
CASE_CAT_I18N.pt = CASE_CAT_EN;

function getCaseCatLabel(lang: Lang, cat: CaseCategory): string {
  return CASE_CAT_I18N[lang]?.[cat] ?? CASE_CAT_I18N.en[cat];
}

const MODULE_I18N: Record<string, Record<string, { title: string; subtitle: string }>> = {
  en: {
    m1: { title: 'Module 1: Introduction to AML/CFT', subtitle: 'Who is an AML analyst' },
    m2: { title: 'Module 2: KYC, CDD, EDD, SDD', subtitle: 'How customers are verified' },
    m3: { title: 'Module 3: Screening & monitoring', subtitle: 'Sanctions, PEP, adverse media, red flags' },
    m4: { title: 'Module 4: EDD investigations', subtitle: 'End-to-end case work' },
    m5: { title: 'Module 5: Reporting & regulators', subtitle: 'SAR, MLRO, FIU requests' },
    m6: { title: 'Module 6: Crypto, AI & sanctions', subtitle: 'Modern threats' },
    m7: { title: 'Module 7: Day-to-day AML work', subtitle: 'Alerts, teams, communication' },
    m8: { title: 'Module 8: Career in AML', subtitle: 'CV, interview, certifications' },
  },
  lt: {
    m1: { title: 'Modulis 1: Įvadas į AML/CFT', subtitle: 'Kas yra AML analitikas' },
    m2: { title: 'Modulis 2: KYC, CDD, EDD, SDD', subtitle: 'Klientų tikrinimas' },
    m3: { title: 'Modulis 3: Screening ir monitoringas', subtitle: 'Sankcijos, PEP, red flags' },
    m4: { title: 'Modulis 4: EDD tyrimai', subtitle: 'Pilnas case workflow' },
    m5: { title: 'Modulis 5: Ataskaitos ir reguliatoriai', subtitle: 'SAR, MLRO, FIU' },
    m6: { title: 'Modulis 6: Kripto, AI ir sankcijos', subtitle: 'Šiuolaikinės grėsmės' },
    m7: { title: 'Modulis 7: AML kasdienybė', subtitle: 'Alertai, komandos' },
    m8: { title: 'Modulis 8: Karjera AML', subtitle: 'CV, interviu, sertifikatai' },
  },
  uk: {
    m1: { title: 'Модуль 1: Вступ до AML/CFT', subtitle: 'Хто такий AML-аналітик' },
    m2: { title: 'Модуль 2: KYC, CDD, EDD, SDD', subtitle: 'Перевірка клієнтів' },
    m3: { title: 'Модуль 3: Скринінг і моніторинг', subtitle: 'Санкції, PEP, red flags' },
    m4: { title: 'Модуль 4: EDD-розслідування', subtitle: 'Повний цикл кейсу' },
    m5: { title: 'Модуль 5: Звітність і регулятори', subtitle: 'SAR, MLRO, FIU' },
    m6: { title: 'Модуль 6: Крипто, ШІ і санкції', subtitle: 'Сучасні загрози' },
    m7: { title: 'Модуль 7: Робота AML-фахівця', subtitle: 'Алерти, команди' },
    m8: { title: 'Модуль 8: Кар\'єра в AML', subtitle: 'CV, співбесіда' },
  },
  pl: {
    m1: { title: 'Moduł 1: Wprowadzenie do AML/CFT', subtitle: 'Kim jest analityk AML' },
    m2: { title: 'Moduł 2: KYC, CDD, EDD, SDD', subtitle: 'Weryfikacja klientów' },
    m3: { title: 'Moduł 3: Screening i monitoring', subtitle: 'Sankcje, PEP, red flags' },
    m4: { title: 'Moduł 4: Dochodzenia EDD', subtitle: 'Pełny workflow case' },
    m5: { title: 'Moduł 5: Raportowanie i regulatorzy', subtitle: 'SAR, MLRO, FIU' },
    m6: { title: 'Moduł 6: Krypto, AI i sankcje', subtitle: 'Nowoczesne zagrożenia' },
    m7: { title: 'Moduł 7: Codzienna praca AML', subtitle: 'Alerty, zespoły' },
    m8: { title: 'Moduł 8: Kariera w AML', subtitle: 'CV, rozmowa kwalifikacyjna' },
  },
};

function getModuleMeta(lang: Lang, mod: Module): { title: string; subtitle: string } {
  if (lang === 'ru') return { title: mod.title, subtitle: mod.subtitle };
  return MODULE_I18N[lang]?.[mod.id] ?? MODULE_I18N.en?.[mod.id] ?? { title: mod.title, subtitle: mod.subtitle };
}

MODULE_I18N.de = MODULE_I18N.en;
MODULE_I18N.fr = MODULE_I18N.en;
MODULE_I18N.es = MODULE_I18N.en;
MODULE_I18N.it = MODULE_I18N.en;
MODULE_I18N.pt = MODULE_I18N.en;

const GLOSSARY: Term[] = [
  { id: 'aml', abbr: 'AML', full: 'Anti-Money Laundering', category: 'basics', color: 'blue', simple: 'Борьба с отмыванием денег через финансовую систему.', example: 'Банк блокирует счёт, если видит подозрительные переводы.' },
  { id: 'kyc', abbr: 'KYC', full: 'Know Your Customer', category: 'basics', color: 'green', simple: 'Идентификация и понимание клиента до начала обслуживания.', example: 'Паспорт + селфи + проверка адреса при открытии счёта.' },
  { id: 'ctf', abbr: 'CTF', full: 'Counter-Terrorist Financing', category: 'basics', color: 'pink', simple: 'Блокировка финансирования терроризма.', example: 'Переводы в зоны конфликта → усиленная проверка.' },
  { id: 'fatf', abbr: 'FATF', full: 'Financial Action Task Force', category: 'systems', color: 'yellow', simple: 'Международный стандарт AML — 40 рекомендаций для всех стран.', example: 'Из-за FATF банки обязаны проверять UBO.' },
  { id: 'fiu', abbr: 'FIU', full: 'Financial Intelligence Unit', category: 'systems', color: 'gray', simple: 'Государственная финансовая разведка. SAR подаётся сюда.', example: 'FinCEN в США, NCA в UK.' },
  { id: 'cdd', abbr: 'CDD', full: 'Customer Due Diligence', category: 'basics', color: 'green', simple: 'Стандартная проверка клиента: ID, адрес, доход, цель счёта.', example: 'Обычный клиент без PEP-статуса → CDD достаточно.' },
  { id: 'edd', abbr: 'EDD', full: 'Enhanced Due Diligence', category: 'basics', color: 'orange', simple: 'Углублённая проверка для высокорисковых клиентов.', example: 'PEP, офшор, крупный оборот → EDD обязательно.' },
  { id: 'pep', abbr: 'PEP', full: 'Politically Exposed Person', category: 'screening', color: 'purple', simple: 'Политик или его близкий. Повышенный риск коррупции.', example: 'Депутат, министр, судья, их супруг/дети.' },
  { id: 'ubo', abbr: 'UBO', full: 'Ultimate Beneficial Owner', category: 'screening', color: 'green', simple: 'Реальный владелец компании (обычно >25%).', example: 'За 5 офшорными фирмами стоит один человек — он UBO.' },
  { id: 'sof', abbr: 'SOF / SOW', full: 'Source of Funds / Source of Wealth', category: 'investigation', color: 'blue', simple: 'Откуда конкретные деньги / откуда состояние в целом.', example: 'SOF: зарплата за этот перевод. SOW: 20 лет в IT.' },
  { id: 'sanctions', abbr: 'Sanctions Screening', full: 'Проверка по санкциям', category: 'screening', color: 'pink', simple: 'Сверка с OFAC, EU, UN, UK списками.', example: 'Клиент совпал с SDN list → hit.' },
  { id: 'ofac', abbr: 'OFAC / SDN', full: 'Office of Foreign Assets Control', category: 'systems', color: 'pink', simple: 'US санкционный реестр. SDN = Specially Designated Nationals.', example: 'Совпадение с SDN → блокировка для US-linked операций.' },
  { id: 'adverse', abbr: 'Adverse Media', full: 'Негативные медиа', category: 'screening', color: 'orange', simple: 'Новости о преступлениях, коррупции, судебных делах.', example: 'Статья «CEO arrested for fraud» → medium/high risk.' },
  { id: 'hit', abbr: 'Hit', full: 'Срабатывание скрининга', category: 'screening', color: 'pink', simple: 'Система нашла потенциальное совпадение со списком.', example: '87% match с санкционным лицом → hit для разбора.' },
  { id: 'true-match', abbr: 'True Match', full: 'Подтверждённое совпадение', category: 'screening', color: 'pink', simple: 'Hit подтверждён: тот же человек/компания.', example: 'Совпали имя, DOB, паспорт → true match → блокировка.' },
  { id: 'false-positive', abbr: 'False Positive', full: 'Ложное срабатывание', category: 'screening', color: 'yellow', simple: 'Hit, но это другой человек. Нужно задокументировать.', example: 'Однофамилец с другим DOB → false positive.' },
  { id: 'fuzzy', abbr: 'Fuzzy Matching', full: 'Нечёткое совпадение', category: 'screening', color: 'yellow', simple: 'Алгоритм ищет похожие имена, не только точные.', example: 'Ivan Ivanov ≈ I. Ivanov ≈ Иван Иванов.' },
  { id: 'tm', abbr: 'Transaction Monitoring', full: 'Мониторинг транзакций', category: 'monitoring', color: 'blue', simple: 'Автоматическое отслеживание операций клиента.', example: 'Actimize ловит structuring → создаёт alert.' },
  { id: 'alert', abbr: 'Alert', full: 'Алерт (сигнал TM)', category: 'monitoring', color: 'blue', simple: 'Автоматическое предупреждение о подозрительной активности.', example: 'Alert #TM-4521: unusual velocity — твоя задача расследовать.' },
  { id: 'structuring', abbr: 'Structuring / Smurfing', full: 'Дробление сумм', category: 'redflags', color: 'orange', simple: 'Много переводов чуть ниже порога отчётности.', example: '15 × 9 800 EUR вместо одного 150 000.' },
  { id: 'rapid-in-out', abbr: 'Rapid In-Out', full: 'Быстрый проход денег', category: 'redflags', color: 'orange', simple: 'Деньги зашли и почти сразу ушли — счёт как прокладка.', example: '100K пришло утром, 95K ушло вечером на crypto.' },
  { id: 'third-party', abbr: 'Third-Party Payments', full: 'Платежи за третьих лиц', category: 'redflags', color: 'orange', simple: 'Клиент проводит операции, не связанные с его профилем.', example: 'Студент получает 40 переводов от незнакомых людей.' },
  { id: 'mule', abbr: 'Mule Account', full: 'Счёт-прокладка', category: 'redflags', color: 'pink', simple: 'Счёт используется для транзита чужих денег.', example: 'Много входящих от физлиц → быстрый вывод.' },
  { id: 'layering', abbr: 'Layering', full: 'Наслоение', category: 'redflags', color: 'purple', simple: '2-я стадия отмывания: запутывание цепочки переводов.', example: 'A→B→C→D→crypto — каждый шаг усложняет след.' },
  { id: 'placement', abbr: 'Placement', full: 'Внесение', category: 'redflags', color: 'purple', simple: '1-я стадия: ввод «грязных» денег в систему.', example: 'Мелкие cash deposits в разных отделениях.' },
  { id: 'integration', abbr: 'Integration', full: 'Легализация', category: 'redflags', color: 'purple', simple: '3-я стадия: «чистые» деньги возвращаются в экономику.', example: 'Покупка недвижимости/бизнеса на отмытые средства.' },
  { id: 'inconsistent', abbr: 'Inconsistent Profile', full: 'Несоответствие профилю', category: 'redflags', color: 'yellow', simple: 'Оборот не соответствует заявленному доходу/профессии.', example: 'Студент, 500 EUR/мес доход, 180K оборот.' },
  { id: 'dormant', abbr: 'Dormant → Active', full: 'Спящий счёт проснулся', category: 'redflags', color: 'yellow', simple: 'Долго без активности, потом резкий всплеск.', example: '2 года тишина → 200K за неделю.' },
  { id: 'hrj', abbr: 'High-Risk Jurisdiction', full: 'Высокорисковая юрисдикция', category: 'redflags', color: 'pink', simple: 'Страна/офшор с высоким AML-риском.', example: 'Переводы в/из FATF grey list стран.' },
  { id: 'rfi', abbr: 'RFI', full: 'Request for Information', category: 'investigation', color: 'blue', simple: 'Запрос документов/объяснений у клиента.', example: '«Пришлите договор с контрагентом и объясните перевод 50K».' },
  { id: 'sar', abbr: 'SAR / STR', full: 'Suspicious Activity Report', category: 'investigation', color: 'purple', simple: 'Официальный отчёт о подозрении для FIU.', example: 'Обоснованное подозрение + нет правдоподобного объяснения → SAR.' },
  { id: 'escalation', abbr: 'Escalation', full: 'Эскалация', category: 'investigation', color: 'gray', simple: 'Передача кейса старшему аналитику / MLRO.', example: 'True sanctions match → немедленная эскалация.' },
  { id: 'mlro', abbr: 'MLRO', full: 'Money Laundering Reporting Officer', category: 'systems', color: 'gray', simple: 'Главный compliance-офицер, принимает решение по SAR.', example: 'Аналитик готовит кейс → MLRO одобряет SAR.' },
  { id: 'audit-trail', abbr: 'Audit Trail', full: 'След аудита', category: 'investigation', color: 'gray', simple: 'Полная документация каждого шага расследования.', example: 'Почему закрыл alert — должно быть записано.' },
  { id: 'risk-score', abbr: 'Risk Score', full: 'Оценка риска', category: 'basics', color: 'blue', simple: 'Low / Medium / High — определяет уровень проверки.', example: 'PEP + adverse media = High → EDD.' },
  { id: 'rfi-deadline', abbr: 'Tipping Off', full: 'Запрет предупреждать клиента', category: 'investigation', color: 'pink', simple: 'Нельзя говорить клиенту, что готовится SAR. Уголовная ответственность.', example: 'RFI формулируется нейтрально: «для compliance review».' },
  { id: 'vasp', abbr: 'VASP', full: 'Virtual Asset Service Provider', category: 'systems', color: 'purple', simple: 'Лицензируемый crypto-провайдер: биржа, custodian, broker.', example: 'Binance, Coinbase, licensed neobanks — все VASP под Travel Rule.' },
  { id: 'travel-rule', abbr: 'Travel Rule', full: 'FATF Recommendation 16 (crypto)', category: 'systems', color: 'blue', simple: 'Передача данных отправителя/получателя при crypto-переводах между VASP.', example: 'Transfer 10K USDC → нужны имя, адрес, wallet both sides.' },
  { id: 'mixer', abbr: 'Mixer / Tumbler', full: 'Crypto obfuscation service', category: 'redflags', color: 'pink', simple: 'Сервис запутывания blockchain trail. Extreme red flag.', example: 'Tornado Cash exposure → reject/offboard/SAR.' },
  { id: 'chain-hopping', abbr: 'Chain-Hopping', full: 'Cross-chain obfuscation', category: 'redflags', color: 'orange', simple: 'Быстрые переводы между blockchains для сокрытия источника.', example: 'ETH→bridge→BSC→TRON→fiat off-ramp.' },
  { id: 'defi', abbr: 'DeFi', full: 'Decentralized Finance', category: 'systems', color: 'purple', simple: 'Финансы через smart contracts без традиционного посредника.', example: 'Uniswap swap, Aave lend — on-chain видно всё.' },
  { id: 'unhosted', abbr: 'Unhosted Wallet', full: 'Self-custody crypto wallet', category: 'screening', color: 'yellow', simple: 'Кошелёк без VASP (MetaMask, Ledger). Travel Rule gap риск.', example: 'Deposit from unknown unhosted → EDD + blockchain trace.' },
  { id: 'kyt', abbr: 'KYT', full: 'Know Your Transaction', category: 'monitoring', color: 'blue', simple: 'Screening crypto-транзакций как TM для fiat.', example: 'Chainalysis KYT flags sanctioned wallet inbound.' },
];

const TERM_ENRICHMENTS: Record<string, { detail: string; english: string }> = {
  aml: { detail: 'AML — глобальная система: законы стран + рекомендации FATF + внутренние политики банка. Три стадии отмывания: Placement → Layering → Integration. Банк обязан: идентифицировать клиента (KYC), мониторить транзакции (TM), сообщать о подозрениях (SAR). Штрафы за нарушение — миллионы EUR/USD.', english: 'Anti-Money Laundering — the framework of laws, regulations and procedures to detect and report money laundering.' },
  kyc: { detail: 'KYC — не разовая проверка, а ongoing process. Включает: Customer Identification (ID), Customer Verification (документы), Risk Assessment, Ongoing Monitoring. Для юрлиц — KYC + KYB (Know Your Business). Все licensed финтехи и банки обязаны KYC до активации счёта.', english: 'Know Your Customer — the process of verifying the identity of clients and assessing their risk profile.' },
  ctf: { detail: 'CTF дополняет AML. Фокус — не отмывание прибыли, а финансирование терроризма. Особенность: террористические суммы могут быть малыми и «чистыми». FATF Recommendation 5-7 касаются CTF. Санкционные списки пересекаются с CTF.', english: 'Counter-Terrorist Financing — measures to prevent funds reaching terrorist organisations.' },
  fatf: { detail: 'FATF (Париж, 1989) — 40 Recommendations + 9 Special Recommendations (CTF). Публикует grey/black lists стран. Страна в grey list → все банки мира усиливают проверки операций с ней. AMLD в EU — внедрение FATF в европейское право.', english: 'Financial Action Task Force — intergovernmental body setting global AML/CFT standards.' },
  fiu: { detail: 'FIU получает SAR/STR от банков, анализирует, передаёт правоохранителям. FinCEN (US), NCA (UK), GOAML (многие страны). Банк не расследует преступление — он сообщает о подозрении. FIU — мост между банком и полицией.', english: 'Financial Intelligence Unit — national agency receiving and analysing suspicious transaction reports.' },
  cdd: { detail: 'CDD минимум: полное имя, DOB, адрес, гражданство, ID-документ, цель счёта, источник средств. Simplified CDD — для low-risk (редко). Standard CDD — большинство клиентов. При изменении риска — пересмотр. CDD ≠ «один раз при открытии».', english: 'Customer Due Diligence — standard identification and verification measures applied to all customers.' },
  edd: { detail: 'EDD триггеры: PEP, high-risk jurisdiction, adverse media, сложная корпоративная структура, необычно высокий оборот, crypto, cash-intensive business. EDD = больше документов, senior approval, чаще пересмотр (минимум ежегодно).', english: 'Enhanced Due Diligence — additional measures for higher-risk customers and transactions.' },
  pep: { detail: 'PEP категории: Head of State, Ministers, MPs, judges, military, central bank, SOE executives + family (супруг, дети, родители) + close associates. Domestic PEP и Foreign PEP. Бывший PEP (ex-PEP) — риск сохраняется 12-18 мес после ухода.', english: 'Politically Exposed Person — an individual entrusted with prominent public functions, plus family and close associates.' },
  ubo: { detail: 'Порог UBO: обычно 25% (EU AMLD), иногда 10% (UK). Контроль без доли тоже UBO (nominee arrangements). Shell companies — главный способ скрыть UBO. Инструменты: OpenCorporates, Companies House, LEI registry, OSINT.', english: 'Ultimate Beneficial Owner — the natural person who ultimately owns or controls a legal entity.' },
  sof: { detail: 'SOF — для конкретной транзакции: «откуда эти 50 000 EUR?». SOW — общее состояние: «как вы накопили 2 млн?». Документы: зарплатные листы, налоговые декларации, продажа имущества, наследство, дивиденды. Противоречия в SOF/SOW = red flag.', english: 'Source of Funds / Source of Wealth — origin of specific funds vs. overall accumulated wealth.' },
  sanctions: { detail: 'Списки: OFAC SDN (US), EU Consolidated List, UN Security Council, UK OFSI, HMT. Проверяют: клиент, UBO, контрагенты, банки-корреспонденты. Secondary sanctions — наказание за сделки с санкционными лицами даже вне US.', english: 'Sanctions Screening — checking parties against government restricted-party lists.' },
  ofac: { detail: 'OFAC SDN List — 10 000+ имён. 50% Rule: компания блокируется, если 50%+ принадлежит SDN. Civil penalties до $300K+ за нарушение. Все USD-транзакции под юрисдикцией US, даже если банк не в США.', english: 'Office of Foreign Assets Control — US Treasury body administering economic sanctions programmes.' },
  adverse: { detail: 'Источники: Google, Factiva, World-Check, Dow Jones, локальные СМИ. Оцениваешь: свежесть, серьёзность, статус дела (convicted vs. accused vs. cleared). Одна статья ≠ auto-decline. Нужен контекст и вес.', english: 'Adverse Media — negative news linking a customer to financial crime, corruption or sanctions.' },
  hit: { detail: 'Hit не = виновен. Hit = «стоп, проверь». Workflow: hit → analyst review → true/false match → action. Hit rate в индустрии: 90-95% false positives. KPI аналитика — качество разбора, не скорость закрытия.', english: 'Hit — a potential match generated by screening software against a watchlist.' },
  'true-match': { detail: 'True match критерии: совпадение 2+ уникальных идентификаторов (имя+DOB, имя+паспорт). При true match на sanctions: freeze funds, block account, SAR, escalate MLRO, NO tipping off.', english: 'True Match — confirmed identity match with a listed person or entity.' },
  'false-positive': { detail: 'False positive: разный DOB, другой паспорт, другая страна. Документируешь: какие поля сравнили, почему не match. Audit trail обязателен. Закрытие без документации = regulatory breach.', english: 'False Positive — screening alert where the customer is not the listed party.' },
  fuzzy: { detail: 'Алгоритмы: Levenshtein distance, phonetic matching (Soundex), transliteration (Cyrillic↔Latin). 85% match + разный DOB = скорее false positive. 95% + совпадение DOB = escalate.', english: 'Fuzzy Matching — approximate string matching to detect similar names across scripts.' },
  tm: { detail: 'Системы: NICE Actimize, Oracle Mantas, SAS AML, ComplyAdvantage TM. Правила (rules) + ML-модели (anomaly detection). Типы алертов: structuring, velocity, high-risk country, unusual pattern, mule.', english: 'Transaction Monitoring — automated surveillance of customer transactions for suspicious patterns.' },
  alert: { detail: 'Alert содержит: customer ID, rule triggered, transactions, score, date. SLA: обычно 24-72 часа на первичный разбор. Статусы: Open → Under Review → RFI → Escalated → Closed / SAR Filed.', english: 'Alert — a system-generated notification flagging activity that may require investigation.' },
  structuring: { detail: 'US: CTR порог $10 000. EU: varying thresholds. Smurfing — использование нескольких людей для structuring. Типичный паттерн: many deposits just below threshold in short period. Автоматически ловится TM rules.', english: 'Structuring — deliberately splitting transactions to avoid reporting thresholds; smurfing involves third parties.' },
  'rapid-in-out': { detail: 'Pass-through account: funds in and out within 24-48h with minimal balance retention. Часто mule или layering. Смотри: sender diversity, destination (crypto, offshore), customer profile mismatch.', english: 'Rapid In-Out — funds passing quickly through an account with little economic rationale.' },
  'third-party': { detail: 'Клиент получает/отправляет деньги от/к лицам без очевидной связи. Проверяй: договоры, invoices, family ties. Много third-party + rapid movement = classic mule typology.', english: 'Third-Party Payments — transactions involving parties with no apparent relationship to the customer.' },
  mule: { detail: 'Money mule types: unwitting (обмануты), witting (согласны за %), complicit (организаторы). Типичный профиль mule: young, student, recent account. Social engineering через «работу переводчиком денег».', english: 'Mule Account — bank account used to receive and transfer illicit funds on behalf of others.' },
  layering: { detail: 'Цель — оторвать деньги от источника. Методы: multiple transfers, different currencies, shell companies, crypto, trade-based ML. TM ловит: circular transactions, round amounts, complex chains.', english: 'Layering — the second ML stage involving complex transfers to obscure the audit trail.' },
  placement: { detail: 'Самый рискованный этап для преступника. Методы: cash deposits, casino, purchase of monetary instruments, smuggling. Banks: cash deposit alerts, CTR reporting, source of cash questions.', english: 'Placement — introducing illicit cash into the financial system.' },
  integration: { detail: 'Финальная стадия: деньги выглядят легальными. Покупка недвижимости, бизнеса, luxury goods. EDD на крупные покупки. Adverse media + sudden wealth = investigate SOW.', english: 'Integration — reintroducing laundered funds into the economy as apparent legitimate assets.' },
  inconsistent: { detail: 'Сравни: declared income vs. turnover, profession vs. transaction types, age vs. wealth. Студент/безработный с 500K оборотом — классика. Запроси SOF/SOW через RFI.', english: 'Inconsistent Profile — customer activity that does not match their stated profile or income.' },
  dormant: { detail: 'Dormant account awakening: 12+ months inactivity → sudden high volume. Может быть: account takeover, sold account, mule activation. Проверь: смена контактов, новые устройства, IP-адреса.', english: 'Dormant-to-Active — a previously inactive account showing sudden transaction activity.' },
  hrj: { detail: 'FATF grey list (increased monitoring) и black list (call to action). EU high-risk third countries list. Офшоры: BVI, Cayman, Panama — не auto-decline, но EDD. UAE, Turkey — часто high-risk в TM rules.', english: 'High-Risk Jurisdiction — country identified by FATF or regulators as posing elevated AML risk.' },
  rfi: { detail: 'RFI формат: конкретные вопросы, deadline (обычно 14-30 дней), список документов. Нельзя: «мы подозреваем вас в отмывании». Можно: «для завершения compliance review предоставьте...». No response = escalate.', english: 'Request for Information — formal request to the customer for documents or explanations.' },
  sar: { detail: 'SAR filing deadline: US 30 days, UK «as soon as practicable», EU varies. Содержание: who, what, when, where, why suspicious. После SAR: NO tipping off, continue monitoring, NO account closure that alerts client (in some jurisdictions).', english: 'Suspicious Activity Report — confidential report filed with the FIU when suspicion cannot be dispelled.' },
  escalation: { detail: 'Эскалация к: Senior Analyst → Team Lead → MLRO → Legal. Mandatory escalation: true sanctions match, PEP without approval, SAR recommendation, media enquiry about investigation.', english: 'Escalation — referring a case to a more senior compliance officer for decision.' },
  mlro: { detail: 'MLRO (UK) / BSA Officer (US) / Compliance Officer. Принимает финальное решение по SAR. Защищённая должность — не увольняется за добросовестный SAR. Все licensed banks обязаны иметь MLRO.', english: 'Money Laundering Reporting Officer — senior officer responsible for AML compliance and SAR decisions.' },
  'audit-trail': { detail: 'Каждое действие: timestamp, analyst name, decision, rationale, documents reviewed. Регулятор может запросить audit trail за 5+ лет. «Закрыл alert» без записи почему = finding в audit.', english: 'Audit Trail — chronological record of all actions and decisions taken on a case.' },
  'risk-score': { detail: 'Факторы: geography, PEP, industry, product, channel, transaction behaviour. Low: EU resident, employed, standard products. High: PEP, offshore, crypto, cash business. Score определяет: CDD vs EDD, review frequency.', english: 'Risk Score — calculated rating determining the level of due diligence and monitoring required.' },
  'rfi-deadline': { detail: 'Tipping off — criminal offence в UK (POCA), US, EU. Нельзя: сообщить клиенту о SAR, изменить поведение чтобы намекнуть. Можно: стандартный RFI, freeze без объяснения причин (в рамках закона).', english: 'Tipping Off — unlawfully informing a customer that a SAR has been or will be filed.' },
  vasp: { detail: 'VASP под FATF = exchanges, custodial wallets, brokers, ATM operators, some DeFi frontends. Лицензия: MiCA (EU), FCA crypto register (UK), FinCEN MSB (US). Analyst проверяет: licensed? jurisdiction? AML programme?', english: 'Virtual Asset Service Provider — entity conducting exchange, transfer, custody or issuance of virtual assets.' },
  'travel-rule': { detail: 'EU Transfer of Funds Regulation + FATF R.16. Threshold ~1000 USD/EUR. Data: originator name, account/wallet, beneficiary name, wallet. Notabene/Sygna — messaging networks. Missing data = hold or reject.', english: 'Travel Rule — requirement to transmit originator and beneficiary information with virtual asset transfers.' },
  mixer: { detail: 'Mixers pool funds to break traceability. OFAC sanctioned Tornado Cash (2022). Policy: most banks prohibit any mixer exposure. Analyst documents exposure % from Chainalysis/Elliptic.', english: 'Mixer/Tumbler — service designed to obscure the origin of cryptocurrency funds.' },
  'chain-hopping': { detail: 'Typology: move assets across chains via bridges (Wormhole, Multichain). Each hop adds complexity. TRM/Chainalysis cross-chain tracing required. Often paired with mixer output.', english: 'Chain-Hopping — moving crypto across blockchains to obscure transaction trails.' },
  defi: { detail: 'Protocols: DEX (Uniswap), lending (Aave), staking (Lido). Risks: exploit funds, wash trading, sanctioned protocol interaction. Analyst reads Etherscan + analytics — OSINT skill applies.', english: 'Decentralized Finance — financial services via smart contracts without central intermediary.' },
  unhosted: { detail: 'Self-hosted wallet = customer controls keys. FATF requires VASP to treat transfers from/to unhosted as higher risk. EDD: prove ownership (sign message), trace source funds on-chain.', english: 'Unhosted Wallet — cryptocurrency wallet not held by a VASP (self-custody).' },
  kyt: { detail: 'KYT = crypto equivalent of TM. Real-time screening on deposit/withdrawal. Integrates with onboarding and fraud. Analyst reviews KYT alerts same as TM alerts: context, trace, decision.', english: 'Know Your Transaction — monitoring and screening of cryptocurrency transactions.' },
};

function enrichedTerm(term: Term) {
  const e = TERM_ENRICHMENTS[term.id];
  return { ...term, detail: term.detail ?? e?.detail ?? term.simple, english: term.english ?? e?.english ?? term.full };
}

const REGULATIONS: Regulation[] = [
  { id: 'fatf-global', region: 'Мир', country: 'FATF (39 стран-участниц)', flag: 'UN', name: '40 FATF Recommendations', authority: 'Financial Action Task Force', summary: 'Глобальный золотой стандарт AML/CFT. Основа всех национальных законов.', detail: 'Рекомендации 1-10: AML/CFT policies. 10-21: меры прозрачности (UBO, PEP, записи). 22-40: полномочия и международное сотрудничество. Grey/Black lists публикуются 3 раза в год. Все банки мира ориентируются на FATF.', keyRules: ['Risk-based approach (RBA)', 'UBO identification 25%+', 'PEP enhanced measures', 'STR/SAR reporting', 'International cooperation'], sarName: 'STR (Suspicious Transaction Report)', fiu: 'National FIU per country', englishTerms: ['Recommendation', 'High-risk jurisdiction', 'Mutual evaluation', 'Grey list'] },
  { id: 'eu-amld6', region: 'Европа', country: 'Европейский союз', flag: 'EU', name: 'AMLD6 (6-я директива AML)', authority: 'European Commission / EBA', summary: 'EU-рамка AML: обязанности для банков, финтехов, crypto. Переносится в законы стран-членов.', detail: 'AMLD6 расширила: crypto-активы, art dealers, tax crimes как predicate offence, повышенные штрафы. EBA Guidelines — детальные инструкции для financial institutions. EU/UK licensed firms следуют EU/UK rules.', keyRules: ['CDD/EDD обязательны', 'UBO registry access', 'PEP screening', 'STR to FIU в 24-48h', 'Travel Rule для crypto'], sarName: 'STR', fiu: 'Национальные FIU (FIU-NL, SEPBLAC, etc.)', englishTerms: ['AMLD', 'EBA Guidelines', 'Passporting', 'GDPR + AML balance'] },
  { id: 'uk-mlr', region: 'Европа', country: 'Великобритания', flag: 'UK', name: 'Money Laundering Regulations 2017 + POCA 2002', authority: 'FCA / HMRC / NCA', summary: 'UK — один из строжайших AML-режимов. FCA-regulated firms.', detail: 'POCA (Proceeds of Crime Act) — основной закон. MLR 2017 — обязанности regulated firms. FCA Handbook SYSC 3/6/7 — governance. MLRO обязателен. JMLIT — обмен intelligence между банками.', keyRules: ['MLRO appointment', 'Tipping off offence', 'SAR to NCA (UKFIU)', 'PEP + sanctions screening', 'FCA enforcement'], sarName: 'SAR (Suspicious Activity Report)', fiu: 'NCA — UK Financial Intelligence Unit', englishTerms: ['Regulated firm', 'Senior Management Function', 'JMLIT', 'Consent (Defence against money laundering)'] },
  { id: 'lt-fiu', region: 'Европа', country: 'Литва', flag: 'LT', name: 'Закон о ML (LT) + LB (Bank of Lithuania)', authority: 'Bank of Lithuania / FNTT', summary: 'Литовская AML-рамка EU. Bank of Lithuania надзор. Remote compliance roles часто на LT entity.',
detail: 'Литва — EU member, полное соответствие AMLD. FNTT (Financial Crime Investigation Service) — FIU. LB надзор за банками. Штрафы до 10% годового оборота.', keyRules: ['EU AMLD transposition', 'STR to FNTT', 'LB supervisory review', 'PEP/UBO per EU standard', 'GDPR compliance'], sarName: 'STR', fiu: 'FNTT (Lithuania)', englishTerms: ['Bank of Lithuania', 'EMI/Banking license', 'Passporting rights'] },
  { id: 'us-bsa', region: 'Америка', country: 'США', flag: 'US', name: 'Bank Secrecy Act (BSA) + USA PATRIOT Act', authority: 'FinCEN / OCC / FDIC / Federal Reserve', summary: 'Самая жёсткая AML-система. OFAC sanctions глобально влияют на все банки.', detail: 'BSA (1970) + PATRIOT Act (2001) после 9/11. FinCEN — FIU. CTR (>$10K cash), SAR (suspicious). OFAC — отдельный sanctions regime. BSA Officer обязателен. Civil/criminal penalties — крупнейшие в мире.', keyRules: ['CTR $10,000 threshold', 'SAR within 30 days', 'OFAC SDN screening', 'BSA Officer', 'Customer Identification Program (CIP)'], sarName: 'SAR', fiu: 'FinCEN', englishTerms: ['BSA', 'PATRIOT Act', 'CTR', 'MSB', 'Beneficial Ownership Rule'] },
  { id: 'by-aml', region: 'СНГ', country: 'Беларусь', flag: 'BY', name: 'Закон «О мерах по предотвращению легализации доходов»', authority: 'Нацбанк РБ / КГК / ФРПЗ', summary: 'Национальная AML-рамка. Для работы в EU-финтехе — ориентир на EU/UK, не только BY.',
detail: 'BY закон гармонизирован с FATF, но enforcement отличается. ФРПЗ — приём STR. Для remote compliance в EU entity: применяются правила employer jurisdiction. Знание BY полезно для локальных клиентов.', keyRules: ['Идентификация клиентов', 'STR в ФРПЗ', 'Надзор Нацбанка', 'Санкционные списки BY + UN', 'FATF compliance'], sarName: 'Сообщение о подозрительной сделке', fiu: 'ФРПЗ (Финансовая разведка)', englishTerms: ['National Bank of Belarus', 'Financial monitoring', 'Predicate offence'] },
  { id: 'uae-cbuae', region: 'Ближний Восток', country: 'ОАЭ', flag: 'AE', name: 'Federal AML Law + CBUAE Guidelines', authority: 'Central Bank of UAE / UAE FIU', summary: 'ОАЭ — частый high-risk jurisdiction в TM alerts. Строгое усиление после FATF grey list 2022.', detail: 'UAE вышел из FATF grey list в 2024, но банки всё ещё применяют EDD для UAE операций. goAML system для STR. DNFBPs (юристы, риелторы) тоже под AML. Dubai real estate — классический ML vector.', keyRules: ['STR via goAML', 'EDD for high-risk', 'Targeted Financial Sanctions', 'DNFBP obligations', 'UBO identification'], sarName: 'STR', fiu: 'UAE FIU (goAML)', englishTerms: ['CBUAE', 'DNFBP', 'goAML', 'Targeted Financial Sanctions'] },
  { id: 'sg-mas', region: 'Азия', country: 'Сингапур', flag: 'SG', name: 'MAS Notice 626 + Corruption, Drug Trafficking Act', authority: 'Monetary Authority of Singapore', summary: 'Один из ведущих финансовых центров Азии. Строгий AML-режим.', detail: 'MAS Notice 626 — для banks. Notice 824 — для finance companies. STR в Suspicious Transaction Reporting Office (STRO). Сингапур — FATF member, высокие стандарты. Много Asian PEP и trade-based ML.', keyRules: ['MAS Notice 626 compliance', 'STR to STRO', 'CDD/EDD', 'Sanctions screening', 'Trade finance monitoring'], sarName: 'STR', fiu: 'STRO (Suspicious Transaction Reporting Office)', englishTerms: ['MAS', 'STRO', 'Notice 626', 'Dealer in Precious Metals'] },
  { id: 'ch-finma', region: 'Европа', country: 'Швейцария', flag: 'CH', name: 'AMLA (Anti-Money Laundering Act) + FINMA', authority: 'FINMA / MROS (FIU)', summary: 'Традиционный банковский центр. Строгий UBO и PEP контроль.', detail: 'Швейцария — FATF member. MROS — FIU. FINMA — регулятор. Form A (UBO declaration) обязательна. Banking secrecy не защищает от AML obligations. Art. 305bis Swiss Criminal Code — money laundering offence.', keyRules: ['Form A UBO declaration', 'STR to MROS', 'FINMA circulars', 'PEP screening', 'Cross-border reporting'], sarName: 'STR (meldung)', fiu: 'MROS', englishTerms: ['FINMA', 'MROS', 'Form A', 'Qualified tax offence'] },
  { id: 'un-sc', region: 'Мир', country: 'ООН', flag: 'UN', name: 'UN Security Council Sanctions', authority: 'UN Security Council / UNSC Committees', summary: 'Глобальные санкции: терроризм, WMD, страновые программы.', detail: 'Все UN members обязаны внедрять UN sanctions. Consolidated UN List. Пересечение с OFAC/EU lists. Terrorist financing lists обновляются регулярно. Банки скринят UN list alongside domestic lists.', keyRules: ['Asset freeze', 'Travel ban', 'Arms embargo', 'Mandatory implementation', 'Consolidated list screening'], sarName: 'N/A (sanctions compliance)', fiu: 'National FIU', englishTerms: ['UNSC', 'Consolidated List', 'Designated person', 'Asset freeze'] },
];

const ENGLISH_LESSONS: EnglishLesson[] = [
  {
    id: 'en-basics',
    topic: 'Базовые термины на каждый день',
    category: 'technical',
    level: 'basic',
    phrases: [
      { en: 'I am reviewing an alert.', ru: 'Я рассматриваю алерт.', context: 'Начало рабочего дня' },
      { en: 'This case requires Enhanced Due Diligence.', ru: 'Этот кейс требует углублённой проверки.', context: 'PEP/high-risk' },
      { en: 'I recommend escalating to the MLRO.', ru: 'Рекомендую эскалировать MLRO.', context: 'Серьёзный кейс' },
      { en: 'The screening returned a false positive.', ru: 'Скрининг дал ложное срабатывание.', context: 'Sanctions hit' },
      { en: 'We need to file a SAR.', ru: 'Нам нужно подать SAR.', context: 'Подозрительная активность' },
    ],
    vocabulary: [
      { term: 'Due diligence', meaning: 'Проверка клиента', example: 'Customer due diligence was completed.' },
      { term: 'Red flag', meaning: 'Признак риска', example: 'Multiple red flags were identified.' },
      { term: 'Watchlist', meaning: 'Список для скрининга', example: 'The name matched the sanctions watchlist.' },
      { term: 'Onboarding', meaning: 'Подключение клиента', example: 'KYC onboarding is pending review.' },
    ],
    exercise: 'Напиши на английском: «Клиент — PEP, требуется EDD. World-Check подтвердил статус. Запрошены SOW и UBO.»',
  },
  {
    id: 'en-investigation',
    topic: 'Расследование и RFI',
    category: 'technical',
    level: 'intermediate',
    phrases: [
      { en: 'Please provide supporting documentation for the transactions listed below.', ru: 'Предоставьте подтверждающие документы по указанным транзакциям.', context: 'RFI письмо' },
      { en: 'The activity is not consistent with the customer profile.', ru: 'Активность не соответствует профилю клиента.', context: 'Обоснование подозрения' },
      { en: 'I have documented my rationale in the case notes.', ru: 'Я задокументировал обоснование в заметках кейса.', context: 'Audit trail' },
      { en: 'The alert can be closed as a false positive.', ru: 'Алерт можно закрыть как ложное срабатывание.', context: 'Закрытие кейса' },
      { en: 'There is a reasonable suspicion that requires reporting.', ru: 'Есть обоснованное подозрение, требующее отчёта.', context: 'SAR decision' },
    ],
    vocabulary: [
      { term: 'Predicate offence', meaning: 'Предшествующее преступление', example: 'Fraud is a predicate offence for money laundering.' },
      { term: 'Disposition', meaning: 'Решение по кейсу', example: 'Case disposition: escalated for SAR filing.' },
      { term: 'Nexus', meaning: 'Связь/отношение', example: 'No nexus between the customer and the counterparty.' },
      { term: 'Mitigating factor', meaning: 'Смягчающий фактор', example: 'Long-standing relationship is a mitigating factor.' },
    ],
    exercise: 'Составь RFI на английском: клиент получил 12 переводов по 9,900 EUR. Запроси объяснение и документы.',
  },
  {
    id: 'en-sanctions',
    topic: 'Sanctions и screening',
    category: 'technical',
    level: 'intermediate',
    phrases: [
      { en: 'A potential match was identified during sanctions screening.', ru: 'При санкционном скрининге выявлено потенциальное совпадение.', context: 'Hit notification' },
      { en: 'Upon review, this has been determined to be a false positive.', ru: 'После проверки установлено ложное срабатывание.', context: 'Closing hit' },
      { en: 'The match score is 87% — further verification is required.', ru: 'Совпадение 87% — требуется дополнительная верификация.', context: 'Fuzzy match' },
      { en: 'Funds have been frozen pending investigation.', ru: 'Средства заморожены до завершения расследования.', context: 'True match action' },
    ],
    vocabulary: [
      { term: 'SDN List', meaning: 'Список OFAC', example: 'The entity appears on the OFAC SDN list.' },
      { term: 'Delisting', meaning: 'Исключение из списка', example: 'The party was removed from the sanctions list.' },
      { term: 'Sectoral sanctions', meaning: 'Отраслевые санкции', example: 'Sectoral sanctions apply to Russian energy firms.' },
      { term: 'Screening threshold', meaning: 'Порог срабатывания', example: 'Matches above 80% require manual review.' },
    ],
    exercise: 'Опиши на английском: sanctions hit, DOB совпадает, паспорт отличается. Какие шаги предпримешь?',
  },
  {
    id: 'en-interview',
    topic: 'Собеседование (финтех / банк)',
    category: 'interview',
    level: 'advanced',
    phrases: [
      { en: 'In my previous OSINT work, I conducted open-source investigations that directly translate to EDD and adverse media screening.', ru: 'В OSINT я проводила расследования, которые напрямую применимы в EDD и adverse media.', context: 'Self-introduction' },
      { en: 'I am CAMS-certified / currently pursuing CAMS certification.', ru: 'Я сертифицирована CAMS / готовлюсь к CAMS.', context: 'Certification' },
      { en: 'I understand the importance of audit trail and tipping-off restrictions.', ru: 'Понимаю важность audit trail и запрета tipping off.', context: 'Compliance culture' },
      { en: 'Could you describe the TM system and alert volumes your team handles?', ru: 'Расскажите о TM-системе и объёме алертов в команде?', context: 'Your questions' },
    ],
    vocabulary: [
      { term: 'Financial crime', meaning: 'Финансовые преступления', example: 'I specialise in financial crime prevention.' },
      { term: 'Regulatory framework', meaning: 'Нормативная база', example: 'Familiar with EU and UK regulatory frameworks.' },
      { term: 'Risk appetite', meaning: 'Допустимый риск', example: 'The decision aligns with the bank risk appetite.' },
      { term: 'Control framework', meaning: 'Система контролей', example: 'Three lines of defence control framework.' },
    ],
    exercise: 'Подготовь 60-секундный pitch: Financial Crime Investigator | AML/KYC Analyst | OSINT & Forensic.',
  },
  {
    id: 'en-economic',
    topic: 'Экономический English (финансы и EDD)',
    category: 'economic',
    level: 'intermediate',
    phrases: [
      { en: 'The declared annual turnover is inconsistent with the transaction volume.', ru: 'Заявленный годовой оборот не соответствует объёму транзакций.', context: 'EDD / SOF' },
      { en: 'Please provide audited financial statements for the last three years.', ru: 'Предоставьте аудированную отчётность за 3 года.', context: 'Corporate EDD' },
      { en: 'The profit margin appears unusually high for this industry sector.', ru: 'Маржа прибыли необычно высока для этой отрасли.', context: 'Trade-based ML' },
      { en: 'Cash flow from operating activities does not support the stated revenue.', ru: 'Операционный cash flow не подтверждает заявленную выручку.', context: 'Financial analysis' },
      { en: 'The company reported a significant increase in accounts receivable.', ru: 'Компания показала значительный рост дебиторки.', context: 'Balance sheet red flag' },
    ],
    vocabulary: [
      { term: 'Turnover / Revenue', meaning: 'Оборот / выручка', example: 'Annual turnover exceeded EUR 2 million.' },
      { term: 'Net profit', meaning: 'Чистая прибыль', example: 'Net profit margin was 45%, which is atypical.' },
      { term: 'Balance sheet', meaning: 'Баланс', example: 'The balance sheet shows insufficient assets.' },
      { term: 'Liquidity', meaning: 'Ликвидность', example: 'The entity lacks liquidity to support these transfers.' },
      { term: 'Accounts receivable', meaning: 'Дебиторская задолженность', example: 'Rising receivables may indicate fictitious sales.' },
      { term: 'P&L / Income statement', meaning: 'Отчёт о прибылях и убытках', example: 'The P&L does not reflect the wire transfer activity.' },
    ],
    exercise: 'Напиши на английском: «Годовой оборот компании 500K, но за 3 месяца прошло 2M. Прошу P&L, balance sheet и объяснение расхождения.»',
  },
  {
    id: 'en-banking',
    topic: 'Banking & Payments English',
    category: 'banking',
    level: 'intermediate',
    phrases: [
      { en: 'The wire transfer was rejected by the correspondent bank.', ru: 'Перевод отклонён банком-корреспондентом.', context: 'Cross-border' },
      { en: 'SEPA instant payment received from an unknown originator.', ru: 'SEPA instant от неизвестного отправителя.', context: 'TM alert' },
      { en: 'The customer initiated a chargeback on the card transaction.', ru: 'Клиент оформил chargeback по карте.', context: 'Fraud' },
      { en: 'Funds were returned via recall due to invalid beneficiary details.', ru: 'Средства возвращены из-за неверных реквизитов.', context: 'Operations' },
    ],
    vocabulary: [
      { term: 'Wire transfer / SWIFT', meaning: 'Международный перевод', example: 'A SWIFT MT103 was initiated to UAE.' },
      { term: 'Correspondent bank', meaning: 'Банк-корреспондент', example: 'The correspondent bank flagged the payment.' },
      { term: 'Beneficiary', meaning: 'Получатель платежа', example: 'The beneficiary account is in a high-risk jurisdiction.' },
      { term: 'Chargeback', meaning: 'Оспаривание платежа по карте', example: 'Multiple chargebacks indicate merchant fraud.' },
      { term: 'IBAN / BIC', meaning: 'Международные реквизиты', example: 'IBAN validation failed for the counterparty.' },
    ],
    exercise: 'Опиши на английском: клиент получил 5 SEPA переводов от разных отправителей, затем wire в ОАЭ. Какие red flags?',
  },
  {
    id: 'en-economic-advanced',
    topic: 'Экономический English — Advanced (Trade ML)',
    category: 'economic',
    level: 'advanced',
    phrases: [
      { en: 'The invoice value significantly exceeds the market price for comparable goods.', ru: 'Сумма инвойса значительно превышает рыночную цену.', context: 'Over-invoicing' },
      { en: 'There is a mismatch between customs declarations and bank payments.', ru: 'Расхождение между таможней и банковскими платежами.', context: 'Trade-based ML' },
      { en: 'The entity operates in a high-risk sector with opaque ownership.', ru: 'Компания в рискованном секторе с непрозрачной структурой.', context: 'EDD' },
      { en: 'Working capital appears insufficient for the reported trade volume.', ru: 'Оборотный капитал недостаточен для заявленного объёма торговли.', context: 'Financial crime' },
    ],
    vocabulary: [
      { term: 'Over-invoicing', meaning: 'Завышение цены в инвойсе', example: 'Over-invoicing is a common trade-based ML method.' },
      { term: 'Under-invoicing', meaning: 'Занижение цены', example: 'Under-invoicing shifts value across borders.' },
      { term: 'Working capital', meaning: 'Оборотный капитал', example: 'Working capital ratios are abnormally low.' },
      { term: 'Capital flight', meaning: 'Утечка капитала', example: 'Patterns suggest capital flight to offshore accounts.' },
    ],
    exercise: 'Write an EDD memo in English: import company, invoices 3x market price, payments to UAE shell company.',
  },
];

const ENGLISH_CATEGORY_LABELS: Record<EnglishLesson['category'], string> = {
  technical: 'Technical AML',
  economic: 'Economic / Financial',
  banking: 'Banking & Payments',
  interview: 'Interview & Career',
};

function speakEnglish(text: string, rate = 0.88) {
  if (typeof globalThis !== 'undefined' && 'speechSynthesis' in globalThis) {
    const synth = globalThis.speechSynthesis as SpeechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = rate;
    const voices = synth.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en-GB')) ?? voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;
    synth.speak(utterance);
  }
}

function AudioButton({ text, label }: { text: string; label?: string }) {
  return (
    <Button variant="ghost" onClick={() => speakEnglish(text)}>
      {label ?? '▶ Audio'}
    </Button>
  );
}

const REGIONS = ['Все', 'Мир', 'Европа', 'Америка', 'СНГ', 'Ближний Восток', 'Азия'];

const CASE_RUBRICS: Record<CaseCategory, RubricCriterion[]> = {
  kyc: [
    { id: 'cdd', label: 'CDD / уровень проверки', weight: 25, required: true, patterns: [['cdd', 'standard', 'стандарт', 'low risk', 'низк']] },
    { id: 'risk', label: 'Оценка риска клиента', weight: 20, patterns: [['risk', 'риск', 'профил', 'доход', 'цель']] },
    { id: 'flags', label: 'Red flags / их отсутствие', weight: 20, patterns: [['red flag', 'флаг', 'чист', 'clean', 'нет признак', 'подозр']] },
    { id: 'decision', label: 'Решение approve/EDD/reject', weight: 25, required: true, patterns: [['approve', 'edd', 'reject', 'одобр', 'отказ', 'отклон', 'усилен']] },
    { id: 'monitor', label: 'Ongoing monitoring', weight: 10, patterns: [['monitor', 'монитор', 'tm', 'отслеж', 'пересмотр']] },
  ],
  pep: [
    { id: 'edd', label: 'EDD обязательна', weight: 30, required: true, patterns: [['edd', 'enhanced', 'усилен', 'углублен']] },
    { id: 'pep', label: 'PEP-статус учтён', weight: 20, required: true, patterns: [['pep', 'politic', 'политик', 'ex-pep']] },
    { id: 'media', label: 'Adverse media оценка', weight: 20, patterns: [['adverse', 'media', 'медиа', 'medium', 'средн', 'контекст', 'закрыт']] },
    { id: 'docs', label: 'SOW/SOF, UBO, декларации', weight: 20, patterns: [['sow', 'sof', 'ubo', 'декларац', 'контракт', 'налог', 'cv']] },
    { id: 'approval', label: 'Senior / MLRO approval', weight: 10, patterns: [['senior', 'mlro', 'approval', 'одобрен', 'комитет']] },
  ],
  sanctions: [
    { id: 'verify', label: 'Сверка идентификаторов', weight: 25, required: true, patterns: [['dob', 'паспорт', 'passport', 'address', 'адрес', 'national', 'id']] },
    { id: 'not-auto', label: 'Не auto-close без проверки', weight: 20, required: true, patterns: [['не закры', 'не auto', 'эскалац', 'escalat', 'дополнительн', 'вериф']] },
    { id: 'osint', label: 'OSINT / реестры', weight: 15, patterns: [['osint', 'opencorpor', 'linkedin', 'реестр', 'google', 'media']] },
    { id: 'match', label: 'True vs false match логика', weight: 25, patterns: [['true match', 'false positive', 'совпад', 'отлича', '87%', 'процент']] },
    { id: 'action', label: 'Следующий шаг (freeze/SAR)', weight: 15, patterns: [['freeze', 'block', 'блок', 'sar', 'mlro', 'замороз']] },
  ],
  tm: [
    { id: 'flags', label: 'Минимум 2-3 red flags', weight: 25, required: true, patterns: [['structur', 'mule', 'rapid', 'third-party', 'inconsistent', 'dormant', 'velocity']] },
    { id: 'alert', label: 'Тип TM-алерта', weight: 15, patterns: [['alert', 'алерт', 'tm', 'rule', 'anomal', 'velocity', 'mule']] },
    { id: 'profile', label: 'Несоответствие профилю', weight: 15, patterns: [['профил', 'profile', 'доход', 'income', 'несоответ', 'inconsistent']] },
    { id: 'rfi', label: 'RFI / вопросы клиенту', weight: 15, patterns: [['rfi', 'запрос', 'объясн', 'документ', 'invoice', 'контракт']] },
    { id: 'next', label: 'Эскалация / SAR / закрытие', weight: 20, patterns: [['sar', 'эскалац', 'escalat', 'close', 'закры', 'monitor', 'block']] },
  ],
  fraud: [
    { id: 'typology', label: 'Тип fraud (ATO/scam/APP)', weight: 25, required: true, patterns: [['ato', 'scam', 'app', 'phish', 'social engineer', 'мошен', 'victim']] },
    { id: 'indicators', label: 'Fraud indicators', weight: 20, patterns: [['device', 'ip', 'новый получ', 'urgent', 'pressure', 'gift card', 'crypto']] },
    { id: 'verify', label: 'Верификация легитимности', weight: 20, patterns: [['callback', 'out-of-band', 'вериф', 'confirm', 'подтверж']] },
    { id: 'action', label: 'Block / hold / refund path', weight: 15, patterns: [['block', 'hold', 'freeze', 'блок', 'hold', 'stop']] },
    { id: 'report', label: 'SAR / fraud report / police', weight: 20, patterns: [['sar', 'fraud report', 'police', 'fiu', 'эскалац']] },
  ],
  crypto: [
    { id: 'vasp', label: 'VASP / Travel Rule', weight: 20, patterns: [['vasp', 'travel rule', 'counterparty', 'бирж', 'exchange']] },
    { id: 'analytics', label: 'Blockchain analytics', weight: 25, required: true, patterns: [['chainalysis', 'elliptic', 'trm', 'blockchain', 'on-chain', 'wallet', 'cluster']] },
    { id: 'risk', label: 'High-risk exposure (mixer/sanctions/darknet)', weight: 25, required: true, patterns: [['mixer', 'tumbler', 'sanction', 'darknet', 'illicit', 'scam', 'ransomware', 'high risk']] },
    { id: 'sof', label: 'SOF / origin of crypto', weight: 15, patterns: [['sof', 'source', 'mining', 'staking', 'p2p', 'источник', 'origin']] },
    { id: 'action', label: 'EDD / block / SAR / offboarding', weight: 15, patterns: [['edd', 'block', 'sar', 'offboard', 'reject', 'freeze', 'эскалац']] },
  ],
  trade: [
    { id: 'tbml', label: 'Trade-based ML typology', weight: 25, required: true, patterns: [['tbml', 'over-invoic', 'under-invoic', 'trade', 'завыш', 'заниж']] },
    { id: 'price', label: 'Price / market mismatch', weight: 20, patterns: [['price', 'рыноч', 'market', 'расхожд', 'mismatch', 'valuation']] },
    { id: 'route', label: 'Suspicious trade route / intermediary', weight: 15, patterns: [['uae', 'intermediary', 'посредник', 'offshore', 'треть']] },
    { id: 'docs', label: 'Trade docs (invoice, B/L, customs)', weight: 20, patterns: [['invoice', 'bill of lading', 'customs', 'contract', 'инвойс', 'тамож']] },
    { id: 'action', label: 'EDD / SAR recommendation', weight: 20, patterns: [['edd', 'sar', 'эскалац', 'escalat', 'подозр']] },
  ],
  osint: [
    { id: 'sources', label: 'OSINT источники', weight: 25, required: true, patterns: [['google', 'linkedin', 'opencorpor', 'registry', 'court', 'media', 'reuters', 'factiva']] },
    { id: 'verify', label: 'Верификация фактов', weight: 20, patterns: [['verify', 'вериф', 'cross-check', 'первоисточ', 'archive', 'whois']] },
    { id: 'risk', label: 'Risk rating adverse findings', weight: 20, patterns: [['high', 'medium', 'low', 'risk', 'риск', 'свеж', 'convict', 'accus']] },
    { id: 'edd', label: 'EDD implications', weight: 15, patterns: [['edd', 'enhanced', 'дополнительн', 'документ']] },
    { id: 'doc', label: 'Документирование в case notes', weight: 20, patterns: [['audit', 'case note', 'документ', 'скрин', 'ссылк', 'timestamp']] },
  ],
  sar: [
    { id: 'chain', label: 'Investigation chain', weight: 25, required: true, patterns: [['alert', 'rfi', 'контекст', 'анализ', 'audit', 'chain', 'цепочк']] },
    { id: 'suspicion', label: 'Обоснованное подозрение', weight: 25, required: true, patterns: [['reasonable suspicion', 'обоснован', 'подозр', 'cannot dispel', 'не снят']] },
    { id: 'tipping', label: 'No tipping off', weight: 10, patterns: [['tipping', 'не предупреж', 'не сообщ', 'нейтральн rfi']] },
    { id: 'mlro', label: 'MLRO escalation', weight: 20, patterns: [['mlro', 'эскалац', 'escalat', 'compliance officer']] },
    { id: 'sar', label: 'SAR filing decision', weight: 20, required: true, patterns: [['sar', 'str', 'fiu', 'report', 'подать', 'file']] },
  ],
  ubo: [
    { id: 'structure', label: 'Корпоративная структура', weight: 25, required: true, patterns: [['ubo', 'structure', 'структур', 'ownership', 'beneficial', '25%']] },
    { id: 'shell', label: 'Shell / nominee detection', weight: 20, patterns: [['shell', 'nominee', 'проклад', 'offshore', 'bvi', 'cayman', 'пустыш']] },
    { id: 'verify', label: 'Registry / OSINT verification', weight: 20, patterns: [['opencorpor', 'companies house', 'registry', 'реестр', 'lei', 'director']] },
    { id: 'edd', label: 'EDD on UBO', weight: 20, patterns: [['edd', 'enhanced', 'id ubo', 'паспорт ubo', 'декларац']] },
    { id: 'decision', label: 'Approve / reject / escalate', weight: 15, patterns: [['approve', 'reject', 'escalat', 'одобр', 'отказ', 'эскалац']] },
  ],
  hrj: [
    { id: 'jurisdiction', label: 'HRJ / FATF list', weight: 25, required: true, patterns: [['high-risk', 'hrj', 'fatf', 'grey list', 'black list', 'офшор', 'юрисдикц']] },
    { id: 'edd', label: 'EDD measures', weight: 25, patterns: [['edd', 'enhanced', 'дополнительн', 'senior approval']] },
    { id: 'purpose', label: 'Economic purpose of transaction', weight: 20, patterns: [['purpose', 'цель', 'обоснован', 'business rationale', 'контракт']] },
    { id: 'corridor', label: 'Corridor / counterparty risk', weight: 15, patterns: [['corridor', 'counterparty', 'контраг', 'correspondent', 'маршрут']] },
    { id: 'action', label: 'Monitor / block / SAR', weight: 15, patterns: [['monitor', 'block', 'sar', 'reject', 'блок', 'эскалац']] },
  ],
  cash: [
    { id: 'ctr', label: 'CTR / reporting thresholds', weight: 20, patterns: [['ctr', 'threshold', 'порог', '10000', '10 000', 'отчёт']] },
    { id: 'structuring', label: 'Cash structuring', weight: 25, required: true, patterns: [['structur', 'smurf', 'дроблен', 'multiple branch', 'отделен']] },
    { id: 'business', label: 'Cash-intensive business fit', weight: 20, patterns: [['cash business', 'msb', 'exchange', 'restaurant', 'retail', 'оборот нал']] },
    { id: 'sof', label: 'Source of cash', weight: 20, patterns: [['source of cash', 'sof', 'источник', 'налич', 'declar']] },
    { id: 'action', label: 'RFI / SAR / exit', weight: 15, patterns: [['rfi', 'sar', 'exit', 'offboard', 'эскалац']] },
  ],
  wire: [
    { id: 'wire', label: 'Wire transfer analysis', weight: 20, patterns: [['wire', 'swift', 'sepa', 'ach', 'перевод', 'payment']] },
    { id: 'beneficiary', label: 'Beneficiary / ordering party check', weight: 20, patterns: [['beneficiary', 'ordering', 'получат', 'отправит', 'counterparty']] },
    { id: 'flags', label: 'Red flags (round amounts, urgency)', weight: 25, required: true, patterns: [['round amount', 'urgent', 'third party', 'new beneficiary', 'кругл', 'сроч']] },
    { id: 'sanctions', label: 'Sanctions / name screening', weight: 15, patterns: [['sanction', 'screen', 'ofac', 'hit', 'sdn']] },
    { id: 'action', label: 'Hold / release / SAR', weight: 20, patterns: [['hold', 'release', 'sar', 'block', 'задерж', 'эскалац']] },
  ],
  defi: [
    { id: 'protocol', label: 'DeFi protocol risk', weight: 20, patterns: [['defi', 'dex', 'liquidity pool', 'smart contract', 'protocol', 'uniswap', 'aave']] },
    { id: 'wallet', label: 'Wallet clustering / exposure', weight: 25, required: true, patterns: [['wallet', 'cluster', 'address', 'exposure', 'chainalysis', 'on-chain']] },
    { id: 'mixer', label: 'Mixer / bridge / privacy coin', weight: 25, required: true, patterns: [['mixer', 'tornado', 'bridge', 'privacy', 'monero', 'zcash', 'obfuscat']] },
    { id: 'kyc', label: 'Unhosted wallet / KYC gap', weight: 15, patterns: [['unhosted', 'self-custody', 'non-custodial', 'travel rule', 'vasp']] },
    { id: 'action', label: 'Block / EDD / offboard', weight: 15, patterns: [['block', 'edd', 'offboard', 'sar', 'reject', 'эскалац']] },
  ],
};

const FEATURED_CASES: PracticeCase[] = [
  {
    id: 'case-001',
    moduleId: 'm1',
    category: 'kyc',
    difficulty: 'junior',
    caseNum: 1,
    title: 'Кейс: Первый рабочий день',
    scenario: 'Новый клиент — фрилансер-дизайнер, 28 лет, Литва. Доход 2 500 EUR/мес. Хочет счёт для получения оплаты от EU-клиентов. Документы в порядке. World-Check: clean. Adverse media: clean.',
    tasks: ['Какой уровень due diligence?', 'Какие red flags видишь?', 'Approve, EDD или Reject?'],
    minWords: 40,
    rubric: [
      { id: 'cdd', label: 'CDD (стандартная проверка)', weight: 25, required: true, patterns: [['cdd', 'стандарт', 'standard', 'обычн', 'low risk', 'low-risk', 'низк']] },
      { id: 'no-edd', label: 'EDD не нужна (нет PEP/офшора)', weight: 15, patterns: [['не edd', 'edd не', 'без edd', 'cdd достат', 'стандартн']] },
      { id: 'no-flags', label: 'Red flags отсутствуют', weight: 20, patterns: [['нет red flag', 'red flag нет', 'без red flag', 'не вижу', 'отсутств', 'чист', 'clean', 'нет признак', 'не обнаруж']] },
      { id: 'approve', label: 'Решение: Approve', weight: 30, required: true, patterns: [['approve', 'одобр', 'accept', 'откры', 'принять', 'можно обслуж']] },
      { id: 'monitor', label: 'Мониторинг после онбординга', weight: 10, patterns: [['монитор', 'tm', 'transaction monitor', 'отслеж', 'наблюд']] },
    ],
  },
  {
    id: 'case-002',
    moduleId: 'm2',
    category: 'pep',
    difficulty: 'mid',
    caseNum: 2,
    title: 'Кейс: PEP + Adverse Media',
    scenario: 'Клиент — бывший замминистра страны X (5 лет назад). World-Check: PEP. Google: статья о расследовании коррупции (дело закрыто, обвинений нет). Консалтинговая фирма, оборот 300K EUR/год.',
    tasks: ['CDD или EDD?', 'Как оценишь adverse media?', 'Какие документы запросишь?'],
    minWords: 60,
    rubric: [
      { id: 'edd', label: 'EDD обязательна (PEP)', weight: 30, required: true, patterns: [['edd', 'enhanced', 'усилен', 'углублен']] },
      { id: 'pep-reason', label: 'Причина: PEP-статус', weight: 15, required: true, patterns: [['pep', 'политик', 'politic', 'politically exposed']] },
      { id: 'media', label: 'Adverse media: medium risk, не auto-decline', weight: 20, patterns: [['medium', 'средн', 'не auto', 'не отказ', 'не decline', 'закрыт', 'нет обвин', 'дело закрыт', 'учитыва', 'вес']] },
      { id: 'docs', label: 'Документы: SOW/SOF, UBO, регистрация', weight: 25, patterns: [['sow', 'sof', 'source of', 'ubo', 'регистрац', 'контракт', 'налог', 'cv', 'pep declaration', 'выписк']] },
      { id: 'no-cdd-only', label: 'Не ограничиваться только CDD', weight: 10, mistakePatterns: [['только cdd', 'cdd достат', 'standard cdd', 'обычн cdd']] },
    ],
  },
  {
    id: 'case-003',
    moduleId: 'm3',
    category: 'sanctions',
    difficulty: 'mid',
    caseNum: 3,
    title: 'Кейс: Sanctions Hit',
    scenario: 'Онбординг «Global Trade LLC» (ОАЭ). Hit на директора «Mohammed Al-Rashid» — 87% match с OFAC SDN. DOB совпадает. Номер паспорта отличается на 2 цифры.',
    tasks: ['True или false match?', 'Какие данные сверишь?', 'Следующий шаг?'],
    minWords: 50,
    rubric: [
      { id: 'not-auto', label: 'Не закрывать автоматически', weight: 20, required: true, patterns: [['не закры', 'не false', 'не автомат', 'нельзя сразу', 'эскалац', 'escalat', 'дополнительн', 'вериф']] },
      { id: 'identifiers', label: 'Сверка идентификаторов', weight: 25, required: true, patterns: [['dob', 'паспорт', 'passport', 'адрес', 'address', 'national', 'граждан', 'фото', 'photo', 'id']] },
      { id: 'osint', label: 'OSINT / реестры', weight: 15, patterns: [['osint', 'opencorpor', 'linkedin', 'реестр', 'registry', 'новост', 'media', 'google']] },
      { id: 'passport-diff', label: 'Разный паспорт при совпадении DOB = риск', weight: 20, patterns: [['паспорт', 'passport', '2 цифр', 'отлича', 'не совпад', 'риск', 'подозр', 'true match возмож']] },
      { id: 'no-immediate-block', label: 'Не блокировать без полной сверки', weight: 10, mistakePatterns: [['сразу блок', 'немедленн блок', 'auto block', 'instant block']] },
      { id: 'no-dismiss', label: 'Не списывать как false positive без проверки', weight: 10, mistakePatterns: [['false positive без', 'сразу false', 'просто false positive', 'закрыть hit']] },
    ],
  },
  {
    id: 'case-004',
    moduleId: 'm4',
    category: 'tm',
    difficulty: 'mid',
    caseNum: 4,
    title: 'Кейс: Alert Transaction Monitoring',
    scenario: 'Анна, 22, студентка. Доход 500 EUR/мес. За 3 месяца: 180 000 EUR. 40 входящих от разных физлиц по 3 000–5 000 EUR. Быстрый вывод на криптобиржу.',
    tasks: ['Назови минимум 3 red flags', 'Какой alert сработал?', 'RFI-вопросы и решение по SAR'],
    minWords: 80,
    rubric: [
      { id: 'mule', label: 'Mule account', weight: 15, patterns: [['mule', 'проклад', 'muling', 'drop account']] },
      { id: 'third-party', label: 'Third-party payments', weight: 15, patterns: [['third-party', 'third party', 'третьих', '3-их лиц', 'от разных', 'множеств', '40 перевод', 'нескольк', 'много отправ']] },
      { id: 'rapid', label: 'Rapid in-out', weight: 15, patterns: [['rapid', 'быстр', 'in-out', 'in out', 'сразу', 'моментал', 'проход']] },
      { id: 'inconsistent', label: 'Inconsistent profile', weight: 15, patterns: [['inconsistent', 'несоответ', 'студент', '500', 'профил', 'доход']] },
      { id: 'crypto', label: 'High-risk destination (crypto)', weight: 10, patterns: [['crypto', 'крипт', 'бирж', 'exchange', 'bitcoin', 'usdt']] },
      { id: 'alert-type', label: 'Тип алерта TM', weight: 10, patterns: [['alert', 'алерт', 'tm', 'transaction monitor', 'unusual', 'mule', 'velocity', 'anomal']] },
      { id: 'rfi', label: 'RFI-вопросы', weight: 10, patterns: [['rfi', 'запрос', 'объясн', 'откуда', 'связь', 'контраг', 'цель', 'источник']] },
      { id: 'sar', label: 'SAR вероятен', weight: 10, patterns: [['sar', 'str', 'подозр', 'suspicious', 'report', 'fiu', 'эскалац']] },
    ],
  },
  {
    id: 'case-005',
    moduleId: 'm5',
    category: 'sar',
    difficulty: 'senior',
    caseNum: 5,
    title: 'Кейс: Финальное расследование',
    scenario: 'Alert #TM-8834. Клиент — владелец ресторана. За 2 недели: 12 входящих по 9 900 EUR от разных физлиц, затем один перевод 115 000 EUR в UAE (high-risk). Клиент говорит: «это оплата от гостей».',
    tasks: ['Опиши цепочку расследования', 'Почему structuring?', 'SAR или закрыть? Обоснуй.'],
    minWords: 100,
    rubric: [
      { id: 'chain', label: 'Цепочка: alert → контекст → анализ → RFI → решение', weight: 20, patterns: [['alert', 'алерт', 'контекст', 'rfi', 'анализ', 'решение', 'sar', 'документ', 'audit']] },
      { id: 'structuring', label: 'Structuring: 9 900 × 12', weight: 25, required: true, patterns: [['structur', 'дроблен', 'smurf', '9 900', '9900', 'порог', 'threshold', 'just below', 'чуть ниже']] },
      { id: 'hrj', label: 'High-risk jurisdiction UAE', weight: 15, patterns: [['uae', 'оаэ', 'high-risk', 'high risk', 'рисков', 'jurisdiction', 'юрисдик']] },
      { id: 'explanation-weak', label: 'Объяснение «гости» неубедительно', weight: 15, patterns: [['неубедит', 'не правдоподоб', 'не сход', 'сомнит', 'weak', 'insufficient', 'не объясн', 'физлиц']] },
      { id: 'sar-yes', label: 'SAR / эскалация', weight: 20, required: true, patterns: [['sar', 'str', 'эскалац', 'escalat', 'mlro', 'fiu', 'report', 'подозр']] },
      { id: 'no-close', label: 'Не закрывать без обоснования', weight: 5, mistakePatterns: [['закрыть alert', 'close alert', 'false positive', 'закрываю', 'не подозр']] },
    ],
  },
  {
    id: 'case-006',
    moduleId: 'm9',
    category: 'trade',
    difficulty: 'senior',
    caseNum: 6,
    title: 'Кейс: Trade-Based ML',
    scenario: 'Импортёр «EuroImport Sp. z o.o.» (Польша). Закупка электроники из Китая. Инвойс: 2.5M EUR. Рыночная цена аналогичной партии: ~800K EUR. Оплата через UAE intermediary «Gulf Trading LLC». Customs declaration: 900K EUR.',
    tasks: ['Какой тип ML?', 'Какие red flags?', 'Какие документы запросишь?', 'EDD или SAR?'],
    minWords: 80,
    rubric: [
      { id: 'tbml', label: 'Trade-based ML / over-invoicing', weight: 25, required: true, patterns: [['trade', 'over-invoic', 'tbml', 'завыш', 'invoice', 'торгов']] },
      { id: 'price', label: 'Цена выше рыночной', weight: 20, patterns: [['2.5', '800', 'рыноч', 'market', 'завыш', 'over']] },
      { id: 'uae', label: 'UAE intermediary — red flag', weight: 15, patterns: [['uae', 'оаэ', 'gulf', 'посредник', 'intermediary', 'offshore']] },
      { id: 'customs', label: 'Расхождение customs vs invoice', weight: 15, patterns: [['customs', 'тамож', '900', 'расхожд', 'mismatch', 'declaration']] },
      { id: 'docs', label: 'Документы: invoice, B/L, contract, customs', weight: 15, patterns: [['invoice', 'bill of lading', 'b/l', 'contract', 'customs', 'инвойс', 'контракт', 'тамож']] },
      { id: 'edd-sar', label: 'EDD + возможный SAR', weight: 10, patterns: [['edd', 'sar', 'эскалац', 'escalat', 'подозр', 'suspicious']] },
    ],
  },
];

type CasePoolEntry = {
  moduleId: string;
  difficulty: PracticeCase['difficulty'];
  minWords: number;
  scenarios: string[];
  taskSets: string[][];
};

const CASE_POOLS: Record<CaseCategory, CasePoolEntry> = {
  kyc: {
    moduleId: 'm1',
    difficulty: 'junior',
    minWords: 45,
    scenarios: [
      'Фрилансер UX-дизайнер, 31 год, Эстония. Доход 3 200 EUR/мес. EU-клиенты, договоры на Upwork. ID verified, World-Check clean.',
      'Студент Erasmus, 21 год, Испания. Стипендия 800 EUR + подработка 400 EUR. Нужен счёт для стипендии и аренды.',
      'Пенсионер, 67 лет, Португалия. Пенсия 1 100 EUR. Хочет счёт для оплаты коммунальных и переводов внуку.',
      'Sole trader — репетитор английского, UK resident. Оборот 4 500 GBP/мес, налоговая декларация SA submitted.',
      'Новый клиент: junior developer, remote, Латвия. Зарплата 2 800 EUR от EU SaaS-компании. LinkedIn подтверждён.',
      'Клиент отказался предоставить proof of address (utility bill). Паспорт OK, selfie OK. Причина: «живу у друга».',
      'Dual citizenship (BY + LT). Адрес в Литве, паспорт BY. Запрос на счёт для зарплаты LT-работодателя.',
    ],
    taskSets: [
      ['CDD или EDD?', 'Red flags?', 'Approve / EDD / Reject?'],
      ['Какие документы запросишь?', 'Risk score?', 'Решение и обоснование'],
      ['Что проверишь в onboarding?', 'Ongoing monitoring?', 'Финальное решение'],
    ],
  },
  pep: {
    moduleId: 'm2',
    difficulty: 'mid',
    minWords: 55,
    scenarios: [
      'Бывший депутат парламента (3 года назад). Консалтинг, 250K EUR/год. Adverse media: статья 2019 о расследовании (дело закрыто).',
      'Супруга действующего мэра крупного города EU. Открывает счёт для благотворительного фонда.',
      'Сын ex-minister of finance. Стартап fintech, seed round 2M EUR. PEP через family member.',
      'Domestic PEP: судья апелляционного суда. Зарплата 90K EUR, стандартные расходы.',
      'Close associate PEP: бизнес-партнёр governor of central bank. Import/export компания.',
      'Ex-PEP (18 мес после ухода). Luxury car dealership. Крупные cash deposits.',
      'PEP + HRJ: minister of energy, гражданин grey-list страны. Offshore consulting fees.',
    ],
    taskSets: [
      ['EDD scope?', 'Adverse media weight?', 'Документы и approval path'],
      ['PEP category?', 'SOF/SOW?', 'Senior sign-off needed?'],
      ['Ongoing monitoring frequency?', 'Risk rating?', 'Approve with conditions?'],
    ],
  },
  sanctions: {
    moduleId: 'm3',
    difficulty: 'mid',
    minWords: 50,
    scenarios: [
      'Hit 92% на «Viktor Petrov» — EU Consolidated List. Клиент «Viktor Petrov», DOB совпадает, паспорт RU отличается.',
      'Entity hit: «Al Noor Trading» — 78% match с OFAC SDN. Клиент UAE company с похожим названием.',
      'Wire beneficiary hit на UN list. Клиент — EU corporate, платёж на legitimate supplier.',
      'Fuzzy hit 85% на director при KYB. DOB отсутствует в hit record.',
      'Secondary sanctions risk: клиент не SDN, но 60% owned by SDN entity (50% rule).',
      'Sanctions hit на UBO (не на applicant). Applicant — EU startup, UBO — RU national с hit.',
      'Name-only hit 95%, все identifiers mismatch. Analyst хочет закрыть как false positive за 2 мин.',
    ],
    taskSets: [
      ['True or false match?', 'Какие identifiers сверишь?', 'Next steps'],
      ['50% rule applicable?', 'Freeze or escalate?', 'Documentation'],
      ['OSINT steps?', 'MLRO timeline?', 'SAR needed?'],
    ],
  },
  tm: {
    moduleId: 'm4',
    difficulty: 'mid',
    minWords: 70,
    scenarios: [
      'Студентка, 20 лет. 150K EUR за 2 мес: 35 incoming от физлиц по 3-5K, вывод на Binance.',
      'Dormant account 14 мес → 80K EUR за 3 дня. Профиль: учитель, 1 800 EUR/мес.',
      'Structuring: 18 deposits по 9 750 EUR за 10 дней. Клиент — owner car wash.',
      'Rapid in-out: 200K in → 195K out за 24h через 4 intermediary accounts.',
      'Round amounts: 10 × 50 000 EUR weekly to same BVI company. «Investment returns».',
      'Third-party: пенсионер получает 25 SWIFT от unknown senders, sends to crypto.',
      'Velocity alert: 500 transactions/day on business account. Declared turnover 50K/mo.',
    ],
    taskSets: [
      ['3+ red flags', 'Alert type', 'RFI + SAR decision'],
      ['Typology (mule/layering/etc.)', 'Profile mismatch', 'Investigation steps'],
      ['Hold or release?', 'Escalation path', 'Audit trail notes'],
    ],
  },
  fraud: {
    moduleId: 'm7',
    difficulty: 'mid',
    minWords: 60,
    scenarios: [
      'APP fraud: клиент перевёл 45K EUR «инвестиции» после WhatsApp «банковский advisor». Жалоба через 2 дня.',
      'ATO: смена phone/email, новое устройство, 3 transfers 15K each to new beneficiaries за 1 час.',
      'Romance scam victim: pensioner, 12 transfers to NG over 6 months. «Fiancé abroad».',
      'Invoice fraud: corporate client paid fake invoice 220K EUR — account details changed in email.',
      'Refund fraud: 40 chargebacks on merchant account за 48h. New business, 2 weeks old.',
      'Synthetic identity: «новый» клиент, credit file 8 months, sudden high-value outgoing wires.',
      'Internal fraud tip: employee created fake vendors, 30 payments to personal account.',
    ],
    taskSets: [
      ['Fraud typology', 'Immediate actions', 'SAR / law enforcement?'],
      ['Customer contact strategy', 'Recovery options', 'Documentation'],
      ['Red flags missed at onboarding?', 'Block vs monitor', 'Escalation'],
    ],
  },
  crypto: {
    moduleId: 'm8',
    difficulty: 'mid',
    minWords: 65,
    scenarios: [
      'Клиент выводит 80K EUR on Binance. Chainalysis: 15% exposure to mixer (Tornado Cash) за 3 hops.',
      'Incoming 50K USDT from unhosted wallet. Cluster linked to darknet marketplace (TRM Labs).',
      'P2P crypto trader: 200+ small trades/mo, counterparties high-risk jurisdictions.',
      'Mining income claim: 300K EUR/year BTC. No pool receipts, only self-reported.',
      'DeFi yield farmer: complex swaps ETH→USDC→DAI. Source flagged as stolen funds bridge.',
      'Travel Rule gap: transfer 10K USDC to VASP без beneficiary info. Counterparty = Seychelles exchange.',
      'Ransomware adjacent: client receives crypto, immediate fiat off-ramp. Victim report in media same day.',
    ],
    taskSets: [
      ['Blockchain analytics steps', 'Mixer/sanctions exposure', 'EDD / block / SAR'],
      ['Travel Rule compliance', 'SOF crypto', 'VASP due diligence'],
      ['Unhosted wallet policy', 'Risk score', 'Offboarding criteria'],
    ],
  },
  trade: {
    moduleId: 'm9',
    difficulty: 'senior',
    minWords: 75,
    scenarios: [
      'Over-invoicing: electronics import, invoice 3M vs market 900K. UAE intermediary.',
      'Under-invoicing: export gold, declared 400K vs market 2.1M. Destination HRJ.',
      'Phantom shipping: B/L for goods, satellite imagery shows empty port.',
      'Multiple invoicing: same shipment, 3 different invoice amounts to different banks.',
      'Misdescription: «industrial pumps» in customs, actually luxury watches.',
      'Round-tripping: A sells to B (offshore), B sells back to A at inflated price.',
      'Trade corridor: CN→AE→CY→EU. No economic rationale for routing.',
    ],
    taskSets: [
      ['TBML typology', 'Red flags', 'Documents to request', 'EDD/SAR'],
      ['Price analysis approach', 'Intermediary risk', 'Next steps'],
      ['Customs vs invoice gap', 'Correspondent bank risk', 'Escalation'],
    ],
  },
  osint: {
    moduleId: 'm6',
    difficulty: 'mid',
    minWords: 55,
    scenarios: [
      'EDD: CEO name returns 50 articles — fraud allegations 2021, acquitted 2023.',
      'LinkedIn shows VP at company X, но Companies House — director resigned 2 years ago.',
      'OpenCorporates: 12 shell companies same registered address, client is director of 8.',
      'Court records: civil lawsuit bankruptcy 2020, not disclosed in onboarding.',
      'Adverse media only in local language (Arabic). World-Check clean.',
      'Instagram luxury lifestyle vs declared income 2K EUR/mo.',
      'WHOIS/domain: client website registered 2 weeks ago, claims 10-year business.',
    ],
    taskSets: [
      ['OSINT sources to use', 'Verify before conclude', 'Risk rating'],
      ['EDD impact', 'Document findings', 'Recommend approve/decline'],
      ['False vs true adverse media', 'Cross-reference steps', 'Case note format'],
    ],
  },
  sar: {
    moduleId: 'm5',
    difficulty: 'senior',
    minWords: 90,
    scenarios: [
      'Structuring 9 900×12 + HRJ UAE + weak RFI «guest payments».',
      'Mule typology confirmed, client ghosted RFI. 180K processed.',
      'True sanctions match on UBO after EDD — applicant unaware.',
      'TBML indicators + fake trade docs on second review.',
      'Crypto mixer exposure 25%, client says «gift from friend» — no proof.',
      'Internal alert: same beneficiary across 50 unrelated clients.',
      'PEP wire to offshore with no contract — client lawyer sends aggressive email.',
    ],
    taskSets: [
      ['Investigation chain', 'Reasonable suspicion?', 'SAR yes/no — justify'],
      ['MLRO escalation', 'Tipping off avoidance', 'Audit trail'],
      ['RFI assessment', 'Alternative explanations ruled out?', 'FIU timeline'],
    ],
  },
  ubo: {
    moduleId: 'm6',
    difficulty: 'mid',
    minWords: 60,
    scenarios: [
      '5-layer structure: UK Ltd → BVI → Cyprus → Malta → UBO unknown.',
      'Nominee director everywhere, shareholder — another shell company.',
      'UBO claims 15% but controls via voting agreement (de facto control).',
      'Trust structure: discretionary trust, protector is PEP.',
      'Recent change: 100% sold to new UBO 1 week before large wire.',
      'LEI mismatch: registered entity differs from invoice entity.',
      'Partnership: 4 partners, one is sanctions hit (10% share).',
    ],
    taskSets: [
      ['Map ownership chain', 'Shell indicators', 'UBO identification'],
      ['EDD on UBO', 'Registry/OSINT', 'Approve / reject'],
      ['Nominee red flags', 'Documents needed', 'Escalation'],
    ],
  },
  hrj: {
    moduleId: 'm10',
    difficulty: 'mid',
    minWords: 55,
    scenarios: [
      'Wire 500K EUR to FATF grey-list country. Stated purpose: «consulting».',
      'Client resident EU but all funds from offshore (BVI) account.',
      'Correspondent bank in HRJ, client is EU SME — first transaction 2M.',
      'Cash-intensive business, owner frequent travel to black-list adjacent region.',
      'Real estate purchase HRJ, client SOF = crypto gains.',
      'Dual-use goods export to HRJ with vague end-user certificate.',
      'Family remittances 40K/mo to conflict zone — pattern escalation.',
    ],
    taskSets: [
      ['HRJ classification', 'EDD measures', 'Purpose of transaction'],
      ['Block / approve / monitor', 'Senior approval', 'SAR consideration'],
      ['FATF list reference', 'Corridor risk', 'Documentation'],
    ],
  },
  cash: {
    moduleId: 'm10',
    difficulty: 'mid',
    minWords: 55,
    scenarios: [
      'MSB: 200 cash deposits/day, just below CTR threshold, multiple branches.',
      'Restaurant owner: declared 30K/mo revenue, deposits 120K/mo cash.',
      'Currency exchange booth: buy/sell pattern inconsistent with tourism season.',
      'ATM structuring: 15 withdrawals 990 EUR same day different ATMs.',
      'Casino chips: client buys 50K chips, redeems 48K as «check».',
      'Cash courier: third party deposits cash for corporate client weekly.',
      'New account: 80K cash deposit day 1, SOF = «savings at home».',
    ],
    taskSets: [
      ['Structuring indicators', 'CTR/reporting', 'SOF cash'],
      ['Business fit', 'RFI questions', 'SAR path'],
      ['MSB licensing check', 'Exit strategy', 'Monitor plan'],
    ],
  },
  wire: {
    moduleId: 'm4',
    difficulty: 'mid',
    minWords: 55,
    scenarios: [
      'SWIFT to new beneficiary 990K EUR, reference «loan repayment», urgent.',
      'SEPA batch: 30 outgoing to same name different IBANs in 24h.',
      'Incoming wire from sanctioned-adjacent bank (not on list), high-risk corridor.',
      'Payment intercepted: beneficiary account changed last minute (BEC).',
      'Round 100K wire weekly to Hong Kong «supplier», no trade history.',
      'Client sends wire to own account different bank — name mismatch.',
      'Correspondent chain: 4 banks, final beneficiary shell company.',
    ],
    taskSets: [
      ['Wire red flags', 'Hold/release', 'Beneficiary verification'],
      ['Sanctions screening', 'RFI', 'SAR if needed'],
      ['BEC indicators', 'Callback verification', 'Document requirements'],
    ],
  },
  defi: {
    moduleId: 'm8',
    difficulty: 'senior',
    minWords: 70,
    scenarios: [
      'Client swaps via Uniswap, source wallet linked to exploit (2024 hack).',
      'Liquidity pool LP tokens, rewards from protocol under OFAC scrutiny.',
      'Cross-chain bridge: ETH→BSC→TRON, obfuscation pattern.',
      'Staking via Lido, but deposit source = sanctioned mixer output.',
      'NFT sales 500K USD, buyer wallets clustered as wash trading.',
      'DAO treasury contributor, wallet tied to fraud token project.',
      'Flash loan arbitrage 50 txs in block — bot or layering?',
    ],
    taskSets: [
      ['DeFi risk assessment', 'On-chain analytics', 'Mixer/bridge flags'],
      ['Unhosted vs custodial', 'Block/offboard', 'SAR threshold'],
      ['Protocol due diligence', 'Exposure %', 'Travel Rule gap'],
    ],
  },
};

const ALL_CASE_CATEGORIES: CaseCategory[] = ['kyc', 'pep', 'sanctions', 'tm', 'fraud', 'crypto', 'trade', 'osint', 'sar', 'ubo', 'hrj', 'cash', 'wire', 'defi'];

function buildGeneratedCases(): PracticeCase[] {
  const out: PracticeCase[] = [];
  let num = 7;
  for (const cat of ALL_CASE_CATEGORIES) {
    const pool = CASE_POOLS[cat];
    for (let v = 0; v < 21; v++) {
      const diff: PracticeCase['difficulty'] = v < 7 ? pool.difficulty : v < 14 ? (pool.difficulty === 'junior' ? 'mid' : 'senior') : 'senior';
      out.push({
        id: `case-${String(num).padStart(3, '0')}`,
        moduleId: pool.moduleId,
        category: cat,
        difficulty: diff,
        caseNum: num,
        title: `${CASE_CATEGORY_LABELS[cat]} — сценарий ${v + 1}`,
        scenario: pool.scenarios[v % pool.scenarios.length],
        tasks: pool.taskSets[v % pool.taskSets.length],
        rubric: CASE_RUBRICS[cat],
        minWords: pool.minWords + (v >= 14 ? 15 : 0),
      });
      num++;
    }
  }
  return out;
}

const ALL_PRACTICE_CASES: PracticeCase[] = [...FEATURED_CASES, ...buildGeneratedCases()];

const OSINT_BASE_SCENARIOS = [
  'EDD: CEO — множество статей о fraud allegations (2021), оправдан (2023). Нужна weighting.',
  'LinkedIn: VP в company X, но corporate registry — director resigned 2 года назад.',
  'OpenCorporates: 12 shell companies на одном адресе, клиент director в 8 из них.',
  'Court records: bankruptcy civil lawsuit 2020, не раскрыто в onboarding questionnaire.',
  'Adverse media только на local language (Arabic). Automated screening — clean.',
  'Instagram luxury lifestyle vs declared income 2 000 EUR/mo. Material inconsistency?',
  'WHOIS: website domain зарегистрирован 2 недели назад, клиент claims 10-year business.',
  'UBO chain: UK Ltd → BVI → Cyprus → Malta, natural person не виден в первом реестре.',
  'Nominee director во всех компаниях группы, shareholder — another shell entity.',
  'Sanctions-adjacent: counterparty не SDN, но 60% owned by listed entity (50% rule research).',
];

const OSINT_CONTEXTS = ['EU retail client', 'UK corporate KYB', 'UAE trade finance', 'Asia-Pacific VASP', 'US remote freelancer'];

function buildOsintPracticeCases(): PracticeCase[] {
  const tasks = [
    ['OSINT sources to use', 'Verify before conclude', 'Risk rating + recommendation'],
    ['EDD impact assessment', 'Document findings with URLs', 'Approve / decline / escalate'],
    ['Cross-reference steps', 'Fact vs inference', 'Case note format'],
  ];
  const out: PracticeCase[] = [];
  for (let v = 0; v < OSINT_CONTEXTS.length; v++) {
    for (let b = 0; b < OSINT_BASE_SCENARIOS.length; b++) {
      const i = v * OSINT_BASE_SCENARIOS.length + b;
      out.push({
        id: `osint-p-${String(i + 1).padStart(3, '0')}`,
        moduleId: `o${Math.min(6, Math.floor(i / 9) + 1)}`,
        category: 'osint',
        difficulty: i < 20 ? 'junior' : i < 40 ? 'mid' : 'senior',
        caseNum: 2000 + i,
        title: `OSINT — кейс ${i + 1}`,
        scenario: `${OSINT_BASE_SCENARIOS[b]} Контекст: ${OSINT_CONTEXTS[v]}.`,
        tasks: tasks[i % 3],
        rubric: CASE_RUBRICS.osint,
        minWords: 50 + (i >= 40 ? 15 : 0),
      });
    }
  }
  return out;
}

const OSINT_PRACTICE_CASES = buildOsintPracticeCases();

function getCaseById(id: string): PracticeCase | undefined {
  return ALL_PRACTICE_CASES.find((c) => c.id === id) ?? OSINT_PRACTICE_CASES.find((c) => c.id === id);
}
const PRACTICE_CASES = ALL_PRACTICE_CASES;

const FEATURED_CASE_I18N: Record<string, { title: string; scenario: string; tasks: string[] }> = {
  'case-001': {
    title: 'Case: First day on the job',
    scenario: 'New client — freelance designer, 28, Lithuania. Income EUR 2,500/mo. Wants account for EU client payments. Docs OK. World-Check: clean. Adverse media: clean.',
    tasks: ['CDD or EDD level?', 'Any red flags?', 'Approve, EDD or Reject?'],
  },
  'case-002': {
    title: 'Case: PEP + Adverse Media',
    scenario: 'Client — former deputy minister (5 years ago). World-Check: PEP. Google: corruption investigation article (case closed, no charges). Consulting firm, turnover EUR 300K/year.',
    tasks: ['CDD or EDD?', 'How do you weight adverse media?', 'Which documents will you request?'],
  },
  'case-003': {
    title: 'Case: Sanctions Hit',
    scenario: 'Onboarding «Global Trade LLC» (UAE). Hit on director «Mohammed Al-Rashid» — 87% match with OFAC SDN. DOB matches. Passport number differs by 2 digits.',
    tasks: ['True or false match?', 'Which data will you verify?', 'Next step?'],
  },
  'case-004': {
    title: 'Case: TM Alert',
    scenario: 'Anna, 22, student. Income EUR 500/mo. Over 3 months: EUR 180,000. 40 incoming from individuals EUR 3,000–5,000 each. Rapid withdrawal to crypto exchange.',
    tasks: ['Name 3+ red flags', 'Which alert fired?', 'RFI questions and SAR decision'],
  },
  'case-005': {
    title: 'Case: Full investigation',
    scenario: 'Alert #TM-8834. Restaurant owner. 2 weeks: 12 incoming EUR 9,900 from individuals, then one EUR 115,000 transfer to UAE (high-risk). Client says: «guest payments».',
    tasks: ['Describe investigation chain', 'Why structuring?', 'SAR or close? Justify.'],
  },
  'case-006': {
    title: 'Case: Trade-Based ML',
    scenario: 'Importer «EuroImport Sp. z o.o.» (Poland). Electronics from China. Invoice EUR 2.5M. Market price ~EUR 800K. Payment via UAE intermediary. Customs declaration EUR 900K.',
    tasks: ['ML typology?', 'Red flags?', 'Documents to request?', 'EDD or SAR?'],
  },
};

const TASKS_EN: Record<CaseCategory, string[][]> = {
  kyc: [['CDD or EDD?', 'Red flags?', 'Approve / EDD / Reject?'], ['Documents to request?', 'Risk score?', 'Decision with rationale'], ['Onboarding checks?', 'Ongoing monitoring?', 'Final decision']],
  pep: [['EDD scope?', 'Adverse media weight?', 'Documents & approval'], ['PEP category?', 'SOF/SOW?', 'Senior sign-off?'], ['Monitoring frequency?', 'Risk rating?', 'Conditional approve?']],
  sanctions: [['True or false match?', 'Identifiers to verify?', 'Next steps'], ['50% rule?', 'Freeze or escalate?', 'Documentation'], ['OSINT steps?', 'MLRO timeline?', 'SAR needed?']],
  tm: [['3+ red flags', 'Alert type', 'RFI + SAR decision'], ['Typology', 'Profile mismatch', 'Investigation steps'], ['Hold or release?', 'Escalation', 'Audit notes']],
  fraud: [['Fraud typology', 'Immediate actions', 'SAR / law enforcement?'], ['Customer contact', 'Recovery options', 'Documentation'], ['Onboarding gaps?', 'Block vs monitor', 'Escalation']],
  crypto: [['Blockchain analytics steps', 'Mixer/sanctions exposure', 'EDD / block / SAR'], ['Travel Rule', 'SOF crypto', 'VASP DD'], ['Unhosted wallet', 'Risk score', 'Offboarding']],
  trade: [['TBML typology', 'Red flags', 'Documents', 'EDD/SAR'], ['Price analysis', 'Intermediary risk', 'Next steps'], ['Customs vs invoice', 'Correspondent risk', 'Escalation']],
  osint: [['OSINT sources', 'Verify facts', 'Risk rating'], ['EDD impact', 'Document findings', 'Approve/decline'], ['True vs false media', 'Cross-reference', 'Case note format']],
  sar: [['Investigation chain', 'Reasonable suspicion?', 'SAR yes/no'], ['MLRO escalation', 'No tipping off', 'Audit trail'], ['RFI assessment', 'Alternatives ruled out?', 'FIU timeline']],
  ubo: [['Map ownership', 'Shell indicators', 'UBO ID'], ['EDD on UBO', 'Registry/OSINT', 'Approve/reject'], ['Nominee flags', 'Documents', 'Escalation']],
  hrj: [['HRJ classification', 'EDD measures', 'Transaction purpose'], ['Block/approve/monitor', 'Senior approval', 'SAR?'], ['FATF reference', 'Corridor risk', 'Documentation']],
  cash: [['Structuring indicators', 'CTR/reporting', 'SOF cash'], ['Business fit', 'RFI questions', 'SAR path'], ['MSB license', 'Exit strategy', 'Monitor plan']],
  wire: [['Wire red flags', 'Hold/release', 'Beneficiary verify'], ['Sanctions screening', 'RFI', 'SAR if needed'], ['BEC indicators', 'Callback verify', 'Documents']],
  defi: [['DeFi risk assessment', 'On-chain analytics', 'Mixer/bridge flags'], ['Unhosted vs custodial', 'Block/offboard', 'SAR threshold'], ['Protocol DD', 'Exposure %', 'Travel Rule gap']],
};

function getPoolVariantIndex(pc: PracticeCase): number {
  if (pc.caseNum <= 6) return 0;
  return (pc.caseNum - 7) % 21;
}

function getLocalizedCase(pc: PracticeCase, lang: Lang): { title: string; scenario: string; tasks: string[] } {
  if (lang === 'ru') return { title: pc.title, scenario: pc.scenario, tasks: pc.tasks };
  const featured = FEATURED_CASE_I18N[pc.id];
  if (featured) return featured;
  const vi = getPoolVariantIndex(pc);
  const pool = CASE_POOLS[pc.category];
  const sIdx = vi % pool.scenarios.length;
  const tIdx = vi % pool.taskSets.length;
  const scenario = pool.scenarios[sIdx];
  return {
    title: `${CASE_CAT_I18N[lang][pc.category]} — ${t(lang, 'scenario')} ${sIdx + 1}`,
    scenario,
    tasks: TASKS_EN[pc.category][tIdx] ?? pool.taskSets[tIdx],
  };
}

function getAlertMeta(pc: PracticeCase) {
  const prefix =
    pc.category === 'tm' || pc.category === 'wire' ? 'TM' :
    pc.category === 'sanctions' ? 'SCR' :
    pc.category === 'crypto' || pc.category === 'defi' ? 'KYT' :
    pc.category === 'fraud' ? 'FRD' :
    pc.category === 'kyc' || pc.category === 'pep' ? 'KYC' : 'AML';
  const rules: Record<CaseCategory, string> = {
    kyc: 'ONB-001 · New customer risk', pep: 'PEP-002 · Enhanced screening', sanctions: 'SAN-003 · Watchlist hit',
    tm: 'TM-041 · Unusual velocity', fraud: 'FRD-012 · ATO pattern', crypto: 'KYT-007 · Mixer exposure',
    trade: 'TBF-005 · Price mismatch', osint: 'EDD-008 · Adverse media', sar: 'INV-099 · Multi-flag escalation',
    ubo: 'KYB-004 · Complex structure', hrj: 'GEO-006 · High-risk corridor', cash: 'CSH-010 · CTR threshold',
    wire: 'WIR-015 · New beneficiary', defi: 'DEF-003 · Exploit wallet link',
  };
  return {
    alertId: `${prefix}-${String(pc.caseNum).padStart(5, '0')}`,
    customerId: `CUS-${String(10000 + pc.caseNum)}`,
    riskScore: pc.difficulty === 'senior' ? 87 : pc.difficulty === 'mid' ? 62 : 34,
    priority: pc.difficulty === 'senior' ? 'P1' : pc.difficulty === 'mid' ? 'P2' : 'P3',
    sla: pc.difficulty === 'senior' ? '04:12:00' : '18:45:00',
    rule: rules[pc.category],
    status: pc.difficulty === 'senior' ? 'Under Review' : 'Open',
  };
}

const SOFTWARE_CATEGORY_LABELS: Record<SoftwareProvider['category'], string> = {
  tm: 'Transaction Monitoring',
  screening: 'Sanctions & PEP Screening',
  kyc: 'KYC / Identity Verification',
  crypto: 'Blockchain Analytics & Crypto AML',
  case: 'Case Management & Investigations',
  osint: 'OSINT & Adverse Media',
  regtech: 'RegTech / AI AML',
  network: 'Network Analytics & Graph',
};

const SOFTWARE_PROVIDERS: SoftwareProvider[] = [
  { id: 'actimize', name: 'NICE Actimize', category: 'tm', vendor: 'NICE', summary: 'Лидер TM и case management в tier-1 банках.', detail: 'Actimize SAM — rules + ML для transaction monitoring. Alert management, SAR workflow, model tuning. Аналитик TM проводит 80% рабочего дня в Actimize: review alerts, document decisions, escalate. Интеграция с sanctions и KYC модулями.', usedFor: ['Transaction monitoring alerts', 'Case workflow', 'SAR preparation', 'Model governance'], typicalUsers: 'TM Analyst, Financial Crime Investigator, MLRO' },
  { id: 'mantas', name: 'Oracle Mantas', category: 'tm', vendor: 'Oracle', summary: 'Enterprise AML platform для крупных банков.', detail: 'Полный AML suite: TM, sanctions, KYC, reporting. Сильна в банках с legacy Oracle stack. Аналитик работает с alert queues, scenario tuning, regulatory reports.', usedFor: ['TM scenarios', 'Regulatory reporting', 'Sanctions integration'], typicalUsers: 'TM Analyst, Compliance Officer' },
  { id: 'sas-aml', name: 'SAS Anti-Money Laundering', category: 'tm', vendor: 'SAS', summary: 'Analytics-driven AML с сильной статистикой.', detail: 'Scenario designer, anomaly detection, network analysis. Популярна в банках Americas/EU. Аналитик использует для complex pattern detection и audit reports.', usedFor: ['Scenario development', 'Anomaly detection', 'Management reporting'], typicalUsers: 'Senior TM Analyst, Model Validation' },
  { id: 'feedzai', name: 'Feedzai', category: 'tm', vendor: 'Feedzai', summary: 'Real-time fraud + AML для финтехов и neobanks.', detail: 'ML-first платформа: payment fraud + AML в одном engine. Крупные neobanks часто используют Feedzai или аналоги. Sub-second decisioning on every transaction.', usedFor: ['Real-time payment screening', 'Fraud + AML combined', 'Customer profiling'], typicalUsers: 'Fraud Analyst, TM Analyst (fintech)' },
  { id: 'featurespace', name: 'Featurespace ARIC', category: 'tm', vendor: 'Featurespace', summary: 'Adaptive behavioural analytics для fraud/AML.', detail: 'Self-learning models на поведении клиента. Меньше false positives vs static rules. Аналитик review adaptive alerts и feedback loop для модели.', usedFor: ['Behavioural TM', 'Fraud detection', 'Adaptive models'], typicalUsers: 'Fraud/TM Analyst' },
  { id: 'worldcheck', name: 'LSEG World-Check (Refinitiv)', category: 'screening', vendor: 'LSEG', summary: 'Industry standard PEP/sanctions/adverse media.', detail: 'World-Check One — screening при onboarding и ongoing. PEP, sanctions, adverse media, law enforcement. Аналитик KYC/EDD ежедневно: hits, true/false match, documentation. Интеграция с case systems.', usedFor: ['PEP screening', 'Sanctions hits', 'Adverse media', 'Ongoing screening'], typicalUsers: 'KYC Analyst, EDD Analyst, Sanctions Analyst' },
  { id: 'dow-jones', name: 'Dow Jones Risk & Compliance', category: 'screening', vendor: 'Dow Jones', summary: 'Watchlist + adverse media для global banks.', detail: 'Factiva integration, PEP/sanctions lists, risk profiles. Сильна в adverse media research. EDD analyst использует для deep-dive media checks.', usedFor: ['Screening', 'Adverse media research', 'Enhanced due diligence'], typicalUsers: 'EDD/OSINT Analyst, Sanctions Analyst' },
  { id: 'lexis-bridger', name: 'LexisNexis Bridger', category: 'screening', vendor: 'LexisNexis', summary: 'Screening + identity для US-heavy institutions.', detail: 'XG platform: sanctions, PEP, adverse media, payment screening. Популярна в US banks и MSBs. Batch и real-time screening.', usedFor: ['Sanctions/PEP screening', 'Payment screening', 'Batch rescreening'], typicalUsers: 'Sanctions Analyst, KYC Analyst' },
  { id: 'complyadvantage', name: 'ComplyAdvantage', category: 'screening', vendor: 'ComplyAdvantage', summary: 'API-first screening для финтехов.', detail: 'ML-enhanced lists, mesh network data, TM module. Стартапы и neobanks выбирают за скорость интеграции. Analyst UI для hit resolution.', usedFor: ['API screening', 'TM (CA Mesh)', 'Adverse media'], typicalUsers: 'KYC Analyst, TM Analyst (fintech)' },
  { id: 'accuity', name: 'Accuity (Fiserv)', category: 'screening', vendor: 'Fiserv', summary: 'Payment sanctions screening (SWIFT/SEPA).', detail: 'Focal Point и payment filtering. Проверка каждого wire message на sanctions. Payment ops + sanctions analyst совместно.', usedFor: ['Wire screening', 'Sanctions filtering', 'Payment compliance'], typicalUsers: 'Sanctions Analyst, Payment Ops' },
  { id: 'onfido', name: 'Onfido', category: 'kyc', vendor: 'Entrust', summary: 'Document + biometric verification.', detail: 'ID document capture, liveness, facial match. Аналитик KYC review failed verifications, document tampering alerts, manual override decisions.', usedFor: ['ID verification', 'Liveness check', 'Document authentication'], typicalUsers: 'KYC Analyst, Onboarding Analyst' },
  { id: 'jumio', name: 'Jumio', category: 'kyc', vendor: 'Jumio', summary: 'AI identity verification для digital onboarding.', detail: 'Netverify: 5000+ document types, AML watchlist check bundled. Fintech onboarding pipeline. Analyst handles exceptions queue.', usedFor: ['Digital onboarding', 'IDV exceptions', 'Watchlist pre-screen'], typicalUsers: 'KYC Analyst' },
  { id: 'trulioo', name: 'Trulioo', category: 'kyc', vendor: 'Trulioo', summary: 'Global identity verification (195 countries).', detail: 'Electronic identity verification against government/registries. KYB module for businesses. KYC analyst uses for non-standard jurisdictions.', usedFor: ['eIDV', 'Global coverage', 'KYB verification'], typicalUsers: 'KYC Analyst, EDD Analyst' },
  { id: 'sumsub', name: 'Sumsub', category: 'kyc', vendor: 'Sumsub', summary: 'All-in-one KYC/KYB для crypto и fintech.', detail: 'IDV, liveness, AML screening, transaction monitoring lite. Популярен у VASP и crypto exchanges. Full onboarding funnel.', usedFor: ['KYC/KYB', 'AML screening', 'Crypto onboarding'], typicalUsers: 'KYC Analyst, Crypto Compliance' },
  { id: 'persona', name: 'Persona', category: 'kyc', vendor: 'Persona', summary: 'Configurable identity flows для US fintech.', detail: 'No-code KYC workflows, database checks, document verification. Analyst configures and reviews case-by-case exceptions.', usedFor: ['Custom KYC flows', 'Database verification', 'Case review'], typicalUsers: 'KYC Analyst, Product Compliance' },
  { id: 'chainalysis', name: 'Chainalysis', category: 'crypto', vendor: 'Chainalysis', summary: 'Gold standard blockchain analytics.', detail: 'Reactor, KYT (Know Your Transaction), Kryptos. Cluster wallets, trace funds, sanctions exposure, mixer detection. Crypto compliance analyst основной инструмент расследований.', usedFor: ['Wallet clustering', 'Sanctions exposure', 'Mixer/tumbler detection', 'SAR blockchain evidence'], typicalUsers: 'Crypto Compliance Analyst, Financial Crime Investigator' },
  { id: 'elliptic', name: 'Elliptic', category: 'crypto', vendor: 'Elliptic', summary: 'Crypto AML для exchanges и banks.', detail: 'Navigator, Lens, Discovery. Wallet screening, VASP due diligence, cross-chain tracing. Интеграция в onboarding и withdrawals.', usedFor: ['Wallet screening', 'VASP DD', 'Cross-chain tracing'], typicalUsers: 'Crypto Compliance Analyst' },
  { id: 'trm', name: 'TRM Labs', category: 'crypto', vendor: 'TRM Labs', summary: 'Blockchain intelligence для law enforcement и VASP.', detail: 'Forensics-grade tracing, entity attribution, case management. Сильна в DeFi and cross-chain. Investigator builds visual transaction graphs.', usedFor: ['Forensic tracing', 'DeFi exposure', 'Case graphs'], typicalUsers: 'Crypto Investigator, Law Enforcement liaison' },
  { id: 'ciphertrace', name: 'CipherTrace (Mastercard)', category: 'crypto', vendor: 'Mastercard', summary: 'Bank-grade crypto compliance suite.', detail: 'Armada for banks entering crypto. Travel Rule, wallet risk scoring. Bank analyst screens crypto-correlated fiat flows.', usedFor: ['Bank crypto compliance', 'Travel Rule', 'Wallet risk score'], typicalUsers: 'Crypto Compliance, TM Analyst' },
  { id: 'merkle', name: 'Merkle Science', category: 'crypto', vendor: 'Merkle Science', summary: 'Predictive crypto risk for APAC-focused VASP.', detail: 'Tracker, Compass for transaction monitoring on-chain. ML risk scoring. Growing in Asia-Pacific exchanges.', usedFor: ['On-chain TM', 'Risk scoring', 'Compliance automation'], typicalUsers: 'Crypto Compliance Analyst' },
  { id: 'hummingbird', name: 'Hummingbird', category: 'case', vendor: 'Hummingbird', summary: 'Investigation case management для fincrime teams.', detail: 'Collaborative investigations, SAR drafting, regulator-ready exports. Investigator documents full chain, attaches evidence, tracks RFI.', usedFor: ['Investigation workflow', 'SAR drafting', 'Team collaboration'], typicalUsers: 'Financial Crime Investigator, SAR Writer' },
  { id: 'quantexa', name: 'Quantexa', category: 'network', vendor: 'Quantexa', summary: 'Contextual decision intelligence / graph analytics.', detail: 'Entity resolution, network graphs, hidden connections. Finds mule networks, UBO links, fraud rings. Senior investigator explores graph views.', usedFor: ['Network analysis', 'Entity resolution', 'Hidden links'], typicalUsers: 'Senior Investigator, TM Lead' },
  { id: 'factiva', name: 'Factiva (Dow Jones)', category: 'osint', vendor: 'Dow Jones', summary: 'Premium global news database for adverse media.', detail: 'Millions of sources, advanced search, archiving. EDD/OSINT analyst primary tool for adverse media beyond Google.', usedFor: ['Adverse media search', 'Archive research', 'EDD reports'], typicalUsers: 'EDD Analyst, OSINT Researcher' },
  { id: 'sayari', name: 'Sayari', category: 'osint', vendor: 'Sayari', summary: 'Corporate ownership intelligence.', detail: 'Global corporate graph, UBO mapping, sanctions-adjacent entities. OSINT analyst maps shell structures faster than manual registry search.', usedFor: ['UBO mapping', 'Corporate networks', 'Sanctions evasion detection'], typicalUsers: 'EDD/OSINT Analyst, Sanctions Investigator' },
  { id: 'orbis', name: 'Orbis (Moody\'s)', category: 'osint', vendor: 'Moody\'s Analytics', summary: 'Global company database for KYB/EDD.', detail: '400M+ companies, ownership trees, financials. KYB analyst verifies corporate clients and supply chains.', usedFor: ['KYB', 'Ownership trees', 'Counterparty DD'], typicalUsers: 'KYB Analyst, EDD Analyst' },
  { id: 'napier', name: 'Napier AI', category: 'regtech', vendor: 'Napier', summary: 'AI-enhanced AML platform (screening + TM).', detail: 'Intelligent screening reduces false positives. Continued monitoring, client risk assessment. Analyst benefits from AI-prioritized queues.', usedFor: ['Intelligent screening', 'Client risk assessment', 'Continued monitoring'], typicalUsers: 'KYC/TM Analyst' },
  { id: 'silent-eight', name: 'Silent Eight', category: 'regtech', vendor: 'Silent Eight', summary: 'AI for sanctions false positive resolution.', detail: 'Iris platform automates hit resolution with explainable AI. Sanctions analyst reviews AI recommendations, handles edge cases.', usedFor: ['Sanctions hit resolution', 'False positive reduction'], typicalUsers: 'Sanctions Analyst' },
  { id: 'lucinity', name: 'Lucinity', category: 'regtech', vendor: 'Lucinity', summary: 'Human-AI AML investigation platform.', detail: 'Lucy AI co-pilot for investigators. Case summarization, SAR narrative drafting. Investigator uses AI assist but owns decision.', usedFor: ['Investigation co-pilot', 'SAR narrative', 'Case summarization'], typicalUsers: 'Financial Crime Investigator' },
  { id: 'sensa', name: 'SymphonyAI Sensa', category: 'network', vendor: 'SymphonyAI', summary: 'Network detection for AML and fraud.', detail: 'Graph analytics for mule networks, collusion, trade ML patterns. TM team uses for complex multi-customer investigations.', usedFor: ['Network typologies', 'Collusion detection', 'Complex TM cases'], typicalUsers: 'Senior TM Analyst, Investigator' },
  { id: 'goaml', name: 'goAML (UNODC)', category: 'case', vendor: 'UNODC', summary: 'FIU reporting portal used by 100+ countries.', detail: 'Not vendor software for banks — but analyst must know SAR/STR filed via goAML interface in many jurisdictions. MLRO submits through bank connector.', usedFor: ['STR/SAR filing to FIU', 'Regulatory reporting'], typicalUsers: 'MLRO, SAR Team' },
  { id: 'notabene', name: 'Notabene', category: 'crypto', vendor: 'Notabene', summary: 'Travel Rule compliance network for VASP.', detail: 'IVMS101 data exchange between VASPs. Crypto compliance ensures outbound transfers include beneficiary originator info.', usedFor: ['Travel Rule', 'VASP-to-VASP messaging', 'Compliance automation'], typicalUsers: 'Crypto Compliance Analyst' },
  { id: 'holistic', name: 'Holistic AI / AML RightSource', category: 'regtech', vendor: 'Various', summary: 'Managed AML services + tech hybrids.', detail: 'Banks outsource L1 alert review or KYC to vendors. Analyst may work inside client bank OR vendor BPO — same tools (Actimize, World-Check).', usedFor: ['Managed KYC/TM', 'Surge capacity', 'Audit support'], typicalUsers: 'Outsourced Analyst, QA Reviewer' },
];

const SOFTWARE_META: Record<string, { websiteUrl: string; dashboardVariant: DashboardVariant }> = {
  actimize: { websiteUrl: 'https://www.nice.com/products/actimize', dashboardVariant: 'tm' },
  mantas: { websiteUrl: 'https://www.oracle.com/financial-services/anti-money-laundering/', dashboardVariant: 'tm' },
  'sas-aml': { websiteUrl: 'https://www.sas.com/en_us/solutions/fraud-security-intelligence/anti-money-laundering.html', dashboardVariant: 'tm' },
  feedzai: { websiteUrl: 'https://feedzai.com/', dashboardVariant: 'tm' },
  featurespace: { websiteUrl: 'https://www.featurespace.com/', dashboardVariant: 'tm' },
  worldcheck: { websiteUrl: 'https://www.lseg.com/en/data-analytics/financial-crime-risk/world-check-kyc-screening', dashboardVariant: 'screening' },
  'dow-jones': { websiteUrl: 'https://www.dowjones.com/professional/risk/', dashboardVariant: 'screening' },
  'lexis-bridger': { websiteUrl: 'https://risk.lexisnexis.com/products/bridger-insight-xg', dashboardVariant: 'screening' },
  complyadvantage: { websiteUrl: 'https://complyadvantage.com/', dashboardVariant: 'screening' },
  accuity: { websiteUrl: 'https://www.accuity.com/', dashboardVariant: 'screening' },
  onfido: { websiteUrl: 'https://onfido.com/', dashboardVariant: 'kyc' },
  jumio: { websiteUrl: 'https://www.jumio.com/', dashboardVariant: 'kyc' },
  trulioo: { websiteUrl: 'https://www.trulioo.com/', dashboardVariant: 'kyc' },
  sumsub: { websiteUrl: 'https://sumsub.com/', dashboardVariant: 'kyc' },
  persona: { websiteUrl: 'https://withpersona.com/', dashboardVariant: 'kyc' },
  chainalysis: { websiteUrl: 'https://www.chainalysis.com/', dashboardVariant: 'crypto' },
  elliptic: { websiteUrl: 'https://www.elliptic.co/', dashboardVariant: 'crypto' },
  trm: { websiteUrl: 'https://www.trmlabs.com/', dashboardVariant: 'crypto' },
  ciphertrace: { websiteUrl: 'https://ciphertrace.com/', dashboardVariant: 'crypto' },
  merkle: { websiteUrl: 'https://www.merklescience.com/', dashboardVariant: 'crypto' },
  hummingbird: { websiteUrl: 'https://www.hummingbird.co/', dashboardVariant: 'case' },
  quantexa: { websiteUrl: 'https://www.quantexa.com/', dashboardVariant: 'network' },
  factiva: { websiteUrl: 'https://www.dowjones.com/professional/factiva/', dashboardVariant: 'osint' },
  sayari: { websiteUrl: 'https://sayari.com/', dashboardVariant: 'osint' },
  orbis: { websiteUrl: 'https://www.moodys.com/web/en/us/kyc/products/orbis.html', dashboardVariant: 'osint' },
  napier: { websiteUrl: 'https://www.napier.ai/', dashboardVariant: 'regtech' },
  'silent-eight': { websiteUrl: 'https://www.silent8.com/', dashboardVariant: 'regtech' },
  lucinity: { websiteUrl: 'https://lucinity.com/', dashboardVariant: 'regtech' },
  sensa: { websiteUrl: 'https://www.symphonyai.com/financial-services/sensa/', dashboardVariant: 'network' },
  goaml: { websiteUrl: 'https://goaml.unodc.org/', dashboardVariant: 'case' },
  notabene: { websiteUrl: 'https://notabene.id/', dashboardVariant: 'crypto' },
  holistic: { websiteUrl: 'https://www.amlrightsource.com/', dashboardVariant: 'regtech' },
};

function getSoftwareFull(sw: SoftwareProvider): SoftwareFull {
  const meta = SOFTWARE_META[sw.id] ?? { websiteUrl: `https://www.google.com/search?q=${encodeURIComponent(sw.vendor + ' ' + sw.name)}`, dashboardVariant: sw.category === 'network' ? 'network' : sw.category };
  return { ...sw, ...meta };
}

const SOFTWARE_EN: Record<string, { summary: string; detail: string; usedFor: string[]; typicalUsers: string }> = {
  actimize: { summary: 'TM and case management leader in tier-1 banks.', detail: 'Actimize SAM — rules + ML for transaction monitoring. Alert management, SAR workflow, model tuning. TM analysts spend ~80% of their day here: review alerts, document decisions, escalate.', usedFor: ['Transaction monitoring alerts', 'Case workflow', 'SAR preparation', 'Model governance'], typicalUsers: 'TM Analyst, Financial Crime Investigator, MLRO' },
  mantas: { summary: 'Enterprise AML platform for large banks.', detail: 'Full AML suite: TM, sanctions, KYC, reporting. Strong in banks with legacy Oracle stack.', usedFor: ['TM scenarios', 'Regulatory reporting', 'Sanctions integration'], typicalUsers: 'TM Analyst, Compliance Officer' },
  'sas-aml': { summary: 'Analytics-driven AML with strong statistics.', detail: 'Scenario designer, anomaly detection, network analysis. Popular in Americas/EU banks.', usedFor: ['Scenario development', 'Anomaly detection', 'Management reporting'], typicalUsers: 'Senior TM Analyst, Model Validation' },
  feedzai: { summary: 'Real-time fraud + AML for fintechs and neobanks.', detail: 'ML-first platform: payment fraud + AML in one engine. Sub-second decisioning on every transaction.', usedFor: ['Real-time payment screening', 'Fraud + AML combined', 'Customer profiling'], typicalUsers: 'Fraud Analyst, TM Analyst (fintech)' },
  featurespace: { summary: 'Adaptive behavioural analytics for fraud/AML.', detail: 'Self-learning models on customer behaviour. Fewer false positives vs static rules.', usedFor: ['Behavioural TM', 'Fraud detection', 'Adaptive models'], typicalUsers: 'Fraud/TM Analyst' },
  worldcheck: { summary: 'Industry standard PEP/sanctions/adverse media.', detail: 'World-Check One — screening at onboarding and ongoing. PEP, sanctions, adverse media, law enforcement.', usedFor: ['PEP screening', 'Sanctions hits', 'Adverse media', 'Ongoing screening'], typicalUsers: 'KYC Analyst, EDD Analyst, Sanctions Analyst' },
  'dow-jones': { summary: 'Watchlist + adverse media for global banks.', detail: 'Factiva integration, PEP/sanctions lists, risk profiles. Strong in adverse media research.', usedFor: ['Screening', 'Adverse media research', 'Enhanced due diligence'], typicalUsers: 'EDD/OSINT Analyst, Sanctions Analyst' },
  'lexis-bridger': { summary: 'Screening + identity for US-heavy institutions.', detail: 'XG platform: sanctions, PEP, adverse media, payment screening. Batch and real-time screening.', usedFor: ['Sanctions/PEP screening', 'Payment screening', 'Batch rescreening'], typicalUsers: 'Sanctions Analyst, KYC Analyst' },
  complyadvantage: { summary: 'API-first screening for fintechs.', detail: 'ML-enhanced lists, mesh network data, TM module. Fast integration for startups and neobanks.', usedFor: ['API screening', 'TM (CA Mesh)', 'Adverse media'], typicalUsers: 'KYC Analyst, TM Analyst (fintech)' },
  accuity: { summary: 'Payment sanctions screening (SWIFT/SEPA).', detail: 'Focal Point and payment filtering. Every wire message checked against sanctions lists.', usedFor: ['Wire screening', 'Sanctions filtering', 'Payment compliance'], typicalUsers: 'Sanctions Analyst, Payment Ops' },
  onfido: { summary: 'Document + biometric verification.', detail: 'ID document capture, liveness, facial match. KYC analysts review failed verifications and tampering alerts.', usedFor: ['ID verification', 'Liveness check', 'Document authentication'], typicalUsers: 'KYC Analyst, Onboarding Analyst' },
  jumio: { summary: 'AI identity verification for digital onboarding.', detail: 'Netverify: 5000+ document types, AML watchlist check bundled. Fintech onboarding pipeline.', usedFor: ['Digital onboarding', 'IDV exceptions', 'Watchlist pre-screen'], typicalUsers: 'KYC Analyst' },
  trulioo: { summary: 'Global identity verification (195 countries).', detail: 'Electronic identity verification against government/registries. KYB module for businesses.', usedFor: ['eIDV', 'Global coverage', 'KYB verification'], typicalUsers: 'KYC Analyst, EDD Analyst' },
  sumsub: { summary: 'All-in-one KYC/KYB for crypto and fintech.', detail: 'IDV, liveness, AML screening, transaction monitoring lite. Popular with VASPs and crypto exchanges.', usedFor: ['KYC/KYB', 'AML screening', 'Crypto onboarding'], typicalUsers: 'KYC Analyst, Crypto Compliance' },
  persona: { summary: 'Configurable identity flows for US fintech.', detail: 'No-code KYC workflows, database checks, document verification.', usedFor: ['Custom KYC flows', 'Database verification', 'Case review'], typicalUsers: 'KYC Analyst, Product Compliance' },
  chainalysis: { summary: 'Gold standard blockchain analytics.', detail: 'Reactor, KYT, Kryptos. Cluster wallets, trace funds, sanctions exposure, mixer detection.', usedFor: ['Wallet clustering', 'Sanctions exposure', 'Mixer/tumbler detection', 'SAR blockchain evidence'], typicalUsers: 'Crypto Compliance Analyst, Financial Crime Investigator' },
  elliptic: { summary: 'Crypto AML for exchanges and banks.', detail: 'Navigator, Lens, Discovery. Wallet screening, VASP due diligence, cross-chain tracing.', usedFor: ['Wallet screening', 'VASP DD', 'Cross-chain tracing'], typicalUsers: 'Crypto Compliance Analyst' },
  trm: { summary: 'Blockchain intelligence for law enforcement and VASP.', detail: 'Forensics-grade tracing, entity attribution, case management. Strong in DeFi and cross-chain.', usedFor: ['Forensic tracing', 'DeFi exposure', 'Case graphs'], typicalUsers: 'Crypto Investigator, Law Enforcement liaison' },
  ciphertrace: { summary: 'Bank-grade crypto compliance suite.', detail: 'Armada for banks entering crypto. Travel Rule, wallet risk scoring.', usedFor: ['Bank crypto compliance', 'Travel Rule', 'Wallet risk score'], typicalUsers: 'Crypto Compliance, TM Analyst' },
  merkle: { summary: 'Predictive crypto risk for APAC-focused VASP.', detail: 'Tracker, Compass for on-chain transaction monitoring. ML risk scoring.', usedFor: ['On-chain TM', 'Risk scoring', 'Compliance automation'], typicalUsers: 'Crypto Compliance Analyst' },
  hummingbird: { summary: 'Investigation case management for fincrime teams.', detail: 'Collaborative investigations, SAR drafting, regulator-ready exports.', usedFor: ['Investigation workflow', 'SAR drafting', 'Team collaboration'], typicalUsers: 'Financial Crime Investigator, SAR Writer' },
  quantexa: { summary: 'Contextual decision intelligence / graph analytics.', detail: 'Entity resolution, network graphs, hidden connections. Finds mule networks, UBO links, fraud rings.', usedFor: ['Network analysis', 'Entity resolution', 'Hidden links'], typicalUsers: 'Senior Investigator, TM Lead' },
  factiva: { summary: 'Premium global news database for adverse media.', detail: 'Millions of sources, advanced search, archiving. Primary EDD/OSINT tool beyond Google.', usedFor: ['Adverse media search', 'Archive research', 'EDD reports'], typicalUsers: 'EDD Analyst, OSINT Researcher' },
  sayari: { summary: 'Corporate ownership intelligence.', detail: 'Global corporate graph, UBO mapping, sanctions-adjacent entities.', usedFor: ['UBO mapping', 'Corporate networks', 'Sanctions evasion detection'], typicalUsers: 'EDD/OSINT Analyst, Sanctions Investigator' },
  orbis: { summary: 'Global company database for KYB/EDD.', detail: '400M+ companies, ownership trees, financials. KYB analyst verifies corporate clients.', usedFor: ['KYB', 'Ownership trees', 'Counterparty DD'], typicalUsers: 'KYB Analyst, EDD Analyst' },
  napier: { summary: 'AI-enhanced AML platform (screening + TM).', detail: 'Intelligent screening reduces false positives. Continued monitoring, client risk assessment.', usedFor: ['Intelligent screening', 'Client risk assessment', 'Continued monitoring'], typicalUsers: 'KYC/TM Analyst' },
  'silent-eight': { summary: 'AI for sanctions false positive resolution.', detail: 'Iris platform automates hit resolution with explainable AI.', usedFor: ['Sanctions hit resolution', 'False positive reduction'], typicalUsers: 'Sanctions Analyst' },
  lucinity: { summary: 'Human-AI AML investigation platform.', detail: 'Lucy AI co-pilot for investigators. Case summarization, SAR narrative drafting.', usedFor: ['Investigation co-pilot', 'SAR narrative', 'Case summarization'], typicalUsers: 'Financial Crime Investigator' },
  sensa: { summary: 'Network detection for AML and fraud.', detail: 'Graph analytics for mule networks, collusion, trade ML patterns.', usedFor: ['Network typologies', 'Collusion detection', 'Complex TM cases'], typicalUsers: 'Senior TM Analyst, Investigator' },
  goaml: { summary: 'FIU reporting portal used by 100+ countries.', detail: 'Not vendor software for banks — but analysts must know SAR/STR filing via goAML in many jurisdictions.', usedFor: ['STR/SAR filing to FIU', 'Regulatory reporting'], typicalUsers: 'MLRO, SAR Team' },
  notabene: { summary: 'Travel Rule compliance network for VASP.', detail: 'IVMS101 data exchange between VASPs. Ensures outbound transfers include originator/beneficiary info.', usedFor: ['Travel Rule', 'VASP-to-VASP messaging', 'Compliance automation'], typicalUsers: 'Crypto Compliance Analyst' },
  holistic: { summary: 'Managed AML services + tech hybrids.', detail: 'Banks outsource L1 alert review or KYC to vendors. Same tools (Actimize, World-Check).', usedFor: ['Managed KYC/TM', 'Surge capacity', 'Audit support'], typicalUsers: 'Outsourced Analyst, QA Reviewer' },
};

function getSoftwareLocalized(sw: SoftwareProvider, lang: Lang): SoftwareProvider {
  if (lang === 'ru') return sw;
  const en = SOFTWARE_EN[sw.id];
  if (!en) return sw;
  return { ...sw, ...en };
}

function getSoftwareCategoryLabel(lang: Lang, cat: SoftwareProvider['category']): string {
  const en = SOFTWARE_CATEGORY_LABELS[cat];
  if (lang === 'ru') {
    const ru: Record<SoftwareProvider['category'], string> = {
      tm: 'Transaction Monitoring', screening: 'Sanctions & PEP Screening', kyc: 'KYC / Верификация личности',
      crypto: 'Blockchain Analytics & Crypto AML', case: 'Case Management & Расследования', osint: 'OSINT & Adverse Media',
      regtech: 'RegTech / AI AML', network: 'Network Analytics & Graph',
    };
    return ru[cat];
  }
  return en;
}

type CryptoCheckStep = {
  id: string;
  step: number;
  title: string;
  action: string;
  tools: string[];
  redFlags: string[];
  analystTip: string;
};

const CRYPTO_CHECKS: CryptoCheckStep[] = [
  { id: 'cc1', step: 1, title: 'VASP Identification', action: 'Определи: custodial VASP, unhosted wallet, P2P, DeFi protocol. Проверь лицензию VASP в jurisdiction registry.', tools: ['Sumsub', 'VASP registry', 'FATF VASP list'], redFlags: ['Unlicensed VASP', 'Seychelles/BVI exchange без audit'], analystTip: 'Licensed VASP — всегда проверяй counterparty VASP в Travel Rule network.' },
  { id: 'cc2', step: 2, title: 'Travel Rule Compliance', action: 'Для transfers ≥ threshold: originator + beneficiary info переданы? IVMS101 complete?', tools: ['Notabene', 'Sygna', 'CipherTrace Travel Rule'], redFlags: ['Missing beneficiary name', 'Self-hosted without proof'], analystTip: 'EU TFR + FATF R.16 — gap = hold transaction до получения data.' },
  { id: 'cc3', step: 3, title: 'Wallet Screening (KYT)', action: 'Screen wallet address до approve deposit/withdrawal. Получи risk score и exposure categories.', tools: ['Chainalysis KYT', 'Elliptic Lens', 'TRM Labs'], redFlags: ['Sanctioned address', 'Darknet market', 'Stolen funds', 'Scam cluster'], analystTip: 'Любой hit > direct exposure — эскалация, не auto-approve.' },
  { id: 'cc4', step: 4, title: 'Transaction Tracing', action: 'Trace hops backward (source) и forward (destination). Document path in case notes.', tools: ['Chainalysis Reactor', 'TRM Forensics', 'Elliptic Navigator'], redFlags: ['Mixer within 3 hops', 'Chain-hopping', 'Peel chain', 'Dusting attack'], analystTip: 'OSINT навык: строй timeline как в расследовании — placement→layering.' },
  { id: 'cc5', step: 5, title: 'Mixer / Tumbler Detection', action: 'Identify Tornado Cash, ChipMixer, cross-chain bridges used for obfuscation.', tools: ['Chainalysis', 'Elliptic', 'TRM'], redFlags: ['>5% mixer exposure', 'Tornado Cash', 'Privacy coin conversion'], analystTip: 'Mixer = extreme red flag. Policy большинства банков: reject/offboard.' },
  { id: 'cc6', step: 6, title: 'Sanctions Screening (Crypto)', action: 'Check addresses against OFAC SDN crypto lists, EU crypto sanctions, UK OFSI.', tools: ['Chainalysis Sanctions API', 'OFAC SDN list', 'Elliptic'], redFlags: ['SDN-listed wallet', 'North Korea Lazarus cluster', 'Garantex'], analystTip: 'True match on crypto address = immediate freeze + MLRO + SAR.' },
  { id: 'cc7', step: 7, title: 'SOF / Origin of Crypto', action: 'Verify mining, staking, salary-in-crypto, P2P, investment claims with evidence.', tools: ['Mining pool API', 'Exchange statements', 'Tax returns'], redFlags: ['No proof mining', 'P2P only from HRJ', 'Sudden wealth'], analystTip: 'RFI: «Provide exchange statements / pool payout records for last 12 months».' },
  { id: 'cc8', step: 8, title: 'DeFi / Unhosted Wallet EDD', action: 'For DeFi: analyze smart contract interaction, LP tokens, bridge usage, protocol risk.', tools: ['TRM DeFi', 'Chainalysis', 'Etherscan/BscScan'], redFlags: ['Exploit protocol funds', 'Wash trading NFT', 'Flash loan abuse'], analystTip: 'DeFi ≠ anonymous. On-chain fully visible — твой OSINT advantage.' },
  { id: 'cc9', step: 9, title: 'Fiat-Crypto Correlation', action: 'Match fiat TM alerts with crypto flows. Same client? Same timeframe? Layering pattern?', tools: ['Actimize', 'Chainalysis KYT', 'Internal TM'], redFlags: ['Fiat in → crypto out same day', 'Smurfing into exchange'], analystTip: 'Классика mule: SEPA in → instant BTC buy → external wallet.' },
  { id: 'cc10', step: 10, title: 'Decision & Reporting', action: 'Document: exposure %, hops, tools used, decision (approve/hold/EDD/SAR/offboard). No tipping off.', tools: ['Hummingbird', 'Case system', 'goAML connector'], redFlags: ['Undocumented approval of high-risk wallet'], analystTip: 'Screenshot blockchain graph → attach to case → MLRO review if SAR threshold met.' },
];

const MODULES: CourseModule[] = COURSE_MODULES;
const MODULE_META = COURSE_MODULE_META;

const OSINT_MODULES: Module[] = [
  {
    id: 'o1', title: 'OSINT 1: Методология и этика', subtitle: 'OPSEC, источники, chain of custody, AML-контекст',
    passScore: 4, termIds: ['adverse', 'ubo'],
    lessons: [
      { title: 'Что такое OSINT в AML', body: 'Open Source Intelligence — сбор и анализ публичных данных для KYC, EDD, adverse media, UBO. Не хacking: только легальные источники. Твой deliverable — verifiable facts с URL, датой, скриншотом.' },
      { title: 'OPSEC и compliance', body: 'Не используй fake accounts для обхода paywalls без разрешения. GDPR: personal data только для legitimate interest (AML). Документируй methodology. Не tipping off — OSINT findings только в internal case file.' },
      { title: 'OSINT cycle', body: 'Planning → Collection → Processing → Analysis → Dissemination. В AML: hypothesis (red flag) → sources → cross-reference → risk rating → EDD report. Минимум 2 independent sources для material fact.' },
    ],
    exam: [
      { id: 'o1-q1', question: 'OSINT в AML — это:', options: [{ id: 'a', text: 'Анализ публичных источников для EDD/KYC', correct: true }, { id: 'b', text: 'Взлом банковских систем', correct: false }, { id: 'c', text: 'Маркетинг', correct: false }], explain: 'Только open sources.' },
      { id: 'o1-q2', question: 'Material fact требует:', options: [{ id: 'a', text: '≥2 независимых источника', correct: true }, { id: 'b', text: 'Только Google', correct: false }, { id: 'c', text: 'Мнение аналитика', correct: false }], explain: 'Cross-reference обязателен.' },
      { id: 'o1-q3', question: 'Chain of custody означает:', options: [{ id: 'a', text: 'URL + дата + скрин для каждого finding', correct: true }, { id: 'b', text: 'Удалить следы', correct: false }, { id: 'c', text: 'Сообщить клиенту', correct: false }], explain: 'Audit trail для регулятора.' },
      { id: 'o1-q4', question: 'Tipping off при OSINT:', options: [{ id: 'a', text: 'Запрещено — findings только internal', correct: true }, { id: 'b', text: 'Можно предупредить клиента', correct: false }, { id: 'c', text: 'Нужно публиковать в соцсетях', correct: false }], explain: 'Confidential investigation.' },
      { id: 'o1-q5', question: 'Первый шаг OSINT-расследования:', options: [{ id: 'a', text: 'Planning — гипотеза и scope', correct: true }, { id: 'b', text: 'SAR сразу', correct: false }, { id: 'c', text: 'Reject клиента', correct: false }], explain: 'Plan before collect.' },
    ],
  },
  {
    id: 'o2', title: 'OSINT 2: Поиск и Google Dorking', subtitle: 'Operators, reverse search, archives',
    passScore: 4, termIds: ['adverse'],
    lessons: [
      { title: 'Advanced search operators', body: 'site:, filetype:, intitle:, inurl:, OR, -exclude, «exact phrase». Пример: site:reuters.com "company name" fraud. Для adverse media — несколько языков (оригинал + English).' },
      { title: 'Reverse image & email', body: 'Reverse image search для verify photos, fake profiles. Email in breaches (Have I Been Pwned) — не для AML decision alone, но signal для ATO/fraud. Phone OSINT — осторожно с GDPR.' },
      { title: 'Web archives', body: 'Wayback Machine — deleted pages, old company claims. Client website «10 years business» но domain 2 weeks old = red flag. Compare archived vs current statements.' },
    ],
    exam: [
      { id: 'o2-q1', question: 'site:gov.uk используется для:', options: [{ id: 'a', text: 'Поиска только на gov.uk доменах', correct: true }, { id: 'b', text: 'Блокировки сайта', correct: false }, { id: 'c', text: 'Sanctions check', correct: false }], explain: 'Google dork operator.' },
      { id: 'o2-q2', question: 'Wayback Machine помогает:', options: [{ id: 'a', text: 'Восстановить удалённые страницы', correct: true }, { id: 'b', text: 'Hack website', correct: false }, { id: 'c', text: 'Платить налоги', correct: false }], explain: 'Archive.org.' },
      { id: 'o2-q3', question: 'Adverse media search на нескольких языках потому что:', options: [{ id: 'a', text: 'Нegative news может быть только на local language', correct: true }, { id: 'b', text: 'Google не работает на English', correct: false }, { id: 'c', text: 'Не нужно', correct: false }], explain: 'Local media coverage.' },
      { id: 'o2-q4', question: '«Exact phrase» в Google:', options: [{ id: 'a', text: 'Кавычки для точного совпадения', correct: true }, { id: 'b', text: 'Звёздочки', correct: false }, { id: 'c', text: 'Хештег', correct: false }], explain: '"John Smith" fraud.' },
      { id: 'o2-q5', question: 'Domain age 2 weeks vs claim 10 years business:', options: [{ id: 'a', text: 'Red flag — verify further', correct: true }, { id: 'b', text: 'Normal', correct: false }, { id: 'c', text: 'Auto-approve', correct: false }], explain: 'Inconsistency signal.' },
    ],
  },
  {
    id: 'o3', title: 'OSINT 3: Корпоративные реестры и UBO', subtitle: 'OpenCorporates, Companies House, shell detection',
    passScore: 4, termIds: ['ubo', 'cdd'],
    lessons: [
      { title: 'Corporate registries', body: 'Companies House (UK), OpenCorporates (global), local registries (LT, PL, BY). Проверяй: status active/dissolved, directors, filing history, registered address, SIC codes.' },
      { title: 'Shell company indicators', body: 'Mass address (100+ companies same office), nominee directors, no employees, recent incorporation + large wire, bearer shares jurisdictions, circular ownership.' },
      { title: 'UBO mapping', body: 'Строй ownership chain до natural person. 25% threshold (EU), 10% (UK sometimes). Trusts — identify settlor, trustee, beneficiaries. Document каждый hop с registry extract.' },
    ],
    exam: [
      { id: 'o3-q1', question: 'OpenCorporates — это:', options: [{ id: 'a', text: 'Глобальный агрегатор реестров компаний', correct: true }, { id: 'b', text: 'Sanctions list', correct: false }, { id: 'c', text: 'TM system', correct: false }], explain: 'Corporate OSINT.' },
      { id: 'o3-q2', question: 'Shell indicator:', options: [{ id: 'a', text: '100 компаний на одном адресе', correct: true }, { id: 'b', text: 'Офис в бизнес-центре', correct: false }, { id: 'c', text: 'LinkedIn page', correct: false }], explain: 'Mass registration address.' },
      { id: 'o3-q3', question: 'UBO threshold в EU обычно:', options: [{ id: 'a', text: '25%', correct: true }, { id: 'b', text: '1%', correct: false }, { id: 'c', text: '100%', correct: false }], explain: 'AMLD standard.' },
      { id: 'o3-q4', question: 'Director resigned 2 years ago но LinkedIn shows active:', options: [{ id: 'a', text: 'Registry wins — investigate discrepancy', correct: true }, { id: 'b', text: 'Trust LinkedIn', correct: false }, { id: 'c', text: 'Ignore', correct: false }], explain: 'Official registry primary.' },
      { id: 'o3-q5', question: '5-layer offshore structure:', options: [{ id: 'a', text: 'EDD + full UBO mapping required', correct: true }, { id: 'b', text: 'CDD only', correct: false }, { id: 'c', text: 'Auto-reject without review', correct: false }], explain: 'Complex structure = high risk.' },
    ],
  },
  {
    id: 'o4', title: 'OSINT 4: Adverse Media', subtitle: 'News, courts, sanctions-adjacent, weighting',
    passScore: 4, termIds: ['adverse', 'pep'],
    lessons: [
      { title: 'Source tiers', body: 'Tier 1: Reuters, Bloomberg, court records, regulators. Tier 2: National quality press. Tier 3: Blogs, forums — corroborate only. Оценивай: conviction vs accusation vs acquittal.' },
      { title: 'Weighting framework', body: 'Recency (last 24 months heavier), severity (fraud > tax dispute), outcome (convicted > ongoing > acquitted), relevance to role (director fraud vs employee theft). One Tier-3 article ≠ auto-decline.' },
      { title: 'Local language media', body: 'Arabic, Chinese, Russian local press — use translation + native keyword search. Regional court databases. FATF grey-list country media may need local source.' },
    ],
    exam: [
      { id: 'o4-q1', question: 'Acquitted 2023, charged 2021 — weight:', options: [{ id: 'a', text: 'Medium — document context', correct: true }, { id: 'b', text: 'Auto-decline', correct: false }, { id: 'c', text: 'Ignore completely', correct: false }], explain: 'Outcome matters.' },
      { id: 'o4-q2', question: 'Tier 1 source — это:', options: [{ id: 'a', text: 'Reuters / court / regulator', correct: true }, { id: 'b', text: 'Random forum', correct: false }, { id: 'c', text: 'Instagram comment', correct: false }], explain: 'Reliability hierarchy.' },
      { id: 'o4-q3', question: '50 articles same event:', options: [{ id: 'a', text: 'Deduplicate — count as one fact pattern', correct: true }, { id: 'b', text: '50 separate red flags', correct: false }, { id: 'c', text: 'Ignore all', correct: false }], explain: 'Same underlying event.' },
      { id: 'o4-q4', question: 'Adverse media only Arabic, screening clean:', options: [{ id: 'a', text: 'Manual OSINT in Arabic required', correct: true }, { id: 'b', text: 'Approve without check', correct: false }, { id: 'c', text: 'Close account', correct: false }], explain: 'Screening gaps.' },
      { id: 'o4-q5', question: 'Blog post accusing CEO без court:', options: [{ id: 'a', text: 'Corroborate Tier 1 before EDD conclusion', correct: true }, { id: 'b', text: 'SAR immediately', correct: false }, { id: 'c', text: 'Publish blog', correct: false }], explain: 'Unverified allegation.' },
    ],
  },
  {
    id: 'o5', title: 'OSINT 5: People & Social OSINT', subtitle: 'LinkedIn, profiles, lifestyle mismatch',
    passScore: 4, termIds: ['pep', 'sof'],
    lessons: [
      { title: 'LinkedIn verification', body: 'Cross-check: title vs registry, employment dates, connections pattern, endorsements. Fake profiles: stock photo, few connections, recent creation. PEP self-declaration vs OSINT find.' },
      { title: 'Lifestyle vs declared income', body: 'Public Instagram/Facebook luxury vs 2K EUR/mo declared — not proof of crime, but EDD trigger. Document screenshots with timestamp. SOF/SOW RFI if material.' },
      { title: 'Professional networks', body: 'Conference speaker lists, patent filings, academic papers, court party names. Connect people to companies without registry link (hidden influence).' },
    ],
    exam: [
      { id: 'o5-q1', question: 'LinkedIn vs registry conflict:', options: [{ id: 'a', text: 'Investigate — registry primary for legal status', correct: true }, { id: 'b', text: 'Always trust LinkedIn', correct: false }, { id: 'c', text: 'Delete LinkedIn', correct: false }], explain: 'Cross-reference.' },
      { id: 'o5-q2', question: 'Luxury Instagram vs low declared income:', options: [{ id: 'a', text: 'EDD trigger — not standalone proof', correct: true }, { id: 'b', text: 'SAR mandatory', correct: false }, { id: 'c', text: 'Irrelevant', correct: false }], explain: 'Inconsistency signal.' },
      { id: 'o5-q3', question: 'Stock photo profile:', options: [{ id: 'a', text: 'Possible fake identity — escalate', correct: true }, { id: 'b', text: 'Normal KYC', correct: false }, { id: 'c', text: 'Approve faster', correct: false }], explain: 'Identity fraud signal.' },
      { id: 'o5-q4', question: 'PEP not self-declared but OSINT finds MP role:', options: [{ id: 'a', text: 'Apply PEP EDD — misrepresentation risk', correct: true }, { id: 'b', text: 'Ignore OSINT', correct: false }, { id: 'c', text: 'Warn client about SAR', correct: false }], explain: 'Material omission.' },
      { id: 'o5-q5', question: 'Screenshot for case file must include:', options: [{ id: 'a', text: 'URL, date, full page context', correct: true }, { id: 'b', text: 'Only cropped headline', correct: false }, { id: 'c', text: 'Nothing', correct: false }], explain: 'Evidence standard.' },
    ],
  },
  {
    id: 'o6', title: 'OSINT 6: EDD Report & Delivery', subtitle: 'Structure, executive summary, recommendations',
    passScore: 4, termIds: ['edd', 'rfi'],
    lessons: [
      { title: 'EDD report structure', body: '1 Executive Summary (1 page) 2 Subject profile 3 Methodology 4 Findings (sourced) 5 Risk assessment 6 Recommendation (approve/EDD ongoing/reject/escalate). Every fact: [Source, Date, URL].' },
      { title: 'Writing for non-OSINT readers', body: 'MLRO и QA не будут повторять твой search. Пиши plain language, highlight material risks first. Separate facts vs analyst inference. «Recommend EDD ongoing» — обоснуй.' },
      { title: 'Handoff to AML workflow', body: 'OSINT report → case system attachment → risk score update → RFI if gaps → senior review if high risk → SAR if suspicion after full picture. OSINT не replaces screening/TM.' },
    ],
    exam: [
      { id: 'o6-q1', question: 'Executive summary должен:', options: [{ id: 'a', text: 'Дать recommendation в первом абзаце', correct: true }, { id: 'b', text: 'Скрыть выводы', correct: false }, { id: 'c', text: 'Без источников', correct: false }], explain: 'Decision-ready.' },
      { id: 'o6-q2', question: 'Facts vs inference:', options: [{ id: 'a', text: 'Чётко разделить в report', correct: true }, { id: 'b', text: 'Смешать для скорости', correct: false }, { id: 'c', text: 'Только inference', correct: false }], explain: 'Professional standard.' },
      { id: 'o6-q3', question: 'Missing source URL:', options: [{ id: 'a', text: 'QA fail — finding not verifiable', correct: true }, { id: 'b', text: 'Acceptable', correct: false }, { id: 'c', text: 'Preferred', correct: false }], explain: 'Reproducibility.' },
      { id: 'o6-q4', question: 'OSINT после negative findings:', options: [{ id: 'a', text: 'Document «no material findings» + sources checked', correct: true }, { id: 'b', text: 'Empty report', correct: false }, { id: 'c', text: 'Skip report', correct: false }], explain: 'Negative assurance documented.' },
      { id: 'o6-q5', question: 'High risk OSINT → next step:', options: [{ id: 'a', text: 'Senior review + possible RFI/SAR path', correct: true }, { id: 'b', text: 'Auto-approve', correct: false }, { id: 'c', text: 'Tell client on phone', correct: false }], explain: 'Escalation path.' },
    ],
  },
];

const OSINT_MODULE_META: Record<string, { objectives: string[]; takeaways: string[]; proTip: string }> = {
  o1: { objectives: ['Понять OSINT cycle', 'Знать OPSEC и GDPR', 'Document chain of custody'], takeaways: ['Only public sources', '2+ sources for material facts', 'Internal only — no tipping off'], proTip: 'Начни каждый кейс с written scope: что ищешь и зачем.' },
  o2: { objectives: ['Google dorks', 'Archives', 'Multi-language search'], takeaways: ['site: and quotes — твои друзья', 'Wayback for deleted claims', 'Local language keywords'], proTip: 'Сохраняй search string в case notes для reproducibility.' },
  o3: { objectives: ['Registry navigation', 'Shell detection', 'UBO chains'], takeaways: ['Registry > social media', 'Mass address = shell signal', 'Map to natural person'], proTip: 'OpenCorporates + local registry — always both.' },
  o4: { objectives: ['Source tiering', 'Weight acquittal vs conviction', 'Deduplicate news'], takeaways: ['Tier 1 first', 'Recency + severity', 'One event ≠ 50 flags'], proTip: 'Translate local media — don\'t rely on English-only Google.' },
  o5: { objectives: ['Verify LinkedIn', 'Lifestyle mismatch', 'Evidence screenshots'], takeaways: ['Cross-check employment', 'Instagram ≠ proof but triggers EDD', 'Full screenshot with URL/date'], proTip: 'PEP hidden in OSINT = same as undeclared PEP.' },
  o6: { objectives: ['Write EDD report', 'Executive summary', 'Escalation path'], takeaways: ['Fact vs inference separated', 'Recommendation upfront', 'Negative findings documented'], proTip: 'Пиши report для MLRO, который прочитает за 5 минут.' },
};

const OSINT_MODULE_I18N: Record<string, Record<string, { title: string; subtitle: string }>> = {
  en: {
    o1: { title: 'OSINT 1: Methodology & Ethics', subtitle: 'OPSEC, sources, chain of custody' },
    o2: { title: 'OSINT 2: Search & Dorking', subtitle: 'Operators, archives, reverse search' },
    o3: { title: 'OSINT 3: Corporate & UBO', subtitle: 'Registries, shells, ownership chains' },
    o4: { title: 'OSINT 4: Adverse Media', subtitle: 'News tiers, weighting, local language' },
    o5: { title: 'OSINT 5: People OSINT', subtitle: 'LinkedIn, social, lifestyle checks' },
    o6: { title: 'OSINT 6: EDD Reports', subtitle: 'Structure, summary, handoff' },
  },
};

function getOsintModuleMeta(lang: Lang, mod: Module): { title: string; subtitle: string } {
  if (lang === 'ru') return { title: mod.title, subtitle: mod.subtitle };
  return OSINT_MODULE_I18N.en?.[mod.id] ?? { title: mod.title, subtitle: mod.subtitle };
}

const OSINT_FINAL_THEORY_EXAM: ExamQuestion[] = OSINT_MODULES.flatMap((m) => m.exam).map((q, i) => ({ ...q, id: `osint-final-q${i + 1}` }));
const OSINT_FINAL_PASS = 24;
const OSINT_FINAL_PRACTICAL_IDS = ['osint-p-001', 'osint-p-010', 'osint-p-020', 'osint-p-030', 'osint-p-040', 'osint-p-050'];
const OSINT_FINAL_PRACTICAL_PASS = 4;

const FINAL_THEORY_EXAM: ExamQuestion[] = MODULES.flatMap((m) => m.exam).slice(0, 40).map((q, i) => ({
  ...q,
  id: `final-q${i + 1}`,
}));

const FINAL_PRACTICAL_CASE_IDS = ['case-001', 'case-002', 'case-003', 'case-004', 'case-005', 'case-006', 'case-091', 'case-112', 'case-154', 'case-217'];
const FINAL_THEORY_PASS = 32;
const FINAL_PRACTICAL_PASS = 7;
const FINAL_PRACTICAL_MIN_SCORE = 60;

const VERDICT_LABELS: Record<Verdict, string> = {
  correct: 'Верно',
  partial_ok: 'Верно, но…',
  partial_bad: 'Неверно, но…',
  incorrect: 'Неверно',
};

const VERDICT_TONE: Record<Verdict, 'success' | 'warning' | 'danger' | 'info'> = {
  correct: 'success',
  partial_ok: 'info',
  partial_bad: 'warning',
  incorrect: 'danger',
};

function LessonProse({ body }: { body: string }) {
  const sections = body.split(/\n(?=### )/).filter(Boolean);
  return (
    <div className="lesson-prose">
      {sections.map((section, si) => {
        const lines = section.trim().split('\n');
        const heading = lines[0].replace(/^###\s*/, '');
        const content = lines.slice(1);
        const items: ReactNode[] = [];
        let listBuf: string[] = [];

        const flushList = () => {
          if (listBuf.length) {
            items.push(<ul key={`ul-${si}-${items.length}`}>{listBuf.map((li, i) => <li key={i}>{li}</li>)}</ul>);
            listBuf = [];
          }
        };

        content.forEach((line, li) => {
          const t = line.trim();
          if (!t) return;
          if (t.startsWith('- ')) {
            listBuf.push(t.slice(2));
            return;
          }
          flushList();
          if (t.startsWith('**') && t.includes('**')) {
            const m = t.match(/^\*\*(.+?)\*\*\s*(.*)$/);
            items.push(
              <p key={`p-${si}-${li}`}>
                <strong>{m?.[1] ?? t}</strong>
                {m?.[2] ? ` ${m[2]}` : ''}
              </p>,
            );
            return;
          }
          items.push(<p key={`p-${si}-${li}`}>{t}</p>);
        });
        flushList();

        return (
          <div key={si} style={{ marginBottom: 20 }}>
            <h4>{heading}</h4>
            {items}
          </div>
        );
      })}
    </div>
  );
}

function DetailPanel() {
  const theme = useHostTheme();
  const [panel, setPanel] = useCanvasState<DetailPanelState>('detail-panel', null);
  if (!panel) return null;

  if (panel.kind === 'term') {
    const term = enrichedTerm(GLOSSARY.find((t) => t.id === panel.id)!);
    return (
      <Card>
        <CardHeader trailing={<Button variant="ghost" onClick={() => setPanel(null)}>Закрыть</Button>}>
          {term.abbr} — {term.full}
        </CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Pill tone="info" size="sm">{CATEGORY_LABELS[term.category]}</Pill>
            <Text weight="medium">Кратко</Text>
            <Text>{term.simple}</Text>
            <Text weight="medium">Подробное описание</Text>
            <Text>{term.detail}</Text>
            <Text weight="medium">Пример из практики</Text>
            <Text tone="secondary">{term.example}</Text>
            <Divider />
            <Text weight="medium">Technical English</Text>
            <Text>{term.english}</Text>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  if (panel.kind === 'regulation') {
    const reg = REGULATIONS.find((r) => r.id === panel.id)!;
    return (
      <Card>
        <CardHeader trailing={<Button variant="ghost" onClick={() => setPanel(null)}>Закрыть</Button>}>
          {reg.flag} {reg.country}: {reg.name}
        </CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Row gap={8} wrap>
              <Pill tone="neutral" size="sm">{reg.region}</Pill>
              <Pill tone="info" size="sm">{reg.authority}</Pill>
            </Row>
            <Text>{reg.summary}</Text>
            <Text weight="medium">Полное описание</Text>
            <Text>{reg.detail}</Text>
            <Text weight="medium">Ключевые правила</Text>
            {reg.keyRules.map((rule) => (
              <span key={rule}><Text size="small">• {rule}</Text></span>
            ))}
            <Table
              headers={['Параметр', 'Значение']}
              rows={[
                ['Отчёт о подозрении', reg.sarName],
                ['FIU / регулятор', reg.fiu],
                ['Регулятор', reg.authority],
              ]}
            />
            <Text weight="medium">English terms</Text>
            <Row gap={6} wrap>
              {reg.englishTerms.map((t) => (
                <span key={t}><Pill tone="info" size="sm">{t}</Pill></span>
              ))}
            </Row>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  if (panel.kind === 'english') {
    const lesson = ENGLISH_LESSONS.find((l) => l.id === panel.id)!;
    return (
      <Card>
        <CardHeader trailing={<Button variant="ghost" onClick={() => setPanel(null)}>Закрыть</Button>}>
          English: {lesson.topic}
        </CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Pill tone="neutral" size="sm">{lesson.level}</Pill>
            <Text weight="medium">Фразы для работы</Text>
            {lesson.phrases.map((p) => (
              <div key={p.en} style={{ padding: '8px 0', borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
                <Row gap={8} align="center">
                  <Text weight="medium">{p.en}</Text>
                  <AudioButton text={p.en} label="▶" />
                </Row>
                <Text size="small" tone="secondary">{p.ru}</Text>
                <Text size="small" tone="tertiary">Контекст: {p.context}</Text>
              </div>
            ))}
            <Text weight="medium">Словарь</Text>
            <Table
              headers={['Term', 'Meaning', 'Example']}
              rows={lesson.vocabulary.map((v) => [v.term, v.meaning, v.example])}
            />
            <Callout tone="info" title="Упражнение">{lesson.exercise}</Callout>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  if (panel.kind === 'software') {
    const sw = SOFTWARE_PROVIDERS.find((s) => s.id === panel.id)!;
    return (
      <Card>
        <CardHeader trailing={<Button variant="ghost" onClick={() => setPanel(null)}>Закрыть</Button>}>
          {sw.name}
        </CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Row gap={8} wrap>
              <Pill tone="info" size="sm">{SOFTWARE_CATEGORY_LABELS[sw.category]}</Pill>
              <Pill tone="neutral" size="sm">{sw.vendor}</Pill>
            </Row>
            <Text>{sw.summary}</Text>
            <Text weight="medium">Подробное описание для сотрудника</Text>
            <Text>{sw.detail}</Text>
            <Text weight="medium">Используется для</Text>
            {sw.usedFor.map((u) => (
              <span key={u}><Text size="small">• {u}</Text></span>
            ))}
            <Table
              headers={['Параметр', 'Значение']}
              rows={[
                ['Типичные пользователи', sw.typicalUsers],
                ['Категория', SOFTWARE_CATEGORY_LABELS[sw.category]],
                ['Вендор', sw.vendor],
              ]}
            />
          </Stack>
        </CardBody>
      </Card>
    );
  }

  return null;
}

function DetailButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" onClick={onClick}>
      {label}
    </Button>
  );
}

function FlowDiagram({ steps, edges }: { steps: Array<{ id: string; label: string }>; edges: Array<{ from: string; to: string }> }) {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes: steps.map((s) => ({ id: s.id })),
    edges,
    direction: 'vertical',
    nodeWidth: 180,
    nodeHeight: 36,
    rankGap: 48,
    nodeGap: 24,
    padding: 16,
  });
  const labelById = Object.fromEntries(steps.map((s) => [s.id, s.label]));

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={layout.width} height={layout.height} style={{ display: 'block' }}>
        {layout.edges.map((edge, i) => {
          const midY = (edge.sourceY + edge.targetY) / 2;
          return (
            <path
              key={i}
              d={`M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX} ${midY}, ${edge.targetX} ${midY}, ${edge.targetX} ${edge.targetY}`}
              fill="none"
              stroke={theme.stroke.secondary}
              strokeWidth={1.5}
            />
          );
        })}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            <rect x={node.x} y={node.y} width={180} height={36} rx={4} fill={theme.fill.secondary} stroke={theme.stroke.primary} strokeWidth={1} />
            <text x={node.x + 90} y={node.y + 22} textAnchor="middle" fill={theme.text.primary} fontSize={11} fontFamily="system-ui, sans-serif">
              {(labelById[node.id]?.length ?? 0) > 24 ? labelById[node.id].slice(0, 22) + '…' : labelById[node.id]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CourseHero({ lang, passedCount, certified, onOpenFinal, moduleCount }: { lang: Lang; passedCount: number; certified: boolean; onOpenFinal: () => void; moduleCount: number }) {
  const theme = useHostTheme();
  const pct = Math.round((passedCount / moduleCount) * 100);
  const allModules = passedCount === moduleCount;

  return (
    <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${theme.stroke.primary}`, background: theme.fill.secondary }}>
      <Stack gap={14}>
        <Row gap={12} align="center" wrap>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="small" tone="secondary" weight="medium">AML/KYC ACADEMY</Text>
            <H2>{t(lang, 'appTitle')}</H2>
            <Text tone="secondary">{t(lang, 'appSubtitle')}</Text>
          </Stack>
          {certified ? (
            <Pill tone="success" size="sm">{t(lang, 'certified')}</Pill>
          ) : (
            <Pill tone="info" size="sm">{pct}%</Pill>
          )}
        </Row>
        <UsageBar
          segments={[
            { id: 'done', value: passedCount, color: 'green' },
            { id: 'left', value: Math.max(0, moduleCount - passedCount), color: 'gray' },
          ]}
          total={moduleCount}
          topLeftLabel={t(lang, 'courseProgress')}
          topRightLabel={`${passedCount}/${moduleCount}`}
        />
        {allModules && !certified && (
          <Callout tone="success" title={t(lang, 'finalExamUnlocked')}>
            <Button variant="primary" onClick={onOpenFinal}>{t(lang, 'finalExamTitle')} →</Button>
          </Callout>
        )}
        {certified && (
          <Callout tone="success" title={t(lang, 'finalExamPass')}>{t(lang, 'jobReadyBody')}</Callout>
        )}
      </Stack>
    </div>
  );
}

function ModulePathGrid({ lang, passedModules, currentView, onSelect, modules, getMeta }: {
  lang: Lang; passedModules: string[]; currentView: string; onSelect: (id: string) => void;
  modules: Module[]; getMeta: (lang: Lang, mod: Module) => { title: string; subtitle: string };
}) {
  const theme = useHostTheme();

  return (
    <div className={`module-grid${modules.length <= 6 ? ' osint' : ''}`}>
      {modules.map((m, i) => {
        const done = passedModules.includes(m.id);
        const locked = i > 0 && !passedModules.includes(modules[i - 1].id);
        const active = currentView === m.id;
        const meta = getMeta(lang, m);
        return (
          <button
            key={m.id}
            type="button"
            disabled={locked}
            onClick={() => !locked && onSelect(m.id)}
            style={{
              padding: '12px 10px', textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer',
              border: `1px solid ${active ? theme.accent.primary : theme.stroke.primary}`,
              borderRadius: 6, background: active ? theme.fill.secondary : theme.bg.elevated,
              opacity: locked ? 0.45 : 1,
            }}
          >
            <Text size="small" tone="secondary">{m.id.toUpperCase()}</Text>
            <Text size="small" weight="medium">{meta.title.replace(/^Modul[eы]? \d+: /i, '').replace(/^OSINT \d+: /i, '').slice(0, 28)}</Text>
            <div style={{ marginTop: 6 }}>
              {done && <Pill tone="success" size="sm">{t(lang, 'passed')}</Pill>}
              {locked && <Pill tone="neutral" size="sm">{t(lang, 'locked')}</Pill>}
              {!done && !locked && <Pill tone="info" size="sm">{t(lang, 'available')}</Pill>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ModuleStepBar({ lang, tab, onTab, hasGlossary, hasPractice }: { lang: Lang; tab: string; onTab: (t: string) => void; hasGlossary: boolean; hasPractice: boolean }) {
  const theme = useHostTheme();
  const steps = [
    { id: 'lesson', label: t(lang, 'stepLearn'), required: true },
    ...(hasGlossary ? [{ id: 'glossary', label: t(lang, 'stepGlossary'), required: false }] : []),
    ...(hasPractice ? [{ id: 'practice', label: t(lang, 'stepPractice'), required: false }] : []),
    { id: 'exam', label: t(lang, 'stepExam'), required: true },
  ];

  return (
    <Row gap={6} wrap>
      {steps.map((s, i) => {
        const active = tab === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onTab(s.id)}
            style={{
              padding: '8px 14px', borderRadius: 20, cursor: 'pointer', border: 'none',
              background: active ? theme.accent.primary : theme.fill.tertiary,
              color: active ? theme.text.onAccent : theme.text.primary,
              fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: 'inherit',
            }}
          >
            {i + 1}. {s.label}{!s.required ? ` (${t(lang, 'optional')})` : ''}
          </button>
        );
      })}
    </Row>
  );
}

function FinalExamView({ lang }: { lang: Lang }) {
  const theme = useHostTheme();
  const [part, setPart] = useCanvasState('final-exam-part', 'theory');
  const [certified, setCertified] = useCanvasState('final-certified', false);
  const [theoryPassed, setTheoryPassed] = useCanvasState('final-theory-passed', false);
  const [passedModules] = useCanvasState<string[]>('passed-modules', []);
  const [practicalPassed, setPracticalPassed] = useCanvasState<string[]>('final-practical-passed', []);
  const allModules = MODULES.every((m) => passedModules.includes(m.id));
  const practicalDone = practicalPassed.length >= FINAL_PRACTICAL_PASS;

  if (!allModules) {
    return (
      <Callout tone="warning" title={t(lang, 'finalExamLocked')}>
        {passedModules.length}/{MODULES.length} {t(lang, 'modulesPassed')}
      </Callout>
    );
  }

  const tryCertify = (tp: boolean, ppCount: number) => {
    if (tp && ppCount >= FINAL_PRACTICAL_PASS) setCertified(true);
  };

  return (
    <Stack gap={16}>
      <H2>{t(lang, 'finalExamTitle')}</H2>
      <Text tone="secondary">{t(lang, 'finalExamTheory')} + {t(lang, 'finalExamPractical')}</Text>

      {certified && (
        <Callout tone="success" title={t(lang, 'certified')}>{t(lang, 'finalExamPass')}</Callout>
      )}

      <Row gap={8}>
        {(['theory', 'practice'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPart(p)}
            style={{
              padding: '8px 16px', borderRadius: 20, cursor: 'pointer', border: 'none',
              background: part === p ? theme.accent.primary : theme.fill.tertiary,
              color: part === p ? theme.text.onAccent : theme.text.primary,
              fontSize: 13, fontFamily: 'inherit',
            }}
          >
            {p === 'theory' ? t(lang, 'finalExamTheory') : t(lang, 'finalExamPractical')}
            {p === 'theory' && theoryPassed && ' ✓'}
            {p === 'practice' && practicalDone && ' ✓'}
          </button>
        ))}
      </Row>

      {part === 'theory' && (
        <ExamBlock
          moduleId="final"
          exam={FINAL_THEORY_EXAM}
          passScore={FINAL_THEORY_PASS}
          lang={lang}
          onPass={() => {
            setTheoryPassed(true);
            tryCertify(true, practicalPassed.length);
          }}
          hideModulePassedCallout
          skipModuleUnlock
          forcedPassed={theoryPassed}
        />
      )}

      {part === 'practice' && (
        <Stack gap={12}>
          <Row gap={8} wrap>
            <Stat value={`${practicalPassed.length}/${FINAL_PRACTICAL_CASE_IDS.length}`} label={t(lang, 'passed')} tone={practicalDone ? 'success' : 'info'} />
            <Text size="small" tone="secondary">{FINAL_PRACTICAL_PASS}+ {lang === 'ru' ? 'кейсов с оценкой ≥60%' : 'cases with score ≥60%'}</Text>
          </Row>
          {FINAL_PRACTICAL_CASE_IDS.map((cid, i) => {
            const done = practicalPassed.includes(cid);
            return (
              <div key={cid}>
                <Card>
                  <CardHeader trailing={done ? <Pill tone="success" size="sm">{t(lang, 'passed')}</Pill> : undefined}>
                    {lang === 'ru' ? 'Практика' : 'Practice'} {i + 1}: {getCaseById(cid)?.title ?? cid}
                  </CardHeader>
                  <CardBody>
                    <FinalPracticalCase
                      caseId={cid}
                      lang={lang}
                      alreadyPassed={done}
                      onPass={() => {
                        if (!practicalPassed.includes(cid)) {
                          const next = [...practicalPassed, cid];
                          setPracticalPassed(next);
                          tryCertify(theoryPassed, next.length);
                        }
                      }}
                    />
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

function FinalPracticalCase({ caseId, lang, onPass, alreadyPassed }: { caseId: string; lang: Lang; onPass: () => void; alreadyPassed: boolean }) {
  const [result] = useCanvasState<EvalResult | null>(`case-result-${caseId}`, null);
  const passed = alreadyPassed || (result !== null && result.percent >= FINAL_PRACTICAL_MIN_SCORE);

  return (
    <Stack gap={8}>
      {!alreadyPassed && <CaseEvaluator caseId={caseId} lang={lang} />}
      {alreadyPassed && <Text tone="secondary">{t(lang, 'passed')}</Text>}
      {passed && !alreadyPassed && (
        <Button variant="primary" onClick={onPass}>{lang === 'ru' ? 'Засчитать кейс' : 'Credit this case'}</Button>
      )}
    </Stack>
  );
}

function ExamBlock({ moduleId, exam, passScore, lang, onPass, hideModulePassedCallout, skipModuleUnlock, forcedPassed, passedKey = 'passed-modules' }: {
  moduleId: string; exam: ExamQuestion[]; passScore: number; lang: Lang; onPass: () => void;
  hideModulePassedCallout?: boolean; skipModuleUnlock?: boolean; forcedPassed?: boolean; passedKey?: string;
}) {
  const theme = useHostTheme();
  const key = `exam-${moduleId}`;
  const [answers, setAnswers] = useCanvasState<Record<string, string>>(`${key}-answers`, {});
  const [submitted, setSubmitted] = useCanvasState(`${key}-submitted`, false);
  const [passedModules, setPassedModules] = useCanvasState<string[]>(passedKey, []);

  const score = exam.filter((q) => q.options.find((o) => o.id === answers[q.id])?.correct).length;
  const passed = score >= passScore;
  const alreadyPassed = forcedPassed ?? passedModules.includes(moduleId);

  const submit = () => {
    setSubmitted(true);
    if (score >= passScore) {
      if (!skipModuleUnlock && !passedModules.includes(moduleId)) {
        setPassedModules((prev) => [...prev, moduleId]);
      }
      onPass();
    }
  };

  return (
    <Stack gap={12}>
      <H3>{t(lang, 'tabExam')} ({exam.length} {lang === 'ru' ? 'вопросов' : 'questions'}, {lang === 'ru' ? 'проходной' : 'pass'}: {passScore}/{exam.length})</H3>
      {alreadyPassed && !hideModulePassedCallout && (
        <Callout tone="success" title={t(lang, 'passed')}>
          {lang === 'ru' ? 'Экзамен пройден. Следующий модуль разблокирован.' : 'Exam passed. Next module unlocked.'}
        </Callout>
      )}

      {exam.map((q, idx) => (
        <div key={q.id}>
          <Card>
            <CardHeader>{`${idx + 1}. ${q.question}`}</CardHeader>
            <CardBody>
              <Stack gap={8}>
                {q.options.map((opt) => {
                  const chosen = answers[q.id] === opt.id;
                  const showResult = submitted;
                  const isCorrect = opt.correct;
                  let border = theme.stroke.secondary;
                  if (showResult && isCorrect) border = theme.accent.primary;
                  if (showResult && chosen && !isCorrect) border = theme.text.quaternary;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => !submitted && setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        border: `1px solid ${chosen ? theme.accent.primary : border}`,
                        borderRadius: 4,
                        background: theme.bg.elevated,
                        color: theme.text.primary,
                        cursor: submitted ? 'default' : 'pointer',
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
                {submitted && (
                  <Text size="small" tone="secondary">
                    {answers[q.id] && q.options.find((o) => o.id === answers[q.id])?.correct ? 'Верно. ' : 'Неверно. '}
                    {q.explain}
                  </Text>
                )}
              </Stack>
            </CardBody>
          </Card>
        </div>
      ))}

      <Row gap={12} align="center">
        {!submitted ? (
          <Button variant="primary" onClick={submit} disabled={Object.keys(answers).length < exam.length}>
            {t(lang, 'examSubmit')}
          </Button>
        ) : (
          <>
            <Stat value={`${score}/${exam.length}`} label={t(lang, 'examResult')} tone={passed ? 'success' : 'danger'} />
            {!passed && (
              <Button variant="ghost" onClick={() => { setAnswers({}); setSubmitted(false); }}>
                {t(lang, 'examRetake')}
              </Button>
            )}
          </>
        )}
      </Row>
    </Stack>
  );
}

function CaseEvaluator({ caseId, lang }: { caseId: string; lang: Lang }) {
  const theme = useHostTheme();
  const pc = getCaseById(caseId);
  const [answer, setAnswer] = useCanvasState(`case-answer-${caseId}`, '');
  const [result, setResult] = useCanvasState<EvalResult | null>(`case-result-${caseId}`, null);

  if (!pc) {
    return <Callout tone="danger" title={t(lang, 'caseNotFound')}>ID: {caseId}</Callout>;
  }

  const content = getLocalizedCase(pc, lang);

  const runCheck = () => {
    const evalResult = evaluateAnswer(answer, pc.rubric);
    setResult(evalResult);
  };

  const placeholders: Record<string, string> = {
    ru: 'Investigation Notes: red flags, термины, RFI, решение, audit trail…',
    en: 'Investigation Notes: red flags, terms, RFI, decision, audit trail…',
    lt: 'Investigation Notes: red flags, terms, RFI, decision…',
    uk: 'Investigation Notes: red flags, терміни, RFI, рішення…',
    pl: 'Investigation Notes: red flags, terms, RFI, decision…',
    de: 'Investigation Notes: red flags, terms, RFI, decision, audit trail…',
    fr: 'Investigation Notes: red flags, terms, RFI, decision, audit trail…',
    es: 'Investigation Notes: red flags, terms, RFI, decision, audit trail…',
    it: 'Investigation Notes: red flags, terms, RFI, decision, audit trail…',
    pt: 'Investigation Notes: red flags, terms, RFI, decision, audit trail…',
  };

  return (
    <Stack gap={12}>
      {lang !== 'ru' && lang !== 'en' && UI[lang].contentEnNote && (
        <Callout tone="info" title="Note">{UI[lang].contentEnNote}</Callout>
      )}
      <H3>{t(lang, 'tasks')}</H3>
      {content.tasks.map((task, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <Text weight="medium">{i + 1}.</Text>
          <Text>{task}</Text>
        </div>
      ))}

      <Text weight="medium">{t(lang, 'investigationNotes')}</Text>
      <TextArea
        value={answer}
        onChange={(v) => {
          setAnswer(v);
          setResult(null);
        }}
        placeholder={placeholders[lang] ?? placeholders.en}
        rows={8}
      />

      <Text size="small" tone="tertiary">
        {t(lang, 'minWordsHint')}: {pc.minWords}
      </Text>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={runCheck} disabled={answer.trim().length < 20}>
          {t(lang, 'checkAnswer')}
        </Button>
      </Row>

      <Callout tone="info" title={lang === 'ru' ? 'Как оценивается ответ' : 'How answers are scored'}>
        {lang === 'ru'
          ? 'Проверка по смыслу и ключевым пунктам — не нужно повторять эталон дословно. Достаточно описать red flags, шаги, RFI и решение своими словами.'
          : 'Scored by meaning and key points — no verbatim match required.'}
      </Callout>

      {result && (
        <Callout tone={VERDICT_TONE[result.verdict]} title={`${verdictLabel(lang, result.verdict)} — ${result.percent}%`}>
          <Stack gap={8}>
            {result.remarks.map((r, i) => (
              <span key={i}><Text>{r}</Text></span>
            ))}
            {result.found.length > 0 && (
              <>
                <Text weight="medium">{t(lang, 'foundInAnswer')}:</Text>
                {result.found.map((f) => (
                  <span key={f.label}><Text size="small">+ {f.label}</Text></span>
                ))}
              </>
            )}
            {result.missing.length > 0 && (
              <>
                <Text weight="medium">{t(lang, 'missing')}:</Text>
                {result.missing.slice(0, 6).map((m) => (
                  <span key={m}><Text size="small" tone="secondary">− {m}</Text></span>
                ))}
              </>
            )}
            {result.mistakes.length > 0 && (
              <>
                <Text weight="medium">{t(lang, 'mistakes')}:</Text>
                {result.mistakes.map((m) => (
                  <span key={m}><Text size="small" tone="secondary">{m}</Text></span>
                ))}
              </>
            )}
          </Stack>
        </Callout>
      )}
    </Stack>
  );
}

function GlossaryView({ filterCategory, lang }: { filterCategory?: TermCategory | 'all'; lang: Lang }) {
  const cl = contentLang(lang);
  const catLabels = getCategoryLabels(cl);
  const [readTerms, setReadTerms] = useCanvasState<string[]>('read-terms', []);
  const [, setPanel] = useCanvasState<DetailPanelState>('detail-panel', null);
  const [catFilter, setCatFilter] = useCanvasState<TermCategory | 'all'>('glossary-cat', filterCategory ?? 'all');
  const terms = (catFilter === 'all' ? GLOSSARY : GLOSSARY.filter((t) => t.category === catFilter)).map(enrichedTerm);

  return (
    <Stack gap={8}>
      <H2>{tc(cl, 'glossaryTitle')}</H2>
      <Row gap={12} align="center">
        <Stat value={`${readTerms.length}/${GLOSSARY.length}`} label={tc(cl, 'glossaryTermsLearned')} tone={readTerms.length === GLOSSARY.length ? 'success' : 'info'} />
      </Row>
      <Select
        value={catFilter}
        onChange={(v) => setCatFilter(v as TermCategory | 'all')}
        options={[
          { value: 'all', label: tc(cl, 'glossaryAllCategories') },
          ...Object.entries(catLabels).map(([k, v]) => ({ value: k, label: v })),
        ]}
      />
      {terms.map((term) => (
        <div key={term.id}>
          <CollapsibleSection
            title={`${term.abbr} — ${term.full}`}
            leading={<Swatch color={term.color} />}
            trailing={
              <Row gap={8} align="center">
                <DetailButton label={tc(cl, 'regulationsDetails')} onClick={() => setPanel({ kind: 'term', id: term.id })} />
                <Checkbox
                  checked={readTerms.includes(term.id)}
                  onChange={(c) =>
                    setReadTerms((prev) => (c ? [...new Set([...prev, term.id])] : prev.filter((id) => id !== term.id)))
                  }
                  label={t(lang, 'understood')}
                />
              </Row>
            }
          >
            <Stack gap={6} style={{ paddingLeft: 20 }}>
              <Pill tone="neutral" size="sm">{catLabels[term.category]}</Pill>
              <Text>{term.simple}</Text>
              <Text size="small" tone="secondary">{tc(cl, 'glossaryExample')} {term.example}</Text>
              <DetailButton label={cl === 'ru' ? 'Полное описание + English' : 'Full description + English'} onClick={() => setPanel({ kind: 'term', id: term.id })} />
            </Stack>
          </CollapsibleSection>
        </div>
      ))}
    </Stack>
  );
}

function RegulationsView({ lang }: { lang: Lang }) {
  const cl = contentLang(lang);
  const allLabel = cl === 'ru' ? 'Все' : 'All';
  const [, setPanel] = useCanvasState<DetailPanelState>('detail-panel', null);
  const [region, setRegion] = useCanvasState('reg-region', allLabel);
  const filtered = region === allLabel ? REGULATIONS : REGULATIONS.filter((r) => r.region === region);
  const regions = [allLabel, ...REGIONS.filter((r) => r !== 'Все' && r !== 'All')];

  return (
    <Stack gap={16}>
      <H2>{tc(cl, 'regulationsTitle')}</H2>
      <Text tone="secondary">{tc(cl, 'regulationsSubtitle')}</Text>
      <Select value={region} onChange={setRegion} options={regions.map((r) => ({ value: r, label: r }))} />
      <Grid columns={2} gap={12}>
        {filtered.map((reg) => (
          <div key={reg.id}>
            <Card>
              <CardBody>
                <Stack gap={8}>
                  <Row gap={8} align="center">
                    <Text weight="medium">{reg.flag} {reg.country}</Text>
                    <Pill tone="neutral" size="sm">{reg.region}</Pill>
                  </Row>
                  <Text size="small">{reg.name}</Text>
                  <Text size="small" tone="secondary">{reg.summary}</Text>
                  <Row gap={8}>
                    <DetailButton label={tc(cl, 'regulationsDetails')} onClick={() => setPanel({ kind: 'regulation', id: reg.id })} />
                  </Row>
                </Stack>
              </CardBody>
            </Card>
          </div>
        ))}
      </Grid>
      <Callout tone="info" title={cl === 'ru' ? 'Remote compliance' : 'Remote compliance'}>
        {cl === 'ru'
          ? 'При remote work применяются правила юрисдикции employer entity (EU/UK), не только страны проживания.'
          : 'For remote work, employer entity jurisdiction rules (EU/UK) apply, not only country of residence.'}
      </Callout>
      <Table
        headers={[tc(cl, 'regulationsRegion'), tc(cl, 'regulationsCountry'), 'SAR', 'FIU']}
        rows={regions.filter((r) => r !== allLabel).map((reg) => {
          const items = REGULATIONS.filter((r) => r.region === reg);
          return [reg, String(items.length), items.map((i) => i.sarName).join(', '), items.map((i) => i.fiu).join('; ')];
        })}
      />
    </Stack>
  );
}

function EnglishView() {
  const [, setPanel] = useCanvasState<DetailPanelState>('detail-panel', null);
  const [lessonId, setLessonId] = useCanvasState('english-lesson', 'en-basics');
  const [catFilter, setCatFilter] = useCanvasState<EnglishLesson['category'] | 'all'>('english-cat', 'all');
  const [practice, setPractice] = useCanvasState('english-practice', '');
  const [enResult, setEnResult] = useCanvasState<EvalResult | null>('english-result', null);

  const filteredLessons = catFilter === 'all' ? ENGLISH_LESSONS : ENGLISH_LESSONS.filter((l) => l.category === catFilter);
  const lesson = ENGLISH_LESSONS.find((l) => l.id === lessonId) ?? filteredLessons[0];

  const checkEnglish = () => {
    const rubric: RubricCriterion[] = lesson.vocabulary.map((v) => ({
      id: v.term,
      label: v.term,
      weight: 15,
      patterns: [[v.term.toLowerCase(), ...v.meaning.toLowerCase().split(' ').slice(0, 2)]],
    }));
    rubric.push({
      id: 'exercise',
      label: 'Выполнение упражнения',
      weight: 25,
      required: true,
      patterns: [['pep', 'edd', 'sar', 'rfi', 'sanction', 'alert', 'due diligence', 'sow', 'ubo', 'suspicious', 'transaction', 'compliance', 'turnover', 'revenue', 'invoice', 'profit', 'balance']],
    });
    setEnResult(evaluateAnswer(practice, rubric));
  };

  return (
    <Stack gap={16}>
      <Callout tone="success" title="English: Technical + Economic + Banking">
        8 уроков с аудио (британское произношение). Нажми ▶ Audio чтобы услышать фразу. Economic English — для EDD, trade ML, financial statements.
      </Callout>

      <Select
        value={catFilter}
        onChange={(v) => setCatFilter(v as EnglishLesson['category'] | 'all')}
        options={[
          { value: 'all', label: 'Все категории' },
          ...Object.entries(ENGLISH_CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v })),
        ]}
      />

      <Select
        value={lesson?.id ?? 'en-basics'}
        onChange={setLessonId}
        options={filteredLessons.map((l) => ({ value: l.id, label: `${l.topic} (${l.level})` }))}
      />

      <Row gap={8} wrap>
        <DetailButton label="Полный урок" onClick={() => lesson && setPanel({ kind: 'english', id: lesson.id })} />
        <AudioButton text={lesson.phrases[0]?.en ?? ''} label="▶ Первая фраза" />
        <Button variant="ghost" onClick={() => lesson.phrases.forEach((p, i) => setTimeout(() => speakEnglish(p.en), i * 2500))}>
          ▶ Все фразы
        </Button>
      </Row>

      <H3>Фразы с аудио</H3>
      {lesson.phrases.map((p) => (
        <div key={p.en}>
          <Card>
            <CardBody>
              <Stack gap={6}>
                <Row gap={8} align="center" wrap>
                  <Text weight="medium">{p.en}</Text>
                  <AudioButton text={p.en} label="▶" />
                </Row>
                <Text size="small" tone="secondary">{p.ru}</Text>
                <Text size="small" tone="tertiary">Контекст: {p.context}</Text>
              </Stack>
            </CardBody>
          </Card>
        </div>
      ))}

      <H3>Словарь (с аудио)</H3>
      {lesson.vocabulary.map((v) => (
        <div key={v.term}>
          <Row gap={8} align="center" wrap>
            <Text weight="medium">{v.term}</Text>
            <AudioButton text={v.example} label="▶ Пример" />
            <Text size="small" tone="secondary">— {v.meaning}</Text>
          </Row>
          <Text size="small" tone="tertiary">{v.example}</Text>
        </div>
      ))}

      <H3>Практика письма</H3>
      <Callout tone="info" title="Задание">{lesson.exercise}</Callout>
      <TextArea
        value={practice}
        onChange={(v) => { setPractice(v); setEnResult(null); }}
        placeholder="Write your answer in English…"
        rows={6}
      />
      <Row gap={8} wrap>
        <Button variant="primary" onClick={checkEnglish} disabled={practice.trim().length < 20}>
          Проверить English
        </Button>
      </Row>

      {enResult && (
        <Callout tone={VERDICT_TONE[enResult.verdict]} title={`${VERDICT_LABELS[enResult.verdict]} — ${enResult.percent}%`}>
          <Stack gap={6}>
            {enResult.remarks.map((r, i) => (
              <span key={i}><Text size="small">{r}</Text></span>
            ))}
          </Stack>
        </Callout>
      )}
    </Stack>
  );
}

function ModuleGlossary({ termIds }: { termIds: string[] }) {
  const [, setPanel] = useCanvasState<DetailPanelState>('detail-panel', null);
  return (
    <Stack gap={8}>
      {termIds.map((tid) => {
        const term = enrichedTerm(GLOSSARY.find((g) => g.id === tid)!);
        return (
          <div key={tid}>
            <CollapsibleSection
              title={`${term.abbr} — ${term.full}`}
              leading={<Swatch color={term.color} />}
              trailing={<DetailButton label="Подробнее" onClick={() => setPanel({ kind: 'term', id: term.id })} />}
            >
              <Stack gap={6} style={{ paddingLeft: 20 }}>
                <Text>{term.simple}</Text>
                <Text size="small" tone="secondary">Пример: {term.example}</Text>
              </Stack>
            </CollapsibleSection>
          </div>
        );
      })}
    </Stack>
  );
}

type CaseWorkflowState = {
  status: 'open' | 'assigned' | 'rfi_sent' | 'escalated' | 'closed' | 'sar';
  timeline: Array<{ id: string; time: string; action: string; detail: string }>;
};

const EMPTY_WORKFLOW: CaseWorkflowState = { status: 'open', timeline: [] };

function ActimizeCaseConsole({ lang, cases = ALL_PRACTICE_CASES, defaultCaseId = 'case-001', statePrefix = 'case', consoleTitle }: {
  lang: Lang; cases?: PracticeCase[]; defaultCaseId?: string; statePrefix?: string; consoleTitle?: string;
}) {
  const theme = useHostTheme();
  const [category, setCategory] = useCanvasState<string>(`${statePrefix}-filter-cat`, 'all');
  const [search, setSearch] = useCanvasState(`${statePrefix}-filter-search`, '');
  const [page, setPage] = useCanvasState(`${statePrefix}-filter-page`, 0);
  const [selectedId, setSelectedId] = useCanvasState(`${statePrefix}-selected-id`, defaultCaseId);
  const [workTab, setWorkTab] = useCanvasState(`${statePrefix}-work-tab`, 'overview');
  const [assigned, setAssigned] = useCanvasState<Record<string, boolean>>(`${statePrefix}-assigned`, {});
  const [workflows, setWorkflows] = useCanvasState<Record<string, CaseWorkflowState>>(`${statePrefix}-workflows`, {});
  const [rfiDraft, setRfiDraft] = useCanvasState(`${statePrefix}-rfi-draft`, '');
  const [showRfiForm, setShowRfiForm] = useCanvasState(`${statePrefix}-show-rfi`, false);
  const pageSize = 20;

  const pushTimeline = (caseId: string, action: string, detail: string, status?: CaseWorkflowState['status']) => {
    setWorkflows((prev) => {
      const cur = prev[caseId] ?? EMPTY_WORKFLOW;
      return {
        ...prev,
        [caseId]: {
          status: status ?? cur.status,
          timeline: [{ id: `${Date.now()}`, time: new Date().toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), action, detail }, ...cur.timeline].slice(0, 15),
        },
      };
    });
  };

  const getWorkflow = (caseId: string) => workflows[caseId] ?? EMPTY_WORKFLOW;

  const caseCategories = [...new Set(cases.map((c) => c.category))];

  const filtered = cases.filter((c) => {
    if (category !== 'all' && c.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const meta = getAlertMeta(c);
      return (
        c.title.toLowerCase().includes(q) ||
        c.scenario.toLowerCase().includes(q) ||
        c.id.includes(q) ||
        meta.alertId.toLowerCase().includes(q) ||
        meta.customerId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const queueCases = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const selected = getCaseById(selectedId) ?? queueCases[0] ?? cases[0];
  const meta = selected ? getAlertMeta(selected) : null;
  const content = selected ? getLocalizedCase(selected, lang) : null;
  const wf = selected ? getWorkflow(selected.id) : EMPTY_WORKFLOW;
  const [investigationResult] = useCanvasState<EvalResult | null>(
    selected ? `case-result-${selected.id}` : 'case-result-none',
    null,
  );
  const canClose = (investigationResult?.percent ?? 0) >= 55;
  const isAssigned = selected ? (assigned[selected.id] || wf.status !== 'open') : false;

  const priorityTone = (p: string): 'danger' | 'warning' | 'info' =>
    p === 'P1' ? 'danger' : p === 'P2' ? 'warning' : 'info';

  return (
    <Stack gap={12}>
      <div style={{ border: `1px solid ${theme.stroke.primary}`, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ background: theme.fill.secondary, padding: '10px 16px', borderBottom: `1px solid ${theme.stroke.primary}` }}>
          <Row gap={12} align="center" wrap>
            <Text weight="medium">{consoleTitle ?? t(lang, 'consoleBrand')}</Text>
            <Text size="small" tone="secondary">|</Text>
            <Text size="small">{consoleTitle ? t(lang, 'navOsintCases') : t(lang, 'consoleModule')}</Text>
            <div style={{ flex: 1 }} />
            <Pill tone="neutral" size="sm">{t(lang, 'analystLabel')}: Trainee</Pill>
            <Pill tone="info" size="sm">{cases.length} {t(lang, 'queueCount')}</Pill>
          </Row>
        </div>

        <div className="case-console">
          <div className="case-queue" style={{ background: theme.fill.tertiary, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 12, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
              <Text weight="medium" size="small">{t(lang, 'queueTitle')}</Text>
              <div style={{ marginTop: 8 }}>
                <Select
                  value={category}
                  onChange={(v) => { setCategory(v); setPage(0); }}
                  options={[
                    { value: 'all', label: `${t(lang, 'filterAll')} (${cases.length})` },
                    ...caseCategories.map((cat) => ({
                      value: cat,
                      label: `${getCaseCatLabel(lang, cat)} (${cases.filter((c) => c.category === cat).length})`,
                    })),
                  ]}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <TextArea
                  value={search}
                  onChange={(v) => { setSearch(v); setPage(0); }}
                  placeholder={t(lang, 'searchCases')}
                  rows={2}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 420 }}>
              {queueCases.map((c) => {
                const m = getAlertMeta(c);
                const active = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setWorkTab('overview'); }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.stroke.tertiary}`,
                      background: active ? theme.fill.secondary : 'transparent',
                      borderLeft: active ? `3px solid ${theme.text.link}` : '3px solid transparent',
                    }}
                  >
                    <Row gap={6} align="center" wrap>
                      <Text weight="medium" size="small">{m.alertId}</Text>
                      <Pill tone={priorityTone(m.priority)} size="sm">{m.priority}</Pill>
                    </Row>
                    <Text size="small" tone="secondary">{CASE_CAT_I18N[lang][c.category]}</Text>
                    <Row gap={4} wrap style={{ marginTop: 4 }}>
                      <Pill tone="neutral" size="sm">{m.status}</Pill>
                      {assigned[c.id] && <Pill tone="success" size="sm">Assigned</Pill>}
                    </Row>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 8, borderTop: `1px solid ${theme.stroke.tertiary}` }}>
              <Row gap={6} align="center">
                <Button variant="ghost" disabled={safePage <= 0} onClick={() => setPage(safePage - 1)}>{t(lang, 'prevPage')}</Button>
                <Text size="small">{t(lang, 'pageOf')} {safePage + 1}/{totalPages}</Text>
                <Button variant="ghost" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>{t(lang, 'nextPage')}</Button>
              </Row>
            </div>
          </div>

          <div className="case-main">
            {selected && meta && content ? (
              <>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.stroke.primary}`, background: theme.fill.secondary }}>
                  <Row gap={8} align="center" wrap>
                    <H3 style={{ margin: 0 }}>Alert {meta.alertId}</H3>
                    <Pill tone={priorityTone(meta.priority)} size="sm">{meta.priority}</Pill>
                    <Pill tone="warning" size="sm">{meta.status}</Pill>
                    <Pill tone="neutral" size="sm">SLA {meta.sla}</Pill>
                  </Row>
                  <Text size="small" tone="secondary">{meta.rule}</Text>
                </div>

                <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
                  <Row gap={6} wrap>
                    {(['overview', 'customer', 'screening', 'transactions', 'investigation'] as const).map((tab) => (
                      <span key={tab}>
                        <Button
                          variant={workTab === tab ? 'primary' : 'ghost'}
                          onClick={() => setWorkTab(tab)}
                        >
                          {tab === 'overview' ? t(lang, 'tabOverview') :
                           tab === 'customer' ? t(lang, 'tabCustomer') :
                           tab === 'screening' ? t(lang, 'tabScreening') :
                           tab === 'transactions' ? t(lang, 'tabTransactions') :
                           t(lang, 'tabInvestigation')}
                        </Button>
                      </span>
                    ))}
                  </Row>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                  {workTab === 'overview' && (
                    <Stack gap={12}>
                      <Grid columns={4} gap={8}>
                        <Stat value={meta.customerId} label={t(lang, 'customerId')} tone="info" />
                        <Stat value={String(meta.riskScore)} label={t(lang, 'riskScore')} tone={meta.riskScore > 70 ? 'danger' : 'warning'} />
                        <Stat value={meta.priority} label={t(lang, 'priority')} tone={meta.priority === 'P1' ? 'danger' : meta.priority === 'P2' ? 'warning' : 'info'} />
                        <Stat value={meta.sla} label={t(lang, 'slaRemaining')} tone="warning" />
                      </Grid>
                      <Callout tone="info" title={t(lang, 'scenario')}>{content.scenario}</Callout>
                      <Table
                        headers={[t(lang, 'ruleTriggered'), 'Category', 'Module']}
                        rows={[[meta.rule, CASE_CAT_I18N[lang][selected.category], selected.moduleId.toUpperCase()]]}
                      />
                      <Text weight="medium">Audit trail</Text>
                      {wf.timeline.length === 0 ? (
                        <Text size="small" tone="secondary">Назначь alert себе и начни расследование — шаги появятся здесь.</Text>
                      ) : (
                        wf.timeline.map((ev) => (
                          <div key={ev.id} className="timeline-item">
                            <div className="timeline-dot" />
                            <div>
                              <Text size="small" weight="medium">{ev.action}</Text>
                              <Text size="small" tone="secondary">{ev.time} — {ev.detail}</Text>
                            </div>
                          </div>
                        ))
                      )}
                    </Stack>
                  )}

                  {workTab === 'customer' && (
                    <Stack gap={12}>
                      <Table
                        headers={['Field', 'Value']}
                        rows={[
                          [t(lang, 'customerId'), meta.customerId],
                          ['Segment', selected.difficulty === 'senior' ? 'High Risk' : 'Retail'],
                          [t(lang, 'riskScore'), String(meta.riskScore)],
                          [t(lang, 'profileMismatch'), selected.category === 'tm' || selected.category === 'fraud' ? 'Yes — review' : 'Pending review'],
                          ['Onboarding', selected.category === 'kyc' ? 'In progress' : 'Active'],
                        ]}
                      />
                    </Stack>
                  )}

                  {workTab === 'screening' && (
                    <Stack gap={12}>
                      <Text weight="medium">{t(lang, 'worldCheck')}</Text>
                      <Table
                        headers={['List', 'Match', 'Status']}
                        rows={
                          selected.category === 'sanctions' || selected.category === 'pep'
                            ? [['OFAC SDN / PEP', '87–92%', t(lang, 'screeningPending')], ['EU Consolidated', 'Review', 'Open']]
                            : [['PEP', '—', t(lang, 'noHits')], ['Sanctions', '—', t(lang, 'noHits')], ['Adverse Media', selected.category === 'osint' ? 'Hits found' : '—', selected.category === 'osint' ? t(lang, 'screeningPending') : 'Clean']]}
                      />
                    </Stack>
                  )}

                  {workTab === 'transactions' && (
                    <Stack gap={12}>
                      <Text weight="medium">{t(lang, 'mockTxn')}</Text>
                      <Table
                        headers={['Date', 'Type', 'Amount', 'Counterparty']}
                        rows={[
                          ['2026-06-25', 'Inbound', selected.category === 'crypto' ? 'USDT 45,000' : 'EUR 9,900', 'Third party'],
                          ['2026-06-25', 'Outbound', selected.category === 'crypto' ? 'Withdrawal' : 'EUR 115,000', selected.category === 'hrj' ? 'UAE Bank' : 'Crypto exchange'],
                          ['2026-06-24', 'Inbound', 'EUR 5,000', 'Unknown individual'],
                        ]}
                      />
                    </Stack>
                  )}

                  {workTab === 'investigation' && (
                    <CaseEvaluator caseId={selected.id} lang={lang} />
                  )}
                </div>

                <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.stroke.primary}`, background: theme.fill.tertiary }}>
                  {showRfiForm && (
                    <Stack gap={8} style={{ marginBottom: 12 }}>
                      <Text size="small" weight="medium">RFI — запрос клиенту (без tipping off)</Text>
                      <TextArea
                        value={rfiDraft}
                        onChange={setRfiDraft}
                        rows={3}
                        placeholder="Например: Просим подтвердить цель переводов и предоставить контракт/invoice за период 01–15.06..."
                      />
                      <Row gap={8} wrap>
                        <Button
                          variant="primary"
                          disabled={rfiDraft.trim().length < 20 || !isAssigned}
                          onClick={() => {
                            if (!selected) return;
                            pushTimeline(selected.id, 'RFI sent', rfiDraft.slice(0, 120), 'rfi_sent');
                            setShowRfiForm(false);
                            setRfiDraft('');
                          }}
                        >
                          Отправить RFI
                        </Button>
                        <Button variant="ghost" onClick={() => setShowRfiForm(false)}>Отмена</Button>
                      </Row>
                    </Stack>
                  )}
                  <Row gap={8} wrap>
                    <Button
                      variant="ghost"
                      disabled={!selected || isAssigned}
                      onClick={() => {
                        if (!selected) return;
                        setAssigned((a) => ({ ...a, [selected.id]: true }));
                        pushTimeline(selected.id, 'Assigned', 'Alert назначен на Trainee', 'assigned');
                      }}
                    >
                      {t(lang, 'assignToMe')}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!isAssigned || wf.status === 'rfi_sent'}
                      onClick={() => setShowRfiForm(true)}
                    >
                      {t(lang, 'sendRfi')}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!isAssigned || (investigationResult?.percent ?? 0) < 40}
                      onClick={() => {
                        if (!selected) return;
                        pushTimeline(selected.id, 'Escalated to MLRO', 'Senior review requested', 'escalated');
                      }}
                    >
                      {t(lang, 'escalateMlro')}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!canClose || wf.status === 'closed'}
                      onClick={() => {
                        if (!selected) return;
                        pushTimeline(selected.id, 'Alert closed', `Resolution: ${investigationResult?.percent ?? 0}% analysis score`, 'closed');
                      }}
                    >
                      {t(lang, 'closeAlert')}
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!isAssigned || wf.status !== 'escalated' || (investigationResult?.percent ?? 0) < 60}
                      onClick={() => {
                        if (!selected) return;
                        pushTimeline(selected.id, 'SAR filed', 'Submitted to FIU via MLRO', 'sar');
                      }}
                    >
                      {t(lang, 'fileSar')}
                    </Button>
                  </Row>
                  {!isAssigned && (
                    <Text size="small" tone="secondary" style={{ marginTop: 8 }}>Сначала назначь alert себе (Assign to me).</Text>
                  )}
                  {isAssigned && !canClose && workTab !== 'investigation' && (
                    <Text size="small" tone="secondary" style={{ marginTop: 8 }}>Перейди во вкладку Investigation и отправь анализ (≥55% для закрытия).</Text>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: 32 }}>
                <Text tone="secondary">{t(lang, 'selectCase')}</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </Stack>
  );
}

function CaseLibraryView({ lang }: { lang: Lang }) {
  return <ActimizeCaseConsole lang={lang} />;
}

function MockDashboardPreview({ variant, title, panelIndex }: { variant: DashboardVariant; title: string; panelIndex: number }) {
  const theme = useHostTheme();
  const w = 320;
  const h = 180;
  const bg = theme.fill.secondary;
  const bar = theme.fill.tertiary;
  const accent = theme.text.link;
  const danger = '#ef4444';
  const warn = '#f59e0b';
  const ok = '#22c55e';
  const labels = ['Main console', 'Analyst queue', 'Reports & KPIs'];
  const panelTitle = labels[panelIndex] ?? labels[0];

  const renderContent = () => {
    if (variant === 'tm') {
      return (
        <>
          <rect x={8} y={28} width={w - 16} height={24} fill={bar} rx={2} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={12} y={58 + i * 22} width={w - 24} height={18} fill={i === panelIndex % 3 ? accent + '22' : bg} stroke={theme.stroke.tertiary} rx={2} />
              <rect x={16} y={62 + i * 22} width={48} height={10} fill={i % 2 ? danger : warn} opacity={0.7} rx={1} />
              <rect x={70} y={62 + i * 22} width={100} height={10} fill={theme.stroke.secondary} opacity={0.5} rx={1} />
            </g>
          ))}
        </>
      );
    }
    if (variant === 'screening') {
      return (
        <>
          <rect x={12} y={36} width={120} height={60} fill={bg} stroke={theme.stroke.primary} rx={3} />
          <rect x={140} y={36} width={168} height={60} fill={bg} stroke={theme.stroke.primary} rx={3} />
          <text x={72} y={58} textAnchor="middle" fill={theme.text.secondary} fontSize={9}>Hit score</text>
          <text x={224} y={58} textAnchor="middle" fill={danger} fontSize={14} fontWeight="bold">87%</text>
          <rect x={12} y={104} width={296} height={14} fill={ok} opacity={0.3} rx={2} />
          <rect x={12} y={124} width={296} height={14} fill={warn} opacity={0.3} rx={2} />
          <rect x={12} y={144} width={296} height={14} fill={danger} opacity={0.3} rx={2} />
        </>
      );
    }
    if (variant === 'kyc') {
      return (
        <>
          <rect x={20} y={40} width={90} height={110} fill={bg} stroke={theme.stroke.primary} rx={2} />
          <rect x={130} y={40} width={180} height={20} fill={bar} rx={2} />
          <rect x={130} y={68} width={180} height={20} fill={bar} rx={2} />
          <rect x={130} y={96} width={180} height={20} fill={bar} rx={2} />
          <circle cx={65} cy={95} r={28} fill={ok} opacity={0.25} />
          <text x={220} y={110} textAnchor="middle" fill={ok} fontSize={11}>Verified ✓</text>
        </>
      );
    }
    if (variant === 'crypto') {
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={40 + i * 55} cy={90 + (i % 2) * 30} r={14} fill={i === 2 ? danger : accent} opacity={0.7} />
          ))}
          {[[0, 1], [1, 2], [2, 3], [3, 4]].map(([a, b], i) => (
            <line key={i} x1={40 + a * 55} y1={90 + (a % 2) * 30} x2={40 + b * 55} y2={90 + (b % 2) * 30} stroke={theme.stroke.secondary} strokeWidth={1.5} />
          ))}
          <rect x={12} y={150} width={80} height={18} fill={danger} opacity={0.6} rx={2} />
          <text x={56} y={163} textAnchor="middle" fill="#fff" fontSize={8}>Mixer 12%</text>
        </>
      );
    }
    if (variant === 'case') {
      return (
        <>
          <line x1={40} y1={50} x2={40} y2={150} stroke={accent} strokeWidth={2} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={40} cy={55 + i * 32} r={6} fill={i <= panelIndex % 3 ? accent : bar} />
              <rect x={56} y={48 + i * 32} width={240} height={22} fill={bar} rx={2} />
            </g>
          ))}
        </>
      );
    }
    if (variant === 'network') {
      const nodes = [[160, 50], [80, 100], [240, 100], [120, 150], [200, 150]];
      return (
        <>
          {[[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]].map(([a, b], i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={theme.stroke.secondary} />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 0 ? 16 : 12} fill={i === 0 ? danger : accent} opacity={0.75} />
          ))}
        </>
      );
    }
    if (variant === 'osint') {
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={12} y={40 + i * 28} width={296} height={22} fill={bar} rx={2} />
              <rect x={16} y={46 + i * 28} width={180} height={8} fill={theme.stroke.secondary} opacity={0.5} rx={1} />
            </g>
          ))}
        </>
      );
    }
    return (
      <>
        <rect x={12} y={40} width={140} height={100} fill={bar} rx={3} />
        <rect x={168} y={40} width={140} height={46} fill={ok} opacity={0.25} rx={3} />
        <rect x={168} y={94} width={140} height={46} fill={accent} opacity={0.2} rx={3} />
      </>
    );
  };

  return (
    <div style={{ border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 4, overflow: 'hidden', background: bg }}>
      <div style={{ padding: '6px 10px', background: bar, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
        <Text size="small" weight="medium">{title} — {panelTitle}</Text>
      </div>
      <svg width={w} height={h} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h}`}>
        <rect width={w} height={h} fill={bg} />
        <rect x={0} y={0} width={w} height={22} fill={bar} />
        <circle cx={14} cy={11} r={4} fill={danger} opacity={0.8} />
        <circle cx={26} cy={11} r={4} fill={warn} opacity={0.8} />
        <circle cx={38} cy={11} r={4} fill={ok} opacity={0.8} />
        <text x={w / 2} y={15} textAnchor="middle" fill={theme.text.secondary} fontSize={9}>{title}</text>
        {renderContent()}
      </svg>
    </div>
  );
}

function SoftwareCatalogView({ lang }: { lang: Lang }) {
  const theme = useHostTheme();
  const [catFilter, setCatFilter] = useCanvasState<string>('software-cat', 'all');
  const [selectedId, setSelectedId] = useCanvasState('software-selected-id', 'actimize');
  const [dashTab, setDashTab] = useCanvasState('software-dash-tab', '0');

  const cats = Object.keys(SOFTWARE_CATEGORY_LABELS) as SoftwareProvider['category'][];
  const filtered = catFilter === 'all' ? SOFTWARE_PROVIDERS : SOFTWARE_PROVIDERS.filter((s) => s.category === catFilter);
  const selected = getSoftwareFull(SOFTWARE_PROVIDERS.find((s) => s.id === selectedId) ?? SOFTWARE_PROVIDERS[0]);
  const loc = getSoftwareLocalized(selected, lang);

  return (
    <Stack gap={12}>
      <H2>{t(lang, 'swCatalogTitle')} — {SOFTWARE_PROVIDERS.length}</H2>
      <Text tone="secondary">{t(lang, 'swCatalogHint')}</Text>

      <div style={{ border: `1px solid ${theme.stroke.primary}`, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ background: theme.fill.secondary, padding: '10px 16px', borderBottom: `1px solid ${theme.stroke.primary}` }}>
          <Row gap={12} align="center" wrap>
            <Text weight="medium">AML Software Hub</Text>
            <div style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
              <Select
                value={catFilter}
                onChange={setCatFilter}
                options={[
                  { value: 'all', label: `${t(lang, 'swAllCategories')} (${SOFTWARE_PROVIDERS.length})` },
                  ...cats.map((c) => ({
                    value: c,
                    label: `${getSoftwareCategoryLabel(lang, c)} (${SOFTWARE_PROVIDERS.filter((s) => s.category === c).length})`,
                  })),
                ]}
              />
            </div>
            <Pill tone="info" size="sm">{filtered.length} systems</Pill>
          </Row>
        </div>

        <div style={{ display: 'flex', minHeight: 620 }}>
          <div style={{ width: 300, borderRight: `1px solid ${theme.stroke.primary}`, background: theme.fill.tertiary, overflowY: 'auto', maxHeight: 620 }}>
            {cats.map((cat) => {
              const items = filtered.filter((s) => s.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <div style={{ padding: '8px 12px', background: theme.fill.secondary, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
                    <Text size="small" weight="medium">{getSoftwareCategoryLabel(lang, cat)}</Text>
                  </div>
                  {items.map((sw) => {
                    const active = sw.id === selected.id;
                    return (
                      <button
                        key={sw.id}
                        type="button"
                        onClick={() => { setSelectedId(sw.id); setDashTab('0'); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', cursor: 'pointer',
                          border: 'none', borderBottom: `1px solid ${theme.stroke.tertiary}`,
                          background: active ? theme.fill.secondary : 'transparent',
                          borderLeft: active ? `3px solid ${theme.text.link}` : '3px solid transparent',
                        }}
                      >
                        <Text weight="medium" size="small">{sw.name}</Text>
                        <Text size="small" tone="secondary">{sw.vendor}</Text>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 620 }}>
            <Stack gap={14}>
              <Row gap={8} align="center" wrap>
                <H3>{selected.name}</H3>
                <Pill tone="info" size="sm">{getSoftwareCategoryLabel(lang, selected.category)}</Pill>
                <Pill tone="neutral" size="sm">{selected.vendor}</Pill>
              </Row>

              <Text>{loc.summary}</Text>
              <Text>{loc.detail}</Text>

              <Row gap={8} wrap>
                <Link href={selected.websiteUrl}>{t(lang, 'swVisitVendor')}</Link>
              </Row>

              <Divider />

              <Text weight="medium">{t(lang, 'swUsedFor')}</Text>
              {loc.usedFor.map((u) => (
                <span key={u}><Text size="small">• {u}</Text></span>
              ))}

              <Table
                headers={[t(lang, 'resourceType'), t(lang, 'resource')]}
                rows={[
                  [t(lang, 'swTypicalUsers'), loc.typicalUsers],
                  [t(lang, 'resourceType'), getSoftwareCategoryLabel(lang, selected.category)],
                  ['Vendor', selected.vendor],
                ]}
              />

              <Text weight="medium">{t(lang, 'swWorkflow')}</Text>
              <FlowDiagram
                steps={[
                  { id: 'w1', label: 'Login / Queue' },
                  { id: 'w2', label: lang === 'ru' ? 'Review alert/hit' : 'Review alert/hit' },
                  { id: 'w3', label: 'Document' },
                  { id: 'w4', label: 'Escalate / Close' },
                ]}
                edges={[{ from: 'w1', to: 'w2' }, { from: 'w2', to: 'w3' }, { from: 'w3', to: 'w4' }]}
              />

              <Text weight="medium">{t(lang, 'swDashboards')}</Text>
              <Select
                value={dashTab}
                onChange={setDashTab}
                options={[
                  { value: '0', label: lang === 'ru' ? 'Главная консоль' : 'Main console' },
                  { value: '1', label: lang === 'ru' ? 'Очередь аналитика' : 'Analyst queue' },
                  { value: '2', label: lang === 'ru' ? 'Отчёты и KPI' : 'Reports & KPIs' },
                ]}
              />
              <Grid columns={1} gap={12}>
                <MockDashboardPreview variant={selected.dashboardVariant} title={selected.name} panelIndex={Number(dashTab)} />
                <MockDashboardPreview variant={selected.dashboardVariant} title={selected.name} panelIndex={(Number(dashTab) + 1) % 3} />
                <MockDashboardPreview variant={selected.dashboardVariant} title={selected.name} panelIndex={(Number(dashTab) + 2) % 3} />
              </Grid>
            </Stack>
          </div>
        </div>
      </div>

      <Callout tone="info" title={lang === 'ru' ? 'Как учиться' : 'How to learn'}>
        {lang === 'ru'
          ? 'Опциональный каталог — для самостоятельного изучения инструментов индустрии.'
          : 'Optional catalog — for self-study of industry tools.'}
      </Callout>
    </Stack>
  );
}

function CryptoVerificationView({ lang }: { lang: Lang }) {
  const cl = contentLang(lang);
  const cryptoCaseCount = ALL_PRACTICE_CASES.filter((c) => c.category === 'crypto' || c.category === 'defi').length;

  return (
    <Stack gap={16}>
      <H2>{tc(cl, 'cryptoTitle')}</H2>
      <Text tone="secondary">
        {cl === 'ru'
          ? `Полный workflow crypto compliance analyst: от VASP identification до SAR. ${cryptoCaseCount} практических кейсов в полигоне (категории Crypto + DeFi).`
          : `Full crypto compliance workflow: VASP identification to SAR. ${cryptoCaseCount} practice cases in the polygon (Crypto + DeFi).`}
      </Text>

      <FlowDiagram
        steps={CRYPTO_CHECKS.map((c) => ({ id: c.id, label: `${c.step}. ${c.title}` }))}
        edges={CRYPTO_CHECKS.slice(1).map((c, i) => ({ from: CRYPTO_CHECKS[i].id, to: c.id }))}
      />

      {CRYPTO_CHECKS.map((step) => (
        <div key={step.id}>
          <Card>
          <CardHeader>{cl === 'ru' ? 'Шаг' : 'Step'} {step.step}: {step.title}</CardHeader>
          <CardBody>
            <Stack gap={10}>
              <Text weight="medium">{tc(cl, 'cryptoAction')}</Text>
              <Text>{step.action}</Text>
              <Text weight="medium">Инструменты</Text>
              <Row gap={6} wrap>
                {step.tools.map((t) => (
                  <span key={t}><Pill tone="info" size="sm">{t}</Pill></span>
                ))}
              </Row>
              <Text weight="medium">Red flags</Text>
              {step.redFlags.map((f) => (
                <span key={f}><Text size="small">• {f}</Text></span>
              ))}
              <Callout tone="warning" title={tc(cl, 'cryptoTip')}>{step.analystTip}</Callout>
            </Stack>
          </CardBody>
          </Card>
        </div>
      ))}

    </Stack>
  );
}

function ModuleView({ moduleId, lang, onNavigate, track = 'aml' }: {
  moduleId: string; lang: Lang; onNavigate: (view: string) => void; track?: 'aml' | 'osint';
}) {
  const theme = useHostTheme();
  const modules = track === 'osint' ? OSINT_MODULES : getCourseModules(contentLang(lang));
  const metaMap = track === 'osint' ? OSINT_MODULE_META : getCourseModuleMeta(contentLang(lang));
  const passedKey = track === 'osint' ? 'passed-osint-modules' : 'passed-modules';
  const getMeta = track === 'osint' ? getOsintModuleMeta : getModuleMeta;

  const mod = modules.find((m) => m.id === moduleId)!;
  const meta = track === 'aml' ? { title: mod.title, subtitle: mod.subtitle } : getMeta(lang, mod);
  const modMeta = metaMap[moduleId];
  const courseMod = track === 'aml' ? (mod as CourseModule) : null;
  const practiceTasks = courseMod?.practiceTasks ?? [];
  const hasPractice = !!(mod.practiceCaseId || practiceTasks.length > 0);
  const [tab, setTab] = useCanvasState(`${track}-mod-tab-${moduleId}`, 'lesson');
  const [passedModules] = useCanvasState<string[]>(passedKey, []);

  const modIndex = modules.findIndex((m) => m.id === moduleId);
  const prevPassed = modIndex === 0 || passedModules.includes(modules[modIndex - 1].id);
  const isPassed = passedModules.includes(moduleId);
  const nextMod = modules[modIndex + 1];
  const nextView = track === 'osint' ? nextMod?.id : nextMod?.id;

  if (!mod) {
    return <Callout tone="danger" title="Module not found">{moduleId}</Callout>;
  }

  if (!prevPassed && modIndex > 0) {
    return (
      <Callout tone="warning" title={t(lang, 'moduleLocked')}>
        {getMeta(lang, modules[modIndex - 1]).title}
      </Callout>
    );
  }

  return (
    <Stack gap={16}>
      <Row gap={8} align="center" wrap>
        <H2>{meta.title}</H2>
        {isPassed && <Pill tone="success" size="sm">{t(lang, 'passed')}</Pill>}
        <Pill tone="neutral" size="sm">{mod.id.toUpperCase()} · {modIndex + 1}/{modules.length}</Pill>
      </Row>
      <Text tone="secondary">{meta.subtitle}</Text>

      <ModuleStepBar
        lang={lang}
        tab={tab}
        onTab={setTab}
        hasGlossary={mod.termIds.length > 0}
        hasPractice={hasPractice}
      />

      {tab === 'lesson' && modMeta && (
        <Card>
          <CardHeader>{t(lang, 'moduleObjectives')}</CardHeader>
          <CardBody>
            <Stack gap={6}>
              {modMeta.objectives.map((o) => (
                <span key={o}><Text size="small">• {o}</Text></span>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}

      {tab === 'lesson' && (
        <Stack gap={16}>
          {mod.lessons.map((lesson, i) => (
            <div key={i}>
              <Card>
                <CardHeader>{lesson.title}</CardHeader>
                <CardBody><LessonProse body={lesson.body} /></CardBody>
              </Card>
            </div>
          ))}
          {modMeta && (
            <Card>
              <CardHeader>{t(lang, 'moduleTakeaways')}</CardHeader>
              <CardBody>
                <Stack gap={6}>
                  {modMeta.takeaways.map((tk) => (
                    <span key={tk}><Text size="small">→ {tk}</Text></span>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          )}
          {modMeta && (
            <Callout tone="info" title={t(lang, 'proTip')}>{modMeta.proTip}</Callout>
          )}
          {moduleId === 'm1' && (
            <Card>
              <CardHeader>{t(lang, 'lessonFlowTitle')}</CardHeader>
              <CardBody>
                <FlowDiagram
                  steps={[
                    { id: 'm1a', label: 'Customer' }, { id: 'm1b', label: 'CDD / KYC' },
                    { id: 'm1c', label: 'Risk Rating' }, { id: 'm1d', label: 'Monitoring' }, { id: 'm1e', label: 'SAR' },
                  ]}
                  edges={[
                    { from: 'm1a', to: 'm1b' }, { from: 'm1b', to: 'm1c' },
                    { from: 'm1c', to: 'm1d' }, { from: 'm1d', to: 'm1e' },
                  ]}
                />
              </CardBody>
            </Card>
          )}
          {moduleId === 'm4' && (
            <Card>
              <CardHeader>{t(lang, 'lessonFlowTitle')}</CardHeader>
              <CardBody>
                <FlowDiagram
                  steps={[
                    { id: 'e1', label: 'Trigger' }, { id: 'e2', label: lang === 'ru' ? 'OSINT / реестры' : 'OSINT / registries' },
                    { id: 'e3', label: 'UBO' }, { id: 'e4', label: 'RFI' },
                    { id: 'e5', label: lang === 'ru' ? 'Отчёт MLRO' : 'MLRO report' },
                  ]}
                  edges={[
                    { from: 'e1', to: 'e2' }, { from: 'e2', to: 'e3' },
                    { from: 'e3', to: 'e4' }, { from: 'e4', to: 'e5' },
                  ]}
                />
              </CardBody>
            </Card>
          )}
          {moduleId === 'm5' && (
            <Card>
              <CardHeader>{t(lang, 'lessonFlowTitle')}</CardHeader>
              <CardBody>
                <FlowDiagram
                  steps={[
                    { id: 'a1', label: 'Alert' }, { id: 'a2', label: lang === 'ru' ? 'Контекст' : 'Context' },
                    { id: 'a3', label: 'Red flags' }, { id: 'a4', label: 'RFI' },
                    { id: 'a5', label: lang === 'ru' ? 'Решение' : 'Decision' }, { id: 'a6', label: 'SAR / Close' },
                  ]}
                  edges={[
                    { from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' },
                    { from: 'a3', to: 'a4' }, { from: 'a4', to: 'a5' }, { from: 'a5', to: 'a6' },
                  ]}
                />
              </CardBody>
            </Card>
          )}
          {moduleId === 'm6' && (
            <Card>
              <CardHeader>Crypto AML Flow</CardHeader>
              <CardBody>
                <FlowDiagram
                  steps={[
                    { id: 'c1', label: 'VASP / Wallet' }, { id: 'c2', label: 'KYT Screen' },
                    { id: 'c3', label: 'Travel Rule' }, { id: 'c4', label: 'Trace' }, { id: 'c5', label: 'Decision' },
                  ]}
                  edges={[
                    { from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' },
                    { from: 'c3', to: 'c4' }, { from: 'c4', to: 'c5' },
                  ]}
                />
              </CardBody>
            </Card>
          )}

          <div style={{ padding: 20, borderRadius: 8, border: `2px solid ${theme.accent.primary}`, background: theme.fill.tertiary }}>
            <Stack gap={12}>
              <Text weight="medium">{t(lang, 'examUnlockTitle')}</Text>
              <Text size="small" tone="secondary">{t(lang, 'examUnlockBody')}</Text>
              <Button variant="primary" onClick={() => setTab('exam')}>{t(lang, 'goToExam')}</Button>
            </Stack>
          </div>
        </Stack>
      )}

      {tab === 'glossary' && mod.termIds.length > 0 && <ModuleGlossary termIds={mod.termIds} />}

      {tab === 'glossary' && mod.termIds.length === 0 && (
        <Text tone="secondary">{lang === 'ru' ? 'В этом модуле нет отдельных терминов — см. полный глоссарий.' : 'No module-specific terms — see full glossary.'}</Text>
      )}

      {tab === 'practice' && (
        <Stack gap={12}>
          {practiceTasks.length > 0 && (
            <>
              <H3>{t(lang, 'tabPracticeTasks')}</H3>
              <PracticeTasksPanel tasks={practiceTasks} lang={lang} />
            </>
          )}
          {mod.practiceCaseId && (
            <>
              {practiceTasks.length > 0 && <Divider />}
              <H3>{t(lang, 'tabPractice')} — Case Manager</H3>
              <CaseEvaluator caseId={mod.practiceCaseId} lang={lang} />
            </>
          )}
          {!hasPractice && (
            <Text tone="secondary">{lang === 'ru' ? 'Практика для этого модуля скоро появится.' : 'Practice for this module coming soon.'}</Text>
          )}
        </Stack>
      )}

      {tab === 'exam' && (
        <Stack gap={16}>
          <ExamBlock moduleId={moduleId} exam={mod.exam} passScore={mod.passScore} lang={lang} onPass={() => {}} passedKey={passedKey} />
          {isPassed && nextMod && (
            <Button variant="primary" onClick={() => onNavigate(nextView!)}>{t(lang, 'nextModule')} {getMeta(lang, nextMod).title}</Button>
          )}
          {isPassed && !nextMod && track === 'osint' && (
            <Button variant="primary" onClick={() => onNavigate('osint-final-exam')}>{t(lang, 'osintFinalExam')} →</Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function OsintFinalExamView({ lang }: { lang: Lang }) {
  const theme = useHostTheme();
  const [part, setPart] = useCanvasState('osint-final-part', 'theory');
  const [certified, setCertified] = useCanvasState('osint-certified', false);
  const [theoryPassed, setTheoryPassed] = useCanvasState('osint-theory-passed', false);
  const [passedOsint] = useCanvasState<string[]>('passed-osint-modules', []);
  const [practicalPassed, setPracticalPassed] = useCanvasState<string[]>('osint-final-practical', []);
  const allOsint = OSINT_MODULES.every((m) => passedOsint.includes(m.id));
  const practicalDone = practicalPassed.length >= OSINT_FINAL_PRACTICAL_PASS;

  const tryCertify = (tp: boolean, pp: number) => {
    if (tp && pp >= OSINT_FINAL_PRACTICAL_PASS) setCertified(true);
  };

  if (!allOsint) {
    return (
      <Callout tone="warning" title={t(lang, 'finalExamLocked')}>
        {passedOsint.length}/{OSINT_MODULES.length} {t(lang, 'osintModulesPassed')}
      </Callout>
    );
  }

  return (
    <Stack gap={16}>
      <H2>{t(lang, 'osintFinalExam')}</H2>
      {certified && <Callout tone="success" title={t(lang, 'certified')}>{lang === 'ru' ? 'OSINT-трек завершён!' : 'OSINT track completed!'}</Callout>}
      <Row gap={8}>
        {(['theory', 'practice'] as const).map((p) => (
          <button key={p} type="button" onClick={() => setPart(p)} style={{
            padding: '8px 16px', borderRadius: 20, cursor: 'pointer', border: 'none',
            background: part === p ? theme.accent.primary : theme.fill.tertiary,
            color: part === p ? theme.text.onAccent : theme.text.primary, fontSize: 13, fontFamily: 'inherit',
          }}>
            {p === 'theory' ? t(lang, 'finalExamTheory') : t(lang, 'finalExamPractical')}
            {p === 'theory' && theoryPassed && ' ✓'}
            {p === 'practice' && practicalDone && ' ✓'}
          </button>
        ))}
      </Row>
      {part === 'theory' && (
        <ExamBlock moduleId="osint-final" exam={OSINT_FINAL_THEORY_EXAM} passScore={OSINT_FINAL_PASS} lang={lang}
          onPass={() => { setTheoryPassed(true); tryCertify(true, practicalPassed.length); }}
          hideModulePassedCallout skipModuleUnlock forcedPassed={theoryPassed} passedKey="passed-osint-modules" />
      )}
      {part === 'practice' && (
        <Stack gap={12}>
          <Stat value={`${practicalPassed.length}/${OSINT_FINAL_PRACTICAL_IDS.length}`} label={t(lang, 'passed')} tone={practicalDone ? 'success' : 'info'} />
          {OSINT_FINAL_PRACTICAL_IDS.map((cid, i) => {
            const done = practicalPassed.includes(cid);
            return (
              <div key={cid}>
                <Card>
                  <CardHeader trailing={done ? <Pill tone="success" size="sm">{t(lang, 'passed')}</Pill> : undefined}>
                    {lang === 'ru' ? 'OSINT практика' : 'OSINT practice'} {i + 1}
                  </CardHeader>
                  <CardBody>
                    <FinalPracticalCase caseId={cid} lang={lang} alreadyPassed={done} onPass={() => {
                      if (!practicalPassed.includes(cid)) {
                        const next = [...practicalPassed, cid];
                        setPracticalPassed(next);
                        tryCertify(theoryPassed, next.length);
                      }
                    }} />
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

const JOB_SEARCH_TIPS = [
  { channel: 'LinkedIn', tip: 'Оптимизируй headline: «AML/KYC Analyst | OSINT & EDD». Включи CAMS/ICA если есть. Follow hiring managers compliance.' },
  { channel: 'Indeed / Glassdoor / Jooble', tip: 'Фильтры: AML, KYC, Financial Crime, Compliance Analyst. Remote EU — ключевые слова.' },
  { channel: 'Career pages', tip: 'Банки, neobanks, crypto exchanges, Big4 Forensic — подписка на alerts на careers page.' },
  { channel: 'Recruiters', tip: 'Hays, Michael Page, Morgan McKinley — специализация Financial Crime. Отправь CV + cover letter.' },
  { channel: 'Networking', tip: 'ACAMS local chapter, ICA webinars, LinkedIn posts с case studies (без NDA data).' },
  { channel: 'CV keywords', tip: 'Transaction Monitoring, Sanctions Screening, EDD, OSINT, SAR, World-Check, Actimize — ATS matching.' },
];

const INTERVIEW_QUESTIONS = [
  { q: 'Explain the difference between CDD and EDD.', hint: 'Risk-based: PEP, HRJ, adverse media → EDD. Depth of checks, SOF/SOW, senior approval.' },
  { q: 'How do you resolve a sanctions hit at 87% match?', hint: 'DOB, passport, address, nationality. Never auto-close. Document identifiers.' },
  { q: 'Describe your OSINT workflow for adverse media.', hint: 'Planning → sources (Tier 1/2) → cross-reference → weighting → report with URLs.' },
  { q: 'What is structuring and how do you investigate?', hint: 'Smurfing below threshold. RFI, pattern analysis, SAR if no explanation.' },
  { q: 'Tell me about a complex investigation you handled.', hint: 'STAR method: Situation, Task, Action, Result. Use course case examples.' },
  { q: 'What is tipping off and why does it matter?', hint: 'Must not inform customer about SAR suspicion. Criminal offence in UK/EU.' },
  { q: 'How do you prioritize alerts in a queue?', hint: 'SLA, priority P1/P2, risk score, materiality, regulatory deadlines.' },
  { q: 'Explain Travel Rule in crypto context.', hint: 'FATF R.16, originator/beneficiary info between VASPs above threshold.' },
];

function InterviewTrainerView({ lang }: { lang: Lang }) {
  const [tab, setTab] = useCanvasState('interview-tab', 'job');

  return (
    <Stack gap={16}>
      <H2>{t(lang, 'navInterview')}</H2>
      <Text tone="secondary">{lang === 'ru' ? 'Как искать работу + подготовка к собеседованию AML/KYC/OSINT' : 'Job search + AML/KYC/OSINT interview prep'}</Text>

      <Row gap={8} wrap>
        {[
          { id: 'job', label: t(lang, 'jobSearchTitle') },
          { id: 'interview', label: t(lang, 'interviewPrep') },
          { id: 'cv', label: lang === 'ru' ? 'CV & pitch' : 'CV & pitch' },
        ].map((item) => (
          <span key={item.id}><Button variant={tab === item.id ? 'primary' : 'ghost'} onClick={() => setTab(item.id)}>{item.label}</Button></span>
        ))}
      </Row>

      {tab === 'job' && (
        <Stack gap={12}>
          <Table headers={[lang === 'ru' ? 'Канал' : 'Channel', lang === 'ru' ? 'Рекомендация' : 'Tip']} rows={JOB_SEARCH_TIPS.map((j) => [j.channel, j.tip])} />
          <Callout tone="info" title={lang === 'ru' ? 'Стратегия' : 'Strategy'}>
            {lang === 'ru'
              ? 'Подавай 10–15 targeted applications в неделю + 2 networking touchpoints. Кастомизируй cover letter под каждую роль (KYC vs TM vs OSINT).'
              : 'Apply 10–15 targeted roles/week + 2 networking touchpoints. Customize cover letter per role (KYC vs TM vs OSINT).'}
          </Callout>
        </Stack>
      )}

      {tab === 'interview' && (
        <Stack gap={12}>
          {INTERVIEW_QUESTIONS.map((item, i) => (
            <div key={i}>
              <Card>
                <CardHeader>{i + 1}. {item.q}</CardHeader>
                <CardBody>
                  <Text size="small" tone="secondary">{lang === 'ru' ? 'Подсказка' : 'Hint'}: {item.hint}</Text>
                </CardBody>
              </Card>
            </div>
          ))}
        </Stack>
      )}

      {tab === 'cv' && (
        <Stack gap={12}>
          <Callout tone="info" title="Elevator pitch (60 sec)">
            Financial Crime Investigator transitioning to AML/KYC Compliance Analyst. OSINT background → EDD, adverse media, UBO research. Course completed: 8 AML modules + OSINT track + 350+ practice cases.
          </Callout>
          <Table
            headers={['Section', 'Content']}
            rows={[
              ['Headline', 'AML/KYC Analyst | OSINT & EDD | CAMS (in progress)'],
              ['Bullets', 'Conducted EDD/OSINT research · Screening hit resolution · TM alert investigation · SAR drafting support'],
              ['Certifications', 'ACAMS CAMS / ICA Diploma — list with year'],
              ['Tools', 'Case management, screening platforms, OpenCorporates, OSINT methodology'],
            ]}
          />
        </Stack>
      )}
    </Stack>
  );
}

function CourseFooterNav({ lang, view, onNavigate, passedModules, passedOsint, allModulesPassed, allOsintPassed, courseModules }: {
  lang: Lang; view: string; onNavigate: (v: string) => void;
  passedModules: string[]; passedOsint: string[]; allModulesPassed: boolean; allOsintPassed: boolean;
  courseModules: CourseModule[];
}) {
  const theme = useHostTheme();
  const btn = (v: string, label: string) => (
    <Button variant={view === v ? 'primary' : 'ghost'} onClick={() => onNavigate(v)}>{label}</Button>
  );

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${theme.stroke.primary}` }}>
      <Stack gap={16}>
        <Text size="small" weight="medium" tone="secondary">{lang === 'ru' ? 'Навигация курса' : 'Course navigation'}</Text>

        <Stack gap={8}>
          <Text size="small" weight="medium">{t(lang, 'footerAml')}</Text>
          <Row gap={6} wrap>
            {btn('home', t(lang, 'navHome'))}
            {btn('literature', t(lang, 'navLiterature'))}
            {btn('trainers', t(lang, 'navTrainers'))}
            {btn('news', t(lang, 'navNews'))}
            {btn('my-progress', t(lang, 'navMyProgress'))}
            {courseModules.slice(0, 4).map((m) => <span key={m.id}>{btn(m.id, m.id.toUpperCase())}</span>)}
          </Row>
          <Row gap={6} wrap>
            {courseModules.slice(4).map((m) => <span key={m.id}>{btn(m.id, m.id.toUpperCase())}</span>)}
            {allModulesPassed && btn('final-exam', t(lang, 'finalExamTitle'))}
          </Row>
        </Stack>

        <Stack gap={8}>
          <Text size="small" weight="medium">{t(lang, 'footerOsint')}</Text>
          <Row gap={6} wrap>
            {btn('osint-home', t(lang, 'navOsintTrack'))}
            {OSINT_MODULES.map((m) => <span key={m.id}>{btn(m.id, m.id.toUpperCase())}</span>)}
            {allOsintPassed && btn('osint-final-exam', t(lang, 'osintFinalExam'))}
            {btn('osint-practice', `${t(lang, 'navOsintCases')} (50)`)}
          </Row>
        </Stack>

        <Stack gap={8}>
          <Text size="small" weight="medium">{t(lang, 'footerPractice')}</Text>
          <Row gap={6} wrap>
            {btn('polygone', t(lang, 'navPolygone'))}
            {btn('english', t(lang, 'navEnglish'))}
          </Row>
        </Stack>

        <Stack gap={8}>
          <Text size="small" weight="medium">{t(lang, 'footerOptional')}</Text>
          <Row gap={6} wrap>
            {btn('glossary', t(lang, 'navGlossary'))}
            {btn('regulations', t(lang, 'navRegulations'))}
            {btn('crypto-checks', t(lang, 'navCrypto'))}
            {btn('software', t(lang, 'navSoftware'))}
          </Row>
        </Stack>

        <Stack gap={8}>
          <Text size="small" weight="medium">{t(lang, 'footerCareer')}</Text>
          <Row gap={6} wrap>
            {btn('interview-trainer', t(lang, 'navInterview'))}
            {btn('resources', t(lang, 'navResources'))}
          </Row>
        </Stack>
      </Stack>
    </div>
  );
}

const PROFESSIONAL_LITERATURE = [
  { title: 'FATF Recommendations (2023)', author: 'FATF', type: 'Нормативка', why: '40 рекомендаций — фундамент AML/KYC во всех юрисдикциях', url: 'https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html' },
  { title: 'Wolfsberg Group — PEP Guidance', author: 'Wolfsberg Group', type: 'Guidance', why: 'PEP-риск, EDD, family/associates — must-read для KYC/EDD', url: 'https://www.wolfsberg-principles.com/' },
  { title: 'BCBS CDD Guidance', author: 'Basel Committee', type: 'Guidance', why: 'Customer due diligence для банков — risk-based approach', url: 'https://www.bis.org/bcbs/publ/d285.htm' },
  { title: 'ACAMS — CAMS Study Guide', author: 'ACAMS', type: 'Сертификация', why: 'Industry standard для AML analyst, часто оплачивает employer', url: 'https://www.acams.org/' },
  { title: 'ICA Diplomas in AML', author: 'International Compliance Association', type: 'Сертификация', why: 'Альтернатива CAMS, сильна в UK/EU', url: 'https://www.int-comp.org/' },
  { title: 'Money Laundering: A Guide for Criminal Investigators', author: 'Madamala & Kuhlhorn', type: 'Книга', why: 'Классика по стадиям отмывания и red flags', url: '' },
  { title: 'The Compliance Handbook (KYC/AML)', author: 'Various / Wiley', type: 'Книга', why: 'Практический обзор KYC, TM, sanctions для банков', url: '' },
  { title: 'Bellingcat OSINT Techniques', author: 'Bellingcat', type: 'OSINT', why: 'Методология открытых источников для EDD/adverse media', url: 'https://www.bellingcat.com/resources/how-tos/' },
  { title: 'OSINT Framework', author: 'osintframework.com', type: 'OSINT', why: 'Каталог инструментов для корпоративного и people OSINT', url: 'https://osintframework.com/' },
  { title: 'EU AML Regulation (AMLA package)', author: 'EU', type: 'Нормативка', why: 'Единый AML-regime EU — актуально для EU banks/fintech', url: 'https://finance.ec.eu/' },
  { title: 'FinCEN SAR Activity Review', author: 'FinCEN', type: 'Практика', why: 'Реальные паттерны SAR в US — учит формулировкам', url: 'https://www.fincen.gov/' },
  { title: 'Chainalysis Crypto Crime Report', author: 'Chainalysis', type: 'Crypto AML', why: 'Ежегодный обзор crypto ML typologies', url: 'https://www.chainalysis.com/' },
  { title: 'OpenSanctions Handbook', author: 'OpenSanctions', type: 'Sanctions', why: 'Практика screening и entity resolution', url: 'https://www.opensanctions.org/docs/' },
  { title: 'FFIEC BSA/AML Manual', author: 'FFIEC (US)', type: 'Manual', why: 'Детальный BSA manual — эталон для US AML programs', url: 'https://bsaaml.ffiec.gov/' },
  { title: 'Transparency International — CPI', author: 'TI', type: 'Research', why: 'Corruption risk by country — для HRJ/PEP assessment', url: 'https://www.transparency.org/' },
];

export default function AmlKycTraining() {
  const [view, setView] = useCanvasState('main-view', 'home');
  const [lang, setLang] = useCanvasState<Lang>('course-lang', 'ru');
  const [passedModules] = useCanvasState<string[]>('passed-modules', []);
  const [passedOsint] = useCanvasState<string[]>('passed-osint-modules', []);
  const [certified] = useCanvasState('final-certified', false);
  const [osintCertified] = useCanvasState('osint-certified', false);
  const cl = contentLang(lang);
  const courseModules = useMemo(() => getCourseModules(cl), [cl]);
  const allModulesPassed = courseModules.every((m) => passedModules.includes(m.id));
  const allOsintPassed = OSINT_MODULES.every((m) => passedOsint.includes(m.id));

  useEffect(() => {
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang;
    document.title = `${getCourseTitle(cl)} — AML/KYC Academy`;
  }, [lang, cl]);

  const navOptions = [
    { value: 'home', label: t(lang, 'navHome') },
    { value: 'my-progress', label: t(lang, 'navMyProgress') },
    { value: 'literature', label: t(lang, 'navLiterature') },
    { value: 'trainers', label: t(lang, 'navTrainers') },
    { value: 'news', label: t(lang, 'navNews') },
    { value: 'osint-home', label: t(lang, 'navOsintTrack') },
    { value: 'interview-trainer', label: t(lang, 'navInterview') },
    { value: 'polygone', label: `${t(lang, 'navPolygone')} (${PRACTICE_CASES.length})` },
    { value: 'osint-practice', label: t(lang, 'navOsintCases') },
    ...(allModulesPassed ? [{ value: 'final-exam', label: t(lang, 'finalExamTitle') }] : []),
    ...(allOsintPassed ? [{ value: 'osint-final-exam', label: t(lang, 'osintFinalExam') }] : []),
    { value: 'glossary', label: `${t(lang, 'navGlossary')} (${GLOSSARY.length})` },
    { value: 'regulations', label: `${t(lang, 'navRegulations')} (${REGULATIONS.length})` },
    { value: 'english', label: `${t(lang, 'navEnglish')} (${ENGLISH_LESSONS.length})` },
    { value: 'crypto-checks', label: `${t(lang, 'navCrypto')} (${t(lang, 'optional')})` },
    { value: 'software', label: `${t(lang, 'navSoftware')} (${t(lang, 'optional')})` },
    { value: 'resources', label: t(lang, 'navResources') },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-row">
          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="small" tone="secondary" weight="medium">{tc(cl, 'brand')}</Text>
            <H1 style={{ fontSize: 22 }}>{getCourseTitle(cl)}</H1>
            <Text size="small" tone="secondary">{getCourseSubtitle(cl)}</Text>
          </Stack>
          <div className="lang-auth-row">
            <Stack gap={4}>
              <Text size="small" tone="secondary">{t(lang, 'langLabel')}</Text>
              <Select value={lang} onChange={(v) => setLang(v as Lang)} options={LANG_OPTIONS} />
            </Stack>
            <AuthHeaderButton lang={lang} onOpenCabinet={() => setView('my-progress')} />
          </div>
        </div>
      </header>

      <Stack gap={20}>

      <div className="hero-card">
        <CourseHero
          lang={lang}
          passedCount={passedModules.length}
          certified={certified}
          onOpenFinal={() => setView('final-exam')}
          moduleCount={courseModules.length}
        />
      </div>

      <div className="stats-grid">
        <Stat value={`${passedModules.length}/${courseModules.length}`} label={t(lang, 'modulesPassed')} tone={allModulesPassed ? 'success' : 'info'} />
        <Stat value={`${passedOsint.length}/${OSINT_MODULES.length}`} label={t(lang, 'osintModulesPassed')} tone={allOsintPassed ? 'success' : 'info'} />
        <Stat value="50" label={t(lang, 'navOsintCases')} tone="info" />
        <Stat value={String(PRACTICE_CASES.length)} label={t(lang, 'casesCount')} tone="info" />
        <Stat value={certified || osintCertified ? t(lang, 'certified') : t(lang, 'statusStudy')} label={t(lang, 'status')} tone={certified ? 'success' : 'warning'} />
      </div>

      <div className="desktop-only-select">
        <Select value={view} onChange={setView} options={navOptions} />
      </div>

      {view === 'home' && (
        <Stack gap={16}>
          <Callout tone="info" title={t(lang, 'howToPass')}>{t(lang, 'examUnlockBody')}</Callout>

          <H2>{tc(cl, 'learningPath')}</H2>
          <ModulePathGrid lang={lang} passedModules={passedModules} currentView={view} onSelect={setView} modules={courseModules} getMeta={getModuleMeta} />

          <H2>{t(lang, 'careerMap')}</H2>
          <Table
            headers={[t(lang, 'direction'), t(lang, 'modulesCol'), t(lang, 'whereToGo')]}
            rows={[
              ['KYC / Onboarding Analyst', 'M1, M2', 'Banks, neobanks, EMI'],
              ['Sanctions / Screening Analyst', 'M3', 'Banks, payment providers'],
              ['EDD / OSINT Researcher', 'M4, OSINT O1–O6', lang === 'ru' ? 'EDD-команды, Big4' : 'EDD teams, Big4'],
              ['SAR / Reporting Analyst', 'M5', 'MLRO office, compliance'],
              ['Crypto Compliance', 'M6', 'Exchanges, VASP, banks'],
              ['Junior AML Analyst (generalist)', 'M1–M8', lang === 'ru' ? 'Банки, финтех' : 'Banks, fintech'],
            ]}
          />

          {allModulesPassed && !certified && (
            <Callout tone="success" title={t(lang, 'finalExamUnlocked')}>
              <Button variant="primary" onClick={() => setView('final-exam')}>{t(lang, 'finalExamTitle')} →</Button>
            </Callout>
          )}
        </Stack>
      )}

      {view === 'my-progress' && (
        <StudentCabinetView
          lang={lang}
          passedModules={passedModules}
          passedOsint={passedOsint}
          certified={certified}
          osintCertified={osintCertified}
          totalCases={PRACTICE_CASES.length}
          osintModules={OSINT_MODULES.map((m) => ({
            id: m.id,
            title: m.title,
            passed: passedOsint.includes(m.id),
          }))}
        />
      )}

      {view === 'osint-home' && (
        <Stack gap={16}>
          <H2>{t(lang, 'osintTrackTitle')}</H2>
          <Callout tone="info" title={t(lang, 'howToPass')}>
            {lang === 'ru' ? '6 модулей OSINT: урок → тест (80%). После всех — финальный экзамен OSINT + 50 практических кейсов.' : '6 OSINT modules: lesson → test (80%). Then OSINT final exam + 50 practice cases.'}
          </Callout>
          <ModulePathGrid lang={lang} passedModules={passedOsint} currentView={view} onSelect={setView} modules={OSINT_MODULES} getMeta={getOsintModuleMeta} />
          <Row gap={8} wrap>
            <Button variant="primary" onClick={() => setView('osint-practice')}>{t(lang, 'navOsintCases')} (50)</Button>
            {allOsintPassed && !osintCertified && (
              <Button variant="ghost" onClick={() => setView('osint-final-exam')}>{t(lang, 'osintFinalExam')} →</Button>
            )}
          </Row>
        </Stack>
      )}

      {OSINT_MODULES.some((m) => m.id === view) && <ModuleView moduleId={view} lang={lang} onNavigate={setView} track="osint" />}

      {view === 'osint-final-exam' && <OsintFinalExamView lang={lang} />}

      {view === 'osint-practice' && (
        <ActimizeCaseConsole lang={lang} cases={OSINT_PRACTICE_CASES} defaultCaseId="osint-p-001" statePrefix="osint-case" consoleTitle="OSINT Lab" />
      )}

      {view === 'interview-trainer' && <InterviewTrainerView lang={lang} />}

      {courseModules.some((m) => m.id === view) && <ModuleView moduleId={view} lang={lang} onNavigate={setView} />}

      {view === 'literature' && <LiteratureView lang={lang} />}
      {view === 'trainers' && <TrainersView lang={lang} onNavigate={setView} />}
      {view === 'news' && <NewsView lang={lang} />}

      {view === 'final-exam' && <FinalExamView lang={lang} />}

      {view === 'glossary' && <GlossaryView filterCategory="all" lang={lang} />}

      {view === 'regulations' && <RegulationsView lang={lang} />}

      {view === 'english' && <EnglishView />}

      {view === 'polygone' && <CaseLibraryView lang={lang} />}

      {view === 'crypto-checks' && <CryptoVerificationView lang={lang} />}

      {view === 'software' && <SoftwareCatalogView lang={lang} />}

      {view === 'resources' && <ResourcesHubView lang={lang} onNavigate={setView} />}

      <CourseFooterNav lang={lang} view={view} onNavigate={setView} passedModules={passedModules} passedOsint={passedOsint} allModulesPassed={allModulesPassed} allOsintPassed={allOsintPassed} courseModules={courseModules} />

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          { id: 'home', label: 'AML' },
          { id: 'my-progress', label: tc(cl, 'navMyProgress').slice(0, 6) },
          { id: 'news', label: tc(cl, 'navNews').slice(0, 5) },
          { id: 'polygone', label: 'Cases' },
          { id: 'literature', label: tc(cl, 'navLiterature').slice(0, 5) },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id || (item.id === 'home' && courseModules.some((m) => m.id === view)) ? 'active' : ''}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <DetailPanel />
      </Stack>
    </div>
  );
}
