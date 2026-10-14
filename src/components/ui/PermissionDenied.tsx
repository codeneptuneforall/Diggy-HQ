import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from './Button';

export function PermissionDenied({ area }: {area: string;}) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad-50 text-bad-600">
        <ShieldOff className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="font-display text-2xl font-semibold">You don’t have access to {area}</h1>
      <p className="mt-2 text-sm text-ink-2">
        This area is limited to Diggy Corporate administrators. If you think you need access, ask a corporate admin to update your role.
      </p>
      <Button variant="primary" className="mt-6" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </div>);

}