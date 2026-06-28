import { useMemo } from 'react';
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
import { COURSE_MODULES, COURSE_TITLE, type PracticeTask } from '../data/course-modules';
import {
  buildCertificateHtml,
  buildProgressReportHtml,
  openPrintWindow,
  type StudentProfile,
} from '../lib/reports';

type Lang = 'ru' | 'en' | 'lt' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it' | 'pt';

const TASK_TYPE_LABEL: Record<PracticeTask['type'], string> = {
  quiz: 'Тест',
  scenario: 'Сценарий',
  case: 'Кейс-расследование',
  communication: 'Имитация общения',
  research: 'Исследование',
};

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
                  <Pill tone="neutral" size="sm">{TASK_TYPE_LABEL[task.type]}</Pill>
                  {done && <Pill tone="success" size="sm">{lang === 'ru' ? 'Выполнено' : 'Done'}</Pill>}
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
  const [profile, setProfile] = useCanvasState<StudentProfile>('student-profile', defaultProfile());
  const [completedTasks] = useCanvasState<string[]>('completed-tasks', []);

  const allTasks = useMemo(
    () => COURSE_MODULES.flatMap((m) => m.practiceTasks.map((t) => ({ ...t, moduleTitle: m.title }))),
    [],
  );
  const tasksDone = completedTasks.filter((id) => allTasks.some((t) => t.id === id)).length;

  const reportData = useMemo(() => {
    const now = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB');
    return {
      profile,
      modules: COURSE_MODULES.map((m) => ({
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
    };
  }, [profile, passedModules, certified, osintCertified, completedTasks, allTasks, totalCases, lang, osintModules]);

  const canCertificate = certified && profile.fullName.trim().length > 0;

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H2>{lang === 'ru' ? 'Личный кабинет' : 'Student cabinet'}</H2>
        <Text tone="secondary">{COURSE_TITLE}</Text>
      </Stack>

      <div className="stats-grid">
        <Stat
          value={`${passedModules.length}/${COURSE_MODULES.length}`}
          label={lang === 'ru' ? 'Модулей сдано' : 'Modules passed'}
          tone={passedModules.length === COURSE_MODULES.length ? 'success' : 'info'}
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
        <CardHeader>{lang === 'ru' ? 'Прогресс по модулям' : 'Module progress'}</CardHeader>
        <CardBody>
          <UsageBar
            segments={[
              { id: 'done', value: passedModules.length, color: 'green' },
              { id: 'left', value: Math.max(0, COURSE_MODULES.length - passedModules.length), color: 'gray' },
            ]}
            total={COURSE_MODULES.length}
            topLeftLabel={lang === 'ru' ? 'Основной курс' : 'Main course'}
            topRightLabel={`${passedModules.length}/${COURSE_MODULES.length}`}
          />
          <Stack gap={8} style={{ marginTop: 16 }}>
            {COURSE_MODULES.map((m) => (
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
                onClick={() => openPrintWindow(buildProgressReportHtml(reportData), lang === 'ru' ? 'Отчёт о прогрессе' : 'Progress report')}
              >
                {lang === 'ru' ? 'Скачать отчёт (PDF/печать)' : 'Download report (print/PDF)'}
              </Button>
              <Button
                variant="ghost"
                disabled={!canCertificate}
                onClick={() => openPrintWindow(buildCertificateHtml(reportData), lang === 'ru' ? 'Сертификат' : 'Certificate')}
              >
                {lang === 'ru' ? 'Сертификат' : 'Certificate'}
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
