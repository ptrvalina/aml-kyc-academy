import { useState } from 'react';
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Row,
  Stack,
  Text,
  TextArea,
  useCanvasState,
} from '../lib/ui';
import type { Lang } from '../i18n/types';
import { contentLang } from '../i18n/types';
import { tc } from '../i18n/content-strings';
import { getSessionUser, loginUser, logoutUser, registerUser } from '../lib/auth';

type AuthMode = 'login' | 'register';

function authErrorText(code: string, cl: 'ru' | 'en'): string {
  const map: Record<string, 'authErrorInvalidEmail' | 'authErrorInvalidName' | 'authErrorWeakPassword' | 'authErrorEmailTaken' | 'authErrorCredentials'> = {
    invalid_email: 'authErrorInvalidEmail',
    invalid_name: 'authErrorInvalidName',
    weak_password: 'authErrorWeakPassword',
    email_taken: 'authErrorEmailTaken',
    invalid_credentials: 'authErrorCredentials',
  };
  const key = map[code];
  return key ? tc(cl, key) : code;
}

export function AuthPanel({ lang, onSuccess }: { lang: Lang; onSuccess?: () => void }) {
  const cl = contentLang(lang);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [, setSessionTick] = useCanvasState('auth-session-tick', 0);

  const user = getSessionUser();

  const submit = () => {
    setError('');
    setSuccess('');
    if (mode === 'register') {
      const res = registerUser({ email, fullName, password });
      if (!res.ok) {
        setError(authErrorText(res.error, cl));
        return;
      }
      setSuccess(tc(cl, 'authSuccessRegister'));
      setSessionTick((n) => n + 1);
      onSuccess?.();
    } else {
      const res = loginUser(email, password);
      if (!res.ok) {
        setError(authErrorText(res.error, cl));
        return;
      }
      setSessionTick((n) => n + 1);
      onSuccess?.();
    }
  };

  if (user) {
    return (
      <Row gap={8} align="center" wrap>
        <Text size="small" tone="secondary">{user.fullName}</Text>
        <Button variant="ghost" onClick={() => { logoutUser(); setSessionTick((n) => n + 1); }}>
          {tc(cl, 'navLogout')}
        </Button>
      </Row>
    );
  }

  return (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader>{mode === 'login' ? tc(cl, 'authLoginTitle') : tc(cl, 'authRegisterTitle')}</CardHeader>
      <CardBody>
        <Stack gap={12}>
          {mode === 'register' && (
            <Stack gap={4}>
              <Text size="small" weight="medium">{tc(cl, 'authFullName')}</Text>
              <TextArea value={fullName} onChange={setFullName} rows={1} />
            </Stack>
          )}
          <Stack gap={4}>
            <Text size="small" weight="medium">{tc(cl, 'authEmail')}</Text>
            <TextArea value={email} onChange={setEmail} rows={1} />
          </Stack>
          <Stack gap={4}>
            <Text size="small" weight="medium">{tc(cl, 'authPassword')}</Text>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </Stack>
          {error && <Callout tone="danger">{error}</Callout>}
          {success && <Callout tone="success">{success}</Callout>}
          <Button variant="primary" onClick={submit}>
            {mode === 'login' ? tc(cl, 'authLoginBtn') : tc(cl, 'authRegisterBtn')}
          </Button>
          <Text size="small" tone="secondary">
            {mode === 'login' ? tc(cl, 'authNoAccount') : tc(cl, 'authHasAccount')}{' '}
            <button type="button" className="link-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? tc(cl, 'navRegister') : tc(cl, 'navLogin')}
            </button>
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}

export function AuthHeaderButton({ lang, onOpenCabinet }: { lang: Lang; onOpenCabinet: () => void }) {
  const cl = contentLang(lang);
  const [tick] = useCanvasState('auth-session-tick', 0);
  void tick;
  const user = getSessionUser();

  if (user) {
    return (
      <Row gap={8} align="center">
        <button type="button" className="user-chip" onClick={onOpenCabinet}>
          <span className="user-avatar">{user.fullName.charAt(0).toUpperCase()}</span>
          <Text size="small">{user.fullName.split(' ')[0]}</Text>
        </button>
        <Button variant="ghost" onClick={() => { logoutUser(); localStorage.removeItem('aml-kyc-academy:auth-session-tick'); window.location.reload(); }}>
          {tc(cl, 'navLogout')}
        </Button>
      </Row>
    );
  }

  return (
    <Button variant="ghost" onClick={onOpenCabinet}>{tc(cl, 'navLogin')}</Button>
  );
}
