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
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-3xl font-bold text-blue-900">The Barn</h1>
              <p className="text-gray-600 mt-1">Basketball & Pickleball Court</p>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-gray-600 text-center">
                © {new Date().getFullYear()} The Barn. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
