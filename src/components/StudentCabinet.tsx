import { useMemo, useState } from 'react';
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CollapsibleSection,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Text,
  TextArea,
  UsageBar,
  useCanvasState,
  useHostTheme,
} from '../lib/ui';
import { getCourseModules, getCourseTitle } from '../data/course-localized';
import type { PracticeTask } from '../data/course-modules';
import {
  buildCertificateHtml,
  buildProgressReportHtml,
  openPrintWindow,
  type StudentProfile,
} from '../lib/reports';
import type { Lang } from '../i18n/types';
import { contentLang } from '../i18n/types';
import { tc } from '../i18n/content-strings';
import { getSessionUser } from '../lib/auth';
import { AuthPanel } from './AuthPanel';
import { buildAchievementShareText, shareFacebook, shareLinkedIn } from '../lib/social-share';

const TASK_TYPE_LABEL: Record<'ru' | 'en', Record<PracticeTask['type'], string>> = {
  ru: { quiz: 'Тест', scenario: 'Сценарий', case: 'Кейс-расследование', communication: 'Имитация общения', research: 'Исследование' },
  en: { quiz: 'Quiz', scenario: 'Scenario', case: 'Case investigation', communication: 'Communication sim', research: 'Research' },
};

function taskTypeLabel(lang: Lang, type: PracticeTask['type']): string {
  const cl = contentLang(lang);
  return TASK_TYPE_LABEL[cl][type];
}

function defaultProfile(): StudentProfile {
  return { fullName: '', email: '', startedAt: new Date().toISOString().slice(0, 10) };
}

export function PracticeTasksPanel({
  tasks,
  lang,
}: {
  tasks: PracticeTask[];
  lang: Lang;
}) {
  const theme = useHostTheme();
  const [completed, setCompleted] = useCanvasState<string[]>('completed-tasks', []);
  const [notes, setNotes] = useCanvasState<Record<string, string>>('practice-notes', {});
  const [revealed, setRevealed] = useCanvasState<Record<string, boolean>>('practice-revealed', {});

  const cl = contentLang(lang);
  if (tasks.length === 0) return null;

  return (
    <Stack gap={12}>
      {tasks.map((task) => {
        const done = completed.includes(task.id);
        const showExample = revealed[task.id];
        return (
          <Card key={task.id}>
            <CardHeader
              trailing={
                <Row gap={8} align="center">
                  <Pill tone="neutral" size="sm">{taskTypeLabel(lang, task.type)}</Pill>
                  {done && <Pill tone="success" size="sm">{cl === 'ru' ? 'Выполнено' : 'Done'}</Pill>}
                </Row>
              }
            >
              {task.title}
            </CardHeader>
            <CardBody>
              <Stack gap={12}>
                <Text size="small">{task.description}</Text>
                <Callout tone="info" title={lang === 'ru' ? 'Что сдать' : 'Deliverable'}>
                  <Text size="small">{task.deliverable}</Text>
                </Callout>
                <TextArea
                  value={notes[task.id] ?? ''}
                  onChange={(v) => setNotes((prev) => ({ ...prev, [task.id]: v }))}
                  placeholder={lang === 'ru' ? 'Ваш ответ или заметки по заданию…' : 'Your answer or notes…'}
                  rows={5}
                />
                <Row gap={8} wrap>
                  <Checkbox
                    checked={done}
                    onChange={(v) => {
                      setCompleted((prev) =>
                        v ? (prev.includes(task.id) ? prev : [...prev, task.id]) : prev.filter((id) => id !== task.id),
                      );
                    }}
                    label={lang === 'ru' ? 'Отметить как выполненное' : 'Mark as completed'}
                  />
                  {task.exampleAnswer && (
                    <Button
                      variant="ghost"
                      onClick={() => setRevealed((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                    >
                      {showExample
                        ? lang === 'ru' ? 'Скрыть пример' : 'Hide example'
                        : lang === 'ru' ? 'Показать пример решения' : 'Show example answer'}
                    </Button>
                  )}
                </Row>
                {showExample && task.exampleAnswer && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      border: `1px solid ${theme.stroke.primary}`,
                      background: theme.fill.tertiary,
                    }}
                  >
                    <Text size="small" weight="medium">
                      {lang === 'ru' ? 'Пример решения' : 'Example answer'}
                    </Text>
                    <Text size="small" tone="secondary" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                      {task.exampleAnswer}
                    </Text>
                  </div>
                )}
              </Stack>
            </CardBody>
          </Card>
        );
      })}
    </Stack>
  );
}

