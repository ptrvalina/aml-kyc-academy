export type StudentProfile = {
  fullName: string;
  email: string;
  startedAt: string;
};

export type ModuleProgress = {
  id: string;
  title: string;
  passed: boolean;
  certified: boolean;
};

export type ReportInput = {
  profile: StudentProfile;
  modules: ModuleProgress[];
  osintModules: ModuleProgress[];
  casesCompleted: number;
  totalCases: number;
  finalCertified: boolean;
  osintCertified: boolean;
  completedTasks: string[];
  generatedAt: string;
  lang?: 'ru' | 'en';
};

const STORAGE_PREFIX = 'aml-kyc-academy:';

export function loadProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'student-profile');
    if (raw) return JSON.parse(raw) as StudentProfile;
  } catch {
    /* ignore */
  }
  return { fullName: '', email: '', startedAt: new Date().toISOString().slice(0, 10) };
}

export function saveProfile(profile: StudentProfile): void {
  localStorage.setItem(STORAGE_PREFIX + 'student-profile', JSON.stringify(profile));
}

export function loadCompletedTasks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'completed-tasks');
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

export function toggleTaskComplete(taskId: string): string[] {
  const cur = loadCompletedTasks();
  const next = cur.includes(taskId) ? cur.filter((id) => id !== taskId) : [...cur, taskId];
  localStorage.setItem(STORAGE_PREFIX + 'completed-tasks', JSON.stringify(next));
  return next;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildProgressReportHtml(data: ReportInput): string {
  const lang = data.lang ?? 'ru';
  const pct = data.modules.filter((m) => m.passed).length;
  const total = data.modules.length;
  const osintPct = data.osintModules.filter((m) => m.passed).length;

  const passedLabel = lang === 'ru' ? '✓ Сдан' : '✓ Passed';
  const passedComment = lang === 'ru' ? 'Тест пройден' : 'Test passed';
  const inProgress = lang === 'ru' ? 'В процессе' : 'In progress';

  const moduleRows = data.modules
    .map(
      (m) =>
        `<tr><td>${escapeHtml(m.title)}</td><td>${m.passed ? passedLabel : '—'}</td><td>${m.passed ? passedComment : inProgress}</td></tr>`,
    )
    .join('');

  const taskList =
    data.completedTasks.length > 0
      ? data.completedTasks.map((t) => `<li>${escapeHtml(t)}</li>`).join('')
      : lang === 'ru'
        ? '<li>Практические задания отмечайте в модулях</li>'
        : '<li>Mark practice tasks in modules</li>';

  const title = lang === 'ru' ? 'Отчёт о прохождении курса' : 'Course progress report';
  const courseName = lang === 'ru' ? 'AML/KYC Analyst: от теории к практике' : 'AML/KYC Analyst: From Theory to Practice';
  const studentLabel = lang === 'ru' ? 'Студент' : 'Student';
  const notSet = lang === 'ru' ? 'Не указано' : 'Not set';
  const reportDate = lang === 'ru' ? 'Дата отчёта' : 'Report date';
  const startDate = lang === 'ru' ? 'Старт обучения' : 'Started';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>${title} — AML/KYC Academy</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #111; line-height: 1.5; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #555; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f4f4f5; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eef2ff; color: #4338ca; font-size: 13px; font-weight: 600; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta"><strong>${courseName}</strong><br/>
  ${studentLabel}: ${escapeHtml(data.profile.fullName || notSet)} · ${escapeHtml(data.profile.email || '')}<br/>
  ${reportDate}: ${escapeHtml(data.generatedAt)} · ${startDate}: ${escapeHtml(data.profile.startedAt)}</p>

  <p><span class="badge">${lang === 'ru' ? 'Основной курс' : 'Main course'}: ${pct}/${total} ${lang === 'ru' ? 'модулей' : 'modules'}</span>
  ${data.finalCertified ? `<span class="badge">${lang === 'ru' ? 'Сертификат основного курса' : 'Main course certificate'}</span>` : ''}
  ${osintPct > 0 ? `<span class="badge">OSINT: ${osintPct}/${data.osintModules.length}</span>` : ''}
  </p>

  <h2>${lang === 'ru' ? 'Модули' : 'Modules'}</h2>
  <table>
    <thead><tr><th>${lang === 'ru' ? 'Модуль' : 'Module'}</th><th>${lang === 'ru' ? 'Статус' : 'Status'}</th><th>${lang === 'ru' ? 'Комментарий' : 'Comment'}</th></tr></thead>
    <tbody>${moduleRows}</tbody>
  </table>

  <h2>${lang === 'ru' ? 'Практика' : 'Practice'}</h2>
  <ul>
    <li>${lang === 'ru' ? 'Кейсы в Case Manager' : 'Case Manager cases'}: ${data.casesCompleted}+ (${lang === 'ru' ? 'всего' : 'total'}: ${data.totalCases})</li>
    ${taskList}
  </ul>

  <h2>${lang === 'ru' ? 'Компетенции (по итогам курса)' : 'Competencies'}</h2>
  <ul>
    ${lang === 'ru' ? `
    <li>Понимание AML/KYC терминологии и Risk-Based Approach</li>
    <li>CDD/EDD расследования и OSINT для adverse media / UBO</li>
    <li>Sanctions screening и transaction monitoring red flags</li>
    <li>Подготовка SAR и взаимодействие с MLRO</li>
    <li>Готовность к позиции Junior AML/KYC Analyst</li>` : `
    <li>AML/KYC terminology and Risk-Based Approach</li>
    <li>CDD/EDD investigations and OSINT for adverse media / UBO</li>
    <li>Sanctions screening and transaction monitoring red flags</li>
    <li>SAR preparation and MLRO interaction</li>
    <li>Ready for Junior AML/KYC Analyst role</li>`}
  </ul>

  <p style="margin-top:32px;font-size:12px;color:#888;">AML/KYC Academy · ${escapeHtml(data.generatedAt)}</p>
</body>
</html>`;
}

export function buildCertificateHtml(data: ReportInput): string {
  const lang = data.lang ?? 'ru';
  const name = escapeHtml(data.profile.fullName || (lang === 'ru' ? 'Студент курса' : 'Course graduate'));
  const date = escapeHtml(data.generatedAt);
  const certTitle = lang === 'ru' ? 'СЕРТИФИКАТ' : 'CERTIFICATE';
  const courseName = lang === 'ru' ? 'AML/KYC Analyst: от теории к практике' : 'AML/KYC Analyst: From Theory to Practice';
  const confirms = lang === 'ru' ? 'Настоящим подтверждается, что' : 'This certifies that';
  const body = lang === 'ru'
    ? 'успешно завершил(а) учебный курс по программе AML/KYC Compliance: 8 модулей, тестирование, практические кейсы и финальная аттестация.'
    : 'has successfully completed the AML/KYC Compliance program: 8 modules, testing, practice cases and final certification.';
  const dateLabel = lang === 'ru' ? 'Дата выдачи' : 'Issue date';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>${lang === 'ru' ? 'Сертификат' : 'Certificate'} AML/KYC Academy</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    body { margin: 0; font-family: Georgia, serif; background: #fafafa; }
    .cert { width: 1000px; margin: 40px auto; padding: 48px 64px; border: 8px solid #4338ca; background: #fff; text-align: center; }
    h1 { font-size: 36px; color: #1e1b4b; margin: 0 0 8px; letter-spacing: 2px; }
    h2 { font-size: 18px; font-weight: normal; color: #6366f1; margin: 0 0 32px; }
    .name { font-size: 32px; margin: 24px 0; color: #111; border-bottom: 2px solid #c7d2fe; display: inline-block; padding-bottom: 8px; min-width: 400px; }
    p { font-size: 16px; color: #444; max-width: 640px; margin: 16px auto; line-height: 1.6; }
    .date { margin-top: 40px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="cert">
    <h1>${certTitle}</h1>
    <h2>${courseName}</h2>
    <p>${confirms}</p>
    <div class="name">${name}</div>
    <p>${body}</p>
    <p class="date">${dateLabel}: ${date}</p>
    <p style="font-size:12px;color:#999;margin-top:48px;">AML/KYC Academy · ptrvalina.github.io/aml-kyc-academy</p>
  </div>
</body>
</html>`;
}

export function openPrintWindow(html: string, title: string, lang: 'ru' | 'en' = 'ru'): void {
  const w = window.open('', '_blank');
  if (!w) {
    alert(lang === 'ru' ? 'Разрешите всплывающие окна для скачивания отчёта' : 'Allow pop-ups to download the report');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.document.title = title;
  setTimeout(() => w.print(), 400);
}
