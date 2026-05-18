import { ROLE_COLOR, ROLE_LABEL } from './constants';
import type { IPLPlayer } from '../../types';

const IPL_TEAM_COLORS: Record<string, string> = {
  RCB: '#C8102E', MI: '#004BA0', CSK: '#F9CD05', KKR: '#3A225D',
  DC: '#0078BC', SRH: '#FF822A', PBKS: '#ED1B24', RR: '#FF69B4',
  GT: '#1C1C5B', LSG: '#A4262C',
};

/* ── Full card (used in list/grid view) ── */
export function PlayerPickCard({ player, selected, disabled, onToggle }: {
  player: IPLPlayer;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const tc = IPL_TEAM_COLORS[player.iplTeam] ?? '#666';

  return (
    <div
      onClick={disabled && !selected ? undefined : onToggle}
      className="relative overflow-hidden transition-all select-none"
      style={{
        borderRadius: 12,
        border: selected ? '2px solid #1a9e5c' : '1.5px solid var(--border)',
        background: selected ? 'rgba(26,158,92,0.08)' : 'var(--bg-surface)',
        opacity: disabled && !selected ? 0.35 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
      }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: tc }} />
      <div className="flex items-center gap-3 px-3 py-2.5 mt-0.5">
        <div className="flex-shrink-0 relative">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow"
            style={{ background: `linear-gradient(135deg,${tc} 0%,${tc}aa 100%)` }}>
            {player.name.charAt(0)}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded text-[8px] font-black px-1 text-white leading-none py-0.5"
            style={{ background: ROLE_COLOR[player.role], whiteSpace: 'nowrap' }}>
            {ROLE_LABEL[player.role]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] font-black rounded px-1 py-0.5"
              style={{ background: `${tc}22`, color: tc }}>{player.iplTeam}</span>
          </div>
          <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
          <div className="flex gap-2 text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {player.role !== 'bowl' && <span>{player.stats.runs}r</span>}
            {(player.role === 'bowl' || player.role === 'ar') && player.stats.wickets > 0 && (
              <span>{player.stats.wickets}w</span>
            )}
            <span>SR {player.stats.sr}</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="text-sm font-black" style={{ color: '#1a9e5c' }}>₹{player.credits}Cr</div>
          {selected ? (
            <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: '#1a9e5c' }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center text-[11px] font-black"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>+</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Side-panel player row (used in Builder pick step) ── */
export function PlayerPickRow({ player, selected, disabled, onToggle, align = 'left' }: {
  player: IPLPlayer;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  align?: 'left' | 'right';
}) {
  const tc = IPL_TEAM_COLORS[player.iplTeam] ?? '#666';
  const isRight = align === 'right';

  return (
    <div
      onClick={disabled && !selected ? undefined : onToggle}
      className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-all select-none"
      style={{
        background: selected ? 'rgba(26,158,92,0.12)' : 'transparent',
        border: selected ? '1px solid rgba(26,158,92,0.4)' : '1px solid transparent',
        opacity: disabled && !selected ? 0.35 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        flexDirection: isRight ? 'row-reverse' : 'row',
      }}>
      {/* avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
          style={{
            background: selected ? '#1a9e5c' : `linear-gradient(135deg,${tc},${tc}bb)`,
            boxShadow: selected ? '0 0 6px rgba(26,158,92,0.5)' : 'none',
          }}>
          {player.name.charAt(0)}
        </div>
        <span
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-black text-white leading-none px-0.5 py-px rounded whitespace-nowrap"
          style={{ background: selected ? '#1a9e5c' : ROLE_COLOR[player.role] }}>
          {ROLE_LABEL[player.role]}
        </span>
      </div>
      {/* name */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-bold leading-tight truncate"
          style={{
            color: selected ? '#1a9e5c' : 'var(--text-primary)',
            textAlign: isRight ? 'right' : 'left',
          }}>
          {player.name.split(' ').slice(-1)[0]}
        </div>
        <div
          className="text-[9px] leading-none truncate"
          style={{
            color: 'var(--text-muted)',
            textAlign: isRight ? 'right' : 'left',
          }}>
          {player.name.split(' ').slice(0, -1).join(' ') || player.iplTeam}
        </div>
      </div>
      {/* selection indicator */}
      {selected ? (
        <div className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#1a9e5c' }}>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L2.8 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        <div className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px] font-black flex-shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>+</div>
      )}
    </div>
  );
}

/* ── Compact column card (used in side-by-side pitch view) ── */
export function PlayerPickCardCompact({ player, selected, disabled, onToggle, flip: _flip = false }: {
  player: IPLPlayer;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  flip?: boolean;
}) {
  const tc = IPL_TEAM_COLORS[player.iplTeam] ?? '#666';

  const avatar = (
    <div className="relative flex-shrink-0">
      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white"
        style={{
          background: selected ? '#1a9e5c' : `linear-gradient(135deg,${tc},${tc}bb)`,
          border: selected ? '2px solid #1a9e5c' : '2px solid transparent',
          boxShadow: selected ? '0 0 8px rgba(26,158,92,0.5)' : 'none',
        }}>
        {player.name.charAt(0)}
      </div>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded text-[7px] font-black px-0.5 text-white leading-none py-0.5 whitespace-nowrap"
        style={{ background: selected ? '#1a9e5c' : ROLE_COLOR[player.role] }}>
        {ROLE_LABEL[player.role]}
      </span>
    </div>
  );

  return (
    <div
      onClick={disabled && !selected ? undefined : onToggle}
      className="flex flex-col items-center gap-0.5 transition-all select-none"
      style={{
        opacity: disabled && !selected ? 0.3 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
      }}>
      {avatar}
      <div className="text-[8px] font-bold text-center leading-none truncate w-full"
        style={{ color: selected ? '#1a9e5c' : 'var(--text-muted)' }}>
        {player.name.split(' ').slice(-1)[0]}
      </div>
    </div>
  );
}