export function StudentCabinetView({
  lang,
  passedModules,
  passedOsint,
  certified,
  osintCertified,
  totalCases,
  osintModules,
}: {
  lang: Lang;
  passedModules: string[];
  passedOsint: string[];
  certified: boolean;
  osintCertified: boolean;
  totalCases: number;
  osintModules: Array<{ id: string; title: string; passed: boolean }>;
}) {
  const cl = contentLang(lang);
  const courseModules = useMemo(() => getCourseModules(cl), [cl]);
  const sessionUser = getSessionUser();
  const [profile, setProfile] = useCanvasState<StudentProfile>('student-profile', defaultProfile());
  const [completedTasks] = useCanvasState<string[]>('completed-tasks', []);
  const [copied, setCopied] = useState(false);

  const allTasks = useMemo(
    () => courseModules.flatMap((m) => m.practiceTasks.map((t) => ({ ...t, moduleTitle: m.title }))),
    [courseModules],
  );
  const tasksDone = completedTasks.filter((id) => allTasks.some((t) => t.id === id)).length;

  const reportData = useMemo(() => {
    const now = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB');
    return {
      profile,
      modules: courseModules.map((m) => ({
        id: m.id,
        title: m.title,
        passed: passedModules.includes(m.id),
        certified: passedModules.includes(m.id),
      })),
      osintModules: osintModules.map((m) => ({
        id: m.id,
        title: m.title,
        passed: m.passed,
        certified: m.passed,
      })),
      casesCompleted: 0,
      totalCases,
      finalCertified: certified,
      osintCertified,
      completedTasks: allTasks.filter((t) => completedTasks.includes(t.id)).map((t) => `${t.moduleTitle}: ${t.title}`),
      generatedAt: now,
      lang: cl,
    };
  }, [profile, passedModules, certified, osintCertified, completedTasks, allTasks, totalCases, lang, osintModules, courseModules, cl]);

  const canCertificate = certified && (profile.fullName.trim().length > 0 || !!sessionUser);
  const shareText = buildAchievementShareText({
    fullName: profile.fullName || sessionUser?.fullName || '',
    modulesPassed: passedModules.length,
    totalModules: courseModules.length,
    certified,
    lang: cl,
  });

  const handleShareCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Stack gap={20}>
      {!sessionUser && (
        <Stack gap={12}>
          <Callout tone="info">{tc(cl, 'guestMode')}</Callout>
          <AuthPanel lang={lang} onSuccess={() => {
            const u = getSessionUser();
            if (u) setProfile((p) => ({ ...p, fullName: u.fullName, email: u.email }));
          }} />
        </Stack>
      )}

      <Stack gap={6}>
        <H2>{cl === 'ru' ? 'Личный кабинет' : 'Student cabinet'}</H2>
        <Text tone="secondary">{getCourseTitle(cl)}</Text>
        {sessionUser && <Pill tone="success" size="sm">{sessionUser.email}</Pill>}
      </Stack>

      <div className="stats-grid">
        <Stat
          value={`${passedModules.length}/${courseModules.length}`}
          label={cl === 'ru' ? 'Модулей сдано' : 'Modules passed'}
          tone={passedModules.length === courseModules.length ? 'success' : 'info'}
        />
        <Stat
          value={`${tasksDone}/${allTasks.length}`}
          label={lang === 'ru' ? 'Практических заданий' : 'Practice tasks'}
          tone={tasksDone === allTasks.length ? 'success' : 'warning'}
        />
        <Stat
          value={certified ? (lang === 'ru' ? 'Да' : 'Yes') : (lang === 'ru' ? 'Нет' : 'No')}
          label={lang === 'ru' ? 'Сертификат' : 'Certificate'}
          tone={certified ? 'success' : 'info'}
        />
      </div>

      <Card>
        <CardHeader>{lang === 'ru' ? 'Профиль студента' : 'Student profile'}</CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Text size="small" tone="secondary">
              {lang === 'ru'
                ? 'Данные сохраняются локально в браузере и используются в отчёте и сертификате.'
                : 'Data is stored locally in your browser for reports and certificates.'}
            </Text>
            <Row gap={12} wrap>
              <Stack gap={4} style={{ flex: 1, minWidth: 200 }}>
                <Text size="small" weight="medium">{lang === 'ru' ? 'ФИО' : 'Full name'}</Text>
                <TextArea
                  value={profile.fullName}
                  onChange={(v) => setProfile((p) => ({ ...p, fullName: v }))}
                  rows={1}
                  placeholder={lang === 'ru' ? 'Иван Иванов' : 'Jane Doe'}
                />
              </Stack>
              <Stack gap={4} style={{ flex: 1, minWidth: 200 }}>
                <Text size="small" weight="medium">Email</Text>
                <TextArea
                  value={profile.email}
                  onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
                  rows={1}
                  placeholder="student@email.com"
                />
              </Stack>
              <Stack gap={4} style={{ minWidth: 140 }}>
                <Text size="small" weight="medium">{lang === 'ru' ? 'Дата старта' : 'Start date'}</Text>
                <input
                  type="date"
                  value={profile.startedAt}
                  onChange={(e) => setProfile((p) => ({ ...p, startedAt: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d4d4d8' }}
                />
              </Stack>
            </Row>
          </Stack>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>{cl === 'ru' ? 'Прогресс по модулям' : 'Module progress'}</CardHeader>
        <CardBody>
          <UsageBar
            segments={[
              { id: 'done', value: passedModules.length, color: 'green' },
              { id: 'left', value: Math.max(0, courseModules.length - passedModules.length), color: 'gray' },
            ]}
            total={courseModules.length}
            topLeftLabel={cl === 'ru' ? 'Основной курс' : 'Main course'}
            topRightLabel={`${passedModules.length}/${courseModules.length}`}
          />
          <Stack gap={8} style={{ marginTop: 16 }}>
            {courseModules.map((m) => (
              <Row key={m.id} gap={8} align="center">
                <Pill tone={passedModules.includes(m.id) ? 'success' : 'neutral'} size="sm">
                  {passedModules.includes(m.id) ? '✓' : m.id.toUpperCase()}
                </Pill>
                <Text size="small">{m.title}</Text>
              </Row>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <CollapsibleSection title={lang === 'ru' ? 'Все практические задания' : 'All practice tasks'} defaultOpen>
        <PracticeTasksPanel tasks={allTasks} lang={lang} />
      </CollapsibleSection>

      <Card>
        <CardHeader>{lang === 'ru' ? 'Отчёты и сертификат' : 'Reports & certificate'}</CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Text size="small" tone="secondary">
              {lang === 'ru'
                ? 'Сформируйте отчёт о проделанной работе для работодателя или ментора. Сертификат доступен после финального экзамена.'
                : 'Generate a progress report for employers or mentors. Certificate unlocks after the final exam.'}
            </Text>
            <Row gap={8} wrap>
              <Button
                variant="primary"
                onClick={() => openPrintWindow(buildProgressReportHtml(reportData), cl === 'ru' ? 'Отчёт' : 'Report', cl)}
              >
                {cl === 'ru' ? 'Скачать отчёт (PDF/печать)' : 'Download report (print/PDF)'}
              </Button>
              <Button
                variant="ghost"
                disabled={!canCertificate}
                onClick={() => openPrintWindow(buildCertificateHtml(reportData), cl === 'ru' ? 'Сертификат' : 'Certificate', cl)}
              >
                {cl === 'ru' ? 'Сертификат' : 'Certificate'}
              </Button>
              <Button style={{ background: '#0a66c2', color: '#fff' }} variant="primary" onClick={() => shareLinkedIn({ title: getCourseTitle(cl), summary: shareText })}>
                {tc(cl, 'shareLinkedIn')}
              </Button>
              <Button style={{ background: '#1877f2', color: '#fff' }} variant="primary" onClick={() => shareFacebook({ quote: shareText })}>
                {tc(cl, 'shareFacebook')}
              </Button>
              <Button variant="ghost" onClick={handleShareCopy}>
                {copied ? tc(cl, 'shareCopied') : tc(cl, 'shareCopy')}
              </Button>
            </Row>
            {!certified && (
              <Callout tone="warning" title={lang === 'ru' ? 'Сертификат заблокирован' : 'Certificate locked'}>
                {lang === 'ru'
                  ? 'Пройдите все 8 модулей и финальный экзамен, затем укажите ФИО в профиле.'
                  : 'Complete all 8 modules and the final exam, then enter your full name.'}
              </Callout>
            )}
            {certified && !profile.fullName.trim() && (
              <Callout tone="warning" title={lang === 'ru' ? 'Укажите ФИО' : 'Enter your name'}>
                {lang === 'ru' ? 'Для сертификата заполните поле «ФИО» выше.' : 'Fill in your full name above to generate the certificate.'}
              </Callout>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
