import type { Dream11Round } from '../../types';

export function MatchBanner({ match }: { match: Dream11Round['match'] }) {
  const isTBD = match.team1Short === 'TBD' || match.team2Short === 'TBD';
  const isLive = match.status === 'live';
  const isDone = match.status === 'completed';

  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0d1f14 0%, #0a1a0f 100%)', border: '1px solid rgba(26,158,92,0.15)' }}>

      {/* subtle grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

      <div className="relative px-5 py-4">
        {/* status pill */}
        <div className="flex justify-center mb-3">
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black"
              style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE NOW
            </span>
          ) : isDone ? (
            <span className="rounded-full px-3 py-1 text-[10px] font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
              MATCH OVER
            </span>
          ) : (
            <span className="rounded-full px-3 py-1 text-[10px] font-bold"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              {match.date !== 'TBD' ? `${match.date} · ${match.time}` : 'Date TBD'}
            </span>
          )}
        </div>

        {/* teams row */}
        <div className="flex items-center justify-between gap-3">
          {/* team 1 */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black"
              style={{
                background: isTBD ? 'rgba(255,255,255,0.06)' : `${match.team1Color}18`,
                border: `2px solid ${isTBD ? 'rgba(255,255,255,0.10)' : match.team1Color + '50'}`,
                color: isTBD ? 'rgba(255,255,255,0.3)' : match.team1Color,
              }}>
              {match.team1Short}
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-white leading-tight">{match.team1Short}</div>
              <div className="text-[10px] mt-0.5 max-w-[80px] leading-tight"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {isTBD ? 'To be decided' : match.team1.split(' ').slice(-1)[0]}
              </div>
            </div>
          </div>

          {/* vs */}
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-base font-black" style={{ color: 'rgba(255,255,255,0.15)' }}>VS</span>
            {match.deadline && !isDone && !isLive && (
              <div className="text-[9px] font-semibold rounded px-1.5 py-0.5"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                Deadline {new Date(match.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* team 2 */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black"
              style={{
                background: isTBD ? 'rgba(255,255,255,0.06)' : `${match.team2Color}18`,
                border: `2px solid ${isTBD ? 'rgba(255,255,255,0.10)' : match.team2Color + '50'}`,
                color: isTBD ? 'rgba(255,255,255,0.3)' : match.team2Color,
              }}>
              {match.team2Short}
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-white leading-tight">{match.team2Short}</div>
              <div className="text-[10px] mt-0.5 max-w-[80px] leading-tight"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {isTBD ? 'To be decided' : match.team2.split(' ').slice(-1)[0]}
              </div>
            </div>
          </div>
        </div>

        {/* result */}
        {isDone && match.result && (
          <div className="mt-3 text-center text-xs font-semibold" style={{ color: '#4ade80' }}>
            ✓ {match.result}
          </div>
        )}

        {/* venue */}
        <div className="mt-3 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          📍 {match.venue}
        </div>
      </div>
    </div>
  );
}
