import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { GroundView } from './GroundView';
import { PlayerPickRow } from './PlayerPickCard';
import { CVCCard } from './CVCCard';
import { SubmitView } from './SubmitView';
import { ROLE_COLOR, ROLE_LABEL } from './constants';
import { useSquadCSV } from '../../hooks/useData';
import type { IPLPlayer, Dream11Constraints, PlayerRole } from '../../types';

const D11_GREEN = '#1a9e5c';

const IPL_TEAM_COLORS: Record<string, string> = {
  RCB: '#C8102E', MI: '#004BA0', CSK: '#F9CD05', KKR: '#3A225D',
  DC: '#0078BC', SRH: '#FF822A', PBKS: '#ED1B24', RR: '#FF69B4',
  GT: '#1C1C5B', LSG: '#A4262C',
};

export function SquadBuilder({ players, constraints, roundId, teamId, canEdit }: {
  players: IPLPlayer[];
  constraints: Dream11Constraints;
  roundId: string;
  teamId: string;
  canEdit: boolean | undefined;
}) {
  const [squad, setSquad] = useState<string[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setVC] = useState<string | null>(null);
  const [step, setStep] = useState<'pick' | 'cvc' | 'submit'>('pick');
  const [filterRole, setFilterRole] = useState<PlayerRole | 'all'>('all');
  const [sortBy, setSortBy] = useState<'credits' | 'runs' | 'wickets'>('credits');

  /* ── fetch submitted squad CSV (if it exists) ── */
  const { data: csvSquad, loading: csvLoading } = useSquadCSV(roundId, teamId);
  const isLockedByFile = !csvLoading && csvSquad !== null && csvSquad.filter(r => r.id.trim() !== '').length >= 11;

  /* reset state when round/team changes */
  useEffect(() => {
    setSquad([]);
    setCaptain(null);
    setVC(null);
    setStep('pick');
  }, [roundId, teamId]);

  /* populate state from CSV once loaded */
  useEffect(() => {
    if (!csvSquad || csvSquad.filter(r => r.id.trim() !== '').length < 11) return;
    setSquad(csvSquad.map(r => r.id));
    setCaptain(csvSquad.find(r => r.isCaptain)?.id ?? null);
    setVC(csvSquad.find(r => r.isViceCaptain)?.id ?? null);
    setStep('submit');
  }, [csvSquad]);

  const iplTeams = useMemo(() => [...new Set(players.map(p => p.iplTeam))], [players]);
  const teamA = iplTeams[0] ?? '';
  const teamB = iplTeams[1] ?? '';

  const teamCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of iplTeams) m[t] = squad.filter(id => players.find(p => p.id === id)?.iplTeam === t).length;
    return m;
  }, [squad, players, iplTeams]);

  const selectedPlayers = useMemo(() => players.filter(p => squad.includes(p.id)), [players, squad]);

  const roleGroups: { role: PlayerRole; label: string; count: number; min: number; max: number }[] = [
    { role: 'wk',   label: 'WK',   count: selectedPlayers.filter(p => p.role === 'wk').length,   min: constraints.wk.min,   max: constraints.wk.max },
    { role: 'bat',  label: 'BAT',  count: selectedPlayers.filter(p => p.role === 'bat').length,  min: constraints.bat.min,  max: constraints.bat.max },
    { role: 'ar',   label: 'AR',   count: selectedPlayers.filter(p => p.role === 'ar').length,   min: constraints.ar.min,   max: constraints.ar.max },
    { role: 'bowl', label: 'BOWL', count: selectedPlayers.filter(p => p.role === 'bowl').length, min: constraints.bowl.min, max: constraints.bowl.max },
  ];

  const toggle = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    setSquad(s => {
      if (s.includes(id)) {
        if (captain === id) setCaptain(null);
        if (viceCaptain === id) setVC(null);
        return s.filter(x => x !== id);
      }
      if (s.length >= constraints.squadSize) return s;
      const roleMax = constraints[player.role].max;
      const roleCount = s.filter(x => players.find(p => p.id === x)?.role === player.role).length;
      if (roleCount >= roleMax) return s;
      const teamCount = s.filter(x => players.find(p => p.id === x)?.iplTeam === player.iplTeam).length;
      if (teamCount >= constraints.maxFromOneIPLTeam) return s;
      return [...s, id];
    });
  };
  const setCap = (id: string) => { if (viceCaptain === id) setVC(null); setCaptain(c => c === id ? null : id); };
  const setViceCap = (id: string) => { if (captain === id) setCaptain(null); setVC(v => v === id ? null : id); };
  const reset = () => { setSquad([]); setCaptain(null); setVC(null); setStep('pick'); };

  const full = squad.length === constraints.squadSize;
  const canSubmit = captain && viceCaptain;

  /* ── players split by role for the side-by-side view ── */
  const ROLES: PlayerRole[] = ['wk', 'bat', 'ar', 'bowl'];
  const byRole = useMemo(() => {
    let list = [...players];
    if (filterRole !== 'all') list = list.filter(p => p.role === filterRole);
    list.sort((a, b) =>
      sortBy === 'credits' ? b.credits - a.credits :
      sortBy === 'runs' ? b.stats.runs - a.stats.runs :
      b.stats.wickets - a.stats.wickets
    );
    const result: Record<PlayerRole, { a: IPLPlayer[]; b: IPLPlayer[] }> = {
      wk: { a: [], b: [] }, bat: { a: [], b: [] }, ar: { a: [], b: [] }, bowl: { a: [], b: [] },
    };
    for (const p of list) {
      if (p.iplTeam === teamA) result[p.role].a.push(p);
      else if (p.iplTeam === teamB) result[p.role].b.push(p);
    }
    return result;
  }, [players, filterRole, sortBy, teamA, teamB]);

  /* visible roles for the centre pitch labels */
  const activeRoles = ROLES.filter(r => filterRole === 'all' || filterRole === r);

