import { useMemo, useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Calendar, ArrowRight, Crown, Flame, Medal } from 'lucide-react';
import { useTeams, useSchedule, useQuotes } from '../hooks/useData';
import { useInView } from '../hooks/useInView';
import DailyQuote from './DailyQuote';
import { useNavigate } from 'react-router-dom';
import type { PlayerWithTeam, TeamWithTotal } from '../types';

/* ── Skeleton ── */
function Sk({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Sk className="h-[340px] rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[0,1,2,3].map(i => <Sk key={i} className="h-24" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {[0,1,2,3,4,5].map(i => <Sk key={i} className="h-16" />)}
        </div>
        <div className="space-y-4"><Sk className="h-48" /><Sk className="h-36" /></div>
      </div>
    </div>
  );
}

/* ── Counter ── */
function Counter({ to, duration = 900, started = true }: { to: number; duration?: number; started?: boolean }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration, started]);
  return <>{val}</>;
}

/* ── Reveal on scroll ── */
function Reveal({ children, delay = 0, from = 'bottom', className = '' }: {
  children: React.ReactNode; delay?: number;
  from?: 'bottom' | 'left' | 'right'; className?: string;
}) {
  const { ref, inView } = useInView();
  const t = { bottom: 'translateY(28px)', left: 'translateX(-20px)', right: 'translateX(20px)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : t[from],
      transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  );
}

