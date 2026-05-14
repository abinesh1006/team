import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, CheckCircle, Zap } from 'lucide-react';
import { useGames } from '../hooks/useData';
import Spinner from './Spinner';
import type { Game } from '../types';

function PointsTable({ game }: { game: Game }) {
  const sections = Object.entries(game.pointsSystem);
  return (
    <div className="space-y-4">
      {sections.map(([key, entries]) => (
        <div key={key}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 capitalize">
            {key === 'fantasy' ? 'Fantasy Points' : key === 'relay' ? 'Relay Points' : 'Points System'}
          </h4>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-2 text-left text-xs text-slate-500">
                    {key === 'fantasy' ? 'Action' : 'Position'}
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500">Points</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-4 py-2 text-slate-300">
                      {row.action ?? row.position}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-amber-400">
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function GameDetail({ game, onBack }: { game: Game; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to all games
      </button>

      {/* Game header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
            {game.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{game.name}</h2>
            <p className="text-slate-400 italic">{game.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2">
            <div className="text-xs text-slate-500">Format</div>
            <div className="text-sm font-medium">{game.format}</div>
          </div>
          {game.events.map(ev => (
            <div key={ev} className="rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-2">
              <div className="text-xs text-amber-400/70">Event</div>
              <div className="text-sm font-medium text-amber-300">{ev}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Points + Rules in two columns on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Points */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold">Points Breakdown</h3>
          </div>
          <PointsTable game={game} />
        </div>

        {/* Rules */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold">Rules & Regulations</h3>
          </div>
          <ol className="space-y-3">
            {game.rules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-xs font-bold text-amber-400">
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function Rules() {
  const { data: games, loading } = useGames();
  const [selected, setSelected] = useState<Game | null>(null);
  const { gameId } = useParams<{ gameId?: string }>();
  const navigate = useNavigate();

  // Auto-open game from URL param
  useEffect(() => {
    if (!games || !gameId) return;
    const found = games.find(g => g.id === gameId);
    if (found) setSelected(found);
  }, [games, gameId]);

  if (loading) return <Spinner />;

  if (selected) {
    return <GameDetail game={selected} onBack={() => { setSelected(null); navigate('/rules'); }} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold">Game Rules</h1>
          <p className="text-sm text-slate-400">Official rules and scoring for each sport</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games?.map(game => (
          <button
            key={game.id}
            onClick={() => setSelected(game)}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-amber-400/30 hover:bg-white/10"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl transition-transform group-hover:scale-110">
                {game.icon}
              </div>
              <div>
                <h3 className="font-bold">{game.name}</h3>
                <p className="text-xs text-slate-500">{game.format}</p>
              </div>
            </div>
            <p className="mb-4 text-sm italic text-slate-400">"{game.tagline}"</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {game.events.map(ev => (
                <span
                  key={ev}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300"
                >
                  {ev}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              {game.rules.length} rules · view details →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
