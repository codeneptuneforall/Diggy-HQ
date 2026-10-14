import React, { useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useMobile } from '../../../contexts/MobileContext';
import { LOGO_URL } from '../../layout/Sidebar';
import { Button } from '../../ui/Button';

export function MSignIn() {
  const { reset, offline, setOffline } = useMobile();
  const [email, setEmail] = useState('maya.t@diggyjc.demo');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  if (offline) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream-2">
          <WifiOff className="h-7 w-7 text-ink-3" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">Can’t connect</h1>
        <p className="mt-2 text-[15px] text-ink-2">Signing in needs an internet connection. Check Wi-Fi or cellular data and try again.</p>
        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => setOffline(false)}>
          Try again
        </Button>
      </div>);

  }

  return (
    <form
      className="flex flex-1 flex-col px-6 pb-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (pw.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        reset({ name: 'home' });
      }}>
      
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src={LOGO_URL} alt="Diggy Donuts" className="h-28 w-28 object-contain" />
        <h1 className="mt-2 font-display text-[26px] font-semibold">Diggy HQ</h1>
        <p className="text-[15px] text-ink-3">Your shifts, events and reports</p>
      </div>
      <label htmlFor="m-email" className="text-[13px] font-medium text-ink-2">
        Email
      </label>
      <input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-12 rounded-xl border border-line-strong bg-white px-4 text-[16px] focus:border-berry-500 focus:outline-none" />
      <label htmlFor="m-pw" className="mt-4 text-[13px] font-medium text-ink-2">
        Password
      </label>
      <input id="m-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 h-12 rounded-xl border border-line-strong bg-white px-4 text-[16px] focus:border-berry-500 focus:outline-none" />
      {error && <p className="mt-2 text-[13px] font-medium text-bad-700" role="alert">{error}</p>}
      <Button type="submit" variant="primary" size="lg" className="mt-6 h-12 w-full text-[16px]">
        Sign in
      </Button>
      <p className="mt-3 text-center text-[13px] text-berry-700">Forgot password?</p>
    </form>);

}