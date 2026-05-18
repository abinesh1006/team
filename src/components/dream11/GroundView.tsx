import { ROLE_LABEL } from './constants';
import type { IPLPlayer, PlayerRole } from '../../types';

export function GroundView({ selectedPlayers, captain, viceCaptain, compact = false }: {
  selectedPlayers: IPLPlayer[];
  captain: string | null;
  viceCaptain: string | null;
  compact?: boolean;
}) {
  const byRole: Record<PlayerRole, IPLPlayer[]> = { wk: [], bat: [], ar: [], bowl: [] };
  for (const p of selectedPlayers) byRole[p.role].push(p);

  const rows: { role: PlayerRole; label: string }[] = [
    { role: 'wk',   label: 'WK' },
    { role: 'bat',  label: 'BAT' },
    { role: 'ar',   label: 'AR' },
    { role: 'bowl', label: 'BOWL' },
  ];

  const avatarSize  = compact ? 28 : 44;
  const fontSize    = compact ? 10 : 14;
  const nameFontSz  = compact ? 'text-[7px]' : 'text-[9px]';
  const badgeFontSz = compact ? 'text-[6px]' : 'text-[8px]';
  const itemWidth   = compact ? 28 : 56;
  const rowGap      = compact ? 'gap-1' : 'gap-2';
  const padding     = compact ? 'py-3 px-1' : 'py-5 px-3';

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg,#0f4a22 0%,#1a6b35 35%,#1e7a3c 65%,#145c2a 100%)',
        minHeight: compact ? undefined : 280,
        flex: compact ? 1 : undefined,
        display: 'flex',
        flexDirection: 'column',
      }}>

      {/* pitch markings — skip inner ring in compact */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full" style={{ width: '88%', height: '92%', border: '1px solid rgba(255,255,255,0.12)' }} />
        {!compact && (
          <div className="absolute rounded-full" style={{ width: '38%', height: '42%', border: '1px solid rgba(255,255,255,0.1)' }} />
        )}
        <div className="absolute rounded-sm"
          style={{
            width: compact ? 12 : 28,
            height: compact ? 36 : 70,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }} />
      </div>

      <div className={`relative ${padding} flex flex-col justify-around flex-1`}>
        {rows.map(({ role, label }) => {
          const players = byRole[role];
          if (!players.length) return null;
          return (
            <div key={role}>
              {!compact && (
                <div className="text-center text-[9px] font-black uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
              )}
              <div className={`flex justify-around flex-wrap ${rowGap}`}>
                {players.map(p => {
                  const isCap = captain === p.id;
                  const isVC  = viceCaptain === p.id;
                  return (
                    <div key={p.id} className="flex flex-col items-center gap-0.5"
                      style={{ width: itemWidth }}>
                      <div className="relative rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
                        style={{
                          width: avatarSize,
                          height: avatarSize,
                          fontSize,
                          background: isCap
                            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                            : isVC
                              ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)'
                              : 'rgba(255,255,255,0.18)',
                          border: isCap ? '2px solid #fcd34d' : isVC ? '2px solid #c4b5fd' : '2px solid rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(4px)',
                          boxShadow: isCap ? '0 0 10px rgba(245,158,11,0.5)' : isVC ? '0 0 10px rgba(139,92,246,0.5)' : 'none',
                        }}>
                        {p.name.charAt(0)}
                        {(isCap || isVC) && (
                          <span className={`absolute -top-1 -right-1 rounded-full flex items-center justify-center font-black text-white ${compact ? 'h-3 w-3 text-[7px]' : 'h-4 w-4 text-[9px]'}`}
                            style={{ background: isCap ? '#f59e0b' : '#8b5cf6', border: '1px solid rgba(255,255,255,0.4)' }}>
                            {isCap ? 'C' : 'V'}
                          </span>
                        )}
                      </div>
                      <div className={`${nameFontSz} font-bold text-white text-center leading-none line-clamp-1 w-full`}>
                        {p.name.split(' ').slice(-1)[0]}
                      </div>
                      {!compact && (
                        <span className={`rounded ${badgeFontSz} font-black px-1 text-white leading-none py-0.5`}
                          style={{ background: 'rgba(0,0,0,0.35)' }}>
                          {ROLE_LABEL[p.role]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {selectedPlayers.length === 0 && (
          <div className={`text-center font-semibold ${compact ? 'py-6 text-[10px]' : 'py-10 text-sm'}`}
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            {compact ? 'Pick players' : 'Pick players to see them on the field'}
          </div>
        )}
      </div>
    </div>
  );
}
