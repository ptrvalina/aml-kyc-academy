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
  const pct = data.modules.filter((m) => m.passed).length;
  const total = data.modules.length;
  const osintPct = data.osintModules.filter((m) => m.passed).length;

  const moduleRows = data.modules
    .map(
      (m) =>
        `<tr><td>${escapeHtml(m.title)}</td><td>${m.passed ? '✓ Сдан' : '—'}</td><td>${m.passed ? 'Тест пройден' : 'В процессе'}</td></tr>`,
    )
    .join('');

  const taskList =
    data.completedTasks.length > 0
      ? data.completedTasks.map((t) => `<li>${escapeHtml(t)}</li>`).join('')
      : '<li>Практические задания отмечайте в модулях</li>';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Отчёт о прогрессе — AML/KYC Academy</title>
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
  <h1>Отчёт о прохождении курса</h1>
  <p class="meta"><strong>AML/KYC Analyst: от теории к практике</strong><br/>
  Студент: ${escapeHtml(data.profile.fullName || 'Не указано')} · ${escapeHtml(data.profile.email || '')}<br/>
  Дата отчёта: ${escapeHtml(data.generatedAt)} · Старт обучения: ${escapeHtml(data.profile.startedAt)}</p>

  <p><span class="badge">Основной курс: ${pct}/${total} модулей</span>
  ${data.finalCertified ? '<span class="badge">Сертификат основного курса</span>' : ''}
  ${osintPct > 0 ? `<span class="badge">OSINT: ${osintPct}/${data.osintModules.length}</span>` : ''}
  </p>

  <h2>Модули</h2>
  <table>
    <thead><tr><th>Модуль</th><th>Статус</th><th>Комментарий</th></tr></thead>
    <tbody>${moduleRows}</tbody>
  </table>

  <h2>Практика</h2>
  <ul>
    <li>Кейсы в Case Manager: ${data.casesCompleted}+ отработано (всего в библиотеке: ${data.totalCases})</li>
    ${taskList}
  </ul>

  <h2>Компетенции (по итогам курса)</h2>
  <ul>
    <li>Понимание AML/KYC терминологии и Risk-Based Approach</li>
    <li>CDD/EDD расследования и OSINT для adverse media / UBO</li>
    <li>Sanctions screening и transaction monitoring red flags</li>
    <li>Подготовка SAR и взаимодействие с MLRO</li>
    <li>Готовность к позиции Junior AML/KYC Analyst</li>
  </ul>

  <p style="margin-top:32px;font-size:12px;color:#888;">Сгенерировано платформой AML/KYC Academy · ${escapeHtml(data.generatedAt)}</p>
</body>
</html>`;
}

export function buildCertificateHtml(data: ReportInput): string {
  const name = escapeHtml(data.profile.fullName || 'Студент курса');
  const date = escapeHtml(data.generatedAt);
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Сертификат AML/KYC Academy</title>
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
    <h1>СЕРТИФИКАТ</h1>
    <h2>AML/KYC Analyst: от теории к практике</h2>
    <p>Настоящим подтверждается, что</p>
    <div class="name">${name}</div>
    <p>успешно завершил(а) учебный курс по программе AML/KYC Compliance: 8 модулей, тестирование, практические кейсы и финальная аттестация.</p>
    <p class="date">Дата выдачи: ${date}</p>
    <p style="font-size:12px;color:#999;margin-top:48px;">AML/KYC Academy · ptrvalina.github.io/aml-kyc-academy</p>
  </div>
</body>
</html>`;
}

export function openPrintWindow(html: string, title: string): void {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Разрешите всплывающие окна для скачивания отчёта');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.document.title = title;
  setTimeout(() => w.print(), 400);
}
