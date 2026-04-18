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
    { href: "/groups", label: "Groups" },
    { href: "/meetings/create", label: "Meetings" },
    { href: "/reports/weekly", label: "Reports" },
  ];

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#E9DABB]/80 backdrop-blur-xl border-b-2 border-[#780000]/10 sticky top-0 z-50 shadow-lg">
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
                  : "text-[#780000]/60 hover:text-[#780000] hover:border-b-2 hover:border-[#780000]/30"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side: notification + profile */}
      <div className="flex items-center gap-6">
        <button className="relative text-[#780000]/60 hover:text-[#780000] transition-all hover:scale-110">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#780000] rounded-full ring-2 ring-[#E9DABB]"></span>
        </button>
        
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#780000] to-[#5c0000] flex items-center justify-center cursor-pointer shadow-xl hover:translate-y-[-2px] transition-all duration-300">
          <span className="text-[#E9DABB] text-xs font-black">U</span>
        </div>
      </div>
    </nav>
  );
}