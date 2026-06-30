export type Verdict = 'correct' | 'partial_ok' | 'partial_bad' | 'incorrect';

export type RubricCriterion = {
  id: string;
  label: string;
  weight: number;
  required?: boolean;
  patterns?: string[][];
  mistakePatterns?: string[][];
};

export type EvalResult = {
  verdict: Verdict;
  score: number;
  maxScore: number;
  percent: number;
  found: Array<{ label: string; matched: string }>;
  missing: string[];
  remarks: string[];
  mistakes: string[];
};

/** Расширенные синонимы — засчитываем смысл, не точную формулировку */
const SYNONYM_GROUPS: string[][] = [
  ['cdd', 'customer due diligence', 'due diligence', 'стандартная проверка', 'стандартн', 'базовая проверка', 'know your customer', 'kyc провер'],
  ['edd', 'enhanced due diligence', 'усиленн', 'углублен', 'enhanced review', 'расширенн'],
  ['rfi', 'request for information', 'запрос информации', 'запрос документ', 'запросить у клиента', 'уточняющ'],
  ['sar', 'suspicious activity report', 'str', 'подозрительн', 'сообщение о подозр', 'suspicious transaction'],
  ['mlro', 'money laundering reporting officer', 'compliance officer', 'комплаенс', 'ответственн за aml'],
  ['pep', 'politically exposed', 'политически знач', 'публичн должност'],
  ['ubo', 'ultimate beneficial owner', 'бенефициар', 'конечн владел', 'beneficial owner'],
  ['sof', 'source of funds', 'источник средств', 'откуда деньги'],
  ['sow', 'source of wealth', 'источник состояния', 'источник богат'],
  ['sanctions', 'санкц', 'ofac', 'sdn', 'экономическ'],
  ['structuring', 'smurfing', 'дроблен', 'обход порог', 'just below threshold', 'структур'],
  ['tipping off', 'tipping-off', 'предупрежд', 'нельзя сообщать клиенту', 'не говорить клиенту о sar'],
  ['audit trail', 'audit-trail', 'документир', 'audit log', 'журнал действ', 'след расслед'],
  ['red flag', 'red flags', 'redflag', 'признак', 'подозрительн', 'аномал', 'несоответств'],
  ['escalat', 'эскалац', 'передать mlro', 'передать старш'],
  ['false positive', 'false-positive', 'ложн', 'не совпад', 'другой человек'],
  ['true match', 'true-match', 'подтвержден', 'совпадение подтверж'],
  ['monitor', 'монитор', 'ongoing', 'отслежив', 'наблюден'],
  ['approve', 'одобр', 'accept', 'принять клиента', 'onboard'],
  ['reject', 'отказ', 'decline', 'offboard', 'закрыть отношен'],
  ['travel rule', 'travel-rule', 'fatf r.16', 'передача данных между vasp'],
  ['adverse media', 'негативн медиа', 'негативн пресс', 'сми', 'media screening'],
  ['mule', 'muling', 'транзит', 'прокладк', 'pass-through'],
  ['layering', 'слоен', 'запутыван'],
  ['placement', 'ввод', 'внесение в систему'],
  ['hrj', 'high risk jurisdiction', 'рискованн юрисдикц', 'офшор'],
  ['fiu', 'financial intelligence', 'financ', 'разведк'],
  ['fatf', '40 рекомен', 'financial action task force'],
  ['osint', 'open source', 'открытые источник', 'расследован'],
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev + 1, row[j] + 1, row[j - 1] + 1);
      prev = tmp;
    }
  }
  return row[b.length];
}

function expandPattern(pattern: string): string[] {
  const base = normalize(pattern);
  const out = new Set<string>([base]);
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => base.includes(normalize(g)) || normalize(g).includes(base))) {
      group.forEach((g) => out.add(normalize(g)));
    }
  }
  return [...out];
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter((w) => w.length > 2);
}

function fuzzyTokenMatch(token: string, pattern: string): boolean {
  const p = normalize(pattern);
  const t = normalize(token);
  if (t === p || t.includes(p) || p.includes(t)) return true;
  const maxDist = p.length <= 4 ? 1 : p.length <= 7 ? 2 : 3;
  return levenshtein(t, p) <= maxDist;
}

