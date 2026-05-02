import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Barn - Book Your Court",
  description: "Indoor basketball and pickleball court booking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8fafc]">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-cyan-500/20">
                B
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">The Barn</h1>
                <p className="text-xs text-slate-500">Basketball & Pickleball Court</p>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-200/60 bg-white mt-16">
            <div className="max-w-5xl mx-auto px-6 py-8 text-center">
              <p className="text-sm text-slate-400">
                &copy; 2026 The Barn. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
