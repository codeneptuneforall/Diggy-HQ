import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import { MobileProvider, useMobile, type Persona } from '../contexts/MobileContext';
import { PhoneFrame } from '../components/mobile/PhoneFrame';
import { MTabBar } from '../components/mobile/MTabBar';
import { MHeader } from '../components/mobile/MHeader';
import { MSignIn } from '../components/mobile/screens/MSignIn';
import { MHome } from '../components/mobile/screens/MHome';
import { MManagerHome } from '../components/mobile/screens/MManagerHome';
import { MSchedule } from '../components/mobile/screens/MSchedule';
import { MEventList } from '../components/mobile/screens/MEventList';

export function MobilePage({ persona }: {persona: Persona;}) {
  return (
    <MobileProvider key={persona} persona={persona}>
      <MobileStage />
    </MobileProvider>);

}

function MobileStage() {
  const { offline, setOffline, persona } = useMobile();
  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-6 bg-cream-2 px-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
      <PhoneFrame offline={offline}>
        <PhoneScreen />
      </PhoneFrame>
      <aside className="w-full max-w-xs space-y-4 text-sm">
        <h1 className="font-display text-2xl font-semibold">Diggy HQ mobile</h1>
        <p className="text-ink-2">{persona === 'employee' ? 'Employee view — Maya Torres, shift lead.' : 'Manager view — Dana Whitfield, franchise owner.'} Switch persona in the Controls panel.</p>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} className="h-4 w-4 accent-berry-600" />
          Simulate offline
        </label>
        <Link to="/" className="inline-flex items-center gap-2 font-medium text-berry-700 hover:underline">
          <Monitor className="h-4 w-4" aria-hidden /> Open web admin
        </Link>
      </aside>
    </div>);

}

function PhoneScreen() {
  const { screen, persona } = useMobile();
  const showTabs = screen.name !== 'signin';
  let body: React.ReactNode;
  switch (screen.name) {
    case 'signin':
      body = <MSignIn />;
      break;
    case 'home':
      body = persona === 'employee' ? <MHome /> : <MManagerHome />;
      break;
    case 'schedule':
      body = <MSchedule initialDay={screen.day} />;
      break;
    case 'events':
      body = <MEventList />;
      break;
    default:
      body = <ComingSoon />;
  }
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      {showTabs && <MTabBar />}
    </>);

}

function ComingSoon() {
  return (
    <>
      <MHeader title="Diggy HQ" back />
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Monitor className="h-10 w-10 text-berry-400" aria-hidden />
        <p className="mt-3 text-[17px] font-semibold">Open this in the web app</p>
        <p className="mt-1 text-[14px] text-ink-3">This mobile screen hasn’t been designed yet.</p>
      </div>
    </>);

}