import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Barn — Book Your Court',
  description: 'Reserve basketball and pickleball court time at The Barn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
          <div className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              B
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">The Barn</span>
          </div>
        </header>

        {/* Main content — centered */}
        <main className="flex-1 w-full flex flex-col items-center">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} The Barn &mdash; All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
