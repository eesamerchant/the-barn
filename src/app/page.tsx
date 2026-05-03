import Calendar from '@/components/Calendar';

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col items-center">
      {/* Hero */}
      <section className="w-full text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
          Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">Court Time</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto mb-6">
          Reserve the court for basketball or pickleball — pick a date below and choose your hours.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium border border-cyan-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            $100/hr
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Min 1 Hour
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 text-sm font-medium border border-sky-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Basketball &amp; Pickleball
          </span>
        </div>
      </section>

      {/* Calendar */}
      <section className="w-full">
        <Calendar />
      </section>

      {/* How It Works */}
      <section className="w-full mt-12 mb-6">
        <h2 className="text-2xl font-bold text-slate-700 text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { step: '1', title: 'Pick a Date', desc: 'Choose your preferred date from the calendar above.', icon: '📅' },
            { step: '2', title: 'Select Hours', desc: 'Pick available hourly slots that work for you.', icon: '⏰' },
            { step: '3', title: 'Confirm & Pay', desc: 'Fill in your details and send an e-Transfer to book.', icon: '✅' },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">Step {item.step}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