export function matchesPattern(text: string, pattern: string): boolean {
  const normalized = normalize(text);
  const variants = expandPattern(pattern);

  for (const variant of variants) {
    if (normalized.includes(variant)) return true;

    const vWords = variant.split(/\s+/).filter(Boolean);
    if (vWords.length === 1) {
      if (tokenize(text).some((t) => fuzzyTokenMatch(t, vWords[0]))) return true;
      continue;
    }

    const tokens = tokenize(text);
    let matched = 0;
    for (const vw of vWords) {
      if (tokens.some((t) => fuzzyTokenMatch(t, vw)) || normalized.includes(vw)) matched++;
    }
    if (matched / vWords.length >= 0.55) return true;
  }

  return false;
}

export function matchesGroup(text: string, group: string[]): boolean {
  return group.some((p) => matchesPattern(text, p));
}

export type EvalLang = 'ru' | 'en';

export type EvaluateOptions = {
  lang?: EvalLang;
  /** Minimum word count before scoring (default 12). */
  minWords?: number;
};

const CRITERION_LABEL_EN: Record<string, string> = {
  cdd: 'CDD / verification level',
  risk: 'Client risk assessment',
  flags: 'Red flags / absence of flags',
  decision: 'Decision approve/EDD/reject',
  monitor: 'Ongoing monitoring',
  edd: 'EDD required',
  pep: 'PEP status considered',
  media: 'Adverse media review',
  docs: 'SOW/SOF, UBO, declarations',
  approval: 'Senior / MLRO approval',
  verify: 'Identifier verification',
  'not-auto': 'No auto-close without review',
  osint: 'OSINT / registries',
  match: 'True vs false match logic',
  action: 'Next step (freeze/SAR/block)',
  alert: 'TM alert type',
  profile: 'Profile mismatch',
  rfi: 'RFI / client questions',
  next: 'Escalation / SAR / closure',
  typology: 'Fraud typology (ATO/scam/APP)',
  indicators: 'Fraud indicators',
  report: 'SAR / fraud report / police',
  vasp: 'VASP / Travel Rule',
  analytics: 'Blockchain analytics',
  sof: 'SOF / origin of funds or crypto',
  tbml: 'Trade-based ML typology',
  price: 'Price / market mismatch',
  route: 'Suspicious trade route / intermediary',
  sources: 'OSINT sources',
  doc: 'Documentation in case notes',
  chain: 'Investigation chain',
  suspicion: 'Reasonable suspicion',
  tipping: 'No tipping off',
  mlro: 'MLRO escalation',
  sar: 'SAR filing decision',
  structure: 'Corporate structure',
  shell: 'Shell / nominee detection',
  jurisdiction: 'HRJ / FATF list',
  purpose: 'Economic purpose of transaction',
  corridor: 'Corridor / counterparty risk',
  ctr: 'CTR / reporting thresholds',
  structuring: 'Cash structuring',
  business: 'Cash-intensive business fit',
  wire: 'Wire transfer analysis',
  beneficiary: 'Beneficiary / ordering party check',
  sanctions: 'Sanctions / name screening',
  protocol: 'DeFi protocol risk',
  wallet: 'Wallet clustering / exposure',
  mixer: 'Mixer / bridge / privacy coin',
  kyc: 'Unhosted wallet / KYC gap',
  exercise: 'Exercise completion',
};

export function localizeRubric(rubric: RubricCriterion[], lang: EvalLang): RubricCriterion[] {
  if (lang === 'ru') return rubric;
  return rubric.map((c) => ({
    ...c,
    label: CRITERION_LABEL_EN[c.id] ?? c.label,
  }));
}

