export function ContestRules() {
  const rules = [
    'Each PlayVista team submits one fantasy squad of exactly 11 players.',
    'Squad: 1 WK · 3–5 BAT · 1–3 AR · 3–5 BOWL.',
    'Max 7 players from any single IPL team.',
    'Pick 1 Captain (2× points) and 1 Vice-Captain (1.5×).',
    'Submit your squad before the match deadline — squads lock automatically.',
    'Contest runs 3 rounds: Playoffs → Semis → Finals (independent squads each round).',
    'Final overall standings = combined points across all 3 rounds.',
    'Per round: 1st → 40 pts · 2nd → 25 pts · 3rd → 15 pts · 4th → 5 pts.',
    'Tie-breaker: higher captain fantasy points wins.',
  ];

  return (
    <div className="rounded-xl p-5 pv-surface">
      <div className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>📋 Contest Rules</div>
      <ol className="space-y-3">
        {rules.map((rule, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{i + 1}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{rule}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
