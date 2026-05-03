import Calendar from '@/components/Calendar';

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-10" style={{ animation: 'slideUp 0.4s ease-out' }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Book Your <span className="text-cyan-400">Court Time</span>
        </h2>
        <p className="text-[#6b6b80] max-w-md mx-auto text-sm">
          Reserve our indoor court for basketball or pickleball. Pick a date and choose your hours.
        </p>
      </div>

      {/* Calendar */}
      <Calendar />

      {/* How it works */}
      <div className="mt-12 bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6" style={{ animation: 'slideUp 0.5s ease-out 0.2s both' }}>
        <h3 className="text-sm font-semibold text-white mb-4">How It Works</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { n: '1', t: 'Pick Date', d: 'Choose available date' },
            { n: '2', t: 'Select Hours', d: 'Tap time slots' },
            { n: '3', t: 'Add Details', d: 'Contact & add-ons' },
            { n: '4', t: 'Confirm', d: 'Send e-transfer' },
          ].map((s) => (
            <div key={s.n} className="text-center group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm font-bold flex items-center justify-center mx-auto mb-2 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                {s.n}
              </div>
              <p className="text-xs font-medium text-white">{s.t}</p>
              <p className="text-[11px] text-[#6b6b80] mt-0.5">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
