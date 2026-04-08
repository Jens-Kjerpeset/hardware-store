"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Tag, Settings, Menu, X, ChevronDown } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Inventory', icon: Package },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeLink = ADMIN_LINKS.find(link => 
    link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
  ) || ADMIN_LINKS[0];

  return (
    <nav className="w-full bg-[#141414] border-b border-border sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        
        {/* Mobile View: Dropdown Toggle */}
        <div className="md:hidden flex items-center justify-between h-14">
          <button 
            className="flex items-center gap-2 text-white font-semibold w-full justify-between"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="flex flex-row items-center gap-2">
              <activeLink.icon className="w-5 h-5 text-brand" />
              {activeLink.label}
            </div>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile View: Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col py-2 border-t border-border absolute left-0 right-0 bg-[#141414] shadow-2xl">
            {ADMIN_LINKS.map(link => {
              const Icon = link.icon;
              const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex flex-row items-center gap-3 px-6 py-3 text-sm font-semibold transition-colors ${
                    isActive ? 'text-brand bg-brand/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop View: Horizontal Scrollable Bar */}
        <div className="hidden md:flex items-center gap-8 h-14 overflow-x-auto whitespace-nowrap">
          {ADMIN_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                  isActive ? 'text-brand' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {link.label}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
