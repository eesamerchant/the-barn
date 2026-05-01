'use client';

import { useEffect, useState } from 'react';
import Calendar from '@/components/Calendar';
import { supabase, type Space } from '@/lib/supabase';

export default function Home() {
  const [space, setSpace] = useState<Space | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-blue-900 tracking-tight">
            The Barn
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600">
            Premium Indoor Basketball & Pickleball Court
          </p>

          {space && (
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-700 leading-relaxed mb-6">
                {space.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    ${space.hourly_rate.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Min. Duration</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {space.min_booking_hours}h
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Max. Duration</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {space.max_booking_hours}h
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
          Select a Date to Book
        </h2>
        <Calendar />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
          Why Choose The Barn?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <div className="text-4xl mb-4">🏀</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Professional Courts
            </h3>
            <p className="text-gray-600">
              Regulation-size basketball and pickleball courts with professional-grade
              equipment.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Easy Booking
            </h3>
            <p className="text-gray-600">
              Simple online booking system with instant confirmation. No hidden fees or
              complications.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Flexible Payment
            </h3>
            <p className="text-gray-600">
              Pay by e-transfer with flexible booking durations and reasonable rates.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Book Your Time?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Select a date above to get started. Bring your friends and make it a great
            game!
          </p>
        </div>
      </section>
    </div>
  );
}
