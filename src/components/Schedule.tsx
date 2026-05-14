import { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, Loader2, Circle, Filter } from 'lucide-react';
import { useSchedule } from '../hooks/useData';
import { useInView } from '../hooks/useInView';
import Spinner from './Spinner';
import type { ScheduleEvent } from '../types';

const GAME_ICONS: Record<string, string> = {
  Running: '🏃', Badminton: '🏸', Chess: '♟️', Carrom: '🎯',
  'Dream11': '🏏', 'Grand Finale': '🏆',
};
function gameIcon(name: string) {
  return Object.entries(GAME_ICONS).find(([k]) => name.includes(k))?.[1] ?? '🎮';
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  individual: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.30)' },
  team:       { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', border: 'rgba(34,197,94,0.30)'  },
  ceremony:   { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.30)' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    fullDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
  };
}

function groupByMonth(events: ScheduleEvent[]) {
  const map = new Map<string, ScheduleEvent[]>();
  for (const ev of events) {
    const key = ev.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  return map;
}

/* ── Progress bar across all events ── */
function ProgressBar({ total, done }: { total: number; done: number }) {
  const { ref, inView } = useInView();
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div ref={ref} className="rounded-2xl p-5 pv-surface">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tournament Progress</span>
        <span className="text-sm font-black text-amber-400">{done}/{total} events</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 relative overflow-hidden"
          style={{ width: inView ? `${pct}%` : '0%', transitionDelay: '200ms' }}>
          <div className="absolute inset-0 animate-shimmer-bar" />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>Started</span>
        <span className="font-bold" style={{ color: pct === 100 ? '#4ade80' : '#fbbf24' }}>
          {pct === 100 ? '🏆 Complete!' : `${Math.round(pct)}% done`}
        </span>
        <span>Finish</span>
      </div>
    </div>
  );
}

/* ── Single event card ── */
function EventCard({ ev, isToday, idx }: { ev: ScheduleEvent; isToday: boolean; idx: number }) {
  const { ref, inView } = useInView();
  const { dayName, day, month } = formatDate(ev.date);
  const icon = gameIcon(ev.game);
  const typeSt = TYPE_STYLES[ev.type] ?? TYPE_STYLES.individual;
  const isDone = ev.status === 'completed';
  const isLive = ev.status === 'ongoing';

  return (
    <div ref={ref} className="relative" style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : 'translateX(-16px)',
      transition: `opacity 0.45s ease ${Math.min(idx * 40, 400)}ms, transform 0.45s ease ${Math.min(idx * 40, 400)}ms`,
    }}>

      {/* Timeline dot */}
      <div className="absolute -left-[1.4rem] top-5 flex h-6 w-6 items-center justify-center rounded-full z-10"
        style={{ background: 'var(--dot-bg)', border: '1px solid var(--border)' }}>
        {isDone
          ? <CheckCircle2 className="h-4 w-4 text-green-400" />
          : isLive
          ? <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          : <Circle className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Card */}
      <div className={`rounded-2xl p-4 sm:p-5 transition-all ${isDone ? '' : 'hover:shadow-lg'}`}
        style={{
          background: isDone
            ? 'var(--completed-bg)'
            : isToday
            ? 'rgba(245,158,11,0.08)'
            : 'var(--bg-surface)',
          border: isDone
            ? '1px solid var(--completed-border)'
            : isToday
            ? '1px solid rgba(245,158,11,0.35)'
            : isLive
            ? '1px solid rgba(245,158,11,0.40)'
            : '1px solid var(--border)',
        }}>

        {/* Completed banner */}
        {isDone && (
          <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Event Completed</span>
            <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(ev.date).fullDate}</span>
          </div>
        )}

        {/* Live banner */}
        {isLive && (
          <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-1.5 bg-amber-400/10 border border-amber-400/30">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Live Now</span>
          </div>
        )}

        <div className="flex flex-wrap items-start gap-3 justify-between">
          {/* Left: icon + info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${isDone ? 'opacity-60' : ''}`}
              style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className={`font-bold text-sm sm:text-base ${isDone ? 'line-through opacity-60' : ''}`}
                  style={{ color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {ev.game}
                </h3>
                {isToday && !isDone && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-black animate-pulse">TODAY</span>
                )}
                <span className="rounded-full border px-2 py-0.5 text-xs font-medium capitalize"
                  style={{ background: typeSt.bg, color: typeSt.text, borderColor: typeSt.border }}>
                  {ev.type}
                </span>
                {isDone && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/25">
                    ✓ Done
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', opacity: isDone ? 0.7 : 1 }}>
                {ev.description}
              </p>
            </div>
          </div>

          {/* Right: date badge */}
          <div className={`shrink-0 rounded-xl px-4 py-2 text-center min-w-[64px] ${isDone ? 'opacity-50' : ''}`}
            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{dayName}</div>
            <div className="text-2xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>{day}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{month}</div>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-3 flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />{ev.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />{ev.venue}
          </span>
          <span className={`ml-auto font-semibold capitalize ${
            isDone ? 'text-green-400' : isLive ? 'text-amber-400' : ''
          }`} style={{ color: !isDone && !isLive ? 'var(--text-muted)' : undefined }}>
            {ev.status}
          </span>
        </div>
      </div>
    </div>
  );
}

