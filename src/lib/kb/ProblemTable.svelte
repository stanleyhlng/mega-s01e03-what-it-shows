<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { problemsOf } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const problems = $derived(problemsOf(merged, tenantOf, notes.oneDayMove));
  const tags = (p: { taggedAs: Record<string, number> }) =>
    Object.entries(p.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const channels = (p: { channels: Record<string, number> }) =>
    Object.entries(p.channels)
      .sort((a, b) => b[1] - a[1])
      .map(([channel, n]) => `${channel} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong> {problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>intake tagged them</th><th>tenants</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.key)}
      <tr>
        <td><code>{p.key}</code></td>
        <td>{p.reports.length}</td>
        <td class="tags">{channels(p)}</td>
        <td class="tags">{tags(p)}</td>
        <td>{p.tenants.length}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
</style>
