import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { CorporateDashboard } from '../components/dashboard/CorporateDashboard';
import { FranchiseDashboard } from '../components/dashboard/FranchiseDashboard';

export function Dashboard() {
  const { role, workspace } = useStore();
  if (role === 'corporate' && workspace === 'network') return <CorporateDashboard />;
  return <FranchiseDashboard />;
}