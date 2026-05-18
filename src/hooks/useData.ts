import { useEffect, useState } from 'react';
import type { Team, ScheduleEvent, Game, Dream11Data, IPLPlayer, PlayerRole, PlayerPerformance } from '../types';

export interface QuoteSet {
  intro: string[];
  daily: { type: 'motivation' | 'scold'; text: string }[];
}

const BASE = import.meta.env.BASE_URL;

function useFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}${path}`)
      .then(r => { if (!r.ok) throw new Error(`Failed to load ${path}`); return r.json(); })
      .then((d: T) => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [path]);

  return { data, loading, error };
}

export function useTeams() {
  return useFetch<Team[]>('data/teams.json');
}

export function useSchedule() {
  return useFetch<ScheduleEvent[]>('data/schedule.json');
}

export function useGames() {
  return useFetch<Game[]>('data/games.json');
}

export function useQuotes() {
  return useFetch<QuoteSet>('data/quotes.json');
}

export function useDream11() {
  return useFetch<Dream11Data>('data/dream11.json');
}

function parseCSV(text: string): IPLPlayer[] {
  const [headerLine, ...rows] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim());

  return rows
    .filter(row => row.trim())
    .map(row => {
      // Handle values that might contain commas (quoted fields)
      const values: string[] = [];
      let cur = '';
      let inQuote = false;
      for (const ch of row) {
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { values.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      values.push(cur.trim());

      const get = (key: string) => values[headers.indexOf(key)] ?? '';

      return {
        id:              get('id'),
        name:            get('name'),
        role:            get('role') as PlayerRole,
        iplTeam:         get('iplTeam'),
        credits:         parseFloat(get('credits')),
        battingOrder:    parseInt(get('battingOrder'), 10),
        isCaptainOption: get('isCaptainOption') === 'true',
        stats: {
          runs:    parseFloat(get('runs'))    || 0,
          avg:     parseFloat(get('avg'))     || 0,
          sr:      parseFloat(get('sr'))      || 0,
          wickets: parseFloat(get('wickets')) || 0,
          economy: get('economy') ? parseFloat(get('economy')) : null,
        },
      } satisfies IPLPlayer;
    });
}

function parseScoresCSV(text: string): PlayerPerformance[] {
  const [headerLine, ...rows] = text.trim().split('\n');
  if (!headerLine) return [];
  const headers = headerLine.split(',').map(h => h.trim());

  return rows
    .filter(row => row.trim())
    .map(row => {
      const values = row.split(',').map(v => v.trim());
      const get = (key: string) => values[headers.indexOf(key)] ?? '';
      const num = (key: string) => { const v = get(key); return v === '' ? undefined : Number(v); };
      const bool = (key: string) => get(key) === 'true' ? true : get(key) === 'false' ? false : undefined;

      const perf: PlayerPerformance = { playerId: get('playerId') };
      const runs = num('runs'); if (runs !== undefined) perf.runs = runs;
      const fours = num('fours'); if (fours !== undefined) perf.fours = fours;
      const sixes = num('sixes'); if (sixes !== undefined) perf.sixes = sixes;
      const isDuck = bool('isDuck'); if (isDuck !== undefined) perf.isDuck = isDuck;
      const wickets = num('wickets'); if (wickets !== undefined) perf.wickets = wickets;
      const maidens = num('maidens'); if (maidens !== undefined) perf.maidens = maidens;
      const lbwBowled = bool('lbwBowled'); if (lbwBowled !== undefined) perf.lbwBowled = lbwBowled;
      const catches = num('catches'); if (catches !== undefined) perf.catches = catches;
      const stumpings = num('stumpings'); if (stumpings !== undefined) perf.stumpings = stumpings;
      const runOutDirect = num('runOutDirect'); if (runOutDirect !== undefined) perf.runOutDirect = runOutDirect;
      const runOutIndirect = num('runOutIndirect'); if (runOutIndirect !== undefined) perf.runOutIndirect = runOutIndirect;
      return perf;
    })
    .filter(p => p.playerId);
}

export function useRoundScores(csvPath: string) {
  const [data, setData] = useState<PlayerPerformance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setLoading(true);
    setError(null);
    fetch(`${BASE}${csvPath}`)
      .then(r => { if (!r.ok) throw new Error(`Failed to load ${csvPath}`); return r.text(); })
      .then(text => { setData(parseScoresCSV(text)); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [csvPath]);

  return { data, loading, error };
}

export function useCricketPlayers(csvPath: string) {
  const [data, setData] = useState<IPLPlayer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}${csvPath}`)
      .then(r => { if (!r.ok) throw new Error(`Failed to load ${csvPath}`); return r.text(); })
      .then(text => { setData(parseCSV(text)); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [csvPath]);

  return { data, loading, error };
}

