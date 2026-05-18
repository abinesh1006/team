export function ScoringReference({ scoring }: {
  scoring: {
    batting: { action: string; points: number }[];
    bowling: { action: string; points: number }[];
    fielding: { action: string; points: number }[];
    multipliers: { action: string; points: number }[];
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { label: '🏏 Batting', items: scoring.batting },
        { label: '🎯 Bowling', items: scoring.bowling },
        { label: '🧤 Fielding', items: scoring.fielding },
        { label: '⚡ Multipliers', items: scoring.multipliers },
      ].map(({ label, items }) => (
        <div key={label} className="rounded-xl p-4 pv-surface">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{label}</div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.action}</span>
                <span className="text-xs font-bold rounded px-2 py-0.5 flex-shrink-0"
                  style={{ color: item.points < 0 ? '#ef4444' : 'var(--accent)', background: item.points < 0 ? '#ef444415' : 'var(--accent-bg)' }}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
