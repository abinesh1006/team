import { useState, useEffect } from 'react';
import {
  Shield, Lock, LogOut, Users, Calendar, BookOpen,
  Plus, Trash2, Edit3, Check, X, AlertCircle,
  ChevronDown, ChevronUp, Crown, Star, Download, RefreshCw,
} from 'lucide-react';
import { useTeams, useSchedule, useGames } from '../hooks/useData';
import type { Team, Player, ScheduleEvent, Game } from '../types';

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? 'playvista-admin-2026';
const SESSION_KEY = 'pv_admin_session';

/* ── Auth ── */
function useAdminSession() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const login = (t: string) => { if (t === ADMIN_TOKEN) { sessionStorage.setItem(SESSION_KEY, 'true'); setAuthed(true); return true; } return false; };
  const logout = () => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); };
  return { authed, login, logout };
}

/* ── Login gate ── */
function LoginGate({ onLogin }: { onLogin: (t: string) => boolean }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);
  const submit = () => { if (!onLogin(token)) setError(true); };
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl p-8 space-y-6 pv-surface">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--accent-bg)' }}>
            <Lock className="h-7 w-7" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Access</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter your admin token to continue</p>
        </div>
        <div className="space-y-3">
          <input type="password" value={token}
            onChange={e => { setToken(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Admin token"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-surface-2)', border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
              color: 'var(--text-primary)',
            }}
          />
          {error && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" />Invalid token.</p>}
          <button onClick={submit}
            className="w-full rounded-xl py-3 text-sm font-bold transition-colors"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            Login
          </button>
        </div>
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Edit JSON files → download → commit → redeploy.
        </p>
      </div>
    </div>
  );
}

