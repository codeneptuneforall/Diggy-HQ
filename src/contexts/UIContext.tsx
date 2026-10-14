import React, { createContext, useContext, useState } from 'react';
import type { DiggyEvent, MovementType } from '../types';

export interface EventFormState {
  mode: 'create' | 'edit' | 'duplicate';
  event?: DiggyEvent;
  prefill?: Partial<DiggyEvent>;
}

export interface StockFormState {
  itemId?: string;
  type?: MovementType;
  eventId?: string;
}

interface UIValue {
  eventForm: EventFormState | null;
  openEventForm: (s: EventFormState) => void;
  closeEventForm: () => void;
  customerForm: {customerId?: string;} | null;
  openCustomerForm: (s: {customerId?: string;}) => void;
  closeCustomerForm: () => void;
  stockForm: StockFormState | null;
  openStockForm: (s: StockFormState) => void;
  closeStockForm: () => void;
  shiftForm: {eventId?: string;employeeId?: string;} | null;
  openShiftForm: (s: {eventId?: string;employeeId?: string;}) => void;
  closeShiftForm: () => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
}

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: {children: React.ReactNode;}) {
  const [eventForm, setEventForm] = useState<EventFormState | null>(null);
  const [customerForm, setCustomerForm] = useState<{customerId?: string;} | null>(null);
  const [stockForm, setStockForm] = useState<StockFormState | null>(null);
  const [shiftForm, setShiftForm] = useState<{eventId?: string;employeeId?: string;} | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  return (
    <UIContext.Provider
      value={{
        eventForm,
        openEventForm: setEventForm,
        closeEventForm: () => setEventForm(null),
        customerForm,
        openCustomerForm: setCustomerForm,
        closeCustomerForm: () => setCustomerForm(null),
        stockForm,
        openStockForm: setStockForm,
        closeStockForm: () => setStockForm(null),
        shiftForm,
        openShiftForm: setShiftForm,
        closeShiftForm: () => setShiftForm(null),
        navOpen,
        setNavOpen
      }}>
      
      {children}
    </UIContext.Provider>);

}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}