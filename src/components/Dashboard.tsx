import { useMemo, useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Calendar, ArrowRight, Crown, ExternalLink } from 'lucide-react';
import OrganizerCarousel from './OrganizerCarousel';
import { useTeams, useSchedule, useDream11 } from '../hooks/useData';
import { useInView } from '../hooks/useInView';

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
function Hero({ teams, totalPts, playerCount, upcomingCount, nextEvent }: {
  teams: TeamWithTotal[];
  totalPts: number; playerCount: number; upcomingCount: number;
  nextEvent: { game: string; date: string; time: string } | null;
}) {
  /* animate in without IntersectionObserver — it's above fold */
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  const top3 = teams.slice(0, 3); // [0]=1st [1]=2nd [2]=3rd

  /* podium order: 2nd | 1st | 3rd */
  const podium = [
    { t: top3[1], height: 96,  medal: '🥈', rank: '2nd', shine: false },
    { t: top3[0], height: 140, medal: '🥇', rank: '1st', shine: true  },
    { t: top3[2], height: 72,  medal: '🥉', rank: '3rd', shine: false },
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
          {podium.map(({ t, height, medal, rank, shine }, i) => {
            if (!t) return null;
            const isCenter = i === 1;
            return (
              <div key={t.id} className="flex flex-col items-center flex-1 max-w-[140px]"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? 'none' : `translateY(${isCenter ? 24 : 16}px) scale(0.92)`,
                  transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delays[i]}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delays[i]}ms`,
                }}>

                {/* Medal + name above platform */}
                <div className="flex flex-col items-center mb-2 gap-1">
                  <span className={`${isCenter ? 'text-5xl animate-float' : 'text-3xl'}`}>{medal}</span>

                  {/* Team emoji avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    style={{
                      backgroundColor: `${t.color}30`,
                      border: `2px solid ${t.color}70`,
                      boxShadow: isCenter ? `0 0 20px ${t.color}50` : 'none',
                    }}>
                    {t.emoji}
                  </div>

                  <div className="text-center">
                    <div className={`font-bold leading-tight ${isCenter ? 'text-sm' : 'text-xs'} truncate max-w-[120px]`}>
                      {t.name.replace('Team ', '')}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{t.players.length}p</div>
                  </div>
                </div>

                {/* Platform block */}
                <div
                  className="w-full rounded-t-2xl flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
                  style={{
                    height,
                    background: isCenter
                      ? `linear-gradient(180deg, ${t.color}35 0%, ${t.color}15 100%)`
                      : `${t.color}18`,
                    borderTop: `3px solid ${t.color}`,
                  }}>

                  {shine && (
                    <div className="pointer-events-none absolute inset-0"
                      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 60%)' }} />
                  )}

                  <div className="text-xl font-black tabular-nums" style={{ color: t.color }}>
                    {t.totalPoints}
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
            onClick={() => navigate(`/${s.id}`)}
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


/* ── Games Hub ── */
const GAMES = [
  {
    id: 'dream11',
    name: 'Dream11',
    icon: '🏏',
    color: '#fb7185',
    desc: 'IPL Fantasy',
    sub: 'Pick squad · C/VC · Leaderboard',
    to: '/dream11',
    badge: 'LIVE',
  },
  {
    id: 'running',
    name: 'Running',
    icon: '🏃',
    color: '#f97316',
    desc: 'Sprint & Relay',
    sub: 'Sprint, relay races',
    to: '/running',
    badge: null,
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    color: '#22c55e',
    desc: 'Singles & Doubles',
    sub: 'Knockout bracket',
    to: '/badminton',
    badge: null,
  },
  {
    id: 'chess',
    name: 'Chess',
    icon: '♟️',
    color: '#a78bfa',
    desc: 'Swiss Rapid',
    sub: 'Swiss-system rounds',
    to: '/chess',
    badge: null,
  },
  {
    id: 'carrom',
    name: 'Carrom',
    icon: '🎯',
    color: '#38bdf8',
    desc: 'Doubles',
    sub: 'Team doubles',
    to: '/carrom',
    badge: null,
  },
];

function GamesHub({ upcomingCount }: { upcomingCount: number }) {
  const { ref, inView } = useInView();
  const navigate = useNavigate();
  const { data: d11 } = useDream11();
  const activeRound = d11?.rounds[0] ?? null;

  return (
    <div ref={ref}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-base font-bold">Games</span>
        <span className="text-xs text-slate-500">{upcomingCount} upcoming</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => (
          <button key={g.id}
            onClick={() => navigate(g.to)}
            className="group relative flex items-center gap-4 rounded-2xl border bg-white/5 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            style={{
              borderColor: `${g.color}25`,
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(18px)',
              transition: `opacity 0.45s ease ${i * 60}ms, transform 0.45s ease ${i * 60}ms, translate 0.15s, box-shadow 0.15s`,
            }}>
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
              style={{ background: `radial-gradient(circle at 30% 50%,${g.color}18,transparent 70%)` }} />

            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl group-hover:scale-110 transition-transform duration-200"
              style={{ background: `${g.color}18` }}>
              {g.icon}
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm">{g.name}</span>
                {g.badge && (
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
                    style={{ background: `${g.color}30`, color: g.color }}>{g.badge}</span>
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">{g.sub}</div>
              {g.id === 'dream11' && activeRound && (
                <div className="mt-1 text-xs font-semibold truncate" style={{ color: g.color }}>
                  {activeRound.match.team1} vs {activeRound.match.team2}
                </div>
              )}
            </div>

            <ExternalLink className="relative h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </button>
        ))}
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

      {/* Hero with podium */}
      <Hero
        teams={rankedTeams}
        totalPts={totalPts}
        playerCount={players.length}
        upcomingCount={upcomingCount}
        nextEvent={nextEvent}
      />

      {/* Games Hub */}
      <GamesHub upcomingCount={upcomingCount} />

      {/* Team standings */}
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

      {/* Sport tiles — rules */}
      <SportTiles />

      {/* Organiser carousel FAB */}
      <OrganizerCarousel />
    </div>
  );
}
