import type { Dream11Round } from '../../types';

export function RoundTabs({ rounds, activeId, onChange }: {
  rounds: Dream11Round[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
      {rounds.map(r => {
        const isActive = r.id === activeId;
        const isLive = r.match.status === 'live';
        const isDone = r.match.status === 'completed';
        const isUpcoming = r.match.status === 'upcoming';

        const statusDot = isLive
          ? <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          : isDone
          ? <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: '#475569' }} />
          : null;

        const statusLabel = isLive ? 'Live' : isDone ? 'Done' : r.match.date !== 'TBD' ? r.match.date : 'TBD';

        return (
          <button
            key={r.id}
            onClick={() => !isUpcoming && onChange(r.id)}
            disabled={isUpcoming}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all"
            style={{
              background: isActive
                ? '#1a9e5c'
                : isUpcoming
                ? 'var(--bg-surface)'
                : 'var(--bg-surface)',
              color: isActive ? '#fff' : isUpcoming ? 'var(--text-muted)' : 'var(--text-secondary)',
              border: isActive
                ? '1.5px solid #1a9e5c'
                : `1.5px solid var(--border)`,
              opacity: isUpcoming ? 0.4 : 1,
              cursor: isUpcoming ? 'not-allowed' : 'pointer',
            }}>
            <span>{r.icon}</span>
            <span>{r.label}</span>
            {statusDot && <span className="flex items-center gap-1 ml-0.5">{statusDot}</span>}
            {!isLive && !isActive && (
              <span className="text-[9px] font-semibold opacity-60">{statusLabel}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
