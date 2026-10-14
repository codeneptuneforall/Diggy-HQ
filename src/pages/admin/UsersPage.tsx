import React, { useState } from 'react';
import { toast } from 'sonner';
import { Check, Eye, Minus, UserPlus, UserCheck, Lock } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { StatusChip } from '../../components/ui/StatusChip';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Field, inputCls } from '../../components/ui/Field';
import { permissionModules, type Access } from '../../data/users';
import { relTime } from '../../utils/date';
import { userStatusMeta } from '../../utils/status';
import { uid } from '../../utils/format';
import type { AppUser, UserRole } from '../../types';

const ROLES: UserRole[] = ['Corporate Admin', 'Corporate Viewer', 'Franchise Owner', 'Franchise Manager', 'Employee'];

const ACCESS: Record<Access, {label: string;icon: typeof Check;cls: string;}> = {
  full: { label: 'Full', icon: Check, cls: 'text-ok-700' },
  own: { label: 'Own franchise', icon: Lock, cls: 'text-info-700' },
  view: { label: 'View only', icon: Eye, cls: 'text-ink-2' },
  assigned: { label: 'Assigned only', icon: UserCheck, cls: 'text-berry-700' },
  none: { label: 'No access', icon: Minus, cls: 'text-ink-3' }
};

export function UsersPage() {
  const store = useStore();
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [inviting, setInviting] = useState(false);
  const [draft, setDraft] = useState<AppUser>({ id: '', name: '', email: '', role: 'Employee', franchiseId: 'f-jc', status: 'invited', lastActive: '' });

  return (
    <Page>
      <PageHeader
        title="Users & permissions"
        description="Who can see and change what. Role changes are recorded in the audit trail."
        actions={
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => {
            setDraft({ id: uid('u'), name: '', email: '', role: 'Employee', franchiseId: 'f-jc', status: 'invited', lastActive: '' });
            setInviting(true);
          }}>
          
            Invite user
          </Button>
        } />
      
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ id: 'users', label: 'Users', count: store.users.length }, { id: 'roles', label: 'Roles & permissions' }]} />

      {tab === 'users' ?
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
              <tr>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Scope</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Last active</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {store.users.map((u) =>
            <tr key={u.id}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <span>
                        <span className="block font-medium">{u.name}</span>
                        <span className="block text-xs text-ink-3">{u.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 text-ink-2">{u.franchiseId ? store.franchises.find((f) => f.id === u.franchiseId)?.shortName : 'All franchises'}</td>
                  <td className="px-4 py-3">
                    <StatusChip {...userStatusMeta[u.status]} />
                  </td>
                  <td className="px-4 py-3 text-ink-2">{u.lastActive ? relTime(u.lastActive) : 'Never'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing({ ...u })}>
                      Change role
                    </Button>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div> :

      <>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Area</th>
                  {ROLES.map((r) =>
                <th key={r} className="px-4 py-2.5 font-medium">
                      {r}
                    </th>
                )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {permissionModules.map((m) =>
              <tr key={m.module}>
                    <td className="px-4 py-3 font-medium">{m.module}</td>
                    {ROLES.map((r) => {
                  const a = ACCESS[m.access[r]];
                  return (
                    <td key={r} className={`px-4 py-3 ${a.cls}`}>
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px]">
                            <a.icon className="h-3.5 w-3.5" aria-hidden /> {a.label}
                          </span>
                        </td>);

                })}
                  </tr>
              )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-3">Franchise users never see another franchise’s financial or operational records unless corporate grants explicit access.</p>
        </>
      }

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Change role — ${editing?.name}`}
        footer={
        <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button
            variant="primary"
            onClick={() => {
              if (!editing) return;
              const prev = store.users.find((u) => u.id === editing.id);
              store.updateUser(editing, prev && prev.role !== editing.role ? { field: 'Role', from: prev.role, to: editing.role } : undefined);
              toast.success('Role updated');
              setEditing(null);
            }}>
            
              Save
            </Button>
          </>
        }>
        
        {editing &&
        <div className="space-y-4">
            <Field label="Role" htmlFor="u-role">
              <select id="u-role" className={inputCls} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole, franchiseId: e.target.value.startsWith('Corporate') ? null : editing.franchiseId ?? 'f-jc' })}>
                {ROLES.map((r) =>
              <option key={r}>{r}</option>
              )}
              </select>
            </Field>
            {!editing.role.startsWith('Corporate') &&
          <Field label="Franchise" htmlFor="u-f">
                <select id="u-f" className={inputCls} value={editing.franchiseId ?? ''} onChange={(e) => setEditing({ ...editing, franchiseId: e.target.value })}>
                  {store.franchises.map((f) =>
              <option key={f.id} value={f.id}>
                      {f.shortName}
                    </option>
              )}
                </select>
              </Field>
          }
          </div>
        }
      </Modal>

      <Modal
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite a user"
        description="They’ll receive an email invite to set up their account."
        footer={
        <>
            <Button onClick={() => setInviting(false)}>Cancel</Button>
            <Button
            variant="primary"
            disabled={!draft.name.trim() || !/\S+@\S+\.\S+/.test(draft.email)}
            onClick={() => {
              store.updateUser(draft);
              toast.success(`Invite sent to ${draft.email}`);
              setInviting(false);
            }}>
            
              Send invite
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Field label="Full name" htmlFor="inv-n" required>
            <input id="inv-n" className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Email" htmlFor="inv-e" required>
            <input id="inv-e" type="email" className={inputCls} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" htmlFor="inv-r">
              <select id="inv-r" className={inputCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole, franchiseId: e.target.value.startsWith('Corporate') ? null : draft.franchiseId ?? 'f-jc' })}>
                {ROLES.map((r) =>
                <option key={r}>{r}</option>
                )}
              </select>
            </Field>
            {!draft.role.startsWith('Corporate') &&
            <Field label="Franchise" htmlFor="inv-f">
                <select id="inv-f" className={inputCls} value={draft.franchiseId ?? ''} onChange={(e) => setDraft({ ...draft, franchiseId: e.target.value })}>
                  {store.franchises.map((f) =>
                <option key={f.id} value={f.id}>
                      {f.shortName}
                    </option>
                )}
                </select>
              </Field>
            }
          </div>
        </div>
      </Modal>
    </Page>);

}