/* ── Bar ── */
function Bar({ pct, color, delay = 0, started = true }: { pct: number; color: string; delay?: number; started?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setW(pct), delay + 60);
    return () => clearTimeout(t);
  }, [pct, delay, started]);
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full" style={{
        width: `${w}%`, backgroundColor: color,
        transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: `0 0 10px ${color}60`,
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   HERO  —  title left, podium right, all above fold
══════════════════════════════════════════════ */
function Hero({ players, totalPts, playerCount, upcomingCount, nextEvent }: {
  players: PlayerWithTeam[];
  totalPts: number; playerCount: number; upcomingCount: number;
  nextEvent: { game: string; date: string; time: string } | null;
}) {
  /* animate in without IntersectionObserver — it's above fold */
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  const top3 = players.slice(0, 3); // [0]=1st [1]=2nd [2]=3rd

  /* podium order: 2nd | 1st | 3rd */
  const podium = [
    { p: top3[1], height: 96,  medal: '🥈', rank: '2nd', shine: false },
    { p: top3[0], height: 140, medal: '🥇', rank: '1st', shine: true  },
    { p: top3[2], height: 72,  medal: '🥉', rank: '3rd', shine: false },
  ];
  const delays = [200, 0, 350];

  const ICONS: Record<string,string> = { Running:'🏃', Badminton:'🏸', Chess:'♟️', Carrom:'🎯' };
  const nIcon = nextEvent ? (Object.entries(ICONS).find(([k]) => nextEvent?.game.includes(k))?.[1] ?? '🏆') : null;
  const diff = nextEvent ? new Date(`${nextEvent.date}T${nextEvent.time}`).getTime() - Date.now() : 0;
  const nDays = Math.max(0, Math.floor(diff / 86400000));
  const nHrs  = Math.max(0, Math.floor((diff % 86400000) / 3600000));

  function anim(delay: number) {
    return {
      opacity: ready ? 1 : 0,
      transform: ready ? 'none' : 'translateY(18px)',
      transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    };
  }

  return (
    <div className="relative overflow-hidden rounded-3xl"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1a1040 45%,#0d1f35 100%)' }}>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-0 right-1/3 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl opacity-25"
        style={{ background: 'radial-gradient(circle,#f59e0b,transparent 70%)' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 translate-y-1/2 rounded-full blur-3xl opacity-15"
        style={{ background: 'radial-gradient(circle,#6366f1,transparent 70%)' }} />

      <div className="relative grid lg:grid-cols-2 gap-0">

        {/* ── LEFT: title + stats ── */}
        <div className="flex flex-col justify-center px-8 py-10 md:px-12">

          {/* Live badge */}
          <div className="mb-4" style={anim(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              LIVE TOURNAMENT
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-1 font-black leading-none" style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', ...anim(80) }}>
            Play<span style={{ color: '#f59e0b' }}>Vista</span>
          </h1>
          <p className="mb-8 text-sm text-slate-400 max-w-xs" style={anim(150)}>
            4 teams · 5 events · one champion
          </p>

          {/* Stat trio */}
          <div className="grid grid-cols-3 gap-3 mb-6" style={anim(220)}>
            {[
              { label: 'Points',  to: totalPts,      color: '#f59e0b', icon: TrendingUp },
              { label: 'Players', to: playerCount,   color: '#818cf8', icon: Users      },
              { label: 'Events',  to: upcomingCount, color: '#34d399', icon: Calendar   },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/5 p-3 text-center">
                <s.icon className="h-4 w-4 mx-auto mb-1" style={{ color: s.color }} />
                <div className="text-xl font-black tabular-nums" style={{ color: s.color }}>
                  <Counter to={s.to} started={ready} />
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Next event */}
          {nextEvent && nIcon && (
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3" style={anim(300)}>
              <span className="text-xl animate-float">{nIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">Next Up</div>
                <div className="text-sm font-bold truncate">{nextEvent.game}</div>
              </div>
              <div className="flex gap-2 text-center shrink-0">
                <div><div className="text-base font-black text-amber-400">{nDays}</div><div className="text-xs text-slate-500">d</div></div>
                <div><div className="text-base font-black text-amber-400">{nHrs}</div><div className="text-xs text-slate-500">h</div></div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Podium ── */}
        <div className="flex items-end justify-center gap-3 px-6 pb-0 pt-8 lg:pt-0 lg:pb-0">
          {podium.map(({ p, height, medal, rank, shine }, i) => {
            if (!p) return null;
            const isCenter = i === 1;
            return (
              <div key={p.name} className="flex flex-col items-center flex-1 max-w-[140px]"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? 'none' : `translateY(${isCenter ? 24 : 16}px) scale(0.92)`,
                  transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delays[i]}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delays[i]}ms`,
                }}>

                {/* Medal + name above platform */}
                <div className="flex flex-col items-center mb-2 gap-1">
                  <span className={`${isCenter ? 'text-5xl animate-float' : 'text-3xl'}`}>{medal}</span>

                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
                    style={{
                      backgroundColor: `${p.teamColor}30`,
                      color: p.teamColor,
                      border: `2px solid ${p.teamColor}70`,
                      boxShadow: isCenter ? `0 0 20px ${p.teamColor}50` : 'none',
                    }}>
                    {p.name.charAt(0)}
                  </div>

                  <div className="text-center">
                    <div className={`font-bold leading-tight ${isCenter ? 'text-sm' : 'text-xs'} truncate max-w-[120px]`}>
                      {p.name.split(' ')[0]}
                    </div>
                    <div className="text-xs rounded-full px-1.5 py-0.5 mt-0.5 font-medium"
                      style={{ backgroundColor: `${p.teamColor}25`, color: p.teamColor }}>
                      {p.teamEmoji} {p.team.replace('Team ','')}
                    </div>
                  </div>
                </div>

                {/* Platform block */}
                <div
                  className="w-full rounded-t-2xl flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
                  style={{
                    height,
                    background: isCenter
                      ? `linear-gradient(180deg, ${p.teamColor}35 0%, ${p.teamColor}15 100%)`
                      : `${p.teamColor}18`,
                    borderTop: `3px solid ${p.teamColor}`,
                  }}>

                  {/* Shine on 1st */}
                  {shine && (
                    <div className="pointer-events-none absolute inset-0"
                      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 60%)' }} />
                  )}

                  <div className="text-xl font-black tabular-nums" style={{ color: p.teamColor }}>
                    {p.points}
                  </div>
                  <div className="text-xs font-bold text-white/40">{rank}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

/* ── Team score cards ── */
function TeamScoreCards({ teams }: { teams: TeamWithTotal[] }) {
  const { ref, inView } = useInView();
  const max = Math.max(...teams.map(t => t.totalPoints), 1);
  const BADGE = ['🥇','🥈','🥉','4️⃣'];
  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {teams.map((t, i) => (
        <div key={t.id}
          className="relative overflow-hidden rounded-2xl border p-5 hover:-translate-y-0.5 transition-all cursor-pointer group"
          style={{
            borderColor: `${t.color}30`,
            background: `linear-gradient(135deg,${t.color}0d 0%,transparent 70%)`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(20px)',
            transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 75}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 75}ms, translate 0.15s`,
          }}>
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
            style={{ background: `radial-gradient(circle at 50% 0%,${t.color}20,transparent 70%)` }} />
          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-xl">{BADGE[i]}</span>
            </div>
            <div className="mb-1 text-sm font-bold">{t.name}</div>
            <div className="mb-3 text-3xl font-black tabular-nums" style={{ color: t.color }}>
              <Counter to={t.totalPoints} started={inView} duration={900} />
            </div>
            <Bar pct={(t.totalPoints / max) * 100} color={t.color} delay={i * 75} started={inView} />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>C: {t.captain.split(' ')[0]}</span>
              <span>{t.players.length} players</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Individual leaderboard rows ── */
function LeaderboardCards({ players }: { players: PlayerWithTeam[] }) {
  const { ref, inView } = useInView();
  const max = players[0]?.points ?? 1;
  return (
    <div ref={ref} className="space-y-2">
      {players.map((p, i) => {
        const isGold = i === 0, isSilver = i === 1, isBronze = i === 2, isTop = i < 3;
        const medal = isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : null;
        return (
          <div key={p.name}
            className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 transition-colors ${
              isGold   ? 'border border-amber-400/25 bg-gradient-to-r from-amber-400/10 to-amber-400/5' :
              isSilver ? 'border border-slate-400/15 bg-white/5' :
              isBronze ? 'border border-amber-700/15 bg-white/4' :
              'border border-white/5 bg-white/3 hover:bg-white/5'
            }`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateX(-16px)',
              transition: `opacity 0.45s ease ${Math.min(i * 30, 500)}ms, transform 0.45s ease ${Math.min(i * 30, 500)}ms`,
            }}>

            {/* Rank */}
            <div className="w-8 shrink-0 text-center">
              {medal
                ? <span className="text-xl">{medal}</span>
                : <span className="text-xs font-bold text-slate-600">{p.rank}</span>}
            </div>

            {/* Avatar */}
            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-sm font-black"
              style={{ background: `${p.teamColor}25`, color: p.teamColor, border: `1.5px solid ${p.teamColor}50` }}>
              {p.name.charAt(0)}
            </div>

            {/* Name + team */}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold truncate text-sm ${isGold ? 'text-amber-200' : ''}`}>{p.name}</div>
              <span className="text-xs rounded-full px-2 py-0.5 font-medium"
                style={{ background: `${p.teamColor}20`, color: p.teamColor }}>
                {p.teamEmoji} {p.team}
              </span>
            </div>

            {/* Progress bar */}
            <div className="hidden sm:block w-28">
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: inView ? `${(p.points / max) * 100}%` : '0%',
                    backgroundColor: p.teamColor,
                    transitionDelay: `${Math.min(i * 30, 500) + 250}ms`,
                    boxShadow: isTop ? `0 0 6px ${p.teamColor}80` : 'none',
                  }} />
              </div>
            </div>

            {/* Points */}
            <div className="shrink-0 text-right min-w-[3rem]">
              <div className={`font-black tabular-nums ${isGold ? 'text-amber-400 text-lg' : isSilver ? 'text-slate-300' : isBronze ? 'text-amber-600' : 'text-slate-400 text-sm'}`}>
                {p.points}
              </div>
              <div className="text-xs text-slate-600">{i === 0 ? 'Leader' : `-${players[0].points - p.points}`}</div>
            </div>

            {isTop && <Flame className="h-4 w-4 shrink-0" style={{ color: isGold ? '#f59e0b' : isSilver ? '#94a3b8' : '#b45309', opacity: 0.7 }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Sport tiles (clickable → rules/:gameId) ── */
const SPORTS = [
  { id: 'running',   name: 'Running',   icon: '🏃', color: '#f97316', desc: 'Sprint & Relay' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', color: '#22c55e', desc: 'Singles & Doubles' },
  { id: 'chess',     name: 'Chess',     icon: '♟️',  color: '#a78bfa', desc: 'Swiss Rapid' },
  { id: 'carrom',    name: 'Carrom',    icon: '🎯', color: '#38bdf8', desc: 'Doubles' },
  { id: 'dream11',   name: 'Dream11',   icon: '🏏', color: '#fb7185', desc: 'IPL Fantasy' },
];

function SportTiles() {
  const { ref, inView } = useInView();
  const navigate = useNavigate();
  return (
    <div ref={ref}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Events — tap to view rules</div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {SPORTS.map((s, i) => (
          <button key={s.id}
            onClick={() => navigate(`/rules/${s.id}`)}
            className="group flex flex-col items-center gap-2 rounded-2xl border bg-white/5 py-4 px-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            style={{
              borderColor: `${s.color}25`,
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(16px)',
              transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms, translate 0.15s, box-shadow 0.15s`,
            }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl group-hover:scale-110 transition-transform duration-200"
              style={{ background: `${s.color}18` }}>
              {s.icon}
            </div>
            <div className="text-xs font-bold leading-tight">{s.name}</div>
            <div className="hidden sm:block text-xs text-slate-500 leading-tight">{s.desc}</div>
            <div className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: s.color }}>Rules →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── IPL-style honour caps ── */
const CAPS = [
  {
    id: 'orange',
    label: 'Orange Cap',
    sublabel: 'Top Scorer',
    emoji: '🧢',
    capColor: '#f97316',
    bg: 'from-orange-500/15 to-orange-500/5',
    border: 'border-orange-500/30',
    pick: (players: PlayerWithTeam[]) => players[0],
  },
  {
    id: 'purple',
    label: 'Purple Cap',
    sublabel: 'Most Consistent',
    emoji: '🧢',
    capColor: '#a855f7',
    bg: 'from-purple-500/15 to-purple-500/5',
    border: 'border-purple-500/30',
    // pick the player whose points are closest to the team average (most consistent)
    pick: (players: PlayerWithTeam[], teams: TeamWithTotal[]) => {
      if (!players.length) return null;
      const teamAvg = teams.map(t => ({
        name: t.name,
        avg: t.players.reduce((s, p) => s + p.points, 0) / t.players.length,
      }));
      return [...players].sort((a, b) => {
        const avgA = teamAvg.find(t => t.name === a.team)?.avg ?? 0;
        const avgB = teamAvg.find(t => t.name === b.team)?.avg ?? 0;
        return Math.abs(a.points - avgA) - Math.abs(b.points - avgB);
      })[0];
    },
  },
  {
    id: 'golden',
    label: 'Golden Cap',
    sublabel: 'Team MVP',
    emoji: '🧢',
    capColor: '#f59e0b',
    bg: 'from-amber-400/15 to-amber-400/5',
    border: 'border-amber-400/30',
    // pick the player who contributes the highest % to their team total
    pick: (players: PlayerWithTeam[], teams: TeamWithTotal[]) => {
      if (!players.length) return null;
      return [...players].sort((a, b) => {
        const tA = teams.find(t => t.name === a.team)?.totalPoints ?? 1;
        const tB = teams.find(t => t.name === b.team)?.totalPoints ?? 1;
        return (b.points / tB) - (a.points / tA);
      })[0];
    },
  },
  {
    id: 'green',
    label: 'Green Cap',
    sublabel: 'Rising Star',
    emoji: '🧢',
    capColor: '#22c55e',
    bg: 'from-green-500/15 to-green-500/5',
    border: 'border-green-500/30',
    // lowest-ranked player among top-50% scorers in their team (underdog)
    pick: (players: PlayerWithTeam[]) => {
      if (players.length < 4) return null;
      // pick player ranked 4th–6th overall (rising, not yet at top)
      return players[3] ?? null;
    },
  },
];

function HonourCaps({ players, teams }: { players: PlayerWithTeam[]; teams: TeamWithTotal[] }) {
  const { ref, inView } = useInView();
  const navigate = useNavigate();

  const picks = CAPS.map(cap => ({
    ...cap,
    player: cap.pick(players, teams) ?? null,
  }));

  return (
    <div ref={ref}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base font-bold">Honour Caps</span>
        <span className="text-xs text-slate-500">— IPL-style awards</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {picks.map((cap, i) => {
          const p = cap.player;
          if (!p) return null;
          return (
            <button key={cap.id}
              onClick={() => navigate('/teams')}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b ${cap.bg} ${cap.border} p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(20px) scale(0.95)',
                transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, translate 0.15s`,
              }}>
              {/* Glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 0%,${cap.capColor}25,transparent 70%)` }} />

              <div className="relative">
                {/* Cap badge */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="rounded-xl px-2.5 py-1 text-xs font-black tracking-wide"
                    style={{ background: `${cap.capColor}25`, color: cap.capColor }}>
                    {cap.label}
                  </div>
                  <span className="text-xl" style={{ filter: `hue-rotate(${cap.id === 'purple' ? '270deg' : cap.id === 'golden' ? '40deg' : cap.id === 'green' ? '120deg' : '0deg'})` }}>
                    🧢
                  </span>
                </div>

                {/* Player avatar */}
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
                  style={{ background: `${p.teamColor}30`, color: p.teamColor, border: `2px solid ${p.teamColor}60` }}>
                  {p.name.charAt(0)}
                </div>

                <div className="font-bold text-sm truncate">{p.name}</div>
                <div className="text-xs truncate" style={{ color: p.teamColor }}>
                  {p.teamEmoji} {p.team}
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-xl font-black tabular-nums" style={{ color: cap.capColor }}>{p.points}</span>
                  <span className="text-xs text-slate-500">{cap.sublabel}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main
══════════════════════════════════════════════ */
export default function Dashboard() {
  const { data: teams, loading } = useTeams();
  const { data: events } = useSchedule();
  const { data: quotes } = useQuotes();
  const navigate = useNavigate();

  const players = useMemo<PlayerWithTeam[]>(() => {
    if (!teams) return [];
    return teams
      .flatMap(t => t.players.map(p => ({ ...p, team: t.name, teamColor: t.color, teamEmoji: t.emoji, rank: 0 })))
      .sort((a, b) => b.points - a.points)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [teams]);

  const rankedTeams = useMemo<TeamWithTotal[]>(() => {
    if (!teams) return [];
    return teams
      .map(t => ({ ...t, totalPoints: t.players.reduce((s, p) => s + p.points, 0), rank: 0 }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((t, i) => ({ ...t, rank: i + 1 }));
  }, [teams]);

  const nextEvent = useMemo(() => {
    if (!events) return null;
    const today = new Date().toISOString().slice(0, 10);
    return events.find(e => e.status !== 'completed' && e.date >= today) ?? null;
  }, [events]);

  if (loading) return <DashboardSkeleton />;

  const totalPts      = players.reduce((s, p) => s + p.points, 0);
  const upcomingCount = events?.filter(e => e.status === 'upcoming').length ?? 0;

  return (
    <div className="space-y-6">

      {/* 0 — Daily quote (once per day) */}
      {quotes && <DailyQuote quotes={quotes.daily} />}

      {/* 1 — Hero with podium right there */}
      <Hero
        players={players}
        totalPts={totalPts}
        playerCount={players.length}
        upcomingCount={upcomingCount}
        nextEvent={nextEvent}
      />

      {/* 2 — Sport tiles */}
      <SportTiles />

      {/* 3 — Honour caps */}
      <HonourCaps players={players} teams={rankedTeams} />

      {/* 4 — Team standings */}
      <Reveal>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-amber-400" />Team Standings
          </h2>
          <button onClick={() => navigate('/teams')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors">
            Full details <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <TeamScoreCards teams={rankedTeams} />
      </Reveal>

      {/* 5 — Leaderboard + side */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <Reveal>
            <div className="mb-3 flex items-center gap-2 text-base font-bold">
              <Medal className="h-4 w-4 text-amber-400" />Individual Rankings
              <span className="text-sm font-normal text-slate-500">({players.length})</span>
            </div>
          </Reveal>
          <LeaderboardCards players={players} />
        </div>

        <div className="space-y-4">
          {/* Top scorer card */}
          {players[0] && (
            <Reveal from="right">
              <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-amber-400/10 to-transparent p-5">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-400/70 flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" />Top Scorer
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full font-black text-lg animate-pulse-glow"
                    style={{ background: `${players[0].teamColor}25`, color: players[0].teamColor, border: `2px solid ${players[0].teamColor}60` }}>
                    {players[0].name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{players[0].name}</div>
                    <div className="text-xs" style={{ color: players[0].teamColor }}>
                      {players[0].teamEmoji} {players[0].team}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-400">{players[0].points}</div>
                </div>
                <div className="rounded-xl bg-white/5 px-4 py-2 flex justify-between text-xs">
                  <span className="text-slate-400">Lead over 2nd</span>
                  <span className="font-bold text-amber-400">+{players[0].points - (players[1]?.points ?? 0)} pts</span>
                </div>
              </div>
            </Reveal>
          )}

          {/* Quick nav */}
          <Reveal from="right" delay={80}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: '📅', label: 'Schedule', sub: `${upcomingCount} left`,  to: '/schedule', color: '#34d399' },
                { icon: '📖', label: 'Rules',    sub: '5 sports',               to: '/rules',    color: '#818cf8' },
                { icon: '🏆', label: 'Teams',    sub: '4 squads',               to: '/teams',    color: '#f59e0b' },
                { icon: '🏏', label: 'Dream11',  sub: 'IPL Final',              to: '/dream11',  color: '#f97316' },
                { icon: '⚙️', label: 'Admin',    sub: 'Manage',                 to: '/admin',    color: '#94a3b8' },
              ].map(l => (
                <button key={l.to} onClick={() => navigate(l.to)}
                  className="group rounded-2xl border border-white/8 bg-white/5 p-4 text-left hover:border-white/15 hover:bg-white/8 transition-all">
                  <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform duration-200">{l.icon}</div>
                  <div className="text-sm font-bold">{l.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: l.color }}>{l.sub}</div>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}