export interface SquadCSVRow {
  id: string;
  name: string;
  role: string;
  iplTeam: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export function useAllSquadCSVs(roundId: string, teamIds: string[]) {
  const [data, setData] = useState<Record<string, SquadCSVRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roundId || teamIds.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(
      teamIds.map(teamId => {
        const path = `${BASE}data/dream11/${roundId}/squads/${teamId}_${roundId}.csv`;
        return fetch(path, { cache: 'no-store' })
          .then(r => {
            const ct = r.headers.get('content-type') ?? '';
            if (!r.ok || ct.includes('text/html')) throw new Error('not found');
            return r.text();
          })
          .then(text => {
            const [headerLine, ...rows] = text.trim().split('\n');
            const headers = headerLine.split(',').map(h => h.trim());
            const parsed = rows.filter(r => r.trim()).map(row => {
              const vals = row.split(',').map(v => v.trim());
              const get = (k: string) => vals[headers.indexOf(k)] ?? '';
              return {
                id: get('id'), name: get('name'), role: get('role'),
                iplTeam: get('iplTeam'),
                isCaptain: get('isCaptain') === 'true',
                isViceCaptain: get('isViceCaptain') === 'true',
              };
            });
            return { teamId, rows: parsed };
          })
          .catch(() => ({ teamId, rows: [] as SquadCSVRow[] }));
      })
    ).then(results => {
      const map: Record<string, SquadCSVRow[]> = {};
      for (const { teamId, rows } of results) if (rows.length > 0) map[teamId] = rows;
      setData(map);
      setLoading(false);
    });
  }, [roundId, teamIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading };
}

export function useSquadCSV(roundId: string, teamId: string) {
  const [data, setData] = useState<SquadCSVRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(null);
    setLoading(true);
    const path = `${BASE}data/dream11/${roundId}/squads/${teamId}_${roundId}.csv`;
    fetch(path, { cache: 'no-store' })
      .then(r => {
        const ct = r.headers.get('content-type') ?? '';
if (!r.ok || ct.includes('text/html')) throw new Error('not found');
        return r.text();
      })
      .then(text => {
        const [headerLine, ...rows] = text.trim().split('\n');
        const headers = headerLine.split(',').map(h => h.trim());
        const parsed = rows.filter(r => r.trim()).map(row => {
          const vals = row.split(',').map(v => v.trim());
          const get = (k: string) => vals[headers.indexOf(k)] ?? '';
          return {
            id: get('id'),
            name: get('name'),
            role: get('role'),
            iplTeam: get('iplTeam'),
            isCaptain: get('isCaptain') === 'true',
            isViceCaptain: get('isViceCaptain') === 'true',
          };
        }).filter(r => r.id !== '');
        setData(parsed);
        setLoading(false);
      })
      .catch(() => { setData(null); setLoading(false); });
  }, [roundId, teamId]);

  return { data, loading };
}

// Kept for Admin compatibility — no-op save since we're JSON-only now
export const STORAGE_KEYS = {
  teams: '',
  schedule: '',
  games: '',
} as const;
