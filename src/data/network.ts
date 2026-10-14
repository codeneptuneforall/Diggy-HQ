import type { Franchise, Territory, Trailer } from '../types';

// Illustrative demo data — not actual Diggy Donuts business records.

export const franchises: Franchise[] = [
{
  id: 'f-jc',
  name: 'Diggy Donuts — Johnson City',
  shortName: 'Johnson City',
  owner: 'Dana Whitfield',
  ownerEmail: 'dana@diggyjc.demo',
  phone: '(423) 555-0142',
  city: 'Johnson City, TN',
  status: 'active',
  since: '2024-03-01'
},
{
  id: 'f-knx',
  name: 'Diggy Donuts — Knoxville',
  shortName: 'Knoxville',
  owner: 'Marcus Bell',
  ownerEmail: 'marcus@diggyknox.demo',
  phone: '(865) 555-0188',
  city: 'Knoxville, TN',
  status: 'active',
  since: '2025-05-12'
},
{
  id: 'f-avl',
  name: 'Diggy Donuts — Asheville',
  shortName: 'Asheville',
  owner: 'Lauren Pike',
  ownerEmail: 'lauren@diggyavl.demo',
  phone: '(828) 555-0119',
  city: 'Asheville, NC',
  status: 'onboarding',
  since: '2026-08-03'
}];


export const territories: Territory[] = [
{
  id: 't-tri',
  name: 'Tri-Cities',
  region: 'Northeast Tennessee',
  coverage: 'Johnson City, Kingsport, Bristol, Elizabethton',
  franchiseId: 'f-jc',
  notes: 'Home territory. Recurring Saturday farmers market slot.'
},
{
  id: 't-gre',
  name: 'Greeneville',
  region: 'Northeast Tennessee',
  coverage: 'Greeneville, Tusculum, Mosheim',
  franchiseId: 'f-jc',
  notes: 'Expansion area added Jan 2026.'
},
{
  id: 't-knx',
  name: 'Knox County',
  region: 'East Tennessee',
  coverage: 'Knoxville, Farragut, Powell',
  franchiseId: 'f-knx',
  notes: ''
},
{
  id: 't-avl',
  name: 'Buncombe County',
  region: 'Western North Carolina',
  coverage: 'Asheville, Weaverville, Black Mountain',
  franchiseId: 'f-avl',
  notes: 'Onboarding — first events in progress.'
},
{
  id: 't-cha',
  name: 'Chattanooga',
  region: 'Southeast Tennessee',
  coverage: 'Chattanooga, East Ridge, Signal Mountain',
  franchiseId: null,
  notes: 'Open territory. Not yet assigned to a franchisee.'
}];


export const seedTrailers: Trailer[] = [
{
  id: 'tr-01',
  name: 'Diggy Trailer 01',
  code: 'DT-01',
  franchiseId: 'f-jc',
  territoryId: 't-tri',
  baseStatus: 'available',
  notes: '16 ft concession trailer, two fryers. Primary for festivals.'
},
{
  id: 'tr-02',
  name: 'Diggy Trailer 02',
  code: 'DT-02',
  franchiseId: 'f-jc',
  territoryId: 't-tri',
  baseStatus: 'available',
  notes: '12 ft trailer, single fryer. Good for private events and tight venues.'
},
{
  id: 'tr-03',
  name: 'Diggy Trailer 03',
  code: 'DT-03',
  franchiseId: 'f-knx',
  territoryId: 't-knx',
  baseStatus: 'available',
  notes: '16 ft concession trailer.'
},
{
  id: 'tr-04',
  name: 'Diggy Trailer 04',
  code: 'DT-04',
  franchiseId: 'f-avl',
  territoryId: 't-avl',
  baseStatus: 'maintenance',
  notes: '14 ft trailer.',
  statusNote: 'Fryer thermostat replacement — back in service around Oct 23.'
}];