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

interface HourlySlot {
  hour: number;
  booked: boolean;
}

export default function Calendar() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Inline slot picker state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ms = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const me = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const [{ data: avail }, { data: bookings }] = await Promise.all([
          supabase.from('availability').select('date, is_available').gte('date', ms).lte('date', me),
          supabase.from('bookings').select('date').gte('date', ms).lte('date', me).in('status', ['pending', 'confirmed']),
        ]);

        const available = new Set<string>();
        avail?.forEach((a) => { if (a.is_available) available.add(a.date); });

        // Only mark fully booked dates — we'll check hourly later
        setAvailableDates(available);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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
      const bookedSet = new Set<number>();
      bk?.forEach((b) => { for (let h = b.start_hour; h < b.end_hour; h++) bookedSet.add(h); });

      const slots: HourlySlot[] = [];
      for (let h = s; h < e; h++) slots.push({ hour: h, booked: bookedSet.has(h) });
      setHourlySlots(slots);
    } catch {
      setHourlySlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateClick = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setHourlySlots([]);
      return;
    }
    setSelectedDate(dateStr);
    loadSlots(dateStr);
  };

  const handleHourClick = (hour: number) => {
    if (startHour === null) {
      setStartHour(hour);
      setEndHour(hour + 1);
    } else if (hour < startHour) {
      setStartHour(hour);
    } else {
      setEndHour(hour + 1);
    }
  };

  const today = startOfDay(new Date());
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayPad = getDay(startOfMonth(currentMonth));
  const duration = startHour !== null && endHour !== null ? endHour - startHour : 0;

  const formatHour = (h: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${suffix}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-lg"
          >
            &#8249;
          </button>
          <h3 className="text-lg font-semibold text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-lg"
          >
            &#8250;
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-4 pt-4">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 px-4 pb-4 gap-1">
            {/* Empty padding cells */}
            {Array.from({ length: firstDayPad }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isPast = isBefore(date, today);
              const available = !isPast && availableDates.has(dateStr);
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(date);

              return (
                <button
                  key={dateStr}
                  disabled={!available}
                  onClick={() => handleDateClick(dateStr)}
                  className={`aspect-square rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-200 relative
                    ${available
                      ? isSelected
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                        : 'text-slate-900 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer'
                      : 'text-slate-300 cursor-default'
                    }
                  `}
                >
                  {date.getDate()}
                  {isTodayDate && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="px-6 py-3 border-t border-slate-100 flex gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Unavailable
          </span>
          <span className="flex items-center gap-1.5">
            <span className="absolute-dot w-1.5 h-1.5 rounded-full bg-cyan-500 ring-2 ring-cyan-200" /> Today
          </span>
        </div>
      </div>

      {/* Hourly Slots Panel */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-down">
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Tap hours to select your time</p>
            </div>
            <button
              onClick={() => { setSelectedDate(null); setHourlySlots([]); }}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1"
            >
              &times;
            </button>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
            </div>
          ) : (
            <div className="p-4 space-y-1.5">
              {hourlySlots.map((slot) => {
                const inRange =
                  startHour !== null &&
                  endHour !== null &&
                  slot.hour >= startHour &&
                  slot.hour < endHour;

                return (
                  <button
                    key={slot.hour}
                    disabled={slot.booked}
                    onClick={() => handleHourClick(slot.hour)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                      ${slot.booked
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        : inRange
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer'
                      }
                    `}
                  >
                    <span>{formatHour(slot.hour)} – {formatHour(slot.hour + 1)}</span>
                    {slot.booked && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">Booked</span>
                    )}
                    {inRange && !slot.booked && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Summary + Continue */}
          <div className="px-6 py-4 border-t border-slate-100">
            {duration > 0 ? (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">
                  {formatHour(startHour!)} – {formatHour(endHour!)}
                  <span className="ml-2 font-semibold text-slate-900">{duration}h</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-3">No time selected yet</p>
            )}
            <button
              disabled={duration === 0}
              onClick={() => {
                if (selectedDate && startHour !== null && endHour !== null) {
                  router.push(`/book/${selectedDate}?start=${startHour}&end=${endHour}`);
                }
              }}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${duration > 0
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-md shadow-cyan-500/20 hover:shadow-lg'
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
