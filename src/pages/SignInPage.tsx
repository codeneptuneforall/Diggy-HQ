import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field, inputCls, inputErrorCls } from '../components/ui/Field';
import { LOGO_URL } from '../components/layout/Sidebar';
import { cx } from '../utils/format';

export function SignInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('expired') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email) || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => navigate('/'), 600);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={LOGO_URL} alt="Diggy Donuts" className="h-24 w-24 object-contain" />
          <h1 className="mt-3 font-display text-2xl font-semibold">Sign in to Diggy HQ</h1>
          <p className="text-sm text-ink-3">Franchise operations for the Diggy Donuts network</p>
        </div>
        {expired &&
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-warn-100 bg-warn-50 px-4 py-3 text-sm text-warn-700" role="status">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Your session expired after 12 hours of inactivity. Sign in again — unsaved drafts were kept.
          </p>
        }
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-card" noValidate>
          <Field label="Email" htmlFor="si-email">
            <input id="si-email" type="email" autoComplete="email" className={cx(inputCls, error && inputErrorCls)} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="si-pw">
            <input id="si-pw" type="password" autoComplete="current-password" className={cx(inputCls, error && inputErrorCls)} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error &&
          <p className="flex items-center gap-1.5 text-xs font-medium text-bad-700" role="alert">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {error}
            </p>
          }
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <button type="button" className="w-full text-center text-[13px] font-medium text-berry-700 hover:underline">
            Forgot password?
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-ink-3">
          Demo: enter any email and a 6+ character password. <button className="font-medium text-berry-700 hover:underline" onClick={() => navigate('/signin?expired=1')}>Preview session-expired</button>
        </p>
      </div>
    </div>);

}