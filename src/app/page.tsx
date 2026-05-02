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

        if (data) setSpace(data);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight animate-slide-up">
          Book Your Court Time
        </h2>
        <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '80ms' }}>
          Premium indoor basketball & pickleball — reserve by the hour, pay by e-transfer.
        </p>

        {space && (
          <div className="mt-10 flex justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: '160ms' }}>
            <div className="bg-white rounded-2xl px-8 py-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rate</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">${space.hourly_rate}<span className="text-sm font-normal text-slate-400">/hr</span></p>
            </div>
            <div className="bg-white rounded-2xl px-8 py-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Minimum</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">{space.min_booking_hours}<span className="text-sm font-normal text-slate-400"> hr</span></p>
            </div>
            <div className="bg-white rounded-2xl px-8 py-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Maximum</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">{space.max_booking_hours}<span className="text-sm font-normal text-slate-400"> hrs</span></p>
            </div>
          </div>
        )}
      </section>

      {/* Calendar */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <Calendar />
      </section>

      {/* Features */}
      <section className="border-t border-slate-200/60 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h3>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Pick a Date', desc: 'Choose an available date from the calendar above.' },
              { step: '2', title: 'Select Hours', desc: 'Tap the hours you want — booked slots are grayed out.' },
              { step: '3', title: 'Confirm & Pay', desc: 'Fill in your details and send an e-transfer to lock it in.' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 font-bold text-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
