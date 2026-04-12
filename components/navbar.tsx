"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/Homepage", label: "Home" }, 
    { href: "/profile", label: "Dashboard" },
    { href: "/Calendar", label: "Calendar" },
    { href: "/Tasklist", label: "Tasks" },
    { href: "/Pomodoro", label: "Focus" },
    { href: "/meetings/create", label: "Meetings" },
    { href: "/reports/weekly", label: "Reports" },
  ];

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link href="/profile" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#780000] flex items-center justify-center">
          <span className="text-white text-xs font-black">PP</span>
        </div>
        <span className="text-xl font-black text-[#780000] tracking-tight">Peer Pressure</span>
      </Link>

      {/* Centered Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold pb-1 transition-all ${
                isActive
                  ? "text-[#780000] border-b-2 border-[#780000]"
                  : "text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side: notification + profile */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#780000] to-[#a33] flex items-center justify-center cursor-pointer shadow-sm">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      </div>
    </nav>
  );
}