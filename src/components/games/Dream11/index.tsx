import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Trophy, Users, Info, CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Zap, Lock, RotateCcw, Star,
} from 'lucide-react';
import { useDream11, useCricketPlayers, useRoundScores, useTeams } from '../../../hooks/useData';
import { useUser } from '../../../context/UserContext';
import type { IPLPlayer, PlayerRole, Dream11TeamSquad, PlayerPerformance, Dream11Round, Dream11Constraints } from '../../../types';

const ROLE_LABEL: Record<PlayerRole, string> = { wk: 'WK', bat: 'BAT', ar: 'AR', bowl: 'BOWL' };
const ROLE_COLOR: Record<PlayerRole, string> = {
  wk: '#f59e0b', bat: '#22c55e', ar: '#8b5cf6', bowl: '#3b82f6',
};
const ROLE_FULL: Record<PlayerRole, string> = {
  wk: 'Wicket Keeper', bat: 'Batter', ar: 'All-Rounder', bowl: 'Bowler',
};

const STORAGE_KEY = (roundId: string, teamId: string) => `d11_squad_${roundId}_${teamId}`;

function calcFantasyPoints(perf: PlayerPerformance, isCaptain: boolean, isVC: boolean): number {
  let pts = 0;
  const runs = perf.runs ?? 0;
  const wickets = perf.wickets ?? 0;
  pts += runs * 0.5;
  pts += (perf.fours ?? 0) * 1;
  pts += (perf.sixes ?? 0) * 2;
  if (runs >= 30) pts += 4;
  if (runs >= 50) pts += 8;
  if (runs >= 100) pts += 16;
  if (perf.isDuck) pts -= 2;
  pts += wickets * 25;
  if (perf.lbwBowled) pts += 8;
  if (wickets >= 3) pts += 4;
  if (wickets >= 4) pts += 8;
  if (wickets >= 5) pts += 16;
  pts += (perf.maidens ?? 0) * 12;
  pts += (perf.catches ?? 0) * 8;
  pts += (perf.stumpings ?? 0) * 12;
  pts += (perf.runOutDirect ?? 0) * 12;
  pts += (perf.runOutIndirect ?? 0) * 6;
  if (isCaptain) pts *= 2;
  else if (isVC) pts *= 1.5;
  return Math.round(pts * 10) / 10;
}

