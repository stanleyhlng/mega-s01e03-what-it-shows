// Splits the reports merged into one ticket by the problem behind them. causes.ts says which cause a
// tenant's report has; this adds the reports the desk read as a one-day move (desk-notes.json), which
// are not a day/month swap at all, whatever their tenant writes.
import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = Cause | 'one-day' | 'unplaced';

export type Problem = {
  key: ProblemKey;
  reports: Report[];
  taggedAs: Record<string, number>;
  channels: Record<string, number>;
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

export function problemsOf(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): Problem[] {
  const byKey = new Map<ProblemKey, Report[]>();
  for (const r of reports) {
    const key: ProblemKey = oneDayMove.includes(r.id) ? 'one-day' : (causeOf(r, tenantOf(r)) ?? 'unplaced');
    byKey.set(key, [...(byKey.get(key) ?? []), r]);
  }
  const tally = (rs: Report[], pick: (r: Report) => string) =>
    rs.reduce<Record<string, number>>((n, r) => ({ ...n, [pick(r)]: (n[pick(r)] ?? 0) + 1 }), {});
  return [...byKey.entries()]
    .map(([key, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        key,
        reports: rs,
        taggedAs: tally(rs, (r) => r.meta.intakeTag),
        channels: tally(rs, (r) => r.channel),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
