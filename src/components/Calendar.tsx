'use client';

import { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isBefore,
  isToday,
  addMonths,
  subMonths,
  startOfDay,
  getDay,
} from 'date-fns';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface HourSlot {
  hour: number;
  booked: boolean;
}

export default function Calendar() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<HourSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ms = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const me = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const { data: avail } = await supabase
          .from('availability').select('date, is_available').gte('date', ms).lte('date', me);
        const available = new Set<string>();
        avail?.forEach((a) => { if (a.is_available) available.add(a.date); });
        setAvailableDates(available);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [currentMonth]);

  const loadSlots = async (dateStr: string) => {
    setLoadingSlots(true);
    setStartHour(null);
    setEndHour(null);
    try {
      const [{ data: av }, { data: bk }] = await Promise.all([
        supabase.from('availability').select('start_hour, end_hour').eq('date', dateStr).single(),
        supabase.from('bookings').select('start_hour, end_hour').eq('date', dateStr).in('status', ['pending', 'confirmed']),
      ]);
      const s = av?.start_hour ?? 6;
      const e = av?.end_hour ?? 23;
      const booked = new Set<number>();
      bk?.forEach((b) => { for (let h = b.start_hour; h < b.end_hour; h++) booked.add(h); });
      const result: HourSlot[] = [];
      for (let h = s; h < e; h++) result.push({ hour: h, booked: booked.has(h) });
      setSlots(result);
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleDateClick = (ds: string) => {
    if (selectedDate === ds) { setSelectedDate(null); return; }
    setSelectedDate(ds);
    loadSlots(ds);
  };

  const handleHourClick = (h: number) => {
    if (startHour === null) { setStartHour(h); setEndHour(h + 1); }
    else if (h < startHour) { setStartHour(h); }
    else { setEndHour(h + 1); }
  };

  const today = startOfDay(new Date());
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const pad = getDay(startOfMonth(currentMonth));
  const duration = startHour !== null && endHour !== null ? endHour - startHour : 0;

  const fmtHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const d = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${d}:00 ${ampm}`;
  };

  return (
    <div className="w-full" style={{ animation: 'slideUp 0.4s ease-out 0.1s both' }}>
      {/* Calendar */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">&#8249;</button>
          <h3 className="text-sm font-semibold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">&#8250;</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-3 pt-3">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-300 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {Array.from({ length: pad }).map((_, i) => <div key={`p-${i}`} />)}
            {days.map((date) => {
              const ds = format(date, 'yyyy-MM-dd');
              const avail = !isBefore(date, today) && availableDates.has(ds);
              const sel = selectedDate === ds;
              const isT = isToday(date);
              return (
                <button
                  key={ds}
                  disabled={!avail}
                  onClick={() => handleDateClick(ds)}
                  className={`aspect-square rounded-xl text-xs font-medium flex items-center justify-center relative transition-all duration-150
                    ${avail
                      ? sel
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                        : isT ? 'bg-cyan-100 text-cyan-700 ring-2 ring-cyan-500 font-bold hover:bg-cyan-200 cursor-pointer' : 'text-slate-900 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer'
                      : 'text-slate-300 cursor-default'
                    }
                  `}
                >
                  {date.getDate()}
                  
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex gap-5 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Unavailable</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-100 ring-1 ring-cyan-500" /> Today</span>
        </div>
      </div>

      {/* Hourly slots */}
      {selectedDate && (
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Tap hours to select your time</p>
            </div>
            <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600 text-lg px-1">&times;</button>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
            </div>
          ) : (
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {slots.map((slot) => {
                const inRange = startHour !== null && endHour !== null && slot.hour >= startHour && slot.hour < endHour;
                return (
                  <button
                    key={slot.hour}
                    disabled={slot.booked}
                    onClick={() => handleHourClick(slot.hour)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-center
                      ${slot.booked
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                        : inRange
                          ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer'
                      }
                    `}
                  >
                    {fmtHour(slot.hour)}
                    {slot.booked && <span className="block text-[9px] mt-0.5" style={{ textDecoration: 'none' }}>Booked</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Summary + continue */}
          <div className="px-5 py-3 border-t border-slate-100">
            {duration > 0 ? (
              <p className="text-xs text-slate-500 mb-2">
                {fmtHour(startHour!)} – {fmtHour(endHour!)} &middot; <span className="text-slate-900 font-semibold">{duration}h</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400 mb-2">No time selected</p>
            )}
            <button
              disabled={duration === 0}
              onClick={() => router.push(`/book/${selectedDate}?start=${startHour}&end=${endHour}`)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${duration > 0
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
