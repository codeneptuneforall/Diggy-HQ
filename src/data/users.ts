import type { AppUser, UserRole } from '../types';

// Illustrative demo data.
export const seedUsers: AppUser[] = [
{ id: 'u-1', name: 'Rick Brewer', email: 'rick@diggydonuts.demo', role: 'Corporate Admin', franchiseId: null, status: 'active', lastActive: '2026-10-14T11:15' },
{ id: 'u-2', name: 'Corey Lin', email: 'corey@diggydonuts.demo', role: 'Corporate Viewer', franchiseId: null, status: 'active', lastActive: '2026-10-13T16:20' },
{ id: 'u-3', name: 'Dana Whitfield', email: 'dana@diggyjc.demo', role: 'Franchise Owner', franchiseId: 'f-jc', status: 'active', lastActive: '2026-10-14T10:48' },
{ id: 'u-4', name: 'Maya Torres', email: 'maya.t@diggyjc.demo', role: 'Franchise Manager', franchiseId: 'f-jc', status: 'active', lastActive: '2026-10-14T10:02' },
{ id: 'u-5', name: 'Jordan Price', email: 'jordan.p@diggyjc.demo', role: 'Employee', franchiseId: 'f-jc', status: 'active', lastActive: '2026-10-14T09:40' },
{ id: 'u-6', name: 'Eli Carter', email: 'eli.c@diggyjc.demo', role: 'Employee', franchiseId: 'f-jc', status: 'active', lastActive: '2026-10-12T20:15' },
{ id: 'u-7', name: 'Hannah Brooks', email: 'hannah.b@diggyavl.demo', role: 'Employee', franchiseId: 'f-avl', status: 'active', lastActive: '2026-10-11T17:00' },
{ id: 'u-8', name: 'Marcus Bell', email: 'marcus@diggyknox.demo', role: 'Franchise Owner', franchiseId: 'f-knx', status: 'active', lastActive: '2026-10-13T21:05' },
{ id: 'u-9', name: 'Priya Shah', email: 'priya.s@diggyknox.demo', role: 'Franchise Manager', franchiseId: 'f-knx', status: 'active', lastActive: '2026-10-14T10:55' },
{ id: 'u-10', name: 'Lauren Pike', email: 'lauren@diggyavl.demo', role: 'Franchise Owner', franchiseId: 'f-avl', status: 'active', lastActive: '2026-10-12T08:31' },
{ id: 'u-11', name: 'Sam Nguyen', email: 'sam.n@diggyjc.demo', role: 'Employee', franchiseId: 'f-jc', status: 'invited', lastActive: '' }];


export type Access = 'full' | 'own' | 'view' | 'assigned' | 'none';

export const permissionModules: {module: string;access: Record<UserRole, Access>;}[] = [
{ module: 'Events & calendar', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'assigned' } },
{ module: 'Trailers', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'assigned' } },
{ module: 'Employees & scheduling', access: { 'Corporate Admin': 'view', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'assigned' } },
{ module: 'Customer CRM', access: { 'Corporate Admin': 'view', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'none' } },
{ module: 'Sales reports — submit', access: { 'Corporate Admin': 'none', 'Corporate Viewer': 'none', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'assigned' } },
{ module: 'Sales reports — review & finalize', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'none', Employee: 'none' } },
{ module: 'Inventory', access: { 'Corporate Admin': 'view', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'assigned' } },
{ module: 'Reports & exports', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'own', Employee: 'none' } },
{ module: 'Franchisees & territories', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'view', 'Franchise Owner': 'none', 'Franchise Manager': 'none', Employee: 'none' } },
{ module: 'Users & permissions', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'none', 'Franchise Owner': 'own', 'Franchise Manager': 'none', Employee: 'none' } },
{ module: 'Audit trail', access: { 'Corporate Admin': 'full', 'Corporate Viewer': 'view', 'Franchise Owner': 'own', 'Franchise Manager': 'none', Employee: 'none' } }];