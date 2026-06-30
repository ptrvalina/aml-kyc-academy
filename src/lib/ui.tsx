import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { computeDAGLayout } from './dag-layout';

export { computeDAGLayout };

const STORAGE_PREFIX = 'aml-kyc-academy:';
const CANVAS_STATE_EVENT = 'aml-kyc-academy:canvas-state';

export type SetCanvasState<T> = (action: T | ((prev: T) => T)) => void;

function readCanvasStorage<T>(storageKey: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw != null) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return defaultValue;
}

export function useCanvasState<T>(key: string, defaultValue: T): [T, SetCanvasState<T>] {
  const storageKey = STORAGE_PREFIX + key;
  const [value, setValue] = useState<T>(() => readCanvasStorage(storageKey, defaultValue));

  useEffect(() => {
    const onExternal = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail?.key === storageKey) setValue(detail.value);
    };
    window.addEventListener(CANVAS_STATE_EVENT, onExternal as EventListener);
    return () => window.removeEventListener(CANVAS_STATE_EVENT, onExternal as EventListener);
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [storageKey, value]);

  const setter = useCallback<SetCanvasState<T>>((action) => {
    setValue((prev) => {
      const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action;
      window.dispatchEvent(new CustomEvent(CANVAS_STATE_EVENT, { detail: { key: storageKey, value: next } }));
      return next;
    });
  }, [storageKey]);

  return [value, setter];
}

export function useCanvasAction(): (_action: unknown) => void {
  return () => {};
}

const darkTheme = {
  kind: 'dark' as const,
  text: {
    primary: '#E4E4E4EB',
    secondary: '#E4E4E48D',
    tertiary: '#E4E4E45E',
    quaternary: '#E4E4E442',
    link: '#818cf8',
    onAccent: '#191c22',
  },
  bg: { editor: '#181818', chrome: '#141414', elevated: '#181818' },
  fill: {
    primary: '#E4E4E430',
    secondary: '#E4E4E41E',
    tertiary: '#E4E4E411',
    quaternary: '#E4E4E40A',
  },
  stroke: {
    primary: '#E4E4E433',
    secondary: '#E4E4E41F',
    tertiary: '#E4E4E414',
  },
  accent: { primary: '#6366f1', control: '#6366f1' },
  tokens: {} as Record<string, unknown>,
  palette: {} as Record<string, unknown>,
};

export function useHostTheme() {
  return darkTheme;
}

export function mergeStyle(base: CSSProperties, override?: CSSProperties): CSSProperties {
  return override ? { ...base, ...override } : base;
}

const SEGMENT_COLORS: Record<string, string> = {
  blue: '#599CE7',
  green: '#3FA266',
  purple: '#A855F7',
  orange: '#F97316',
  pink: '#EC4899',
  yellow: '#EAB308',
  gray: '#6B7280',
  red: '#EF4444',
};

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneColor: Record<Tone, string> = {
  success: '#3FA266',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#599CE7',
  neutral: '#6B7280',
};

export function Stack({ children, gap = 8, style }: { children?: ReactNode; gap?: number; style?: CSSProperties }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

export function Row({
  children,
  gap = 8,
  align = 'stretch',
  justify = 'start',
  wrap,
  style,
}: {
  children?: ReactNode;
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between';
  wrap?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Grid({
  children,
  columns,
  gap = 8,
  style,
}: {
  children?: ReactNode;
  columns: number | string;
  gap?: number;
  align?: string;
  style?: CSSProperties;
}) {
  const cols = typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap, ...style }}>{children}</div>
  );
}

export function Divider({ style }: { style?: CSSProperties }) {
  return <hr style={{ border: 'none', borderTop: `1px solid ${darkTheme.stroke.tertiary}`, margin: 0, ...style }} />;
}

export function H1({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <h1 style={{ margin: 0, fontSize: 24, lineHeight: '30px', fontWeight: 590, ...style }}>{children}</h1>;
}

export function H2({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <h2 style={{ margin: 0, fontSize: 18, lineHeight: '24px', fontWeight: 590, ...style }}>{children}</h2>;
}

export function H3({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <h3 style={{ margin: 0, fontSize: 16, lineHeight: '22px', fontWeight: 590, ...style }}>{children}</h3>;
}

export function Text({
  children,
  size = 'body',
  tone = 'primary',
  weight,
  style,
}: {
  children?: ReactNode;
  size?: 'body' | 'small';
  tone?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  weight?: 'medium' | 'normal';
  style?: CSSProperties;
}) {
  const fontSize = size === 'small' ? 12 : 14;
  const color = darkTheme.text[tone];
  return (
    <span style={{ fontSize, lineHeight: size === 'small' ? '16px' : '20px', color, fontWeight: weight === 'medium' ? 590 : 400, ...style }}>
      {children}
    </span>
  );
}

export function Link({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: darkTheme.text.link, textDecoration: 'none' }}>
      {children}
    </a>
  );
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  style,
}: {
  children?: ReactNode;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const isPrimary = variant === 'primary';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 6,
        border: isPrimary ? 'none' : `1px solid ${darkTheme.stroke.primary}`,
        background: isPrimary ? darkTheme.accent.control : 'transparent',
        color: isPrimary ? darkTheme.text.onAccent : darkTheme.text.primary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: 13,
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = 'neutral',
  size = 'md',
}: {
  children?: ReactNode;
  tone?: Tone;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 9999,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 500,
        background: `${toneColor[tone]}22`,
        color: toneColor[tone],
        border: `1px solid ${toneColor[tone]}44`,
      }}
    >
      {children}
    </span>
  );
}

