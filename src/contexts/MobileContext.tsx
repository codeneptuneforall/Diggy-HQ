import React, { createContext, useContext, useState } from 'react';

export type MScreen =
{name: 'signin';} |
{name: 'home';} |
{name: 'schedule';day?: string;} |
{name: 'events';} |
{name: 'event';id: string;} |
{name: 'location';id: string;} |
{name: 'report';eventId: string;} |
{name: 'review';} |
{name: 'result';kind: 'done' | 'failed' | 'queued';reportId?: string;} |
{name: 'inventory';} |
{name: 'usage';itemId?: string;} |
{name: 'lowstock';} |
{name: 'notifications';} |
{name: 'notification';id: string;} |
{name: 'profile';} |
{name: 'settings';} |
{name: 'reviewReports';} |
{name: 'trailers';} |
{name: 'followups';} |
{name: 'createEvent';};

export interface MobileDraft {
  eventId: string;
  cash: string;
  card: string;
  other: string;
  op: string;
  emp: string;
  batches: string;
  notes: string;
}

export type Persona = 'employee' | 'manager';

interface MobileValue {
  persona: Persona;
  stack: MScreen[];
  screen: MScreen;
  push: (s: MScreen) => void;
  back: () => void;
  reset: (s: MScreen) => void;
  offline: boolean;
  setOffline: (v: boolean) => void;
  failNext: boolean;
  setFailNext: (v: boolean) => void;
  draft: MobileDraft | null;
  setDraft: (d: MobileDraft | null) => void;
  me: {name: string;employeeId: string | null;title: string;};
}

const Ctx = createContext<MobileValue | null>(null);

export function MobileProvider({ persona, initial, children }: {persona: Persona;initial?: MScreen;children: React.ReactNode;}) {
  const [stack, setStack] = useState<MScreen[]>([initial ?? { name: 'home' }]);
  const [offline, setOffline] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [draft, setDraft] = useState<MobileDraft | null>(null);
  const me =
  persona === 'employee' ?
  { name: 'Maya Torres', employeeId: 'emp-maya', title: 'Shift Lead · Johnson City' } :
  { name: 'Dana Whitfield', employeeId: null, title: 'Franchise Owner · Johnson City' };

  return (
    <Ctx.Provider
      value={{
        persona,
        stack,
        screen: stack[stack.length - 1],
        push: (s) => setStack((st) => [...st, s]),
        back: () => setStack((st) => st.length > 1 ? st.slice(0, -1) : st),
        reset: (s) => setStack([s]),
        offline,
        setOffline,
        failNext,
        setFailNext,
        draft,
        setDraft,
        me
      }}>
      
      {children}
    </Ctx.Provider>);

}

export function useMobile() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useMobile must be used inside MobileProvider');
  return c;
}