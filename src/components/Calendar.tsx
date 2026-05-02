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
import { useRouter } from 'next/navigation';
import { supabase, type Availability, type Booking } from '@/lib/supabase';

interface CalendarProps {
  onDateSelect?: (date: string) => void;
}

interface HourlySlot {
  hour: number;
  available: boolean;
  booked: boolean;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);

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

  const loadHourlySlots = async (dateStr: string) => {
    setLoadingSlots(true);
    setSelectedStart(null);
    setSelectedEnd(null);
    try {
      // Fetch the availability record for this specific date
      const { data: availData, error: availError } = await supabase
        .from('availability')
        .select('start_hour, end_hour')
        .eq('date', dateStr)
        .single();

      if (availError) throw availError;

      // Fetch hourly bookings for this specific date
      const { data: bookingsData, error: bookError } = await supabase
        .from('bookings')
        .select('start_hour, end_hour')
        .eq('date', dateStr)
        .in('status', ['pending', 'confirmed']);

      if (bookError) throw bookError;

      const startHour = availData?.start_hour || 6;
      const endHour = availData?.end_hour || 23;

      // Create hourly slots
      const slots: HourlySlot[] = [];
      const bookedHours = new Set<number>();

      // Mark all booked hours
      bookingsData?.forEach((booking) => {
        for (let h = booking.start_hour; h < booking.end_hour; h++) {
          bookedHours.add(h);
        }
      });

      // Create slots for each hour
      for (let h = startHour; h < endHour; h++) {
        slots.push({
          hour: h,
          available: true,
          booked: bookedHours.has(h),
        });
      }

      setHourlySlots(slots);
    } catch (error) {
      console.error('Failed to load hourly slots:', error);
      setHourlySlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateClick = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setHourlySlots([]);
      setSelectedStart(null);
      setSelectedEnd(null);
    } else {
      setSelectedDate(dateStr);
      loadHourlySlots(dateStr);
    }
  };

  const handleHourClick = (hour: number) => {
    const slot = hourlySlots.find((s) => s.hour === hour);
    if (slot?.booked) return; // Can't select booked hours

    if (selectedStart === null) {
      setSelectedStart(hour);
      setSelectedEnd(hour + 1);
    } else if (hour < selectedStart) {
      setSelectedStart(hour);
      setSelectedEnd(selectedStart + 1);
    } else if (hour >= selectedStart) {
      setSelectedEnd(hour + 1);
    }
  };

  const handleContinueBooking = () => {
    if (selectedDate && selectedStart !== null && selectedEnd !== null) {
      router.push(`/book/${selectedDate}?start=${selectedStart}&end=${selectedEnd}`);
    }
  };

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
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
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
              const isSelected = selectedDate === dateStr;

              return (
                <div key={dateStr}>
                  {available ? (
                    <button
                      onClick={() => handleDateClick(dateStr)}
                      className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition-all duration-300 cursor-pointer relative group ${
                        isSelected
                          ? 'bg-cyan-500 text-white shadow-lg scale-105 animate-pulse-glow'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {date.getDate()}
                    </button>
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

      {/* Hourly Slot Picker */}
      {selectedDate && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 animate-slide-down">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Select Time Slot
            </h3>
            <p className="text-gray-600">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {loadingSlots ? (
            <div className="text-center py-8 text-gray-600">Loading time slots...</div>
          ) : hourlySlots.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No availability for this date
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-8">
                {hourlySlots.map((slot) => {
                  const isStartSelected = selectedStart === slot.hour;
                  const isInRange =
                    selectedStart !== null &&
                    selectedEnd !== null &&
                    slot.hour >= selectedStart &&
                    slot.hour < selectedEnd;
                  const timeDisplay = `${slot.hour.toString().padStart(2, '0')}:00 - ${(slot.hour + 1)
                    .toString()
                    .padStart(2, '0')}:00`;

                  return (
                    <button
                      key={slot.hour}
                      onClick={() => handleHourClick(slot.hour)}
                      disabled={slot.booked}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                        slot.booked
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                          : isStartSelected || isInRange
                          ? 'bg-cyan-500 border-cyan-600 text-white shadow-lg'
                          : 'bg-white border-gray-200 hover:border-cyan-400 hover:shadow-md text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{timeDisplay}</span>
                        {slot.booked ? (
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">
                            Booked
                          </span>
                        ) : isInRange ? (
                          <span className="text-xs px-2 py-1 bg-white rounded text-cyan-600 font-semibold">
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedStart !== null && selectedEnd !== null && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 font-medium mb-2">
                    Selected Duration:{' '}
                    <span className="text-cyan-600 font-bold">
                      {selectedEnd - selectedStart} hour{selectedEnd - selectedStart !== 1 ? 's' : ''}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedStart.toString().padStart(2, '0')}:00 -{' '}
                    {selectedEnd.toString().padStart(2, '0')}:00
                  </p>
                </div>
              )}

              <button
                onClick={handleContinueBooking}
                disabled={selectedStart === null || selectedEnd === null}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedStart === null || selectedEnd === null
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                Continue Booking
                <span>→</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
