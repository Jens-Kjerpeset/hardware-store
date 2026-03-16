import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Hardware Store - Premium PC Parts",
  description: "The ultimate hardware store to build your dream PC.",
};

function Footer() {
  return (
    <footer className="border-t border-dark-border mt-auto py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-center items-center text-sm text-gray-500">
        <p>Developed and designed by <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors underline underline-offset-2">Jens Kjerpeset - kjerpeset.no</a></p>
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased selection:bg-brand-500/30 selection:text-brand-100 flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
