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

export function evaluateAnswer(text: string, rubric: RubricCriterion[]): EvalResult {
  const trimmed = text.trim();
  if (trimmed.length < 15) {
    return {
      verdict: 'incorrect',
      score: 0,
      maxScore: 100,
      percent: 0,
      found: [],
      missing: rubric.map((r) => r.label),
      remarks: ['Ответ слишком короткий. Опиши red flags, шаги расследования и решение подробнее — порядок слов и знаки препинания не важны.'],
      mistakes: [],
    };
  }

  const found: Array<{ label: string; matched: string }> = [];
  const missing: string[] = [];
  const mistakes: string[] = [];
  let score = 0;
  let maxScore = 0;
  let requiredMissed = 0;

  for (const criterion of rubric) {
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
          mistakes.push(`Рискованная формулировка: «${group[0]}» — пересмотри блок «${criterion.label}».`);
          score = Math.max(0, score - Math.round(criterion.weight * 0.4));
        }
      }
    }
  }

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount >= 60) score += 4;
  if (wordCount >= 100) score += 6;
  maxScore += 10;
  score = Math.min(score, maxScore);

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const foundRatio = found.length / Math.max(1, rubric.length);

  const remarks: string[] = [
    'Оценка по смыслу и ключевым пунктам — не требуется дословное совпадение.',
  ];
  if (found.length > 0) {
    remarks.push(`Засчитано: ${found.map((f) => f.label).join(', ')}.`);
  }
  if (missing.length > 0 && missing.length <= 5) {
    remarks.push(`Добавь по смыслу: ${missing.slice(0, 5).join(', ')}.`);
  } else if (missing.length > 5) {
    remarks.push(`Не хватает ${missing.length} пунктов — см. список ниже.`);
  }
  if (mistakes.length > 0) remarks.push(...mistakes);

  let verdict: Verdict;
  if (percent >= 78 && requiredMissed === 0 && mistakes.length === 0) {
    verdict = 'correct';
    remarks.unshift('Сильный ответ — логика расследования понятна.');
  } else if (percent >= 55 && requiredMissed <= 1) {
    verdict = 'partial_ok';
    remarks.unshift('В целом верно — доработай пробелы перед закрытием кейса.');
  } else if (percent >= 30 || foundRatio >= 0.35) {
    verdict = 'partial_bad';
    remarks.unshift('Частично верно — перечитай урок и добавь недостающие элементы.');
  } else {
    verdict = 'incorrect';
    remarks.unshift('Недостаточно ключевых пунктов — опирайся на задания кейса и глоссарий.');
  }

  return { verdict, score, maxScore, percent, found, missing, remarks, mistakes };
}
