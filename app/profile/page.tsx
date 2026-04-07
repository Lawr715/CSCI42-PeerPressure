"use client";

import { useRouter } from "next/navigation"; 
import { useSession, signOut } from "@/lib/auth-client"; 
import { useEffect } from "react"; 

import { Navbar } from "@/components/navbar";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { TasklistWidget } from "@/components/dashboard/tasklist-widget";
import { PomodoroWidget } from "@/components/dashboard/pomodoro-widget";

export default function DashboardPage() {
  const router = useRouter(); 
  const { data: session, isPending } = useSession(); 

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/Login"); 
    } 
  }, [isPending, session, router]); 
  
  if (isPending)
    return <p className="text-center mt-8 text-black">Loading...</p>; 
  if (!session?.user)
    return <p className="text-center mt-8 text-black">Redirecting...</p>; 

  const { user } = session; 

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-[#F5F5F5] p-8 text-black font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Greeting Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#780000]">
              Yo, {user.name?.split(' ')[0] || "User"}!
            </h1>
            <p className="text-lg text-gray-600 mt-1 font-medium">Ready to crush your goals today?</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="text-red-500 font-bold border-2 border-red-500 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                🔥
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Daily Streak</span>
                <span className="font-bold text-gray-900 leading-none">12 Days</span>
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              className="bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl px-5 py-3 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Priority "What's Next" Banner */}
        <div className="bg-[#780000] rounded-2xl p-6 text-[#E9DABB] shadow-md flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-sm font-bold tracking-widest uppercase opacity-80 block mb-2">Up Next</span>
            <h2 className="text-2xl font-bold mb-1">Review Q3 Sales Deck</h2>
            <p className="opacity-90 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Starts in 15 mins
            </p>
          </div>
          <div className="hidden md:block relative z-10">
            <button className="bg-[#E9DABB] text-[#780000] font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors shadow-sm">
              Start Work
            </button>
          </div>
          {/* Abstract background shape for visual flair */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
        </div>

        {/* Main 3-Part Widget Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Column 1: Tasklist & Kanban (Takes up 2 cols on large screens) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex-1 overflow-hidden min-h-[450px]">
              <TasklistWidget />
            </div>

          </div>

          {/* Column 2: Productivity Tools (Calendar & Pomodoro) */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 overflow-hidden">
               <PomodoroWidget />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 overflow-hidden flex-1 min-h-[400px]">
               <CalendarWidget />
            </div>

          </div>
        </div>

      </div>
    </main>
    </>
  );
}