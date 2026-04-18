"use client";

import { useRouter } from "next/navigation"; 
import { useSession, signOut } from "@/lib/auth-client"; 
import { useState, useEffect } from "react"; 
import { getNextTask } from "@/app/actions/task";

import { Navbar } from "@/components/navbar";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { TasklistWidget } from "@/components/dashboard/tasklist-widget";
import { PomodoroWidget } from "@/components/dashboard/pomodoro-widget";

export default function DashboardPage() {
  const router = useRouter(); 
  const { data: session, isPending } = useSession(); 
  const [nextTask, setNextTask] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/Login"); 
    } 
    if (session?.user) {
      getNextTask().then(setNextTask);
    }
  }, [isPending, session, router]); 
  
  if (isPending)
    return <><Navbar /><div className="min-h-screen bg-[#E9DABB] flex items-center justify-center text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading...</div></>; 
  if (!session?.user)
    return null; 

  const { user } = session; 

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm(
      "WARNING: You are about to PERMANENTLY delete your account. This will destroy all your tasks, scheduled meetings, owned groups, and messages.\n\nAre you sure you want to proceed?"
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      "FINAL WARNING: This action cannot be undone. Is this really what you want?"
    );
    if (!confirm2) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      
      await signOut();
      router.push("/Register");
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting your account.");
      setDeleting(false);
    }
  };

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-[#E9DABB] p-8 text-[#780000] font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Header & Greeting Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Yo, {user.name?.split(' ')[0] || "User"}!
            </h1>
            <p className="text-lg text-[#780000]/60 mt-1 font-bold italic">Ready to command your focus today?</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/30 backdrop-blur-md border border-[#780000]/10 shadow-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="text-orange-500 font-bold border-2 border-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-inner">
                🔥
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Daily Streak</span>
                <span className="font-black text-[#780000] leading-none">12 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority "What's Next" Banner */}
        <div className="bg-[#780000] rounded-[2.5rem] p-8 text-[#E9DABB] shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden border border-[#780000]/10">
          <div className="z-10 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60 block mb-4">
              Current Objective
            </span>

            <h2 className="text-3xl font-black tracking-tight mb-2">
              {nextTask ? nextTask.taskName : "No tasks pending"}
            </h2>

            <p className="font-bold opacity-80 text-sm italic">
              {nextTask
                ? `Due ${new Date(nextTask.hardDeadline).toLocaleDateString()}`
                : "You've mastered your schedule 🎉"}
            </p>
          </div>

          <button 
            onClick={() => router.push("/Tasklist")} 
            className="mt-8 md:mt-0 z-10 bg-[#E9DABB] text-[#780000] font-black px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs"
          >
            Engage Tasks
          </button>

          {/* Abstract background shape for visual flair */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        </div>

        {/* Main 3-Part Widget Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Column 1: Tasklist & Kanban (Takes up 2 cols on large screens) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/40 p-2 flex-1 overflow-hidden min-h-[450px]">
              <TasklistWidget />
            </div>
          </div>

          {/* Column 2: Productivity Tools (Calendar & Pomodoro) */}
          <div className="xl:col-span-1 flex flex-col gap-8">
            <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/40 p-2 overflow-hidden">
               <PomodoroWidget />
            </div>

            <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/40 p-2 overflow-hidden flex-1 min-h-[400px]">
               <CalendarWidget />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-10">
          <div className="bg-red-50/50 backdrop-blur-md rounded-[2.5rem] p-8 border-2 border-red-500/20 text-center">
            <h3 className="text-xl font-black text-red-600 uppercase tracking-widest mb-2">Danger Zone</h3>
            <p className="text-sm font-bold text-red-600/70 mb-6 max-w-lg mx-auto">
              Permanently delete your Sovereign Command Hub account. This action cannot be undone and will erase all data.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-lg uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        </div>

      </div>
    </main>
    </>
  );
}