type Filter = 'all' | 'upcoming' | 'completed' | 'ongoing';

export default function Schedule() {
  const { data: events, loading } = useSchedule();
  const [filter, setFilter] = useState<Filter>('all');

  const sorted = useMemo(() =>
    events ? [...events].sort((a, b) => a.date.localeCompare(b.date)) : [],
  [events]);

  const filtered = useMemo(() =>
    filter === 'all' ? sorted : sorted.filter(e => e.status === filter),
  [sorted, filter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => ({
    total:     sorted.length,
    done:      sorted.filter(e => e.status === 'completed').length,
    upcoming:  sorted.filter(e => e.status === 'upcoming').length,
    ongoing:   sorted.filter(e => e.status === 'ongoing').length,
  }), [sorted]);

  if (loading) return <Spinner />;

  const FILTERS: { key: Filter; label: string; count: number; color: string }[] = [
    { key: 'all',       label: 'All',       count: stats.total,    color: 'var(--text-primary)' },
    { key: 'upcoming',  label: 'Upcoming',  count: stats.upcoming, color: '#fbbf24' },
    { key: 'ongoing',   label: 'Live',      count: stats.ongoing,  color: '#f97316' },
    { key: 'completed', label: 'Completed', count: stats.done,     color: '#4ade80' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Event Schedule</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Timeline of all sports events</p>
        </div>
      </div>

      {/* Progress + stats */}
      <ProgressBar total={stats.total} done={stats.done} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     val: stats.total,    color: 'var(--text-primary)' },
          { label: 'Completed', val: stats.done,      color: '#4ade80' },
          { label: 'Upcoming',  val: stats.upcoming,  color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center pv-surface">
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-2xl p-1 pv-surface w-fit">
        <Filter className="h-4 w-4 ml-2 shrink-0" style={{ color: 'var(--text-muted)' }} />
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all"
            style={{
              background: filter === f.key ? f.color + '20' : 'transparent',
              color: filter === f.key ? f.color : 'var(--text-secondary)',
              border: filter === f.key ? `1px solid ${f.color}40` : '1px solid transparent',
            }}>
            {f.label}
            <span className="rounded-full px-1.5 text-xs font-black"
              style={{ background: filter === f.key ? f.color + '30' : 'var(--bg-surface)', color: filter === f.key ? f.color : 'var(--text-muted)' }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline grouped by month */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center pv-surface">
          <div className="text-4xl mb-3">📭</div>
          <div className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No events in this filter</div>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([monthKey, monthEvents]) => {
          const monthLabel = new Date(monthKey + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
          const monthDone = monthEvents.filter(e => e.status === 'completed').length;
          return (
            <div key={monthKey}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {monthLabel}
                </h2>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {monthDone}/{monthEvents.length} done
                </span>
              </div>

              {/* Timeline */}
              <div className="relative space-y-4 pl-8"
                style={{
                  borderLeft: 'none',
                }}>
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-px" style={{ background: 'var(--timeline-line)' }} />

                {monthEvents.map((ev, idx) => (
                  <EventCard key={ev.id} ev={ev} isToday={ev.date === today} idx={idx} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