export function Card({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: `1px solid ${darkTheme.stroke.primary}`,
        borderRadius: 8,
        background: darkTheme.bg.elevated,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  trailing,
}: {
  children?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${darkTheme.stroke.tertiary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontWeight: 590,
        fontSize: 14,
      }}
    >
      <div>{children}</div>
      {trailing}
    </div>
  );
}

export function CardBody({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: 16, ...style }}>{children}</div>;
}

export function Callout({
  children,
  title,
  tone = 'info',
}: {
  children?: ReactNode;
  title?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 8,
        border: `1px solid ${toneColor[tone]}44`,
        background: `${toneColor[tone]}11`,
      }}
    >
      {title && <div style={{ fontWeight: 590, marginBottom: 8, fontSize: 14 }}>{title}</div>}
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

export function Stat({
  value,
  label,
  tone = 'info',
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 8,
        border: `1px solid ${darkTheme.stroke.primary}`,
        background: darkTheme.fill.tertiary,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: toneColor[tone] }}>{value}</div>
      <div style={{ fontSize: 12, color: darkTheme.text.secondary, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function Table({
  headers,
  rows,
  style,
}: {
  headers: ReactNode[];
  rows: ReactNode[][];
  style?: CSSProperties;
}) {
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${darkTheme.stroke.primary}`, borderRadius: 8, ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderBottom: `1px solid ${darkTheme.stroke.primary}`,
                  color: darkTheme.text.secondary,
                  fontWeight: 590,
                  background: darkTheme.fill.quaternary,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {headers.map((_, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '10px 12px',
                    borderBottom: `1px solid ${darkTheme.stroke.tertiary}`,
                    verticalAlign: 'top',
                  }}
                >
                  {row[ci] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  style?: CSSProperties;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: 6,
        border: `1px solid ${darkTheme.stroke.primary}`,
        background: darkTheme.bg.elevated,
        color: darkTheme.text.primary,
        fontSize: 13,
        minWidth: 160,
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  style?: CSSProperties;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: 12,
        borderRadius: 6,
        border: `1px solid ${darkTheme.stroke.primary}`,
        background: darkTheme.bg.editor,
        color: darkTheme.text.primary,
        fontSize: 13,
        lineHeight: 1.5,
        resize: 'vertical',
        ...style,
      }}
    />
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  leading,
  trailing,
}: {
  title: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${darkTheme.stroke.tertiary}`, padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {leading}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            color: darkTheme.text.primary,
            cursor: 'pointer',
            padding: '4px 0',
            fontSize: 13,
            fontWeight: 590,
            flex: 1,
            textAlign: 'left',
          }}
        >
          {open ? '▼' : '▶'} {title}
        </button>
        {trailing}
      </div>
      {open && <div style={{ paddingLeft: leading ? 24 : 16, marginTop: 8 }}>{children}</div>}
    </div>
  );
}

export function Swatch({ color }: { color: keyof typeof SEGMENT_COLORS | string }) {
  const c = SEGMENT_COLORS[color] ?? color;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 2,
        background: c,
        flexShrink: 0,
      }}
    />
  );
}

export function UsageBar({
  segments,
  total,
  topLeftLabel,
  topRightLabel,
  style,
}: {
  segments: Array<{ id: string; value: number; color?: string }>;
  total: number;
  topLeftLabel?: ReactNode;
  topRightLabel?: ReactNode;
  style?: CSSProperties;
}) {
  const sum = segments.reduce((a, s) => a + Math.max(0, s.value), 0);
  const remainder = Math.max(0, total - sum);
  const all = [...segments, ...(remainder > 0 ? [{ id: 'rem', value: remainder, color: 'gray' }] : [])];
  return (
    <div style={style}>
      {(topLeftLabel || topRightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: darkTheme.text.secondary }}>
          <span>{topLeftLabel}</span>
          <span>{topRightLabel}</span>
        </div>
      )}
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: darkTheme.fill.quaternary }}>
        {all.map((s, i) => {
          const w = total > 0 ? (s.value / total) * 100 : 0;
          if (w <= 0) return null;
          return (
            <div
              key={s.id}
              style={{
                width: `${w}%`,
                background: SEGMENT_COLORS[s.color ?? 'blue'] ?? SEGMENT_COLORS.gray,
                opacity: s.id === 'rem' ? 0.35 : 1,
              }}
              title={String(s.value)}
            />
          );
        })}
      </div>
    </div>
  );
}
