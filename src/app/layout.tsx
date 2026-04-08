import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hardware Store",
  description: "E-commerce platform for high-end PC parts and system builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-zinc-100 overflow-x-hidden relative`}>
        <Navbar />

        <main className="flex-1 max-w-[1920px] w-full mx-auto px-2 md:px-4 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
          {children}
        </main>

        <footer className="border-t border-border bg-surface mt-auto">
          <div className="max-w-[1920px] w-full mx-auto px-4 lg:px-8 py-4 flex items-center justify-center text-sm font-normal text-zinc-500 text-center">
            <p>
              &copy; {new Date().getFullYear()} Hardware Store. Designed and developed by <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-400 hover:text-white hover:underline transition-all">Jens Kjerpeset</a>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
