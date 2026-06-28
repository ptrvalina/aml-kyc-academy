import type { Module } from '../types';

export type PracticeTask = {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'scenario' | 'case' | 'communication' | 'research';
  deliverable: string;
  exampleAnswer?: string;
};

export type CourseModule = Module & {
  practiceTasks: PracticeTask[];
  estimatedMinutes: number;
};

export const COURSE_TITLE = 'AML/KYC Analyst: от теории к практике';
export const COURSE_SUBTITLE = '8 модулей · 10–12 часов · тесты · кейсы · отчёт о прогрессе';

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'm1',
    title: 'Модуль 1: Введение в AML/CFT',
    subtitle: 'Кто такой AML-аналитик и как устроена отрасль',
    passScore: 4,
    estimatedMinutes: 90,
    termIds: ['aml', 'kyc', 'ctf', 'fatf', 'fiu', 'cdd', 'edd', 'risk-score'],
    lessons: [
      {
        title: 'Что такое отмывание денег и CFT',
        body: `### Простыми словами
**Отмывание денег (Money Laundering)** — это попытка сделать «грязные» доходы похожими на законные. **CFT (Counter-Terrorist Financing)** — борьба с финансированием терроризма. Банки и финтех обязаны по закону видеть подозрительное и сообщать государству.

### Масштаб угрозы
По оценкам ООН/UNODC, через глобальную систему проходит значительный объём преступных средств ежегодно. AML — не «бумажная формальность», а требование регуляторов с штрафами в миллиарды EUR/USD.

### Три стадии отмывания
- **Placement** — ввод в систему (наличные, мелкие переводы, обмен)
- **Layering** — запутывание (цепочки счетов, страны, посредники)
- **Integration** — «легальная» трата (недвижимость, бизнес, luxury)

### Пример
Наркосеть вносит cash через обменники (Placement) → гоняет через 20 счетов в 5 странах (Layering) → покупает квартиру на юрлицо (Integration). AML-аналитик ловит аномалии на этапах 2–3.

### Кто ты как AML-аналитик
Ты не полиция. Ты **оцениваешь риск**, собираешь факты, документируешь и при подозрении готовишь SAR. Работа: банки, финтех, EMI, crypto VASP, Big4 forensic, аутсорс KYC/TM.

### Карьерная лестница
Analyst → Senior Analyst → Team Lead → MLRO / Head of Compliance. Старт: KYC, TM или Sanctions queue.`,
      },
      {
        title: 'Глобальные регуляторы: FATF, OFAC, EU',
        body: `### FATF
40 рекомендаций — «золотой стандарт». Страны переносят их в национальное право. R.10 — CDD, R.16 — wire transfers, R.24 — UBO.

### OFAC (США)
Санкционные списки SDN. Глобальное влияние: даже EU-банк избегает нарушений OFAC при USD/correspondent.

### EU AMLD
Директивы AMLD5/6: UBO-реестры, crypto, tax crimes как predicate offence, усиление PEP.

### FIU
В каждой стране — Financial Intelligence Unit принимает SAR/STR (FinCEN, NCA, FIU LT и т.д.).

### Для новичка
Запомни связку: **FATF → национальный закон → политика банка → твоя ежедневная работа**.`,
      },
      {
        title: 'Рабочий день и системы',
        body: `### Типичный день Junior Analyst
Утро: очередь alerts/hits → review по SLA → документирование → RFI → эскалация MLRO при необходимости.

### Системы (названия варьируются)
- **KYC/onboarding** — верификация клиента
- **Screening** — санкции, PEP, adverse media
- **Transaction Monitoring** — правила и ML-модели
- **Case management** — единое досье расследования

### KPI
Alerts closed within SLA, quality score QA, false positive rate, SAR conversion (осторожно с «гонкой за SAR»).

### Мини-чеклист
Каждое действие в case notes. Никакого tipping off клиенту.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm1-t1',
        title: 'Разбор новости',
        description: 'Найди в открытых источниках любую новость о финансовом преступлении. Определи стадию ML (Placement/Layering/Integration) и кто расследует (банк, FIU, полиция).',
        type: 'research',
        deliverable: '5–7 предложений: факты, стадия, роль AML-аналитика',
        exampleAnswer: 'Схема с обналичиванием через подставные ИП — Placement+Layering. Банк мог бы поймать structuring; FIU получает SAR от банка.',
      },
      {
        id: 'm1-t2',
        title: 'Тест на роли',
        description: 'Пройди тест модуля и объясни разницу между AML, KYC и CFT своими словами в заметках.',
        type: 'quiz',
        deliverable: 'Ответ в свободной форме в Investigation Notes любого кейса',
      },
    ],
    exam: [
      { id: 'm1-q1', question: 'Placement — это:', options: [{ id: 'a', text: 'Ввод средств в финансовую систему', correct: true }, { id: 'b', text: 'Покупка недвижимости', correct: false }, { id: 'c', text: 'Закрытие счёта', correct: false }], explain: 'Первая стадия ML.' },
      { id: 'm1-q2', question: 'FATF — это:', options: [{ id: 'a', text: 'Международные стандарты AML/CFT', correct: true }, { id: 'b', text: 'Банковская CRM', correct: false }, { id: 'c', text: 'Криптокошелёк', correct: false }], explain: '40 Recommendations.' },
      { id: 'm1-q3', question: 'AML-аналитик в банке:', options: [{ id: 'a', text: 'Оценивает риск и готовит SAR при подозрении', correct: true }, { id: 'b', text: 'Арестовывает клиентов', correct: false }, { id: 'c', text: 'Выдаёт кредиты', correct: false }], explain: 'Не law enforcement.' },
      { id: 'm1-q4', question: 'FIU — это:', options: [{ id: 'a', text: 'Подразделение, принимающее SAR', correct: true }, { id: 'b', text: 'Отдел маркетинга', correct: false }, { id: 'c', text: 'IT helpdesk', correct: false }], explain: 'Financial Intelligence Unit.' },
      { id: 'm1-q5', question: 'Layering направлен на:', options: [{ id: 'a', text: 'Сокрытие источника через сложные цепочки', correct: true }, { id: 'b', text: 'Открытие депозита', correct: false }, { id: 'c', text: 'KYC onboarding', correct: false }], explain: 'Вторая стадия ML.' },
    ],
    practiceCaseId: 'case-001',
  },
  {
    id: 'm2',
    title: 'Модуль 2: KYC, CDD, EDD, SDD',
    subtitle: 'Risk-Based Approach и проверка клиентов',
    passScore: 4,
    estimatedMinutes: 100,
    termIds: ['pep', 'ubo', 'sof', 'cdd', 'edd', 'risk-score'],
    lessons: [
      {
        title: 'KYC и уровни due diligence',
        body: `### KYC
**Know Your Customer** — идентификация (кто ты) + верификация (документы подлинны) + понимание цели отношений.

### CDD (стандарт)
Для большинства retail/SME: ID, адрес, screening, оценка риска, мониторинг.

### EDD (усиленная)
PEP, санкции, HRJ, adverse media, сложные структуры, crypto, крупные необъяснимые обороты.

### SDD (упрощённая)
Только для **доказуемо низкого** риска (госпродукты, регулируемые листинги) — редко в финтехе.

### Risk-Based Approach (RBA)
Глубина проверки пропорциональна риску: страна + клиент + продукт + канал + поведение.

### Факторы риска
- Юрисдикция (EU vs offshore)
- Тип клиента (PEP, MSB, casino)
- Продукт (private banking, crypto)
- Аномальный оборот`,
      },
      {
        title: 'Практика: какой DD выбрать',
        body: `### Сценарий A — студент, зарплата, EU
**CDD** + стандартный screening.

### Сценарий B — директор госкорпорации иностранного государства
**EDD** (PEP) + SOW + ongoing monitoring.

### Сценарий C — регулируемый пенсионный фонд EU
Возможен **SDD** при выполнении критериев политики банка — но решение за risk committee.

### Офшорная компания без прозрачного UBO
Почти всегда **EDD** + отказ если UBO не установлен.

### Документы EDD (типовой список)
Устав, реестр акционеров, UBO declaration, финансовая отчётность, контракты, SOF/SOW, CV директоров.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm2-t1',
        title: 'Три клиента — три уровня DD',
        description: 'Опиши для каждого: (1) фрилансер EU, (2) PEP-чиновник, (3) charity NGO — какой DD и почему.',
        type: 'scenario',
        deliverable: 'Таблица: клиент | CDD/EDD/SDD | 3 фактора риска',
        exampleAnswer: 'PEP → EDD из-за corruption risk; фрилансер → CDD; NGO → CDD с проверкой благотворительного статуса.',
      },
      {
        id: 'm2-t2',
        title: 'EDD документы для офшора',
        description: 'Клиент — BVI holding, переводы в EU. Составь список запросов для EDD.',
        type: 'case',
        deliverable: 'Bullet list документов + 2 RFI вопроса',
      },
    ],
    exam: [
      { id: 'm2-q1', question: 'PEP требует:', options: [{ id: 'a', text: 'EDD', correct: true }, { id: 'b', text: 'Только SDD', correct: false }, { id: 'c', text: 'Без проверки', correct: false }], explain: 'Politically exposed persons.' },
      { id: 'm2-q2', question: 'RBA означает:', options: [{ id: 'a', text: 'Меры соразмерны риску', correct: true }, { id: 'b', text: 'Одинаковая проверка для всех', correct: false }, { id: 'c', text: 'Без мониторинга', correct: false }], explain: 'Risk-based approach.' },
      { id: 'm2-q3', question: 'UBO — это:', options: [{ id: 'a', text: 'Конечный бенефициар', correct: true }, { id: 'b', text: 'Бухгалтер', correct: false }, { id: 'c', text: 'Курьер', correct: false }], explain: '>25% или контроль.' },
      { id: 'm2-q4', question: 'SOF — это:', options: [{ id: 'a', text: 'Источник конкретных средств', correct: true }, { id: 'b', text: 'Система мониторинга', correct: false }, { id: 'c', text: 'Санкционный список', correct: false }], explain: 'Source of Funds.' },
      { id: 'm2-q5', question: 'SDD применяется:', options: [{ id: 'a', text: 'При доказуемо низком риске', correct: true }, { id: 'b', text: 'Для всех PEP', correct: false }, { id: 'c', text: 'Никогда', correct: false }], explain: 'Simplified DD — исключение.' },
    ],
    practiceCaseId: 'case-002',
  },
  {
    id: 'm3',
    title: 'Модуль 3: Скрининг и красные флаги',
    subtitle: 'Sanctions, PEP, Adverse Media, TM',
    passScore: 4,
    estimatedMinutes: 110,
    termIds: ['sanctions', 'ofac', 'hit', 'true-match', 'false-positive', 'fuzzy', 'pep', 'adverse', 'tm', 'alert'],
    lessons: [
      {
        title: 'Санкционный и PEP скрининг',
        body: `### Санкции
Списки OFAC, EU, UN, UK HMT. **Hit** — совпадение имени/данных. Задача — true match vs false positive.

### Fuzzy matching
87% match ≠ автоматический true match. Сверяй: полное имя, DOB, паспорт, адрес, гражданство.

### PEP
Должностные лица + семья + close associates. Domestic и foreign PEP. Ex-PEP — риск сохраняется 12–18 мес.

### False positive
Другой человек с похожим именем. Документируй disambiguation и закрывай с обоснованием.

### True match
Блокировка, freeze, SAR, эскалация MLRO. Нельзя «договориться» с клиентом.`,
      },
      {
        title: 'Adverse Media и Transaction Monitoring',
        body: `### Adverse Media
Негативные новости: fraud, corruption, drugs, sanctions evasion. Оцени: источник (Tier 1 Reuters vs blog), дата, статус дела (convicted vs allegation).

### TM — что ловят системы
Structuring, rapid movement, HRJ corridors, dormant→active, inconsistent profile, round amounts, mule patterns.

### Red flags
Один флаг — внимание. **Комбинация** — расследование.

### Практика закрытия alert
Context (профиль) → pattern → RFI → decision → audit trail.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm3-t1',
        title: 'Sanctions hit 87%',
        description: 'Hit на Ivan Petrov, 87%. Клиент: другой DOB и паспорт. Опиши шаги проверки и решение.',
        type: 'case',
        deliverable: 'Пошаговый resolution + вывод True/False match',
        exampleAnswer: 'Сверка DOB, passport, nationality — не совпадают → false positive, документировано, закрыто.',
      },
      {
        id: 'm3-t2',
        title: 'Adverse media OSINT',
        description: 'Найди в открытых источниках информацию о вымышленном директоре (используй кейс в Case Manager). Оцени риск.',
        type: 'research',
        deliverable: 'Краткий adverse media summary с источниками',
      },
    ],
    exam: [
      { id: 'm3-q1', question: 'False positive — это:', options: [{ id: 'a', text: 'Hit на другого человека', correct: true }, { id: 'b', text: 'Подтверждённый санкционный клиент', correct: false }, { id: 'c', text: 'Тип алерта TM', correct: false }], explain: 'Документируй и закрывай.' },
      { id: 'm3-q2', question: 'Structuring — это:', options: [{ id: 'a', text: 'Дробление сумм ниже порога', correct: true }, { id: 'b', text: 'Зарплата', correct: false }, { id: 'c', text: 'Ипотека', correct: false }], explain: 'Smurfing.' },
      { id: 'm3-q3', question: 'Adverse media Tier 1 — это:', options: [{ id: 'a', text: 'Reuters, Bloomberg, официальные суды', correct: true }, { id: 'b', text: 'Анонимный форум', correct: false }, { id: 'c', text: 'Мемы', correct: false }], explain: 'Надёжность источника.' },
      { id: 'm3-q4', question: 'При sanctions hit сверяешь:', options: [{ id: 'a', text: 'DOB, паспорт, адрес', correct: true }, { id: 'b', text: 'Только имя', correct: false }, { id: 'c', text: 'Цвет глаз', correct: false }], explain: 'Максимум идентификаторов.' },
      { id: 'm3-q5', question: 'TM alert означает:', options: [{ id: 'a', text: 'Подозрительный паттерн в транзакциях', correct: true }, { id: 'b', text: 'Одобрение платежа', correct: false }, { id: 'c', text: 'Реклама', correct: false }], explain: 'Начало review.' },
    ],
    practiceCaseId: 'case-003',
  },
  {
    id: 'm4',
    title: 'Модуль 4: EDD-расследование',
    subtitle: 'OSINT, UBO, отчёт для MLRO',
    passScore: 4,
    estimatedMinutes: 120,
    termIds: ['ubo', 'sof', 'adverse', 'rfi', 'audit-trail'],
    lessons: [
      {
        title: 'Когда запускают EDD-расследование',
        body: `### Триггеры EDD
PEP, HRJ, adverse media, необъяснимый оборот, сложная корпоративная структура, crypto, TM alert с высоким риском.

### Вопросы расследования
Кто бенефициар? Откуда деньги? Соответствует ли бизнес-модель транзакциям? Есть ли связь с санкциями/преступлением?

### Источники
Внутренние: KYC file, TM, CRM. Внешние: OpenCorporates, Companies House, судебные реестры, OSINT, отраслевые базы.

### Документы от клиента
Устав, shareholder register, UBO declaration, contracts, invoices, bank statements, SOW narrative.

### Отчёт EDD
Executive summary → methodology → findings (с источниками) → risk rating → recommendation (approve/EDD ongoing/reject/SAR).`,
      },
      {
        title: 'Кейс: IT-компания и офшорные переводы',
        body: `### Ситуация (из ТЗ)
EU IT-компания, 5 переводов €500k+ в офшор за 3 месяца, UBO неясен.

### Шаги аналитика
1. Корпоративный реестр — директора, адрес, filing history
2. UBO через слои holding
3. Adverse media на директоров
4. Сопоставить контракты с IT-услугами vs офшорными контрагентами
5. RFI: контракты, SOF, бизнес-обоснование
6. Риск-вывод и рекомендация MLRO

### Ошибки новичка
Вывод без источника, путать allegation с conviction, tipping off при RFI.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm4-t1',
        title: 'Полное EDD-расследование',
        description: 'Пройди кейс в Case Manager (категория UBO/Corporate). Подготовь EDD summary для MLRO.',
        type: 'case',
        deliverable: 'Структура: Summary | UBO | Risks | Recommendation',
        exampleAnswer: 'Medium-high risk: unclear UBO + offshore flows without matching contracts → EDD ongoing + MLRO review.',
      },
    ],
    exam: [
      { id: 'm4-q1', question: 'EDD report обязан содержать:', options: [{ id: 'a', text: 'Источники для фактов', correct: true }, { id: 'b', text: 'Только мнение', correct: false }, { id: 'c', text: 'Только паспорт', correct: false }], explain: 'Source attribution.' },
      { id: 'm4-q2', question: 'OpenCorporates используется для:', options: [{ id: 'a', text: 'Поиска структуры компании', correct: true }, { id: 'b', text: 'Курса валют', correct: false }, { id: 'c', text: 'HR', correct: false }], explain: 'Corporate OSINT.' },
      { id: 'm4-q3', question: 'RFI в EDD должен быть:', options: [{ id: 'a', text: 'Конкретным по суммам и датам', correct: true }, { id: 'b', text: '«Объясните всё»', correct: false }, { id: 'c', text: 'Устным без записи', correct: false }], explain: 'Audit trail.' },
      { id: 'm4-q4', question: '2+ источника нужны для:', options: [{ id: 'a', text: 'Material facts в OSINT', correct: true }, { id: 'b', text: 'Любого комментария', correct: false }, { id: 'c', text: 'Отпуска', correct: false }], explain: 'Cross-reference.' },
      { id: 'm4-q5', question: 'Рекомендация MLRO — это:', options: [{ id: 'a', text: 'Итог EDD с risk rating', correct: true }, { id: 'b', text: 'Реклама банка', correct: false }, { id: 'c', text: 'Отпуск', correct: false }], explain: 'Decision support.' },
    ],
    practiceCaseId: 'case-006',
  },
  {
    id: 'm5',
    title: 'Модуль 5: SAR и регуляторы',
    subtitle: 'Отчётность, MLRO, chain of custody',
    passScore: 4,
    estimatedMinutes: 90,
    termIds: ['sar', 'rfi', 'mlro', 'escalation', 'audit-trail', 'rfi-deadline'],
    lessons: [
      {
        title: 'Suspicious Activity Report (SAR/STR)',
        body: `### Что такое SAR
Отчёт о **подозрении** (не о доказанной вине). Подаётся в FIU через MLRO.

### Когда подавать
Обоснованное подозрение + нет правдоподобного объяснения после RFI/EDD.

### Структура SAR
- Subject information
- Summary of suspicion
- Factual narrative (хронология)
- Red flags
- Actions taken
- Supporting documents

### Tipping off
Нельзя сообщать клиенту о SAR — уголовная ответственность в UK/EU.`,
      },
      {
        title: 'MLRO, FIU и chain of custody',
        body: `### MLRO
Одобряет/отклоняет SAR, интерфейс с регулятором, owns AML programme.

### Запросы FIU
Могут запросить дополнительные материалы — жёсткие сроки, полный audit trail.

### Chain of custody
Каждый шаг: кто, когда, что сделал. Screenshots, RFI, notes, decisions.

### Практика
Заполни шаблон SAR по кейсу модуля 4 в свободной форме в Investigation Notes.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm5-t1',
        title: 'Черновик SAR',
        description: 'На основе кейса из модуля 4 напиши черновик SAR: факты, подозрение, без эмоций.',
        type: 'case',
        deliverable: '200–400 слов в структуре SAR',
        exampleAnswer: 'Subject: EU IT Ltd. Suspicion: unexplained offshore outflows inconsistent with IT revenue...',
      },
      {
        id: 'm5-t2',
        title: 'Ответ регулятору',
        description: 'Составь краткий ответ FIU (5 предложений) с перечислением приложенных документов.',
        type: 'communication',
        deliverable: 'Формальный тон, без tipping off',
      },
    ],
    exam: [
      { id: 'm5-q1', question: 'SAR подаётся в:', options: [{ id: 'a', text: 'FIU через MLRO', correct: true }, { id: 'b', text: 'Клиенту', correct: false }, { id: 'c', text: 'Instagram', correct: false }], explain: 'Не клиенту.' },
      { id: 'm5-q2', question: 'Tipping off — это:', options: [{ id: 'a', text: 'Предупредить клиента о SAR', correct: true }, { id: 'b', text: 'Эскалация MLRO', correct: false }, { id: 'c', text: 'RFI', correct: false }], explain: 'Запрещено.' },
      { id: 'm5-q3', question: 'MLRO:', options: [{ id: 'a', text: 'Одобряет SAR', correct: true }, { id: 'b', text: 'Кассир', correct: false }, { id: 'c', text: 'Клиент', correct: false }], explain: 'Money Laundering Reporting Officer.' },
      { id: 'm5-q4', question: 'Audit trail нужен для:', options: [{ id: 'a', text: 'Доказательства процесса расследования', correct: true }, { id: 'b', text: 'Маркетинга', correct: false }, { id: 'c', text: 'Удаления данных', correct: false }], explain: 'Regulatory defence.' },
      { id: 'm5-q5', question: 'RFI — это:', options: [{ id: 'a', text: 'Запрос информации клиенту', correct: true }, { id: 'b', text: 'SAR', correct: false }, { id: 'c', text: 'Блокировка', correct: false }], explain: 'Request for Information.' },
    ],
    practiceCaseId: 'case-005',
  },
  {
    id: 'm6',
    title: 'Модуль 6: Крипто, ИИ и санкции',
    subtitle: 'Современные угрозы AML',
    passScore: 4,
    estimatedMinutes: 100,
    termIds: ['tm', 'hrj'],
    lessons: [
      {
        title: 'Crypto AML и Travel Rule',
        body: `### Риски crypto
Mixers, privacy coins, unhosted wallets, DeFi exploits, санкционные адреса (OFAC SDN lists on chain).

### VASP
Лицензируемая биржа/кастодиан — обязан KYT, Travel Rule, SAR.

### Travel Rule (FATF R.16)
Передача originator/beneficiary data между VASP выше порога.

### Red flags
>10–25% exposure to mixer, rapid convert fiat→crypto→cash, mismatch with profile.`,
      },
      {
        title: 'ИИ в AML и санкционные тренды',
        body: `### ИИ в банках
ML-модели для TM, NLP для adverse media, автоматизация false positive triage. Аналитик валидирует и принимает решение.

### Обход ИИ
Structuring под пороги, новые typologies, mule networks — человеческий review обязателен.

### Санкции 2024–2026
Расширение списков, secondary sanctions, crypto addresses, trade-based circumvention.

### ESG и cyber
Новые фокусы регуляторов — document в risk assessment.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm6-t1',
        title: 'Crypto кейс',
        description: 'Клиент выводит €50k на биржу, KYT показывает mixer exposure. Опиши шаги и решение.',
        type: 'case',
        deliverable: 'KYT → RFI → escalate/close',
      },
    ],
    exam: [
      { id: 'm6-q1', question: 'Mixer exposure — это:', options: [{ id: 'a', text: 'Extreme red flag в crypto', correct: true }, { id: 'b', text: 'Норма', correct: false }, { id: 'c', text: 'Зарплата', correct: false }], explain: 'Obfuscation.' },
      { id: 'm6-q2', question: 'Travel Rule относится к:', options: [{ id: 'a', text: 'Передаче данных между VASP', correct: true }, { id: 'b', text: 'Отпуску', correct: false }, { id: 'c', text: 'HR', correct: false }], explain: 'FATF R.16.' },
      { id: 'm6-q3', question: 'ИИ в AML:', options: [{ id: 'a', text: 'Помогает, но решение за аналитиком', correct: true }, { id: 'b', text: 'Заменяет MLRO', correct: false }, { id: 'c', text: 'Не используется', correct: false }], explain: 'Human in the loop.' },
      { id: 'm6-q4', question: 'OFAC может санкционировать:', options: [{ id: 'a', text: 'Crypto wallet addresses', correct: true }, { id: 'b', text: 'Только банки', correct: false }, { id: 'c', text: 'Погоду', correct: false }], explain: 'SDN includes digital currency addresses.' },
      { id: 'm6-q5', question: 'VASP — это:', options: [{ id: 'a', text: 'Поставщик услуг виртуальных активов', correct: true }, { id: 'b', text: 'Вид страховки', correct: false }, { id: 'c', text: 'Тип кредита', correct: false }], explain: 'Virtual Asset Service Provider.' },
    ],
    practiceCaseId: 'case-116',
  },
  {
    id: 'm7',
    title: 'Модуль 7: Рабочий день аналитика',
    subtitle: 'Системы, команда, коммуникация',
    passScore: 4,
    estimatedMinutes: 80,
    termIds: ['alert', 'rfi', 'escalation', 'audit-trail'],
    lessons: [
      {
        title: 'Типовой день и роли',
        body: `### Утро
Review queue по приоритету P1→P3, SLA countdown, assign to me.

### День
Context → screening → transactions → investigation notes → RFI → peer review.

### Команда
L1 analyst, Senior, QA, MLRO, Legal, Business relationship manager.

### 3 Lines of Defence
1st — бизнес/продажи, 2nd — compliance (ты), 3rd — internal audit.`,
      },
      {
        title: 'Коммуникация с клиентом и кризисы',
        body: `### RFI тон
Нейтральный, без намёков на SAR. «Для завершения compliance review предоставьте...»

### Жалоба клиента
Не спорить эмоционально, эскалировать в MLRO/Legal, документировать.

### Запрос регулятора
Приоритет №1, полный пакет документов, сроки жёсткие.

### Симуляция
Используй Case Manager: Assign → RFI → Investigation → Escalate → Close/SAR.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm7-t1',
        title: 'Симуляция рабочего дня',
        description: 'В Case Manager пройди полный цикл одного alert с audit trail (все кнопки действий).',
        type: 'scenario',
        deliverable: 'Скриншот/описание timeline из Overview',
      },
      {
        id: 'm7-t2',
        title: 'Ответ клиенту',
        description: 'Клиент спрашивает «почему заблокировали перевод?». Напиши нейтральный ответ без tipping off.',
        type: 'communication',
        deliverable: '3–5 предложений',
        exampleAnswer: 'We are conducting a routine compliance review and require additional information to process your transaction...',
      },
    ],
    exam: [
      { id: 'm7-q1', question: '2nd line of defence — это:', options: [{ id: 'a', text: 'Compliance / AML', correct: true }, { id: 'b', text: 'Продажи', correct: false }, { id: 'c', text: 'Маркетинг', correct: false }], explain: 'Risk & compliance function.' },
      { id: 'm7-q2', question: 'RFI клиенту должен быть:', options: [{ id: 'a', text: 'Нейтральным, без SAR hints', correct: true }, { id: 'b', text: '«Мы подаём SAR»', correct: false }, { id: 'c', text: 'Грубым', correct: false }], explain: 'No tipping off.' },
      { id: 'm7-q3', question: 'SLA в очереди — это:', options: [{ id: 'a', text: 'Срок обработки alert', correct: true }, { id: 'b', text: 'Зарплата', correct: false }, { id: 'c', text: 'Отпуск', correct: false }], explain: 'Service level agreement.' },
      { id: 'm7-q4', question: 'QA команда проверяет:', options: [{ id: 'a', text: 'Качество case notes и решений', correct: true }, { id: 'b', text: 'Обеды', correct: false }, { id: 'c', text: 'Дизайн сайта', correct: false }], explain: 'Quality assurance.' },
      { id: 'm7-q5', question: 'Assign to me означает:', options: [{ id: 'a', text: 'Взять alert в работу', correct: true }, { id: 'b', text: 'Закрыть без review', correct: false }, { id: 'c', text: 'Удалить клиента', correct: false }], explain: 'Ownership.' },
    ],
    practiceCaseId: 'case-004',
  },
  {
    id: 'm8',
    title: 'Модуль 8: Карьера в AML',
    subtitle: 'Резюме, собеседование, сертификация',
    passScore: 4,
    estimatedMinutes: 70,
    termIds: [],
    lessons: [
      {
        title: 'Где работать и сколько платят',
        body: `### Работодатели
Банки, neobank, EMI, crypto exchange, payment institution, Big4 forensic, RegTech, аутсорс BPO.

### Junior EU (ориентиры, варьируется)
EU: €28–45k, UK: £30–42k, remote EU entity: зависит от лицензии.

### Рост
+30–50% при переходе на Senior / специализацию (crypto, sanctions).

### Сертификация
**ACAMS (CAMS)** — gold standard. **ICA** — UK/EU. Часто оплачивает employer после probation.`,
      },
      {
        title: 'Резюме и собеседование',
        body: `### CV без опыта
Курс + кейсы + transferable skills (OSINT, audit, finance degree). Bullet points на **английском**.

### Формула bullet
Action + Tool + Result («Conducted EDD research using OSINT and corporate registries for 15+ cases»).

### Собеседование
Risk-based approach, TM vs KYC, sanctions hit story, SAR triggers, почему compliance.

### Практика курса
Тренажёр собеседования + список 5 целевых компаний + cover letter.`,
      },
    ],
    practiceTasks: [
      {
        id: 'm8-t1',
        title: '5 компаний-целей',
        description: 'Составь список 5 банков/финтехов куда подашься + почему каждый.',
        type: 'research',
        deliverable: 'Таблица: компания | роль | почему',
      },
      {
        id: 'm8-t2',
        title: 'Cover letter',
        description: 'Напиши сопроводительное на Junior AML Analyst (150–200 слов, EN).',
        type: 'communication',
        deliverable: 'Текст в заметках + проверка в тренажёре',
      },
    ],
    exam: [
      { id: 'm8-q1', question: 'Лучшая entry сертификация AML:', options: [{ id: 'a', text: 'ACAMS CAMS', correct: true }, { id: 'b', text: 'AWS Architect', correct: false }, { id: 'c', text: 'PMP only', correct: false }], explain: 'Industry standard.' },
      { id: 'm8-q2', question: 'В CV для AML важно:', options: [{ id: 'a', text: 'Конкретные навыки и инструменты', correct: true }, { id: 'b', text: 'Только хобби', correct: false }, { id: 'c', text: 'Фото котика', correct: false }], explain: 'Relevance.' },
      { id: 'm8-q3', question: 'На интервью начни с:', options: [{ id: 'a', text: 'Risk-based approach', correct: true }, { id: 'b', text: 'Жалоб на прошлую работу', correct: false }, { id: 'c', text: 'Зарплаты', correct: false }], explain: 'Professional framing.' },
      { id: 'm8-q4', question: 'Big4 forensic нанимает для:', options: [{ id: 'a', text: 'Расследований и advisory', correct: true }, { id: 'b', text: 'Только кассы', correct: false }, { id: 'c', text: 'Доставки еды', correct: false }], explain: 'Consulting path.' },
      { id: 'm8-q5', question: 'После курса ты готов на:', options: [{ id: 'a', text: 'Junior AML/KYC Analyst', correct: true }, { id: 'b', text: 'CFO банка', correct: false }, { id: 'c', text: 'Без подготовки', correct: false }], explain: 'Entry-level ready.' },
    ],
  },
];

export const COURSE_MODULE_META: Record<string, { objectives: string[]; takeaways: string[]; proTip: string }> = {
  m1: { objectives: ['Понять ML/CFT и 3 стадии', 'Знать FATF/OFAC/EU', 'Увидеть карьерный путь'], takeaways: ['AML ≠ полиция', 'Placement→Layering→Integration', 'Analyst→MLRO'], proTip: 'Начни вести глоссарий терминов с первого дня.' },
  m2: { objectives: ['Различать KYC/CDD/EDD/SDD', 'Применять RBA', 'Собирать документы EDD'], takeaways: ['PEP = EDD', 'SDD — редкое исключение', 'UBO обязателен'], proTip: 'Таблица рисков — лучший инструмент на интервью.' },
  m3: { objectives: ['Разбирать sanctions hits', 'Находить red flags в TM', 'Оценивать adverse media'], takeaways: ['Hit ≠ guilt', 'Комбинация flags', 'Tier 1 sources'], proTip: 'Всегда документируй disambiguation при 87% match.' },
  m4: { objectives: ['Вести EDD end-to-end', 'Писать отчёт MLRO', 'Использовать OSINT'], takeaways: ['Факты + источники', 'RFI конкретный', 'No tipping off'], proTip: 'Executive summary пиши последним, но показывай первым.' },
  m5: { objectives: ['Структура SAR', 'Работа с MLRO/FIU', 'Chain of custody'], takeaways: ['SAR = suspicion', 'Audit trail', 'MLRO approves'], proTip: 'SAR narrative — только факты, хронология, без эмоций.' },
  m6: { objectives: ['Crypto red flags', 'Travel Rule', 'Тренды санкций и ИИ'], takeaways: ['Mixer = red flag', 'Human reviews AI', 'Sanctions evolve'], proTip: 'Следи за OFAC crypto address listings.' },
  m7: { objectives: ['Рабочий процесс alert', 'Коммуникация', 'Кризисы с регулятором'], takeaways: ['SLA first', 'Neutral RFI', '2nd line role'], proTip: 'Пройди полный цикл в Case Manager до закрытия.' },
  m8: { objectives: ['CV и cover letter', 'Собеседование', 'План карьеры'], takeaways: ['CAMS path', 'EN bullets', '5 target firms'], proTip: 'Метрики в CV: cases reviewed, languages, certs in progress.' },
};
