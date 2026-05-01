'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import BookingForm from '@/components/BookingForm';
import { supabase, type Space } from '@/lib/supabase';

interface PageProps {
  params: {
    date: string;
  };
}

export default function BookPage({ params }: PageProps) {
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [selectedTime, setSelectedTime] = useState<{
    startHour: number;
    endHour: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpace = async () => {
      try {
        const { data } = await supabase
          .from('spaces')
          .select('*')
          .eq('slug', process.env.NEXT_PUBLIC_SPACE_SLUG!)
          .single();

        if (data) {
          setSpace(data);
        }
      } catch (error) {
        console.error('Failed to load space:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpace();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-lg">Could not load space information</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const displayDate = format(parse(params.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-cyan-600 hover:text-cyan-700 font-medium mb-4"
          >
            ← Back to Calendar
          </button>
          <h1 className="text-4xl font-bold text-blue-900">
            Book for {displayDate}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Time Selection */}
          <div className="lg:col-span-1">
            {!selectedTime ? (
              <TimeSlotPicker
                date={params.date}
                space={space}
                onSelectTime={(start, end) => {
                  setSelectedTime({ startHour: start, endHour: end });
                }}
              />
            ) : (
              <div className="card space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Selected Time</p>
                  <p className="text-2xl font-bold text-green-700">
                    {String(selectedTime.startHour).padStart(2, '0')}:00 -{' '}
                    {String(selectedTime.endHour).padStart(2, '0')}:00
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedTime.endHour - selectedTime.startHour} hour
                    {selectedTime.endHour - selectedTime.startHour !== 1 ? 's' : ''}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTime(null)}
                  className="w-full btn-secondary"
                >
                  Change Time
                </button>
              </div>
            )}
          </div>

          {/* Booking Form */}
          {selectedTime && (
            <div className="lg:col-span-2">
              <BookingForm
                date={params.date}
                startHour={selectedTime.startHour}
                endHour={selectedTime.endHour}
                space={space}
                onBookingComplete={(bookingId) => {
                  router.push(`/booking/${bookingId}`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
