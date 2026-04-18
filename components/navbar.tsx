"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  linkUrl: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/profile", label: "Dashboard" },
    { href: "/Calendar", label: "Calendar" },
    { href: "/Tasklist", label: "Tasks" },
    { href: "/Pomodoro", label: "Focus" },
    { href: "/groups", label: "Groups" },
    { href: "/messages", label: "Messages" },
    { href: "/meetings/create", label: "Meetings" },
    { href: "/reports/weekly", label: "Reports" },
  ];

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch { /* silent */ }
    }

    if (session?.user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* silent */ }
  }

  async function handleNotifClick(notif: Notification) {
    // Mark as read
    if (!notif.read) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [notif.id] }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch { /* silent */ }
    }

    // Navigate
    if (notif.linkUrl) {
      setShowNotifs(false);
      router.push(notif.linkUrl);
    }
  }

  function handleLogout() {
    signOut();
    setShowUserMenu(false);
    router.push("/Login");
  }

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
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative text-[#780000]/60 hover:text-[#780000] transition-all hover:scale-110 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#780000] rounded-full flex items-center justify-center text-[9px] font-black text-[#E9DABB] ring-2 ring-[#E9DABB] px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#780000]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-[#780000]/5">
                <h4 className="text-xs font-black text-[#780000] uppercase tracking-widest">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[#780000]/40 hover:text-[#780000] transition-colors uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[#780000]/30 text-xs font-bold">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full text-left px-4 py-3 hover:bg-[#780000]/5 transition-colors border-b border-[#780000]/5 last:border-0 ${
                        !notif.read ? "bg-[#780000]/[0.03]" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-[#780000] mt-1.5 flex-shrink-0"></div>
                        )}
                        <div className={!notif.read ? "" : "pl-5"}>
                          <p className="text-xs font-black text-[#780000] leading-tight">{notif.title}</p>
                          {notif.body && (
                            <p className="text-[10px] text-[#780000]/50 font-medium mt-0.5 leading-snug">{notif.body}</p>
                          )}
                          <p className="text-[9px] text-[#780000]/30 font-bold mt-1">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#780000] to-[#5c0000] flex items-center justify-center cursor-pointer shadow-xl hover:translate-y-[-2px] transition-all duration-300"
          >
            <span className="text-[#E9DABB] text-xs font-black">{userInitials}</span>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#780000]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="p-5 border-b border-[#780000]/5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#780000] to-[#5c0000] flex items-center justify-center shadow-lg">
                    <span className="text-[#E9DABB] text-sm font-black">{userInitials}</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-[#780000] truncate">{userName}</p>
                    <p className="text-[10px] text-[#780000]/40 font-bold truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#780000]/5 transition-colors text-[#780000]"
                >
                  <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                </Link>
                <Link
                  href="/groups"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#780000]/5 transition-colors text-[#780000]"
                >
                  <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span className="text-xs font-black uppercase tracking-widest">My Groups</span>
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#780000]/5 transition-colors text-[#780000]"
                >
                  <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span className="text-xs font-black uppercase tracking-widest">Messages</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-[#780000]/5 p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-red-600/60 hover:text-red-600 rounded-xl"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span className="text-xs font-black uppercase tracking-widest">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}