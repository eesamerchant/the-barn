'use client';

import { useState, useEffect } from 'react';
import { supabase, type Space } from '@/lib/supabase';

interface TimeSlotPickerProps {
  date: string;
  space: Space;
  onSelectTime: (startHour: number, endHour: number) => void;
}

export default function TimeSlotPicker({
  date,
  space,
  onSelectTime,
}: TimeSlotPickerProps) {
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      setLoading(true);
      try {
        // Get availability records for this date
        const { data: availabilityData } = await supabase
          .from('availability')
          .select('start_hour, end_hour, is_available')
          .eq('date', date);

        // Get bookings for this date (all spaces - check conflicts)
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('start_hour, end_hour')
          .eq('date', date)
          .in('status', ['pending', 'confirmed']);

        // Build set of available hours
        const available = new Set<number>();

        // Get business hours from settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'business_hours_start');

        let startBusinessHour = 6; // default
        if (settingsData?.[0]) {
          startBusinessHour = settingsData[0].value as number;
        }

        const { data: settingsEndData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'business_hours_end');

        let endBusinessHour = 22; // default
        if (settingsEndData?.[0]) {
          endBusinessHour = settingsEndData[0].value as number;
        }

        // Add all hours in business hours range
        for (let hour = startBusinessHour; hour < endBusinessHour; hour++) {
          available.add(hour);
        }

        // Remove hours that are not marked as available in availability table
        if (availabilityData && availabilityData.length > 0) {
          const availableSet = new Set<number>();
          availabilityData.forEach((av) => {
            if (av.is_available) {
              for (let hour = av.start_hour; hour < av.end_hour; hour++) {
                availableSet.add(hour);
              }
            }
          });
          // Intersect with availability
          const filtered = new Set<number>();
          availableSet.forEach((h) => {
            if (available.has(h)) filtered.add(h);
          });
          available.clear();
          filtered.forEach((h) => available.add(h));
        }

        // Remove hours booked on any space
        if (bookingsData && bookingsData.length > 0) {
          bookingsData.forEach((booking) => {
            for (let hour = booking.start_hour; hour < booking.end_hour; hour++) {
              available.delete(hour);
            }
          });
        }

        setAvailableSlots(Array.from(available).sort((a, b) => a - b));
      } catch (error) {
        console.error('Failed to load available slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableSlots();
  }, [date]);

  const handleStartHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hour = parseInt(e.target.value);
    setStartHour(hour);
    if (endHour && hour >= endHour) {
      setEndHour(null);
    }
  };

  const handleEndHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndHour(parseInt(e.target.value));
  };

  const handleApply = () => {
    if (startHour !== null && endHour !== null && endHour > startHour) {
      const hours = endHour - startHour;
      if (hours >= space.min_booking_hours && hours <= space.max_booking_hours) {
        onSelectTime(startHour, endHour);
      }
    }
  };

  const isValidSelection =
    startHour !== null &&
    endHour !== null &&
    endHour > startHour &&
    endHour - startHour >= space.min_booking_hours &&
    endHour - startHour <= space.max_booking_hours;

  if (loading) {
    return <div className="text-center py-4 text-[#6b6b80]">Loading available times...</div>;
  }

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-white">Select Time Slot</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#e4e4ed] mb-2">
            Start Hour
          </label>
          <select
            value={startHour ?? ''}
            onChange={handleStartHourChange}
            className="input-field"
          >
            <option value="">Select start time</option>
            {availableSlots.map((hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e4e4ed] mb-2">
            End Hour
          </label>
          <select
            value={endHour ?? ''}
            onChange={handleEndHourChange}
            disabled={startHour === null}
            className="input-field"
          >
            <option value="">Select end time</option>
            {availableSlots
              .filter((hour) => startHour !== null && hour > startHour)
              .map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, '0')}:00
                </option>
              ))}
          </select>
        </div>
      </div>

      {startHour !== null && endHour !== null && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-[#e4e4ed]">
            Duration: {endHour - startHour} hour{endHour - startHour !== 1 ? 's' : ''}
          </p>
          {endHour - startHour < space.min_booking_hours && (
            <p className="text-sm text-red-400 mt-1">
              Minimum booking duration is {space.min_booking_hours} hour
              {space.min_booking_hours !== 1 ? 's' : ''}
            </p>
          )}
          {endHour - startHour > space.max_booking_hours && (
            <p className="text-sm text-red-400 mt-1">
              Maximum booking duration is {space.max_booking_hours} hour
              {space.max_booking_hours !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={!isValidSelection}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