function Sk({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function RoleBadge({ role, small }: { role: PlayerRole; small?: boolean }) {
  return (
    <span
      className={`rounded font-bold uppercase tracking-wide text-white ${small ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'}`}
      style={{ background: ROLE_COLOR[role] }}>
      {ROLE_LABEL[role]}
    </span>
  );
}

function useSquadValidation(squad: string[], captain: string | null, viceCaptain: string | null, players: IPLPlayer[], c: Dream11Constraints) {
  return useMemo(() => {
    const sel = players.filter(p => squad.includes(p.id));
    const byRole = (r: PlayerRole) => sel.filter(p => p.role === r).length;
    const teams = [...new Set(players.map(p => p.iplTeam))];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (squad.length < c.squadSize) errors.push(`Pick ${c.squadSize - squad.length} more player${c.squadSize - squad.length > 1 ? 's' : ''}`);
    if (squad.length > c.squadSize) errors.push(`Remove ${squad.length - c.squadSize} player${squad.length - c.squadSize > 1 ? 's' : ''}`);
    for (const [role, label] of [['wk','WK'],['bat','BAT'],['ar','AR'],['bowl','BOWL']] as const) {
      const n = byRole(role); const lim = c[role];
      if (n < lim.min) errors.push(`Min ${lim.min} ${label} (have ${n})`);
      if (n > lim.max) errors.push(`Max ${lim.max} ${label} (have ${n})`);
    }
    for (const t of teams) {
      const n = sel.filter(p => p.iplTeam === t).length;
      if (n > c.maxFromOneIPLTeam) errors.push(`Max ${c.maxFromOneIPLTeam} from ${t}`);
    }
    if (squad.length === c.squadSize && !captain) warnings.push('Pick a Captain (2× points)');
    if (squad.length === c.squadSize && !viceCaptain) warnings.push('Pick a Vice-Captain (1.5× points)');

    return { errors, warnings, valid: errors.length === 0 };
  }, [squad, captain, viceCaptain, players, c]);
}

function GroundView({ selectedPlayers, captain, viceCaptain }: {
  selectedPlayers: IPLPlayer[];
  captain: string | null;
  viceCaptain: string | null;
}) {
  const byRole: Record<PlayerRole, IPLPlayer[]> = { wk: [], bat: [], ar: [], bowl: [] };
  for (const p of selectedPlayers) byRole[p.role].push(p);

  const rows: { role: PlayerRole; players: IPLPlayer[] }[] = [
    { role: 'wk',   players: byRole.wk   },
    { role: 'bat',  players: byRole.bat  },
    { role: 'ar',   players: byRole.ar   },
    { role: 'bowl', players: byRole.bowl },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden py-6 px-4"
      style={{
        background: 'linear-gradient(180deg, #14532d 0%, #166534 40%, #15803d 100%)',
        border: '2px solid #16a34a40',
        minHeight: 320,
      }}>
      {/* Pitch markings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="rounded-full opacity-10" style={{ width: '80%', height: '85%', border: '2px solid #fff' }} />
        <div className="absolute rounded-full opacity-10" style={{ width: '35%', height: '40%', border: '2px solid #fff' }} />
        <div className="absolute opacity-10 w-12 h-24 rounded-sm" style={{ border: '2px solid #fff' }} />
      </div>

      <div className="relative space-y-4">
        {rows.map(({ role, players }) => players.length === 0 ? null : (
          <div key={role}>
            <div className="text-center text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60 text-white">
              {ROLE_FULL[role]}
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {players.map(p => {
                const isCap = captain === p.id;
                const isVC = viceCaptain === p.id;
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1 w-16">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full text-lg font-black"
                      style={{
                        background: isCap ? '#f59e0b' : isVC ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                        border: isCap ? '2px solid #fcd34d' : isVC ? '2px solid #c4b5fd' : '2px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        fontSize: 18,
                      }}>
                      {p.name.charAt(0)}
                      {(isCap || isVC) && (
                        <span className="absolute -top-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black"
                          style={{ background: isCap ? '#f59e0b' : '#8b5cf6', border: '1px solid rgba(255,255,255,0.5)' }}>
                          {isCap ? 'C' : 'V'}
                        </span>
                      )}
                    </div>
                    <div className="text-center text-[9px] font-semibold text-white leading-tight line-clamp-2">
                      {p.name.split(' ').slice(-1)[0]}
                    </div>
                    <RoleBadge role={p.role} small />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {selectedPlayers.length === 0 && (
          <div className="text-center text-white opacity-40 text-sm py-8">
            Select players to see them on the field
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerPickCard({ player, selected, disabled, onToggle }: {
  player: IPLPlayer; selected: boolean; disabled: boolean; onToggle: () => void;
}) {
  const iplTeamColor = player.iplTeam === 'RCB' ? '#C8102E' : '#004BA0';

  return (
    <div
      onClick={disabled && !selected ? undefined : onToggle}
      className="rounded-xl p-2.5 transition-all select-none relative overflow-hidden"
      style={{
        border: selected ? '2px solid var(--accent)' : '2px solid var(--border)',
        background: selected ? 'var(--accent-bg)' : 'var(--bg-surface)',
        opacity: disabled && !selected ? 0.35 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
      }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: iplTeamColor }} />
      <div className="flex items-center gap-2.5">
        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-base font-black text-white"
          style={{ background: selected ? 'var(--accent)' : iplTeamColor }}>
          {player.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <RoleBadge role={player.role} small />
            <span className="text-[10px] font-bold" style={{ color: iplTeamColor }}>{player.iplTeam}</span>
          </div>
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
          <div className="text-[11px] mt-0.5 flex gap-2" style={{ color: 'var(--text-muted)' }}>
            {(player.role !== 'bowl') && <span>{player.stats.runs}r</span>}
            {(player.role !== 'bat' && player.role !== 'wk') && player.stats.wickets > 0 && <span>{player.stats.wickets}w</span>}
            <span>SR {player.stats.sr}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs font-bold" style={{ color: 'var(--accent)' }}>₹{player.credits}Cr</div>
          {selected && <CheckCircle className="h-4 w-4 mt-1 ml-auto" style={{ color: 'var(--accent)' }} />}
        </div>
      </div>
    </div>
  );
}

function CVCCard({ player, captain, viceCaptain, onCaptain, onVC }: {
  player: IPLPlayer;
  captain: boolean; viceCaptain: boolean;
  onCaptain: () => void; onVC: () => void;
}) {
  const iplTeamColor = player.iplTeam === 'RCB' ? '#C8102E' : '#004BA0';

  return (
    <div className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-base font-black text-white"
        style={{ background: iplTeamColor }}>
        {player.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <RoleBadge role={player.role} small />
          <span className="text-[10px] font-bold" style={{ color: iplTeamColor }}>{player.iplTeam}</span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={onCaptain}
          className="w-9 h-9 rounded-full text-xs font-black transition-all"
          title="Set as Captain"
          style={{
            background: captain ? '#f59e0b' : 'var(--bg-surface-2)',
            color: captain ? '#fff' : 'var(--text-muted)',
            border: captain ? '2px solid #f59e0b' : '2px solid var(--border)',
            transform: captain ? 'scale(1.1)' : 'scale(1)',
          }}>C</button>
        <button onClick={onVC}
          className="w-9 h-9 rounded-full text-xs font-black transition-all"
          title="Set as Vice-Captain"
          style={{
            background: viceCaptain ? '#8b5cf6' : 'var(--bg-surface-2)',
            color: viceCaptain ? '#fff' : 'var(--text-muted)',
            border: viceCaptain ? '2px solid #8b5cf6' : '2px solid var(--border)',
            transform: viceCaptain ? 'scale(1.1)' : 'scale(1)',
          }}>VC</button>
      </div>
    </div>
  );
}

function SubmitView({ selectedPlayers, squad, captain, viceCaptain, constraints, roundId, teamId, onReset, canSubmit, userTeamName }: {
  selectedPlayers: IPLPlayer[];
  squad: string[];
  captain: string | null;
  viceCaptain: string | null;
  constraints: Dream11Constraints;
  roundId: string;
  teamId: string;
  onReset: () => void;
  canSubmit: boolean;
  userTeamName: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { valid, errors, warnings } = useSquadValidation(squad, captain, viceCaptain, selectedPlayers, constraints);
  const ready = valid && !!captain && !!viceCaptain && canSubmit;

  const STORAGE = STORAGE_KEY(roundId, teamId);

  useEffect(() => {
    if (localStorage.getItem(STORAGE + '_submitted') === 'true') setSubmitted(true);
  }, [STORAGE]);

  const handleSubmit = useCallback(async () => {
    if (!ready) return;

    const header = 'id,name,role,iplTeam,isCaptain,isViceCaptain';
    const rows = selectedPlayers.map(p =>
      `${p.id},${p.name},${p.role},${p.iplTeam},${captain === p.id},${viceCaptain === p.id}`
    );
    const csv = [header, ...rows].join('\n');

    const filename = `${teamId}_${roundId}.csv`;
    const repoPath = `public/data/dream11/${roundId}/squads/${filename}`;
    const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
    const owner = import.meta.env.VITE_GITHUB_OWNER as string | undefined;
    const repo  = import.meta.env.VITE_GITHUB_REPO  as string | undefined;

    if (token && owner && repo) {
      try {
        const githubApiBase = import.meta.env.VITE_GITHUB_API_URL as string;
        const apiUrl = `${githubApiBase}/repos/${owner}/${repo}/contents/${repoPath}`;
        let sha: string | undefined;
        const check = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
        if (check.ok) { const j = await check.json(); sha = j.sha; }

        const body: Record<string, unknown> = {
          message: `feat: submit squad ${filename}`,
          content: btoa(unescape(encodeURIComponent(csv))),
          branch: 'main',
        };
        if (sha) body.sha = sha;

        const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      } catch (err) {
        console.error('GitHub commit failed, downloading locally:', err);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }

    localStorage.setItem(STORAGE + '_submitted', 'true');
    localStorage.setItem(STORAGE + '_squad', JSON.stringify({ squad, captain, viceCaptain }));
    setSubmitted(true);
  }, [ready, selectedPlayers, squad, captain, viceCaptain, roundId, teamId, STORAGE]);

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: '#22c55e18', border: '2px solid #22c55e40' }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0"
            style={{ background: '#22c55e20' }}>
            <Lock className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <div className="font-bold text-green-400">Squad Locked</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Your squad is submitted. Ask admin to commit <code className="text-xs">{teamId}_{roundId}.csv</code> to <code className="text-xs">public/data/dream11/{roundId}/squads/</code>
            </div>
          </div>
        </div>

        <div className="rounded-xl pv-surface overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Your XI
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-amber-400"
                style={{ background: '#f59e0b20' }}>
                C: {selectedPlayers.find(p => p.id === captain)?.name?.split(' ').pop()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-purple-400"
                style={{ background: '#8b5cf620' }}>
                VC: {selectedPlayers.find(p => p.id === viceCaptain)?.name?.split(' ').pop()}
              </span>
            </div>
          </div>
          {(['wk','bat','ar','bowl'] as PlayerRole[]).map(role => {
            const group = selectedPlayers.filter(p => p.role === role);
            if (!group.length) return null;
            return (
              <div key={role} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: ROLE_COLOR[role], background: `${ROLE_COLOR[role]}10` }}>
                  {ROLE_FULL[role]}
                </div>
                {group.map(p => (
                  <div key={p.id} className="px-4 py-2.5 flex items-center gap-3 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: captain === p.id ? '#f59e0b' : viceCaptain === p.id ? '#8b5cf6' : (p.iplTeam === 'RCB' ? '#C8102E' : '#004BA0') }}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.iplTeam}</div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 items-center">
                      {captain === p.id && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: '#f59e0b' }}>C</span>
                      )}
                      {viceCaptain === p.id && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: '#8b5cf6' }}>VC</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>📤 Admin: how to publish this squad</div>
          <ol className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li>1. File <code className="text-amber-400">{teamId}_{roundId}.csv</code> was just downloaded</li>
            <li>2. Move it to <code className="text-amber-400">public/data/dream11/{roundId}/squads/</code></li>
            <li>3. <code>git add . && git commit -m "squad: {teamId} {roundId}" && git push</code></li>
            <li>4. GitHub Actions auto-deploys → leaderboard updates ✓</li>
          </ol>
        </div>

        <button onClick={() => {
          if (!confirm('This will clear your locked squad for this round. Are you sure?')) return;
          localStorage.removeItem(STORAGE + '_submitted');
          localStorage.removeItem(STORAGE + '_squad');
          setSubmitted(false);
          onReset();
        }}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
          style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <RotateCcw className="h-4 w-4" /> Reset squad (admin only)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!canSubmit && (
        <div className="rounded-xl p-3 space-y-1" style={{ background: '#ef444415', border: '1px solid #ef444440' }}>
          <div className="flex items-center gap-2 text-sm text-red-400">
            <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
            Only {userTeamName} can submit for this team
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <div className="rounded-xl p-3 space-y-1" style={{ background: '#ef444415', border: '1px solid #ef444440' }}>
          {errors.map((e, i) => <div key={i} className="flex items-center gap-2 text-sm text-red-400"><XCircle className="h-3.5 w-3.5 flex-shrink-0" />{e}</div>)}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-xl p-3 space-y-1" style={{ background: '#f59e0b15', border: '1px solid #f59e0b40' }}>
          {warnings.map((w, i) => <div key={i} className="flex items-center gap-2 text-sm text-amber-400"><AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{w}</div>)}
        </div>
      )}
      {ready && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-sm text-green-400"
          style={{ background: '#22c55e15', border: '1px solid #22c55e40' }}>
          <CheckCircle className="h-3.5 w-3.5" /> Squad ready to submit!
        </div>
      )}
      <button onClick={handleSubmit} disabled={!ready}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all disabled:opacity-40"
        style={{ background: ready ? 'var(--accent)' : 'var(--bg-surface)', color: ready ? '#fff' : 'var(--text-muted)', border: '2px solid var(--border)' }}>
        <Lock className="h-5 w-5" />
        Submit &amp; Lock Squad
      </button>
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Once submitted, your squad cannot be changed.
      </p>
    </div>
  );
}

type BuilderStep = 'pick' | 'cvc' | 'submit';

function SquadBuilder({ players, constraints, roundId, teamId, canSubmit, userTeamName }: {
  players: IPLPlayer[];
  constraints: Dream11Constraints;
  roundId: string;
  teamId: string;
  canSubmit: boolean;
  userTeamName: string;
}) {
  const STORAGE = STORAGE_KEY(roundId, teamId);

  const [squad, setSquad] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE + '_draft_squad') ?? '[]'); } catch { return []; }
  });
  const [captain, setCaptain] = useState<string | null>(() => localStorage.getItem(STORAGE + '_draft_cap'));
  const [viceCaptain, setVC] = useState<string | null>(() => localStorage.getItem(STORAGE + '_draft_vc'));
  const [step, setStep] = useState<BuilderStep>('pick');
  const [filterRole, setFilterRole] = useState<PlayerRole | 'all'>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'credits' | 'runs' | 'wickets'>('credits');

  useEffect(() => { localStorage.setItem(STORAGE + '_draft_squad', JSON.stringify(squad)); }, [STORAGE, squad]);
  useEffect(() => { if (captain) localStorage.setItem(STORAGE + '_draft_cap', captain); else localStorage.removeItem(STORAGE + '_draft_cap'); }, [STORAGE, captain]);
  useEffect(() => { if (viceCaptain) localStorage.setItem(STORAGE + '_draft_vc', viceCaptain); else localStorage.removeItem(STORAGE + '_draft_vc'); }, [STORAGE, viceCaptain]);

  const iplTeams = useMemo(() => [...new Set(players.map(p => p.iplTeam))], [players]);
  const teamCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of iplTeams) m[t] = squad.filter(id => players.find(p => p.id === id)?.iplTeam === t).length;
    return m;
  }, [squad, players, iplTeams]);

  const filtered = useMemo(() => {
    let list = [...players];
    if (filterRole !== 'all') list = list.filter(p => p.role === filterRole);
    if (filterTeam !== 'all') list = list.filter(p => p.iplTeam === filterTeam);
    list.sort((a, b) =>
      sortBy === 'credits' ? b.credits - a.credits :
      sortBy === 'runs' ? b.stats.runs - a.stats.runs :
      b.stats.wickets - a.stats.wickets
    );
    return list;
  }, [players, filterRole, filterTeam, sortBy]);

  const selectedPlayers = useMemo(() => players.filter(p => squad.includes(p.id)), [players, squad]);

  const toggle = (id: string) => {
    setSquad(s => {
      if (s.includes(id)) {
        if (captain === id) setCaptain(null);
        if (viceCaptain === id) setVC(null);
        return s.filter(x => x !== id);
      }
      if (s.length >= constraints.squadSize) return s;
      return [...s, id];
    });
  };

  const setCap = (id: string) => { if (viceCaptain === id) setVC(null); setCaptain(c => c === id ? null : id); };
  const setViceCap = (id: string) => { if (captain === id) setCaptain(null); setVC(v => v === id ? null : id); };
  const reset = () => { setSquad([]); setCaptain(null); setVC(null); setStep('pick'); };

  const roleGroups: { role: PlayerRole; label: string; count: number; min: number; max: number }[] = [
    { role: 'wk',   label: 'WK',   count: selectedPlayers.filter(p => p.role === 'wk').length,   min: constraints.wk.min,   max: constraints.wk.max   },
    { role: 'bat',  label: 'BAT',  count: selectedPlayers.filter(p => p.role === 'bat').length,  min: constraints.bat.min,  max: constraints.bat.max  },
    { role: 'ar',   label: 'AR',   count: selectedPlayers.filter(p => p.role === 'ar').length,   min: constraints.ar.min,   max: constraints.ar.max   },
    { role: 'bowl', label: 'BOWL', count: selectedPlayers.filter(p => p.role === 'bowl').length, min: constraints.bowl.min, max: constraints.bowl.max },
  ];

  const steps: { id: BuilderStep; label: string; num: number }[] = [
    { id: 'pick',   label: 'Pick Players', num: 1 },
    { id: 'cvc',    label: 'C & VC',       num: 2 },
    { id: 'submit', label: 'Submit',        num: 3 },
  ];
  const stepIdx = steps.findIndex(s => s.id === step);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => { if (i < stepIdx || squad.length === constraints.squadSize) setStep(s.id); }}
              className="flex flex-col items-center gap-1 flex-1 py-2 transition-opacity"
              style={{ opacity: i > stepIdx && squad.length < constraints.squadSize ? 0.4 : 1 }}>
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-colors"
                style={{
                  background: step === s.id ? 'var(--accent)' : i < stepIdx ? '#22c55e' : 'var(--bg-surface-2)',
                  color: step === s.id || i < stepIdx ? '#fff' : 'var(--text-muted)',
                }}>
                {i < stepIdx ? <CheckCircle className="h-4 w-4" /> : s.num}
              </div>
              <span className="text-[10px] font-semibold hidden sm:block"
                style={{ color: step === s.id ? 'var(--accent)' : 'var(--text-muted)' }}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="h-0.5 flex-1 mx-1" style={{ background: i < stepIdx ? '#22c55e' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {step === 'pick' && (
        <>
          <div className="rounded-xl pv-surface">
            <div className="flex divide-x" style={{ borderBottom: '1px solid var(--border)' }}>
              {roleGroups.map(g => (
                <div key={g.role} className="flex-1 flex flex-col items-center py-2 gap-0.5">
                  <div className="text-[10px] font-bold" style={{ color: ROLE_COLOR[g.role] }}>{g.label}</div>
                  <div className="text-sm font-black" style={{ color: g.count < g.min ? '#ef4444' : g.count > g.max ? '#ef4444' : 'var(--text-primary)' }}>
                    {g.count}
                  </div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{g.min}–{g.max}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {iplTeams.map(t => (
                  <span key={t}>{t}: <strong style={{ color: 'var(--text-primary)' }}>{teamCounts[t] ?? 0}</strong></span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black" style={{ color: squad.length === constraints.squadSize ? '#22c55e' : 'var(--text-primary)' }}>
                  {squad.length}/{constraints.squadSize}
                </span>
                <button onClick={reset} title="Reset"
                  className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {(['all', 'wk', 'bat', 'ar', 'bowl'] as const).map(r => (
                <button key={r} onClick={() => setFilterRole(r)}
                  className="px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: filterRole === r ? 'var(--accent)' : 'var(--bg-surface)', color: filterRole === r ? '#fff' : 'var(--text-muted)' }}>
                  {r === 'all' ? 'All' : ROLE_LABEL[r]}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {['all', ...iplTeams].map(t => (
                <button key={t} onClick={() => setFilterTeam(t)}
                  className="px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: filterTeam === t ? 'var(--accent)' : 'var(--bg-surface)', color: filterTeam === t ? '#fff' : 'var(--text-muted)' }}>
                  {t === 'all' ? 'All Teams' : t}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {(['credits', 'runs', 'wickets'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
                  style={{ background: sortBy === s ? 'var(--accent)' : 'var(--bg-surface)', color: sortBy === s ? '#fff' : 'var(--text-muted)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map(player => {
              const isSelected = squad.includes(player.id);
              const wouldExceedTeam = !isSelected && (teamCounts[player.iplTeam] ?? 0) >= constraints.maxFromOneIPLTeam;
              const wouldExceedTotal = !isSelected && squad.length >= constraints.squadSize;
              return (
                <PlayerPickCard key={player.id} player={player} selected={isSelected}
                  disabled={wouldExceedTeam || wouldExceedTotal}
                  onToggle={() => toggle(player.id)} />
              );
            })}
          </div>

          {selectedPlayers.length > 0 && (
            <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />
          )}

          <button
            onClick={() => setStep('cvc')}
            disabled={squad.length !== constraints.squadSize}
            className="w-full rounded-2xl py-3.5 text-sm font-black transition-all disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            Next: Choose C &amp; VC →
          </button>
        </>
      )}

      {step === 'cvc' && (
        <>
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#f59e0b' }}>C</span>
              Captain earns <span style={{ color: '#f59e0b' }}>2× points</span>
              <span className="mx-2 text-muted">·</span>
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#8b5cf6' }}>V</span>
              Vice-Captain earns <span style={{ color: '#8b5cf6' }}>1.5× points</span>
            </div>
          </div>

          <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />

          <div className="space-y-2">
            {(['wk','bat','ar','bowl'] as PlayerRole[]).map(role => {
              const group = selectedPlayers.filter(p => p.role === role);
              if (!group.length) return null;
              return (
                <div key={role}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ROLE_COLOR[role] }}>
                      {ROLE_FULL[role]}
                    </span>
                    <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                  </div>
                  <div className="space-y-2">
                    {group.map(p => (
                      <CVCCard key={p.id} player={p}
                        captain={captain === p.id} viceCaptain={viceCaptain === p.id}
                        onCaptain={() => setCap(p.id)} onVC={() => setViceCap(p.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('pick')}
              className="flex-1 rounded-2xl py-3 text-sm font-bold"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              ← Back
            </button>
            <button onClick={() => setStep('submit')} disabled={!captain || !viceCaptain}
              className="flex-2 rounded-2xl py-3 text-sm font-black disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#fff', flex: 2 }}>
              Preview &amp; Submit →
            </button>
          </div>
        </>
      )}

      {step === 'submit' && (
        <>
          <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />
          <SubmitView
            selectedPlayers={selectedPlayers}
            squad={squad} captain={captain} viceCaptain={viceCaptain}
            constraints={constraints} roundId={roundId} teamId={teamId}
            onReset={reset} canSubmit={canSubmit} userTeamName={userTeamName} />
          <button onClick={() => setStep('cvc')}
            className="w-full rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            ← Change C / VC
          </button>
        </>
      )}
    </div>
  );
}

function FantasyLeaderboard({ squads, players, performances, teams }: {
  squads: Dream11TeamSquad[];
  players: IPLPlayer[];
  performances: PlayerPerformance[];
  teams: { id: string; name: string; color: string; emoji: string }[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const hasResults = performances.length > 0;

  const ranked = useMemo(() => {
    return squads.map(sq => {
      let total = 0;
      const breakdown = sq.squad.map(pid => {
        const player = players.find(p => p.id === pid);
        const perf = performances.find(p => p.playerId === pid);
        const isCap = sq.captain === pid;
        const isVC = sq.viceCaptain === pid;
        const pts = perf ? calcFantasyPoints(perf, isCap, isVC) : null;
        if (pts !== null) total += pts;
        return { player, pts, isCap, isVC };
      });
      return { ...sq, total, breakdown };
    }).sort((a, b) => b.total - a.total);
  }, [squads, players, performances]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <div className="space-y-3">
      {!hasResults && (
        <div className="rounded-xl p-4 text-sm text-center"
          style={{ background: '#f59e0b15', border: '1px solid #f59e0b40', color: '#f59e0b' }}>
          <Info className="h-4 w-4 inline mr-1.5" />
          Fantasy points will appear after match scores are uploaded.
        </div>
      )}
      {ranked.map((entry, idx) => {
        const team = getTeam(entry.teamId);
        const medalBg = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7c3e' : 'var(--bg-surface-2)';
        return (
          <div key={entry.teamId} className="rounded-xl overflow-hidden pv-surface">
            <button className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
              onClick={() => setExpanded(p => p === entry.teamId ? null : entry.teamId)}>
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: medalBg, color: idx < 3 ? '#fff' : 'var(--text-muted)' }}>
                {idx + 1}
              </div>
              <div className="text-xl flex-shrink-0">{team?.emoji ?? '🏏'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{team?.name ?? entry.teamId}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>By {entry.submittedBy}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black" style={{ color: 'var(--accent)' }}>
                  {hasResults ? `${entry.total.toFixed(1)}` : '—'}
                </div>
                {hasResults && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>pts</div>}
                <div className="text-[10px] capitalize mt-0.5"
                  style={{ color: entry.status === 'submitted' || entry.status === 'locked' ? '#22c55e' : '#f59e0b' }}>
                  {entry.status}
                </div>
              </div>
              {expanded === entry.teamId
                ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
            </button>
            {expanded === entry.teamId && (
              <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                {entry.squad.length === 0
                  ? <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Squad not yet submitted.</p>
                  : (
                    <div>
                      {entry.breakdown.map(({ player, pts, isCap, isVC }) => (
                        <div key={player?.id ?? Math.random()}
                          className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                          style={{ borderColor: 'var(--border)' }}>
                          <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                            style={{ background: isCap ? '#f59e0b' : isVC ? '#8b5cf6' : (player?.iplTeam === 'RCB' ? '#C8102E' : '#004BA0') }}>
                            {player?.name.charAt(0) ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{player?.name ?? 'Unknown'}</span>
                              {isCap && <span className="text-[9px] font-black px-1 rounded text-white" style={{ background: '#f59e0b' }}>C</span>}
                              {isVC && <span className="text-[9px] font-black px-1 rounded text-white" style={{ background: '#8b5cf6' }}>VC</span>}
                            </div>
                            {player && <RoleBadge role={player.role} small />}
                          </div>
                          <span className="font-bold text-sm flex-shrink-0"
                            style={{ color: pts !== null ? 'var(--accent)' : 'var(--text-muted)' }}>
                            {pts !== null ? `${pts} pts` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScoringReference({ scoring }: { scoring: { batting: { action: string; points: number }[]; bowling: { action: string; points: number }[]; fielding: { action: string; points: number }[]; multipliers: { action: string; points: number }[] } }) {
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

function ContestRules() {
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

function PerformanceEntry({ players }: { players: IPLPlayer[] }) {
  const [sel, setSel] = useState('');
  const [perf, setPerf] = useState<Partial<PlayerPerformance>>({});
  const [entries, setEntries] = useState<PlayerPerformance[]>([]);

  const f = (key: keyof PlayerPerformance) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    setPerf(p => ({ ...p, [key]: v }));
  };

  const player = players.find(p => p.id === sel);

  const preview = useMemo(() => {
    if (!sel || !Object.keys(perf).length) return null;
    return calcFantasyPoints({ playerId: sel, ...perf }, false, false);
  }, [sel, perf]);

  const add = () => {
    if (!sel) return;
    const entry: PlayerPerformance = { playerId: sel, ...perf };
    setEntries(prev => {
      const i = prev.findIndex(e => e.playerId === sel);
      if (i >= 0) { const u = [...prev]; u[i] = entry; return u; }
      return [...prev, entry];
    });
    setPerf({}); setSel('');
  };

  const exportCsv = () => {
    const cols = ['playerId','runs','fours','sixes','isDuck','wickets','maidens','lbwBowled','catches','stumpings','runOutDirect','runOutIndirect'];
    const rows = entries.map(e => cols.map(c => (e as unknown as Record<string, unknown>)[c] ?? '').join(','));
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'scores.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const iplTeams = [...new Set(players.map(p => p.iplTeam))];

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 pv-surface space-y-3">
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>⚡ Enter Match Performances</div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Fill in stats per player → Export CSV → place in <code>public/data/dream11/[round]/scores.csv</code> → commit &amp; push.
        </p>

        <select value={sel} onChange={e => setSel(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">Select player…</option>
          {iplTeams.map(t => (
            <optgroup key={t} label={t}>
              {players.filter(p => p.iplTeam === t).map(pl => (
                <option key={pl.id} value={pl.id}>{pl.name} ({ROLE_LABEL[pl.role]})</option>
              ))}
            </optgroup>
          ))}
        </select>

        {sel && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {player && (player.role !== 'bowl') && (
              <>
                {[['Runs','runs'],['Fours','fours'],['Sixes','sixes']].map(([l,k]) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <input type="number" min={0} value={(perf as Record<string,unknown>)[k] as number ?? ''}
                      onChange={f(k as keyof PlayerPerformance)}
                      className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                      style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={perf.isDuck ?? false} onChange={f('isDuck')} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duck</span>
                </label>
              </>
            )}
            {player && (player.role === 'bowl' || player.role === 'ar') && (
              <>
                {[['Wickets','wickets'],['Maidens','maidens']].map(([l,k]) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <input type="number" min={0} value={(perf as Record<string,unknown>)[k] as number ?? ''}
                      onChange={f(k as keyof PlayerPerformance)}
                      className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                      style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={perf.lbwBowled ?? false} onChange={f('lbwBowled')} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>LBW/Bowled</span>
                </label>
              </>
            )}
            <label className="space-y-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Catches</span>
              <input type="number" min={0} value={perf.catches ?? ''}
                onChange={f('catches')}
                className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </label>
            {player?.role === 'wk' && (
              <label className="space-y-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stumpings</span>
                <input type="number" min={0} value={perf.stumpings ?? ''}
                  onChange={f('stumpings')}
                  className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                  style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </label>
            )}
          </div>
        )}

        {preview !== null && (
          <div className="rounded-lg px-3 py-2 flex items-center justify-between text-sm"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)40' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Base pts (no C/VC)</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>{preview} pts</span>
          </div>
        )}

        <button onClick={add} disabled={!sel}
          className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          Add / Update
        </button>
      </div>

      {entries.length > 0 && (
        <div className="rounded-xl pv-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Performances ({entries.length})</div>
            <button onClick={exportCsv}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              Export CSV
            </button>
          </div>
          {entries.map(e => {
            const pl = players.find(p => p.id === e.playerId);
            const pts = calcFantasyPoints(e, false, false);
            return (
              <div key={e.playerId} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {pl && <RoleBadge role={pl.role} small />}
                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{pl?.name}</span>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{pts} pts</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoundTabs({ rounds, activeId, onChange }: {
  rounds: Dream11Round[]; activeId: string; onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {rounds.map(r => {
        const isActive = r.id === activeId;
        const sc = r.match.status === 'live' ? '#22c55e' : r.match.status === 'completed' ? '#94a3b8' : '#f59e0b';
        return (
          <button key={r.id} onClick={() => onChange(r.id)}
            className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all"
            style={{
              background: isActive ? 'var(--accent)' : 'var(--bg-surface)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            }}>
            <span className="text-lg">{r.icon}</span>
            <div className="text-left">
              <div>{r.label}</div>
              <div className="text-[10px] font-semibold" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : sc }}>
                {r.match.status === 'live' ? '🔴 LIVE' : r.match.status === 'completed' ? 'Completed' : r.match.date !== 'TBD' ? r.match.date : 'Date TBD'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MatchBanner({ match }: { match: Dream11Round['match'] }) {
  const isTBD = match.team1Short === 'TBD';
  const sc = match.status === 'live' ? '#22c55e' : match.status === 'completed' ? '#94a3b8' : '#f59e0b';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-6 py-5">
        <div className="text-center flex-1">
          <div className="text-3xl font-black" style={{ color: isTBD ? 'var(--text-muted)' : match.team1Color }}>{match.team1Short}</div>
          <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>{match.team1}</div>
        </div>
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="text-sm font-black" style={{ color: 'var(--text-muted)' }}>VS</div>
          <span className="rounded-full px-3 py-1 text-[11px] font-bold"
            style={{ background: `${sc}22`, color: sc }}>
            {match.status === 'live' ? '🔴 LIVE' : match.status === 'completed' ? 'Full Time' : 'Upcoming'}
          </span>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-black" style={{ color: isTBD ? 'var(--text-muted)' : match.team2Color }}>{match.team2Short}</div>
          <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>{match.team2}</div>
        </div>
      </div>
      <div className="px-6 py-2 border-t flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span>📍 {match.venue}</span>
        <span>📅 {match.date !== 'TBD' ? `${match.date} · ${match.time}` : 'Date TBD'}</span>
        {match.deadline && <span>⏰ Deadline: {new Date(match.deadline).toLocaleString()}</span>}
      </div>
      {isTBD && (
        <div className="px-6 py-2 text-xs" style={{ background: '#f59e0b10', color: '#f59e0b', borderTop: '1px solid #f59e0b30' }}>
          Teams TBD — update <code>dream11.json</code> → this round's <code>match</code> block once confirmed.
        </div>
      )}
    </div>
  );
}

type Tab = 'builder' | 'leaderboard' | 'scoring' | 'rules' | 'scores';

export default function Dream11() {
  const { data, loading: d11Loading, error: d11Error } = useDream11();
  const { data: teamsData } = useTeams();
  const { team: userTeam } = useUser();
  const [activeRound, setActiveRound] = useState<string>('playoffs');
  const [tab, setTab] = useState<Tab>('builder');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => userTeam);

  const round = useMemo(() => data?.rounds.find(r => r.id === activeRound) ?? null, [data, activeRound]);
  const playersCsvPath = round?.playersCSV ?? `data/dream11/${activeRound}/players.csv`;
  const { data: players, loading: csvLoading, error: csvError } = useCricketPlayers(playersCsvPath);
  const scoresCsvPath = round?.scoresCSV ?? `data/dream11/${activeRound}/scores.csv`;
  const { data: performances } = useRoundScores(scoresCsvPath);

  const enrichedSquads = useMemo(() => {
    if (!round || !teamsData) return round?.playvistaTeamSquads ?? [];
    return round.playvistaTeamSquads.map(sq => {
      const team = teamsData.find(t => t.id === sq.teamId);
      return { ...sq, submittedBy: team?.captain ?? sq.submittedBy };
    });
  }, [round, teamsData]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'builder',     label: 'My Squad',    icon: <Users className="h-4 w-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
    { id: 'scoring',     label: 'Scoring',     icon: <Zap className="h-4 w-4" /> },
    { id: 'rules',       label: 'Rules',       icon: <Info className="h-4 w-4" /> },
    { id: 'scores',      label: 'Scores ⚙',   icon: <Star className="h-4 w-4" /> },
  ];

  if (d11Loading || csvLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">{[1,2,3].map(i => <Sk key={i} className="h-16 w-36 rounded-2xl" />)}</div>
        <Sk className="h-28 rounded-2xl" />
        <Sk className="h-10 rounded-xl" />
        <div className="grid gap-2 sm:grid-cols-2">{Array.from({length:8}).map((_,i) => <Sk key={i} className="h-20" />)}</div>
      </div>
    );
  }

  if (d11Error || csvError || !data || !players) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <div className="text-4xl mb-3">🏏</div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Failed to load Dream11 data</div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{d11Error ?? csvError}</div>
        </div>
      </div>
    );
  }

  const userTeamData = teamsData?.find(t => t.id === userTeam);
  const canSubmit = selectedTeamId === userTeam;

  return (
    <div className="space-y-5">
      {/* Round tabs */}
      <RoundTabs rounds={data.rounds} activeId={activeRound}
        onChange={id => { setActiveRound(id); setTab('builder'); }} />

      {/* Match banner */}
      {round && <MatchBanner match={round.match} />}

      {/* Team selector (for squad builder) */}
      {tab === 'builder' && teamsData && (
        <div className="flex gap-2 flex-wrap">
          {teamsData.map(t => {
            const isYourTeam = t.id === userTeam;
            return (
              <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
                title={!isYourTeam ? `Only ${userTeamData?.name} can submit for ${t.name}` : undefined}
                style={{
                  background: selectedTeamId === t.id ? `${t.color}22` : 'var(--bg-surface)',
                  color: selectedTeamId === t.id ? t.color : 'var(--text-secondary)',
                  border: `2px solid ${selectedTeamId === t.id ? t.color : 'var(--border)'}`,
                  opacity: !isYourTeam ? 0.6 : 1,
                }}>
                <span>{t.emoji}</span>{t.name}
                {isYourTeam && <span className="text-xs" style={{ color: t.color }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Nav tabs */}
      <div className="flex gap-1 flex-wrap rounded-xl p-1" style={{ background: 'var(--bg-surface)' }}>
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
            style={{ background: tab === id ? 'var(--accent)' : 'transparent', color: tab === id ? '#fff' : 'var(--text-muted)' }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'builder' && (
        <SquadBuilder
          players={players}
          constraints={data.constraints}
          roundId={activeRound}
          teamId={selectedTeamId}
          canSubmit={canSubmit}
          userTeamName={userTeamData?.name ?? userTeam}
        />
      )}
      {tab === 'leaderboard' && (
        <FantasyLeaderboard
          squads={enrichedSquads}
          players={players}
          performances={performances ?? []}
          teams={teamsData ?? []}
        />
      )}
      {tab === 'scoring' && <ScoringReference scoring={data.scoring} />}
      {tab === 'rules' && <ContestRules />}
      {tab === 'scores' && <PerformanceEntry players={players} />}
    </div>
  );
}
