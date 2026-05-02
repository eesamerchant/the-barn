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
        <div className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900" style={{ animation: 'slideUp 0.4s ease-out' }}>
          Book Your <span className="text-cyan-600">Court Time</span>
        </h2>
        <p className="mt-2 text-slate-500 max-w-md mx-auto text-sm" style={{ animation: 'slideUp 0.4s ease-out 0.08s both' }}>
          Premium indoor basketball & pickleball — reserve by the hour, pay by e-transfer.
        </p>

        {space && (
          <div className="flex justify-center gap-3 mt-7" style={{ animation: 'slideUp 0.4s ease-out 0.15s both' }}>
            {[
              { label: `$${space.hourly_rate}`, sub: '/hr' },
              { label: `${space.min_booking_hours}hr`, sub: 'min' },
              { label: `${space.max_booking_hours}hr`, sub: 'max' },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center hover:border-cyan-300 hover:shadow-sm transition-all">
                <p className="text-lg font-bold text-cyan-600">{item.label}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{item.sub}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Calendar */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <Calendar />
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200/60 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h3 className="text-sm font-semibold text-slate-900 text-center mb-6">How It Works</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { n: '1', t: 'Pick a Date', d: 'Choose from the calendar' },
              { n: '2', t: 'Select Hours', d: 'Booked slots are grayed' },
              { n: '3', t: 'Confirm & Pay', d: 'E-transfer to lock in' },
            ].map((s) => (
              <div key={s.n} className="text-center group">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 text-sm font-bold flex items-center justify-center mx-auto mb-2 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  {s.n}
                </div>
                <p className="text-xs font-medium text-slate-900">{s.t}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