/* ── wait for CSV check and permissions before rendering anything ── */
  if (csvLoading || canEdit === undefined) return (
    <div className="flex items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
      <div className="text-sm">Loading squad...</div>
    </div>
  );

  /* ── LOCKED BY SUBMITTED FILE — just show the pitch ── */
  if (isLockedByFile) return (
    <div className="space-y-3">
      <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />
    </div>
  );

  /* ── READ-ONLY (not captain/vc) ── */
  if (!canEdit) return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)' }}>
        <span className="text-xl">🔒</span>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>View only</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Only the captain or vice-captain of this team can edit the squad.
          </div>
        </div>
      </div>
      <SubmitView
        selectedPlayers={selectedPlayers}
        squad={squad} captain={captain} viceCaptain={viceCaptain}
        constraints={constraints} roundId={roundId} teamId={teamId}
        canEdit={false} onReset={reset} />
    </div>
  );

  /* ── STEP: PICK ── */
  if (step === 'pick') return (
    <div className="space-y-3">

      {/* ── sticky header: role counters + count ── */}
      <div className="sticky top-0 z-10 rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-4 divide-x divide-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
          {roleGroups.map(g => {
            const over = g.count > g.max;
            const ok = g.count >= g.min && !over;
            return (
              <button key={g.role}
                onClick={() => setFilterRole(f => f === g.role ? 'all' : g.role)}
                className="flex flex-col items-center py-2 gap-0.5 transition-colors"
                style={{ background: filterRole === g.role ? `${ROLE_COLOR[g.role]}18` : 'transparent' }}>
                <div className="text-[10px] font-black uppercase" style={{ color: ROLE_COLOR[g.role] }}>{g.label}</div>
                <div className="text-base font-black leading-none"
                  style={{ color: over ? '#ef4444' : ok ? D11_GREEN : 'var(--text-primary)' }}>
                  {g.count}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{g.min}–{g.max}</div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {iplTeams.map(t => (
              <span key={t}>{t}: <strong style={{ color: 'var(--text-primary)' }}>{teamCounts[t] ?? 0}</strong></span>
            ))}
            <span style={{ color: 'var(--text-muted)' }}>· max {constraints.maxFromOneIPLTeam}/team</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black" style={{ color: full ? D11_GREEN : 'var(--text-primary)' }}>
              {squad.length}/{constraints.squadSize}
            </span>
            <button onClick={reset} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── filters ── */}
      <div className="flex flex-wrap gap-2">
        {/* role filter */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['all', 'wk', 'bat', 'ar', 'bowl'] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3 py-1.5 text-[11px] font-black transition-colors"
              style={{ background: filterRole === r ? D11_GREEN : 'transparent', color: filterRole === r ? '#fff' : 'var(--text-muted)' }}>
              {r === 'all' ? 'All' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>

        {/* sort */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['credits', 'runs', 'wickets'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className="px-3 py-1.5 text-[11px] font-black capitalize transition-colors"
              style={{ background: sortBy === s ? D11_GREEN : 'transparent', color: sortBy === s ? '#fff' : 'var(--text-muted)' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-column layout: Team A | Pitch | Team B ── */}
      <div className="grid gap-2 items-stretch" style={{ gridTemplateColumns: '1fr 600px 1fr' }}>

        {/* Team A column */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* header */}
          <div className="rounded-xl py-2 px-3 flex items-center justify-between"
            style={{ background: `${IPL_TEAM_COLORS[teamA] ?? '#666'}18`, border: `1.5px solid ${IPL_TEAM_COLORS[teamA] ?? '#666'}55` }}>
            <span className="text-xs font-black" style={{ color: IPL_TEAM_COLORS[teamA] ?? '#666' }}>{teamA}</span>
            <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5"
              style={{ background: `${IPL_TEAM_COLORS[teamA] ?? '#666'}22`, color: IPL_TEAM_COLORS[teamA] ?? '#666' }}>
              {teamCounts[teamA] ?? 0}/{constraints.maxFromOneIPLTeam}
            </span>
          </div>
          {/* players */}
          <div className="flex flex-col gap-0.5">
            {activeRoles.flatMap(role => byRole[role].a).map(pa => (
              <PlayerPickRow key={pa.id} player={pa}
                selected={squad.includes(pa.id)}
                disabled={!squad.includes(pa.id) && (
                  squad.length >= constraints.squadSize ||
                  (teamCounts[pa.iplTeam] ?? 0) >= constraints.maxFromOneIPLTeam ||
                  selectedPlayers.filter(p => p.role === pa.role).length >= constraints[pa.role].max
                )}
                onToggle={() => toggle(pa.id)}
                align="left" />
            ))}
          </div>
        </div>

        {/* Centre: Cricket Pitch — fills full column height */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} compact />
        </div>

        {/* Team B column */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* header */}
          <div className="rounded-xl py-2 px-3 flex items-center justify-between"
            style={{ background: `${IPL_TEAM_COLORS[teamB] ?? '#666'}18`, border: `1.5px solid ${IPL_TEAM_COLORS[teamB] ?? '#666'}55` }}>
            <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5"
              style={{ background: `${IPL_TEAM_COLORS[teamB] ?? '#666'}22`, color: IPL_TEAM_COLORS[teamB] ?? '#666' }}>
              {teamCounts[teamB] ?? 0}/{constraints.maxFromOneIPLTeam}
            </span>
            <span className="text-xs font-black" style={{ color: IPL_TEAM_COLORS[teamB] ?? '#666' }}>{teamB}</span>
          </div>
          {/* players */}
          <div className="flex flex-col gap-0.5">
            {activeRoles.flatMap(role => byRole[role].b).map(pb => (
              <PlayerPickRow key={pb.id} player={pb}
                selected={squad.includes(pb.id)}
                disabled={!squad.includes(pb.id) && (
                  squad.length >= constraints.squadSize ||
                  (teamCounts[pb.iplTeam] ?? 0) >= constraints.maxFromOneIPLTeam ||
                  selectedPlayers.filter(p => p.role === pb.role).length >= constraints[pb.role].max
                )}
                onToggle={() => toggle(pb.id)}
                align="right" />
            ))}
          </div>
        </div>

      </div>

      {/* CTA */}
      <button
        onClick={() => setStep('cvc')}
        disabled={!full}
        className="w-full rounded-2xl py-4 text-sm font-black tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: full ? D11_GREEN : 'var(--bg-surface-2)', color: '#fff' }}>
        {full ? 'Next: Choose C & VC →' : `Pick ${constraints.squadSize - squad.length} more player${constraints.squadSize - squad.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );

  /* ── STEP: C & VC ── */
  if (step === 'cvc') return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-2xl px-4 py-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: '#f59e0b' }}>C</span>
          <span style={{ color: 'var(--text-secondary)' }}>= <strong style={{ color: '#f59e0b' }}>2×</strong> points</span>
        </div>
        <div className="h-4 w-px" style={{ background: 'var(--border)' }} />
        <div className="flex items-center gap-1.5 text-sm">
          <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: '#8b5cf6' }}>VC</span>
          <span style={{ color: 'var(--text-secondary)' }}>= <strong style={{ color: '#8b5cf6' }}>1.5×</strong> points</span>
        </div>
      </div>

      <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />

      <div className="space-y-2">
        {(['wk','bat','ar','bowl'] as PlayerRole[]).map(role => {
          const group = selectedPlayers.filter(p => p.role === role);
          if (!group.length) return null;
          return (
            <div key={role}>
              <div className="flex items-center gap-2 my-2">
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                <span className="text-[10px] font-black uppercase tracking-widest px-2"
                  style={{ color: ROLE_COLOR[role] }}>
                  {role === 'wk' ? 'Wicket Keepers' : role === 'bat' ? 'Batters' : role === 'ar' ? 'All-Rounders' : 'Bowlers'}
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
          className="flex-1 rounded-2xl py-3.5 text-sm font-bold"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          ← Back
        </button>
        <button onClick={() => setStep('submit')} disabled={!canSubmit}
          className="rounded-2xl py-3.5 text-sm font-black disabled:opacity-40 transition-all"
          style={{ flex: 2, background: canSubmit ? D11_GREEN : 'var(--bg-surface-2)', color: '#fff' }}>
          Preview & Submit →
        </button>
      </div>
    </div>
  );

  /* ── STEP: SUBMIT ── */
  return (
    <div className="space-y-3">
      <GroundView selectedPlayers={selectedPlayers} captain={captain} viceCaptain={viceCaptain} />
      <SubmitView
        selectedPlayers={selectedPlayers}
        squad={squad} captain={captain} viceCaptain={viceCaptain}
        constraints={constraints} roundId={roundId} teamId={teamId}
        canEdit={canEdit} onReset={reset} />
      <button onClick={() => setStep('cvc')}
        className="w-full rounded-xl py-2.5 text-sm font-semibold"
        style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
        ← Change C / VC
      </button>
    </div>
  );
}