const EVAL_MSG: Record<EvalLang, {
  tooShort: (min: number) => string;
  scoredByMeaning: string;
  found: (labels: string) => string;
  addMeaning: (labels: string) => string;
  missingMany: (n: number) => string;
  riskyPhrase: (phrase: string, block: string) => string;
  verdict: Record<Verdict, string>;
}> = {
  ru: {
    tooShort: (min) =>
      `Ответ слишком короткий (нужно минимум ${min} слов). Опиши red flags, шаги расследования и решение подробнее — порядок слов и знаки препинания не важны.`,
    scoredByMeaning: 'Оценка по смыслу и ключевым пунктам — не требуется дословное совпадение.',
    found: (labels) => `Засчитано: ${labels}.`,
    addMeaning: (labels) => `Добавь по смыслу: ${labels}.`,
    missingMany: (n) => `Не хватает ${n} пунктов — см. список ниже.`,
    riskyPhrase: (phrase, block) => `Рискованная формулировка: «${phrase}» — пересмотри блок «${block}».`,
    verdict: {
      correct: 'Сильный ответ — логика расследования понятна.',
      partial_ok: 'В целом верно — доработай пробелы перед закрытием кейса.',
      partial_bad: 'Частично верно — перечитай урок и добавь недостающие элементы.',
      incorrect: 'Недостаточно ключевых пунктов — опирайся на задания кейса и глоссарий.',
    },
  },
  en: {
    tooShort: (min) =>
      `Answer is too short (minimum ${min} words). Describe red flags, investigation steps, and your decision — exact wording does not matter.`,
    scoredByMeaning: 'Scored by meaning and key points — no verbatim match required.',
    found: (labels) => `Credited: ${labels}.`,
    addMeaning: (labels) => `Add by meaning: ${labels}.`,
    missingMany: (n) => `${n} items still missing — see list below.`,
    riskyPhrase: (phrase, block) => `Risky phrasing: "${phrase}" — revisit "${block}".`,
    verdict: {
      correct: 'Strong answer — investigation logic is clear.',
      partial_ok: 'Mostly correct — close the gaps before closing the case.',
      partial_bad: 'Partially correct — review the lesson and add missing elements.',
      incorrect: 'Not enough key points — use case tasks and the glossary.',
    },
  },
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function evaluateAnswer(text: string, rubric: RubricCriterion[], options: EvaluateOptions = {}): EvalResult {
  const lang = options.lang ?? 'ru';
  const msg = EVAL_MSG[lang];
  const minWords = options.minWords ?? 12;
  const trimmed = text.trim();
  const localizedRubric = localizeRubric(rubric, lang);

  if (countWords(trimmed) < minWords) {
    return {
      verdict: 'incorrect',
      score: 0,
      maxScore: 100,
      percent: 0,
      found: [],
      missing: localizedRubric.map((r) => r.label),
      remarks: [msg.tooShort(minWords)],
      mistakes: [],
    };
  }

  const found: Array<{ label: string; matched: string }> = [];
  const missing: string[] = [];
  const mistakes: string[] = [];
  let score = 0;
  let maxScore = 0;
  let requiredMissed = 0;

  for (const criterion of localizedRubric) {
    maxScore += criterion.weight;
    const groups = criterion.patterns ?? [];
    let hit = false;
    let matchedPhrase = criterion.label;

    for (const group of groups) {
      const matchedPattern = group.find((p) => matchesPattern(trimmed, p));
      if (matchedPattern) {
        hit = true;
        matchedPhrase = matchedPattern;
        break;
      }
    }

    if (hit) {
      score += criterion.weight;
      found.push({ label: criterion.label, matched: matchedPhrase });
    } else {
      if (criterion.required) requiredMissed += 1;
      missing.push(criterion.label);
    }

    if (criterion.mistakePatterns) {
      for (const group of criterion.mistakePatterns) {
        if (matchesGroup(trimmed, group)) {
          mistakes.push(msg.riskyPhrase(group[0], criterion.label));
          score = Math.max(0, score - Math.round(criterion.weight * 0.4));
        }
      }
    }
  }

  const wordCount = countWords(trimmed);
  if (wordCount >= 60) score += 4;
  if (wordCount >= 100) score += 6;
  maxScore += 10;
  score = Math.min(score, maxScore);

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const foundRatio = found.length / Math.max(1, localizedRubric.length);

  const remarks: string[] = [msg.scoredByMeaning];
  if (found.length > 0) {
    remarks.push(msg.found(found.map((f) => f.label).join(', ')));
  }
  if (missing.length > 0 && missing.length <= 5) {
    remarks.push(msg.addMeaning(missing.slice(0, 5).join(', ')));
  } else if (missing.length > 5) {
    remarks.push(msg.missingMany(missing.length));
  }
  if (mistakes.length > 0) remarks.push(...mistakes);

  let verdict: Verdict;
  if (percent >= 78 && requiredMissed === 0 && mistakes.length === 0) {
    verdict = 'correct';
    remarks.unshift(msg.verdict.correct);
  } else if (percent >= 55 && requiredMissed <= 1) {
    verdict = 'partial_ok';
    remarks.unshift(msg.verdict.partial_ok);
  } else if (percent >= 30 || foundRatio >= 0.35) {
    verdict = 'partial_bad';
    remarks.unshift(msg.verdict.partial_bad);
  } else {
    verdict = 'incorrect';
    remarks.unshift(msg.verdict.incorrect);
  }

  return { verdict, score, maxScore, percent, found, missing, remarks, mistakes };
}
