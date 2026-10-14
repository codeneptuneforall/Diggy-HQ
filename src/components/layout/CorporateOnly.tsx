import React from 'react';
import { useStore } from '../../contexts/StoreContext';
import { PermissionDenied } from '../ui/PermissionDenied';

export function CorporateOnly({ area, children }: {area: string;children: React.ReactNode;}) {
  const { role } = useStore();
  if (role !== 'corporate') return <PermissionDenied area={area} />;
  return <>{children}</>;
}