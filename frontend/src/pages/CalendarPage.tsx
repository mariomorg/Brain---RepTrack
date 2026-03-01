import { useState, useEffect } from 'react';
import { inboxService } from '@features/inbox/services/inboxService';
import { CalendarEvent } from '@features/inbox/types/inbox.types';
import './CalendarPage.css';

/* ─────────────────────────── Icons ─────────────────────────── */
const ChevronLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const ChevronRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);
const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

/* ─────────────────────────── Helpers ─────────────────────────── */
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/** Returns 0=Monday … 6=Sunday for the first day of the month. */
function getFirstDayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay(); // 0=Sun … 6=Sat
    return (day + 6) % 7; // convert to Mon-based
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function formatEventTime(time: string | null): string {
    return time ?? '';
}

/* ─── Calendar export helpers ─── */

/**
 * Converts a YYYY-MM-DD + HH:MM pair to an iCal datetime string.
 * If no time is provided, returns an all-day date string (YYYYMMDD).
 */
function toIcalDate(date: string, time: string | null): string {
    const d = date.replace(/-/g, ''); // YYYYMMDD
    if (!time) return d;
    const t = time.replace(':', '') + '00'; // HHMMSS
    return `${d}T${t}`;
}

/** Generates and triggers download of a .ics file for one event. */
function downloadIcs(event: CalendarEvent): void {
    if (!event.date) return;
    const uid = `brainreptrack-${event.inboxItemId}@local`;
    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const hasTime = Boolean(event.time);
    const dtStart = hasTime
        ? `DTSTART:${toIcalDate(event.date, event.time)}`
        : `DTSTART;VALUE=DATE:${toIcalDate(event.date, null)}`;
    // Default duration: 1 hour when time is specified, all-day otherwise
    const dtEnd = hasTime
        ? (() => {
            const [h, m] = (event.time ?? '00:00').split(':').map(Number);
            const end = new Date(`${event.date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
            end.setHours(end.getHours() + 1);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `DTEND:${event.date.replace(/-/g,'')}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
        })()
        : `DTEND;VALUE=DATE:${toIcalDate(event.date, null)}`;

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BrainRepTrack//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        dtStart,
        dtEnd,
        `SUMMARY:${(event.title ?? 'Evento').replace(/\n/g, '\\n')}`,
        event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(event.title ?? 'evento').replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

/** Builds a Google Calendar "add event" URL. */
function googleCalendarUrl(event: CalendarEvent): string {
    if (!event.date) return '#';
    const hasTime = Boolean(event.time);
    const fmt = (date: string, time: string | null) =>
        hasTime ? `${date.replace(/-/g,'')}T${(time ?? '00:00').replace(':','')}00` : date.replace(/-/g,'');

    const start = fmt(event.date, event.time);
    // End = start + 1 h when timed, next day when all-day
    let end: string;
    if (hasTime) {
        const [h, m] = (event.time ?? '00:00').split(':').map(Number);
        const endDate = new Date(`${event.date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
        endDate.setHours(endDate.getHours() + 1);
        const pad = (n: number) => String(n).padStart(2,'0');
        end = `${event.date.replace(/-/g,'')}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
    } else {
        const next = new Date(event.date + 'T00:00:00');
        next.setDate(next.getDate() + 1);
        end = next.toISOString().slice(0,10).replace(/-/g,'');
    }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title ?? 'Evento',
        dates: `${start}/${end}`,
        details: event.description ?? '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ─────────────────────────── Event Detail Modal ─────────────────────────── */
function EventDetailModal({ event, onClose }: Readonly<{ event: CalendarEvent; onClose: () => void }>) {
    const dateStr = event.date
        ? new Date(event.date + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : null;

    return (
        <div className="cal-modal-backdrop" onClick={onClose}>
            <div className="cal-modal-box" onClick={e => e.stopPropagation()}>
                <div className="cal-modal-header">
                    <div className="cal-modal-title">{event.title ?? 'Evento'}</div>
                    <button className="cal-modal-close" onClick={onClose}><XIcon /></button>
                </div>
                {dateStr && (
                    <div className="cal-modal-date">
                        📅 {dateStr}
                        {event.time && <span className="cal-modal-time"><ClockIcon /> {event.time}</span>}
                    </div>
                )}
                {event.description && (
                    <div className="cal-modal-desc">{event.description}</div>
                )}

                {/* ── Export actions ── */}
                {event.date && (
                    <div className="cal-modal-export">
                        <span className="cal-modal-export-label">Añadir al calendario</span>
                        <div className="cal-modal-export-btns">
                            <a
                                className="cal-export-btn cal-export-btn--google"
                                href={googleCalendarUrl(event)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {/* Google Calendar color logo */}
                                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#4285F4" d="M22 12.5C22 6.977 17.523 2.5 12 2.5S2 6.977 2 12.5c0 4.99 3.657 9.128 8.438 9.878v-6.987H7.898V12.5h2.54V10.26c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195v2.46h-1.264c-1.24 0-1.628.772-1.628 1.563V12.5h2.773l-.443 2.891h-2.33v6.987C18.343 21.628 22 17.49 22 12.5z"/>
                                </svg>
                                Google Calendar
                            </a>
                            <button
                                className="cal-export-btn cal-export-btn--ics"
                                onClick={() => downloadIcs(event)}
                            >
                                <DownloadIcon />
                                Apple / Outlook (.ics)
                            </button>
                        </div>
                    </div>
                )}

                <div className="cal-modal-raw-label">Texto original</div>
                <div className="cal-modal-raw">{event.rawText}</div>
            </div>
        </div>
    );
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function CalendarPage() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        setLoading(true);
        inboxService.getCalendarEvents()
            .then(setEvents)
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    /* Navigation */
    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else { setMonth(m => m - 1); }
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else { setMonth(m => m + 1); }
    };

    /* Build calendar grid */
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOfMonth(year, month);
    const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
    const cells: Array<number | null> = [
        ...Array(firstDayOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ...Array(totalCells - firstDayOffset - daysInMonth).fill(null),
    ];

    /* Map events by date string */
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
        if (!ev.date) continue;
        const key = ev.date; // YYYY-MM-DD
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push(ev);
    }

    function cellDateKey(day: number): string {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    }

    const currentMonthEvents = events.filter(ev => {
        if (!ev.date) return false;
        const d = new Date(ev.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
    });

    return (
        <div className="cal-page">
            {selectedEvent && (
                <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}

            <header className="cal-header">
                <h1>Calendario</h1>
                <p>Citas y eventos detectados automáticamente en tu inbox</p>
            </header>

            <div className="cal-layout">
                {/* ── Monthly grid ── */}
                <section className="cal-grid-section">
                    <div className="cal-nav">
                        <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeftIcon /></button>
                        <span className="cal-nav-title">{MONTH_NAMES[month]} {year}</span>
                        <button className="cal-nav-btn" onClick={nextMonth}><ChevronRightIcon /></button>
                    </div>

                    <div className="cal-grid">
                        {/* Day headers */}
                        {DAY_NAMES.map(d => (
                            <div key={d} className="cal-grid-header">{d}</div>
                        ))}

                        {/* Day cells */}
                        {cells.map((day, idx) => {
                            if (day === null) {
                                return <div key={`empty-${idx}`} className="cal-cell cal-cell--empty" />;
                            }
                            const key = cellDateKey(day);
                            const cellDate = new Date(year, month, day);
                            const isToday = isSameDay(cellDate, today);
                            const cellEvents = (eventsByDate[key] ?? [])
                                .slice()
                                .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

                            return (
                                <div
                                    key={key}
                                    className={`cal-cell${isToday ? ' cal-cell--today' : ''}${cellEvents.length > 0 ? ' cal-cell--has-events' : ''}`}
                                >
                                    <span className="cal-cell-day">{day}</span>
                                    {cellEvents.slice(0, 3).map((ev, i) => (
                                        <button
                                            key={`${ev.inboxItemId}-${i}`}
                                            className="cal-event-chip"
                                            onClick={() => setSelectedEvent(ev)}
                                            title={ev.title ?? 'Evento'}
                                        >
                                            {ev.time && <span className="cal-event-chip__time">{ev.time}</span>}
                                            <span className="cal-event-chip__title">{ev.title ?? 'Evento'}</span>
                                        </button>
                                    ))}
                                    {cellEvents.length > 3 && (
                                        <span className="cal-event-more">+{cellEvents.length - 3} más</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Upcoming events sidebar ── */}
                <aside className="cal-sidebar">
                    <div className="cal-sidebar-title">
                        Eventos en {MONTH_NAMES[month]}
                        <span className="cal-sidebar-count">{currentMonthEvents.length}</span>
                    </div>

                    {loading && <div className="cal-loading">Cargando eventos…</div>}

                    {!loading && currentMonthEvents.length === 0 && (
                        <div className="cal-empty">
                            Sin eventos detectados este mes.<br />
                            <span className="cal-empty-hint">
                                Captura citas, reuniones o recordatorios en el inbox para verlas aquí.
                            </span>
                        </div>
                    )}

                    {!loading && currentMonthEvents
                        .sort((a, b) => {
                            const da = a.date ?? '9999';
                            const db = b.date ?? '9999';
                            if (da !== db) return da.localeCompare(db);
                            return (a.time ?? '').localeCompare(b.time ?? '');
                        })
                        .map(ev => (
                            <button
                                key={ev.inboxItemId}
                                className="cal-sidebar-event"
                                onClick={() => setSelectedEvent(ev)}
                            >
                                <div className="cal-sidebar-event__date">
                                    {ev.date
                                        ? new Date(ev.date + 'T00:00:00').toLocaleDateString('es-ES', {
                                              weekday: 'short', day: 'numeric', month: 'short',
                                          })
                                        : '—'}
                                    {ev.time && (
                                        <span className="cal-sidebar-event__time">
                                            <ClockIcon /> {formatEventTime(ev.time)}
                                        </span>
                                    )}
                                </div>
                                <div className="cal-sidebar-event__title">{ev.title ?? 'Evento'}</div>
                                {ev.description && (
                                    <div className="cal-sidebar-event__desc">{ev.description}</div>
                                )}
                            </button>
                        ))
                    }
                </aside>
            </div>
        </div>
    );
}
