"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  Tag,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 ml-8 border-l border-dark-border pl-8">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
              isActive
                ? "bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20"
                : "text-gray-400 hover:text-white hover:bg-dark-bg border border-transparent"
            }`}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
