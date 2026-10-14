export const fmtMoney = (n: number, cents = false) =>
n.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: cents ? 2 : 0,
  maximumFractionDigits: cents ? 2 : 0
});

export const fmtNum = (n: number, d = 0) =>
n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 });

export const initials = (name: string) =>
name.
split(' ').
filter(Boolean).
map((p) => p[0]).
slice(0, 2).
join('').
toUpperCase();

export const pct = (n: number) => `${Math.round(n * 100)}%`;

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const plural = (n: number, word: string, pluralWord?: string) =>
`${n} ${n === 1 ? word : pluralWord ?? `${word}s`}`;