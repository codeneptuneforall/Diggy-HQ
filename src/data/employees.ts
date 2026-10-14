import type { Employee } from '../types';

// Illustrative demo data.
export const employees: Employee[] = [
{
  id: 'emp-maya',
  name: 'Maya Torres',
  phone: '(423) 555-0161',
  email: 'maya.t@diggyjc.demo',
  franchiseId: 'f-jc',
  role: 'Shift Lead',
  status: 'active',
  availability: 'Weekdays after 9 AM, most weekends.',
  unavailable: [],
  hireDate: '2024-04-15',
  canSubmitReports: true
},
{
  id: 'emp-jordan',
  name: 'Jordan Price',
  phone: '(423) 555-0177',
  email: 'jordan.p@diggyjc.demo',
  franchiseId: 'f-jc',
  role: 'Crew',
  status: 'active',
  availability: 'Weekends and evenings.',
  unavailable: [],
  hireDate: '2025-02-01',
  canSubmitReports: false
},
{
  id: 'emp-eli',
  name: 'Eli Carter',
  phone: '(423) 555-0133',
  email: 'eli.c@diggyjc.demo',
  franchiseId: 'f-jc',
  role: 'Crew',
  status: 'active',
  availability: 'Student — not available Tue/Wed mornings.',
  unavailable: [{ date: '2026-10-21', start: '08:00', end: '12:00', reason: 'Class' }],
  hireDate: '2025-06-10',
  canSubmitReports: true
},
{
  id: 'emp-sam',
  name: 'Sam Nguyen',
  phone: '(423) 555-0109',
  email: 'sam.n@diggyjc.demo',
  franchiseId: 'f-jc',
  role: 'Crew',
  status: 'active',
  availability: 'Flexible. Prefers morning shifts.',
  unavailable: [{ date: '2026-10-17', start: '00:00', end: '23:59', reason: 'Requested day off' }],
  hireDate: '2025-09-02',
  canSubmitReports: false
},
{
  id: 'emp-ava',
  name: 'Ava Mitchell',
  phone: '(423) 555-0150',
  email: 'ava.m@diggyjc.demo',
  franchiseId: 'f-jc',
  role: 'Crew',
  status: 'on_leave',
  availability: 'On leave until Nov 2.',
  unavailable: [],
  hireDate: '2025-03-20',
  canSubmitReports: false
},
{
  id: 'emp-priya',
  name: 'Priya Shah',
  phone: '(865) 555-0124',
  email: 'priya.s@diggyknox.demo',
  franchiseId: 'f-knx',
  role: 'Shift Lead',
  status: 'active',
  availability: 'Full availability.',
  unavailable: [],
  hireDate: '2025-05-20',
  canSubmitReports: true
},
{
  id: 'emp-tyler',
  name: 'Tyler Ross',
  phone: '(865) 555-0193',
  email: 'tyler.r@diggyknox.demo',
  franchiseId: 'f-knx',
  role: 'Crew',
  status: 'active',
  availability: 'Weekends only.',
  unavailable: [],
  hireDate: '2025-07-08',
  canSubmitReports: false
},
{
  id: 'emp-hannah',
  name: 'Hannah Brooks',
  phone: '(828) 555-0171',
  email: 'hannah.b@diggyavl.demo',
  franchiseId: 'f-avl',
  role: 'Shift Lead',
  status: 'active',
  availability: 'Thu–Sun.',
  unavailable: [],
  hireDate: '2026-08-10',
  canSubmitReports: true
}];