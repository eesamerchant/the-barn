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
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-4">🏀</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="inline-block text-5xl sm:text-6xl animate-bounce">🏀</div>
          <h1 className="text-5xl sm:text-6xl font-bold text-primary tracking-tight animate-slide-up">
            The Barn
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Premium Indoor Basketball & Pickleball Court
          </p>

          {space && (
            <div className="max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
              <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                {space.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-cyan-300 hover:scale-105 animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <p className="text-sm text-gray-600 font-medium">Hourly Rate</p>
                  <p className="text-3xl font-bold text-secondary mt-2">${space.hourly_rate.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-cyan-300 hover:scale-105 animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <p className="text-sm text-gray-600 font-medium">Min. Duration</p>
                  <p className="text-3xl font-bold text-secondary mt-2">{space.min_booking_hours}h</p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-cyan-300 hover:scale-105 animate-slide-up" style={{ animationDelay: '500ms' }}>
                  <p className="text-sm text-gray-600 font-medium">Max. Duration</p>
                  <p className="text-3xl font-bold text-secondary mt-2">{space.max_booking_hours}h</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl font-bold text-center text-primary mb-12 animate-slide-up">
          Select a Date to Book
        </h2>
        <Calendar />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl font-bold text-center text-primary mb-12 animate-slide-up">
          Why Choose The Barn?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-cyan-300 animate-slide-up">
            <div className="text-5xl mb-4 inline-block transform transition-transform duration-300 hover:scale-110">
              🏀
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Courts</h3>
            <p className="text-gray-600 leading-relaxed">
              Regulation-size basketball and pickleball courts with professional-grade equipment.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-cyan-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="text-5xl mb-4 inline-block transform transition-transform duration-300 hover:scale-110">
              ⏰
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Booking</h3>
            <p className="text-gray-600 leading-relaxed">
              Simple online booking system with instant confirmation. No hidden fees or complications.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-cyan-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="text-5xl mb-4 inline-block transform transition-transform duration-300 hover:scale-110">
              💳
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Payment</h3>
            <p className="text-gray-600 leading-relaxed">
              Pay by e-transfer with flexible booking durations and reasonable rates.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-slide-up">
        <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 rounded-xl p-8 sm:p-12 text-center text-white overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Book Your Time?</h2>
            <p className="text-lg mb-8 opacity-95">
              Select a date above to get started. Bring your friends and make it a great game!
            </p>
            <div className="flex justify-center gap-2">
              <span className="animate-bounce" style={{ animationDelay: '0s' }}>🏀</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>⚾</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎾</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
