import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Dream11Game from './games/Dream11';
import BadmintonGame from './games/Badminton';
import ChessGame from './games/Chess';
import CarromGame from './games/Carrom';
import RunningGame from './games/Running';

const GAMES = [
  { id: 'dream11', name: 'Dream11', icon: '🏏', color: '#fb7185', desc: 'IPL Fantasy', component: Dream11Game },
  { id: 'badminton', name: 'Badminton', icon: '🏸', color: '#22c55e', desc: 'Singles & Doubles', component: BadmintonGame },
  { id: 'chess', name: 'Chess', icon: '♟️', color: '#a78bfa', desc: 'Swiss Rapid', component: ChessGame },
  { id: 'carrom', name: 'Carrom', icon: '🎯', color: '#38bdf8', desc: 'Doubles', component: CarromGame },
  { id: 'running', name: 'Running', icon: '🏃', color: '#f97316', desc: 'Sprint & Relay', component: RunningGame },
];

export default function HomePage() {
  const [expandedGame, setExpandedGame] = useState<string>('dream11');

  return (
    <div className="space-y-4">
      {GAMES.map((game) => {
        const isExpanded = expandedGame === game.id;
        const Component = game.component;

        return (
          <div key={game.id}>
            {/* Game card header */}
            <button
              onClick={() => setExpandedGame(isExpanded ? '' : game.id)}
              className="w-full rounded-xl p-4 transition-all hover:shadow-lg"
              style={{
                background: isExpanded ? `${game.color}15` : 'var(--bg-surface)',
                border: isExpanded ? `2px solid ${game.color}` : '1px solid var(--border)',
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {game.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {game.desc}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" style={{ color: game.color }} />
                ) : (
                  <ChevronDown className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
            </button>

            {/* Game content */}
            {isExpanded && (
              <div className="mt-2 rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <Component />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
