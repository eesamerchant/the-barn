'use client';

import { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isBefore,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  startOfDay,
} from 'date-fns';
import Link from 'next/link';
import { supabase, type Availability, type Booking } from '@/lib/supabase';

interface CalendarProps {
  onDateSelect?: (date: string) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      try {
        // Fetch availability records for the current month
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const monthStartStr = format(monthStart, 'yyyy-MM-dd');
        const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

        const { data: availabilityData, error: availError } = await supabase
          .from('availability')
          .select('date, is_available')
          .gte('date', monthStartStr)
          .lte('date', monthEndStr);

        if (availError) throw availError;

        // Fetch bookings for the current month (all spaces)
        const { data: bookingsData, error: bookError } = await supabase
          .from('bookings')
          .select('date, status')
          .gte('date', monthStartStr)
          .lte('date', monthEndStr)
          .in('status', ['pending', 'confirmed']);

        if (bookError) throw bookError;

        // Build sets of available and booked dates
        const available = new Set<string>();
        const booked = new Set<string>();

        availabilityData?.forEach((av) => {
          if (av.is_available) {
            available.add(av.date);
          }
        });

        bookingsData?.forEach((booking) => {
          booked.add(booking.date);
        });

        setAvailableDates(available);
        setBookedDates(booked);
      } catch (error) {
        console.error('Failed to load availability:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = startOfDay(new Date());

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isPast = isBefore(date, today);
    const hasAvailability = availableDates.has(dateStr);
    const isNotFullyBooked = !bookedDates.has(dateStr);
    return !isPast && hasAvailability && isNotFullyBooked;
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((date) => {
              const available = isDateAvailable(date);
              const dateStr = format(date, 'yyyy-MM-dd');
              const isPast = isBefore(date, today);
              const isCurrentMonth = isSameMonth(date, currentMonth);

              return (
                <div key={dateStr}>
                  {available ? (
                    <Link
                      href={`/book/${dateStr}`}
                      className="aspect-square flex items-center justify-center rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-colors cursor-pointer"
                    >
                      {date.getDate()}
                    </Link>
                  ) : (
                    <div
                      className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm ${
                        !isCurrentMonth
                          ? 'bg-gray-50 text-gray-300'
                          : isPast
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
