import { useCallback, useState } from 'react';
import { Lock, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSquadValidation } from './useSquadValidation';
import { STORAGE_KEY, ROLE_COLOR, ROLE_FULL } from './constants';
import type { IPLPlayer, Dream11Constraints, PlayerRole } from '../../types';

export function SubmitView({
  selectedPlayers,
  squad,
  captain,
  viceCaptain,
  constraints,
  roundId,
  teamId,
  canEdit,
  onReset,
}: {
  selectedPlayers: IPLPlayer[];
  squad: string[];
  captain: string | null;
  viceCaptain: string | null;
  constraints: Dream11Constraints;
  roundId: string;
  teamId: string;
  canEdit: boolean;
  onReset: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { valid, errors, warnings } = useSquadValidation(squad, captain, viceCaptain, selectedPlayers, constraints);
  const ready = valid && !!captain && !!viceCaptain;
  const STORAGE = STORAGE_KEY(roundId, teamId);

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
    const repo = import.meta.env.VITE_GITHUB_REPO as string | undefined;

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

        {canEdit && (
          <button onClick={() => {
            if (!confirm('This will clear your locked squad for this round. Are you sure?')) return;
            setSubmitted(false);
            onReset();
          }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
            style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <RotateCcw className="h-4 w-4" /> Reset squad (admin only)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
      {canEdit ? (
        <>
          <button onClick={handleSubmit} disabled={!ready}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all disabled:opacity-40"
            style={{ background: ready ? 'var(--accent)' : 'var(--bg-surface)', color: ready ? '#fff' : 'var(--text-muted)', border: '2px solid var(--border)' }}>
            <Lock className="h-5 w-5" />
            Submit &amp; Lock Squad
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Once submitted, your squad cannot be changed.
          </p>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
          style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <Lock className="h-4 w-4" /> Only captain / vice-captain can submit
        </div>
      )}
    </div>
  );
}
