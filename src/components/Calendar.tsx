'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Availability, type Booking } from '@/lib/supabase';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function Calendar() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selStart, setSelStart] = useState<number | null>(null);
  const [selEnd, setSelEnd] = useState<number | null>(null);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  };

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d < today;
  };

  // Fetch availability + bookings for selected date
  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSelStart(null);
    setSelEnd(null);
    try {
      const spaceRes = await supabase
        .from('spaces')
        .select('id')
        .eq('slug', process.env.NEXT_PUBLIC_SPACE_SLUG ?? 'basketball-court')
        .single();

      if (!spaceRes.data) return;
      const spaceId = spaceRes.data.id;

      const [availRes, bookRes] = await Promise.all([
        supabase.from('availability').select('*').eq('space_id', spaceId).eq('date', date),
        supabase.from('bookings').select('*').eq('space_id', spaceId).eq('date', date).neq('status', 'cancelled'),
      ]);

      setAvailability(availRes.data ?? []);
      setBookings(bookRes.data ?? []);
    } catch (e) {
      console.error('Failed to fetch slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // Hour helpers
  const isBooked = (hour: number) =>
    bookings.some((b) => hour >= b.start_hour && hour < b.end_hour);

  const isAvailable = (hour: number) => {
    if (availability.length === 0) return true; // default open
    return availability.some((a) => a.is_available && hour >= a.start_hour && hour < a.end_hour);
  };

  const hourOpen = (hour: number) => isAvailable(hour) && !isBooked(hour);

  const toggleHour = (hour: number) => {
    if (!hourOpen(hour)) return;
    if (selStart === null) {
      setSelStart(hour);
      setSelEnd(hour + 1);
    } else if (selEnd !== null) {
      if (hour < selStart) {
        setSelStart(hour);
      } else if (hour + 1 > selEnd) {
        // check contiguous
        let ok = true;
        for (let h = selStart; h <= hour; h++) {
          if (!hourOpen(h)) { ok = false; break; }
        }
        if (ok) setSelEnd(hour + 1);
      } else {
        // clicking inside range resets
        setSelStart(hour);
        setSelEnd(hour + 1);
      }
    }
  };

  const isInRange = (hour: number) =>
    selStart !== null && selEnd !== null && hour >= selStart && hour < selEnd;

  const handleBook = () => {
    if (!selectedDate || selStart === null || selEnd === null) return;
    router.push(`/book/${selectedDate}?start=${selStart}&end=${selEnd}`);
  };

  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7am to 10pm

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Calendar Card */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50 overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-cyan-500 to-teal-500">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-lg font-bold text-white tracking-wide">
            {MONTHS[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-4 pt-4 pb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5 px-4 pb-5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const ds = dateStr(day);
            const isToday = ds === todayStr;
            const past = isPast(day);
            const isSelected = ds === selectedDate;

            return (
              <button
                key={ds}
                disabled={past}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                className={`
                  relative aspect-square rounded-2xl text-sm font-semibold transition-all duration-150 flex items-center justify-center
                  ${past
                    ? 'text-slate-300 cursor-not-allowed'
                    : isSelected
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200 scale-105'
                      : isToday
                        ? 'bg-cyan-100 text-cyan-700 ring-2 ring-cyan-400 font-bold hover:bg-cyan-200'
                        : 'text-slate-700 hover:bg-slate-100 hover:scale-105'
                  }
                `}
              >
                {day}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hourly Slot Picker — appears when a date is selected */}
      {selectedDate && (
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50 overflow-hidden animate-slide-up">
          <div className="px-6 py-4 border-b border-slate-100">
            <h4 className="text-base font-bold text-slate-800">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <p className="text-sm text-slate-400 mt-0.5">Tap hours to select a time range</p>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-3 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 p-4">
                {hours.map((h) => {
                  const open = hourOpen(h);
                  const booked = isBooked(h);
                  const inRange = isInRange(h);
                  const label = `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`;

                  return (
                    <button
                      key={h}
                      disabled={!open}
                      onClick={() => toggleHour(h)}
                      className={`
                        py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-150
                        ${inRange
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200 scale-105'
                          : booked
                            ? 'bg-red-50 text-red-300 cursor-not-allowed line-through'
                            : !open
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 hover:scale-105'
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-5 px-4 pb-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" /> Available
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-3 h-3 rounded bg-cyan-500" /> Selected
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Booked
                </div>
              </div>

              {/* Confirm button */}
              {selStart !== null && selEnd !== null && (
                <div className="px-4 pb-5 pt-2">
                  <button
                    onClick={handleBook}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:scale-[1.01] transition-all duration-200"
                  >
                    Book {selStart > 12 ? selStart - 12 : selStart}:00{selStart >= 12 ? 'pm' : 'am'} — {selEnd > 12 ? selEnd - 12 : selEnd}:00{selEnd >= 12 ? 'pm' : 'am'} →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
