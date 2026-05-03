'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Availability, type Booking } from '@/lib/supabase';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
    setSelectedDate(null);
  };

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d < today;
  };

  // Fetch slots
  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setStartHour(null);
    setEndHour(null);
    try {
      const spaceRes = await supabase
        .from('spaces').select('id')
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

  const isBooked = (hour: number) => bookings.some((b) => hour >= b.start_hour && hour < b.end_hour);
  const isAvail = (hour: number) => {
    if (availability.length === 0) return true;
    return availability.some((a) => a.is_available && hour >= a.start_hour && hour < a.end_hour);
  };
  const hourOpen = (hour: number) => isAvail(hour) && !isBooked(hour);

  const handleHourClick = (h: number) => {
    if (!hourOpen(h)) return;
    if (startHour === null) { setStartHour(h); setEndHour(h + 1); return; }
    if (endHour !== null) {
      if (h < startHour) { setStartHour(h); }
      else if (h + 1 > endHour) {
        let ok = true;
        for (let i = startHour; i <= h; i++) { if (!hourOpen(i)) { ok = false; break; } }
        if (ok) setEndHour(h + 1);
      } else {
        setStartHour(h); setEndHour(h + 1);
      }
    }
  };

  const inRange = (h: number) => startHour !== null && endHour !== null && h >= startHour && h < endHour;
  const duration = startHour !== null && endHour !== null ? endHour - startHour : 0;
  const fmtHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const d = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${d}:00 ${ampm}`;
  };

  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  return (
    <div style={{ animation: 'slideUp 0.4s ease-out 0.1s both' }}>
      {/* Calendar card */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a3a]/60">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:bg-[#1a1a25] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-sm font-semibold text-white">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b80] hover:bg-[#1a1a25] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-3 pt-3">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-[#4a4a5a] uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 px-3 pb-3">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const ds = dateStr(day);
            const isToday = ds === todayStr;
            const past = isPast(day);
            const sel = ds === selectedDate;

            return (
              <button
                key={ds}
                disabled={past}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                className={`
                  aspect-square rounded-xl text-xs font-medium flex items-center justify-center transition-all duration-150
                  ${past
                    ? 'text-[#2a2a3a] cursor-default'
                    : sel
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-105 font-bold'
                      : isToday
                        ? 'bg-cyan-500/15 text-cyan-300 ring-2 ring-cyan-500 font-bold hover:bg-cyan-500/25'
                        : 'text-[#e4e4ed] hover:bg-[#1a1a25] cursor-pointer'
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-4 py-2.5 border-t border-[#2a2a3a]/60 flex gap-5 text-[10px] text-[#4a4a5a]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e4e4ed]" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2a2a3a]" /> Past</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500/20 ring-1 ring-cyan-500" /> Today</span>
        </div>
      </div>

      {/* Hourly slot picker */}
      {selectedDate && (
        <div className="mt-4 bg-[#12121a] border border-[#2a2a3a] rounded-2xl overflow-hidden" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <div className="px-5 py-3 border-b border-[#2a2a3a]/60 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>
              <p className="text-[11px] text-[#6b6b80] mt-0.5">Tap hours to select your time</p>
            </div>
            <button onClick={() => setSelectedDate(null)} className="text-[#6b6b80] hover:text-white text-lg px-1">&times;</button>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <div className="h-5 w-5 rounded-full border-2 border-[#2a2a3a] border-t-cyan-500 animate-spin" />
            </div>
          ) : (
            <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {hours.map((h) => {
                const open = hourOpen(h);
                const booked = isBooked(h);
                const selected = inRange(h);
                return (
                  <button
                    key={h}
                    disabled={!open}
                    onClick={() => handleHourClick(h)}
                    className={`
                      px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-center
                      ${booked
                        ? 'bg-[#1a1a25] text-[#2a2a3a] cursor-not-allowed line-through'
                        : selected
                          ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/20 font-semibold'
                          : !open
                            ? 'bg-[#1a1a25] text-[#2a2a3a] cursor-not-allowed'
                            : 'bg-[#0a0a0f] text-[#6b6b80] hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer'
                      }
                    `}
                  >
                    {fmtHour(h)}
                    {booked && <span className="block text-[9px] mt-0.5" style={{ textDecoration: 'none' }}>Booked</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Summary + CTA */}
          <div className="px-5 py-3 border-t border-[#2a2a3a]/60">
            {duration > 0 ? (
              <p className="text-xs text-[#6b6b80] mb-2">
                {fmtHour(startHour!)} – {fmtHour(endHour!)} &middot; <span className="text-white font-semibold">{duration}h</span>
              </p>
            ) : (
              <p className="text-xs text-[#4a4a5a] mb-2">No time selected</p>
            )}
            <button
              disabled={duration === 0}
              onClick={() => router.push(`/book/${selectedDate}?start=${startHour}&end=${endHour}`)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${duration > 0
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-[#1a1a25] text-[#4a4a5a] cursor-not-allowed'
                }
              `}
            >
              Continue Booking &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
