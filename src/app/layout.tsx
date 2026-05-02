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
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">🏀</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-primary">The Barn</h1>
                  <p className="text-gray-600 text-sm mt-0.5">Basketball & Pickleball Court</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 animate-fade-in">
            {children}
          </main>
          <footer className="bg-gradient-to-t from-gray-100 to-white border-t border-gray-200 mt-12 sm:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
                  <p className="text-gray-600 text-sm">Mon-Fri: 6am - 11pm</p>
                  <p className="text-gray-600 text-sm">Weekends: 8am - 11pm</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                  <p className="text-gray-600 text-sm">E-Transfer Payment</p>
                  <p className="text-gray-600 text-sm">Quick & Secure</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Courts</h3>
                  <p className="text-gray-600 text-sm">Basketball & Pickleball</p>
                  <p className="text-gray-600 text-sm">Professional Grade</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-8 text-center">
                <p className="text-gray-600 text-sm">
                  © {new Date().getFullYear()} The Barn. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
