import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Barn — Court Booking',
  description: 'Reserve basketball and pickleball court time at The Barn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a]/50">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-500/20">
              TB
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-white">The Barn</h1>
              <p className="text-[11px] text-[#6b6b80]">Court Booking</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#2a2a3a]/50 bg-[#0a0a0f]/80">
          <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between text-[11px] text-[#6b6b80]">
            <span>&copy; {new Date().getFullYear()} The Barn</span>
            <span>All rights reserved</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