/* ── Inline editable cell ── */
function EditCell({ value, onSave, type = 'text', min }: {
  value: string | number; onSave: (v: string | number) => void; type?: string; min?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const commit = () => { setEditing(false); onSave(type === 'number' ? Number(draft) : draft); };
  if (editing) return (
    <div className="flex items-center gap-1">
      <input autoFocus type={type} min={min} value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-full rounded-lg px-2 py-1 text-sm outline-none"
        style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
      />
      <button onClick={commit} className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
      <button onClick={() => setEditing(false)} style={{ color: 'var(--text-muted)' }}><X className="h-4 w-4" /></button>
    </div>
  );
  return (
    <button onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="group flex w-full items-center gap-1 rounded-lg px-2 py-1 text-left text-sm hover:bg-black/5">
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
      <Edit3 className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60" style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}

/* ── Download helper ── */
function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Teams editor ── */
function TeamsEditor() {
  const { data: srcTeams } = useTeams();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (srcTeams && !teams) {
      setTeams(JSON.parse(JSON.stringify(srcTeams)));
      setExpanded(srcTeams[0]?.id ?? null);
    }
  }, [srcTeams, teams]);

  if (!teams) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;

  const update = (newTeams: Team[]) => setTeams(newTeams);

  const updatePlayer = (teamId: string, idx: number, field: keyof Player, value: string | number) =>
    update(teams.map(t => t.id !== teamId ? t : {
      ...t, players: t.players.map((p, i) => i !== idx ? p : { ...p, [field]: value }),
    }));

  const updateTeamField = (teamId: string, field: keyof Team, value: string) =>
    update(teams.map(t => t.id !== teamId ? t : { ...t, [field]: value }));

  const addPlayer = (teamId: string) =>
    update(teams.map(t => t.id !== teamId ? t : { ...t, players: [...t.players, { name: 'New Player', points: 0 }] }));

  const removePlayer = (teamId: string, idx: number) =>
    update(teams.map(t => t.id !== teamId ? t : { ...t, players: t.players.filter((_, i) => i !== idx) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Edit inline, then download to commit.</p>
        <button onClick={() => downloadJson(teams, 'teams.json')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <Download className="h-4 w-4" /> Download teams.json
        </button>
      </div>

      {teams.map(team => (
        <div key={team.id} className="rounded-2xl overflow-hidden pv-surface">
          <button onClick={() => setExpanded(e => e === team.id ? null : team.id)}
            className="flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-black/5">
            <span className="text-2xl">{team.emoji}</span>
            <div className="flex-1 text-left">
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{team.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {team.players.length} players · C: {team.captain} · VC: {team.viceCaptain}
              </div>
            </div>
            <div className="text-lg font-black" style={{ color: 'var(--accent)' }}>
              {team.players.reduce((s, p) => s + p.points, 0)} pts
            </div>
            {expanded === team.id ? <ChevronUp className="h-4 w-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />}
          </button>

          {expanded === team.id && (
            <div className="border-t px-4 pb-4 pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
              {/* Team meta */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([['name','Team Name'],['captain','Captain'],['viceCaptain','Vice Captain'],['emoji','Emoji']] as [keyof Team, string][]).map(([f, label]) => (
                  <div key={f} className="rounded-xl p-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                    <div className="mb-1 flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {f === 'captain' && <Crown className="h-3 w-3" style={{ color: 'var(--accent)' }} />}
                      {f === 'viceCaptain' && <Star className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />}
                      {label}
                    </div>
                    <EditCell value={String(team[f])} onSave={v => updateTeamField(team.id, f, String(v))} />
                  </div>
                ))}
              </div>

              {/* Players table */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider" style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th className="px-4 py-2 text-left w-8">#</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left w-28">Points</th>
                      <th className="px-4 py-2 text-left w-16">Role</th>
                      <th className="px-4 py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {team.players.map((p, i) => (
                      <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-1 text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td className="px-1 py-1"><EditCell value={p.name} onSave={v => updatePlayer(team.id, i, 'name', v)} /></td>
                        <td className="px-1 py-1"><EditCell value={p.points} type="number" min={0} onSave={v => updatePlayer(team.id, i, 'points', v)} /></td>
                        <td className="px-4 py-1 text-xs">
                          {p.name === team.captain && <span className="rounded-full px-2 py-0.5 font-bold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>C</span>}
                          {p.name === team.viceCaptain && <span className="rounded-full px-2 py-0.5 font-bold" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>VC</span>}
                        </td>
                        <td className="px-4 py-1">
                          <button onClick={() => removePlayer(team.id, i)} className="text-red-400/50 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => addPlayer(team.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm transition-colors"
                    style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <Plus className="h-4 w-4" /> Add Player
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Schedule editor ── */
const STATUS_OPTIONS: ScheduleEvent['status'][] = ['upcoming', 'ongoing', 'completed'];

function ScheduleEditor() {
  const { data: srcEvents } = useSchedule();
  const [events, setEvents] = useState<ScheduleEvent[] | null>(null);

  useEffect(() => {
    if (srcEvents && !events) setEvents(JSON.parse(JSON.stringify(srcEvents)));
  }, [srcEvents, events]);

  if (!events) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;

  const update = (id: string, field: keyof ScheduleEvent, value: string) =>
    setEvents(events.map(e => e.id !== id ? e : { ...e, [field]: value }));

  const addEvent = () => setEvents([...events, {
    id: `ev-${Date.now()}`, date: new Date().toISOString().slice(0, 10),
    time: '10:00', game: 'New Event', type: 'individual',
    description: 'Description here', venue: 'Venue', status: 'upcoming',
  }]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Edit inline, then download to commit.</p>
        <button onClick={() => downloadJson(events, 'schedule.json')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <Download className="h-4 w-4" /> Download schedule.json
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden pv-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider" style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {['Date','Time','Game','Venue','Description','Status',''].map(h => (
                  <th key={h} className="px-3 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...events].sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
                <tr key={ev.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-1 py-1 min-w-[120px]"><EditCell value={ev.date} onSave={v => update(ev.id, 'date', String(v))} /></td>
                  <td className="px-1 py-1 min-w-[72px]"><EditCell value={ev.time} onSave={v => update(ev.id, 'time', String(v))} /></td>
                  <td className="px-1 py-1 min-w-[140px]"><EditCell value={ev.game} onSave={v => update(ev.id, 'game', String(v))} /></td>
                  <td className="px-1 py-1 min-w-[110px]"><EditCell value={ev.venue} onSave={v => update(ev.id, 'venue', String(v))} /></td>
                  <td className="px-1 py-1 min-w-[180px]"><EditCell value={ev.description} onSave={v => update(ev.id, 'description', String(v))} /></td>
                  <td className="px-3 py-1">
                    <select value={ev.status} onChange={e => update(ev.id, 'status', e.target.value)}
                      className="rounded-lg px-2 py-1 text-xs outline-none"
                      style={{
                        background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                      }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1">
                    <button onClick={() => setEvents(events.filter(e => e.id !== ev.id))} className="text-red-400/50 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={addEvent}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm transition-colors"
            style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Games rules editor ── */
function GamesEditor() {
  const { data: srcGames } = useGames();
  const [games, setGames] = useState<Game[] | null>(null);

  useEffect(() => {
    if (srcGames && !games) setGames(JSON.parse(JSON.stringify(srcGames)));
  }, [srcGames, games]);

  if (!games) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;

  const updateRule = (gameId: string, idx: number, value: string) =>
    setGames(games.map(g => g.id !== gameId ? g : {
      ...g, rules: g.rules.map((r, i) => i !== idx ? r : value),
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Edit rules inline, then download to commit.</p>
        <button onClick={() => downloadJson(games, 'games.json')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <Download className="h-4 w-4" /> Download games.json
        </button>
      </div>

      {games.map(game => (
        <div key={game.id} className="rounded-2xl overflow-hidden pv-surface">
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-2xl">{game.icon}</span>
            <div>
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{game.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{game.rules.length} rules</div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {game.rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{i + 1}</span>
                <EditCell value={rule} onSave={v => updateRule(game.id, i, String(v))} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */
type Tab = 'teams' | 'schedule' | 'games';

export default function Admin() {
  const { authed, login, logout } = useAdminSession();
  const [tab, setTab] = useState<Tab>('teams');

  if (!authed) return <LoginGate onLogin={login} />;

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'teams',    label: 'Teams & Players', icon: Users    },
    { id: 'schedule', label: 'Schedule',         icon: Calendar },
    { id: 'games',    label: 'Game Rules',        icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8" style={{ color: 'var(--accent)' }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Edit data → download → commit to repo → redeploy</p>
        </div>
        <button onClick={logout}
          className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          onMouseOver={e => (e.currentTarget.style.color = '#f87171')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <LogOut className="h-4 w-4" />Logout
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl p-4 text-sm pv-surface" style={{ borderLeft: '4px solid var(--accent)' }}>
        <RefreshCw className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
        <div style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>How to update:</strong> Edit below →
          click <strong>Download</strong> → replace the file in <code style={{ color: 'var(--accent)' }}>public/data/</code> →
          push to GitHub → site redeploys automatically.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl p-1 pv-surface w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={tab === t.id
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--text-secondary)' }}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'teams'    && <TeamsEditor />}
      {tab === 'schedule' && <ScheduleEditor />}
      {tab === 'games'    && <GamesEditor />}
    </div>
  );
}
