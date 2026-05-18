import { ROLE_COLOR, ROLE_LABEL } from './constants';
import type { IPLPlayer } from '../../types';

const IPL_TEAM_COLORS: Record<string, string> = {
  RCB: '#C8102E', MI: '#004BA0', CSK: '#F9CD05', KKR: '#3A225D',
  DC: '#0078BC', SRH: '#FF822A', PBKS: '#ED1B24', RR: '#FF69B4',
  GT: '#1C1C5B', LSG: '#A4262C',
};

export function CVCCard({ player, captain, viceCaptain, onCaptain, onVC }: {
  player: IPLPlayer;
  captain: boolean;
  viceCaptain: boolean;
  onCaptain: () => void;
  onVC: () => void;
}) {
  const tc = IPL_TEAM_COLORS[player.iplTeam] ?? '#666';

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: captain ? 'rgba(245,158,11,0.08)' : viceCaptain ? 'rgba(139,92,246,0.08)' : 'var(--bg-surface)',
        border: `1.5px solid ${captain ? '#f59e0b50' : viceCaptain ? '#8b5cf650' : 'var(--border)'}`,
      }}>
      {/* avatar */}
      <div className="h-11 w-11 flex-shrink-0 rounded-full flex items-center justify-center text-base font-black text-white"
        style={{ background: captain ? '#f59e0b' : viceCaptain ? '#8b5cf6' : `linear-gradient(135deg,${tc},${tc}88)` }}>
        {player.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="rounded text-[9px] font-black px-1 py-0.5 text-white"
            style={{ background: ROLE_COLOR[player.role] }}>{ROLE_LABEL[player.role]}</span>
          <span className="text-[10px] font-bold" style={{ color: tc }}>{player.iplTeam}</span>
          {captain && <span className="text-[10px] font-black" style={{ color: '#f59e0b' }}>· 2× pts</span>}
          {viceCaptain && <span className="text-[10px] font-black" style={{ color: '#8b5cf6' }}>· 1.5× pts</span>}
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button onClick={onCaptain}
          className="h-9 w-9 rounded-full text-xs font-black transition-all"
          style={{
            background: captain ? '#f59e0b' : 'transparent',
            color: captain ? '#fff' : 'var(--text-muted)',
            border: `2px solid ${captain ? '#f59e0b' : 'var(--border)'}`,
            transform: captain ? 'scale(1.1)' : 'scale(1)',
          }}>C</button>
        <button onClick={onVC}
          className="h-9 w-9 rounded-full text-xs font-black transition-all"
          style={{
            background: viceCaptain ? '#8b5cf6' : 'transparent',
            color: viceCaptain ? '#fff' : 'var(--text-muted)',
            border: `2px solid ${viceCaptain ? '#8b5cf6' : 'var(--border)'}`,
            transform: viceCaptain ? 'scale(1.1)' : 'scale(1)',
          }}>VC</button>
      </div>
    </div>
  );
}
