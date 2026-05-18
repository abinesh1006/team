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
        return (
          <button key={r.id} onClick={() => onChange(r.id)}
            className="flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
            style={{
              background: isActive ? '#1a9e5c' : 'var(--bg-surface)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: `1.5px solid ${isActive ? '#1a9e5c' : 'var(--border)'}`,
            }}>
            <span className="text-base">{r.icon}</span>
            <div className="text-left">
              <div className="text-xs font-black leading-none">{r.label}</div>
              <div className="text-[10px] mt-0.5 font-semibold leading-none"
                style={{ color: isActive ? 'rgba(255,255,255,0.7)' : isLive ? '#22c55e' : isDone ? '#94a3b8' : '#f59e0b' }}>
                {isLive ? '🔴 LIVE' : isDone ? 'Done' : r.match.date !== 'TBD' ? r.match.date : 'TBD'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
