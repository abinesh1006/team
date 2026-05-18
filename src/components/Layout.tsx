import { Outlet } from 'react-router-dom';
import { Trophy, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

function formatTeam(teamId: string) {
  return teamId.replace(/^team[-_]/i, '').replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function Layout() {
  const { theme, toggle } = useTheme();
  const user = useUser();

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md"
        style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">

          {/* Logo — left */}
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Play<span style={{ color: 'var(--accent)' }}>Vista</span>
            </span>
          </div>

          {/* Spacer pushes everything else to the right */}
          <div className="flex-1" />

          {/* User pill */}
          <div className="mr-3 hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {user.name.charAt(0)}
            </div>
            <div className="leading-none">
              <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {user.name.split(' ')[0]}
              </div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {formatTeam(user.team)}
              </div>
            </div>
          </div>

          {/* Theme toggle — before nav */}
          <button onClick={toggle}
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            {theme === 'dark'
              ? <Sun className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              : <Moon className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />}
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        PlayVista &copy; {new Date().getFullYear()} · Team Sports Manager
      </footer>
    </div>
  );
}
