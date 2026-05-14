import { useEffect, useState } from 'react';
import type { Team, ScheduleEvent, Game } from '../types';

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

// Kept for Admin compatibility — no-op save since we're JSON-only now
export const STORAGE_KEYS = {
  teams: '',
  schedule: '',
  games: '',
} as const;
