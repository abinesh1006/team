import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Trophy, Menu, X, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { to: '/admin', label: 'Admin', icon: Shield },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const navActive = '';
  const navIdle   = theme === 'dark'
    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
    : 'text-slate-500 hover:bg-black/5 hover:text-slate-900';

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

          {/* Theme toggle — before nav */}
          <button onClick={toggle}
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            {theme === 'dark'
              ? <Sun className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              : <Moon className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />}
          </button>

          {/* Desktop nav — right side */}
          <nav className="hidden gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? navActive : navIdle}`
                }
                style={({ isActive }) => isActive
                  ? { background: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' }
                  : undefined
                }>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu — rightmost */}
          <button className="ml-2 rounded-lg p-2 md:hidden"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setOpen(o => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <nav className="border-t px-4 pb-4 pt-2 md:hidden"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--nav-bg)' }}>
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? navActive : navIdle}`
                }>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </nav>
        )}
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
