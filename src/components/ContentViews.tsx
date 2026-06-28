import { useMemo, useState } from 'react';
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H2,
  H3,
  Link,
  Pill,
  Row,
  Select,
  Stack,
  Text,
  useHostTheme,
} from '../lib/ui';
import type { Lang } from '../i18n/types';
import { contentLang } from '../i18n/types';
import { tc, getCategoryLabels } from '../i18n/content-strings';
import { getLiterature } from '../i18n/literature';
import { getTrainers, TRAINER_CATEGORY_LABELS } from '../i18n/trainers';
import { getNews } from '../i18n/news';

export function LiteratureView({ lang }: { lang: Lang }) {
  const cl = contentLang(lang);
  const items = getLiterature(cl);
  const [level, setLevel] = useState<string>('all');
  const theme = useHostTheme();

  const filtered = useMemo(
    () => (level === 'all' ? items : items.filter((i) => i.level === level)),
    [items, level],
  );

  const levelLabel = (l: string) =>
    l === 'beginner' ? tc(cl, 'literatureBeginner') : l === 'intermediate' ? tc(cl, 'literatureIntermediate') : tc(cl, 'literatureAdvanced');

  return (
    <Stack gap={16}>
      <div className="section-hero">
        <H2>{tc(cl, 'literatureTitle')}</H2>
        <Text tone="secondary">{tc(cl, 'literatureSubtitle')}</Text>
      </div>
      <Select
        value={level}
        onChange={setLevel}
        options={[
          { value: 'all', label: tc(cl, 'allLevels') },
          { value: 'beginner', label: tc(cl, 'literatureBeginner') },
          { value: 'intermediate', label: tc(cl, 'literatureIntermediate') },
          { value: 'advanced', label: tc(cl, 'literatureAdvanced') },
        ]}
      />
      <Grid columns={1} gap={12}>
        {filtered.map((item) => (
          <Card key={item.id} style={{ border: '1px solid var(--border)' }}>
            <CardHeader
              trailing={
                <Pill tone={item.level === 'advanced' ? 'warning' : item.level === 'intermediate' ? 'info' : 'success'} size="sm">
                  {levelLabel(item.level)}
                </Pill>
              }
            >
              {item.title}
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Row gap={8} wrap>
                  <Pill tone="neutral" size="sm">{item.type}</Pill>
                  <Text size="small" tone="secondary">{item.author}</Text>
                </Row>
                <Text size="small">{item.why}</Text>
                {item.url ? (
                  <Link href={item.url}>{tc(cl, 'literatureOpen')} →</Link>
                ) : (
                  <Text size="small" tone="secondary">{cl === 'ru' ? 'Печатное издание — ищите в библиотеке или Amazon' : 'Print edition — check library or Amazon'}</Text>
                )}
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
      <Callout tone="info" title={cl === 'ru' ? 'Совет' : 'Tip'}>
        {cl === 'ru'
          ? 'Начни с FATF Recommendations + ACAMS/ICA, параллельно проходи модули курса. Для EDD добавь Bellingcat и OpenCorporates.'
          : 'Start with FATF Recommendations + ACAMS/ICA while taking course modules. For EDD add Bellingcat and OpenCorporates.'}
      </Callout>
    </Stack>
  );
}

export function TrainersView({ lang, onNavigate }: { lang: Lang; onNavigate: (v: string) => void }) {
  const cl = contentLang(lang);
  const items = getTrainers(cl);
  const [cat, setCat] = useState<string>('all');
  const catLabels = TRAINER_CATEGORY_LABELS[cl];

  const filtered = useMemo(
    () => (cat === 'all' ? items : items.filter((i) => i.category === cat)),
    [items, cat],
  );

  return (
    <Stack gap={16}>
      <div className="section-hero section-hero--trainers">
        <H2>{tc(cl, 'trainersTitle')}</H2>
        <Text tone="secondary">{tc(cl, 'trainersSubtitle')}</Text>
      </div>
      <Select
        value={cat}
        onChange={setCat}
        options={[
          { value: 'all', label: tc(cl, 'filterCategory') + ': All' },
          ...Object.entries(catLabels).map(([k, v]) => ({ value: k, label: v })),
        ]}
      />
      <Grid columns={1} gap={12}>
        {filtered.map((t) => (
          <Card key={t.id} style={{ border: '1px solid var(--border)' }}>
            <CardHeader
              trailing={
                <Row gap={6}>
                  <Pill tone="neutral" size="sm">{catLabels[t.category]}</Pill>
                  <Pill tone={t.free ? 'success' : 'warning'} size="sm">{t.free ? tc(cl, 'trainersFree') : tc(cl, 'trainersPaid')}</Pill>
                </Row>
              }
            >
              {t.name}
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text size="small" tone="secondary">{t.provider}</Text>
                <Text size="small">{t.description}</Text>
                <Callout tone="info" title={cl === 'ru' ? 'Почему в топе' : 'Why top pick'}>{t.whyBest}</Callout>
                {t.url.startsWith('#') ? (
                  <Button variant="primary" onClick={() => onNavigate(t.url.slice(1))}>{tc(cl, 'trainersTryHere')}</Button>
                ) : (
                  <Link href={t.url}>{tc(cl, 'trainersOpen')} →</Link>
                )}
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}

function NewsQuiz({ item, cl }: { item: ReturnType<typeof getNews>[0]; cl: 'ru' | 'en' }) {
  const [picked, setPicked] = useState<number | null>(null);
  if (!item.quiz) return null;
  const { quiz } = item;
  const done = picked !== null;
  const correct = picked === quiz.correct;

  return (
    <div className="news-quiz">
      <Text size="small" weight="medium">{quiz.question}</Text>
      <Row gap={6} wrap style={{ marginTop: 8 }}>
        {quiz.options.map((opt, i) => (
          <Button
            key={opt}
            variant={picked === i ? (i === quiz.correct ? 'primary' : 'ghost') : 'ghost'}
            onClick={() => setPicked(i)}
            disabled={done && correct}
          >
            {opt}
          </Button>
        ))}
      </Row>
      {done && (
        <Text size="small" style={{ marginTop: 8, color: correct ? 'var(--success)' : 'var(--danger)' }}>
          {correct ? tc(cl, 'newsQuizCorrect') : tc(cl, 'newsQuizWrong')}
        </Text>
      )}
    </div>
  );
}

export function NewsView({ lang }: { lang: Lang }) {
  const cl = contentLang(lang);
  const items = getNews(cl);
  const [region, setRegion] = useState('all');

  const regions = useMemo(() => ['all', ...Array.from(new Set(items.map((n) => n.region)))], [items]);
  const filtered = useMemo(
    () => (region === 'all' ? items : items.filter((n) => n.region === region)),
    [items, region],
  );

  return (
    <Stack gap={16}>
      <div className="section-hero section-hero--news">
        <H2>{tc(cl, 'newsTitle')}</H2>
        <Text tone="secondary">{tc(cl, 'newsSubtitle')}</Text>
      </div>
      <Select
        value={region}
        onChange={setRegion}
        options={regions.map((r) => ({ value: r, label: r === 'all' ? (cl === 'ru' ? 'Все регионы' : 'All regions') : r }))}
      />
      <Stack gap={12}>
        {filtered.map((item) => (
          <Card key={item.id} style={{ border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)' }}>
            <CardHeader
              trailing={
                <Row gap={6} wrap>
                  <Pill tone="info" size="sm">{item.region}</Pill>
                  <Pill tone="neutral" size="sm">{item.date}</Pill>
                </Row>
              }
            >
              {item.title}
            </CardHeader>
            <CardBody>
              <Stack gap={10}>
                <Text size="small">{item.summary}</Text>
                <Callout tone="warning" title={tc(cl, 'newsImpact')}>{item.impact}</Callout>
                <Row gap={4} wrap>
                  {item.tags.map((tag) => (
                    <Pill key={tag} tone="neutral" size="sm">#{tag}</Pill>
                  ))}
                </Row>
                <NewsQuiz item={item} cl={cl} />
                <Link href={item.url}>{tc(cl, 'newsReadMore')} →</Link>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export function ResourcesHubView({ lang, onNavigate }: { lang: Lang; onNavigate: (v: string) => void }) {
  const cl = contentLang(lang);
  return (
    <Stack gap={16}>
      <H2>{tc(cl, 'resourcesHub')}</H2>
      <div className="hub-grid">
        <Grid columns={3} gap={12}>
        {[
          { id: 'literature', title: tc(cl, 'literatureTitle'), desc: tc(cl, 'literatureSubtitle') },
          { id: 'trainers', title: tc(cl, 'trainersTitle'), desc: tc(cl, 'trainersSubtitle') },
          { id: 'news', title: tc(cl, 'newsTitle'), desc: tc(cl, 'newsSubtitle') },
          { id: 'glossary', title: tc(cl, 'glossaryTitle'), desc: cl === 'ru' ? `${getCategoryLabels(cl).basics}…` : 'Terms & definitions' },
          { id: 'regulations', title: tc(cl, 'regulationsTitle'), desc: tc(cl, 'regulationsSubtitle') },
          { id: 'interview-trainer', title: cl === 'ru' ? 'Тренажёр собеседования' : 'Interview trainer', desc: cl === 'ru' ? 'Вопросы и подсказки для junior AML' : 'Junior AML interview Q&A' },
        ].map((hub) => (
          <button key={hub.id} type="button" className="hub-card" onClick={() => onNavigate(hub.id)}>
            <H3 style={{ margin: 0, fontSize: 16 }}>{hub.title}</H3>
            <Text size="small" tone="secondary">{hub.desc}</Text>
          </button>
        ))}
        </Grid>
      </div>
    </Stack>
  );
}
