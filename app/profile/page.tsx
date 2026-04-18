"use client";

import { useRouter } from "next/navigation"; 
import { useSession, signOut } from "@/lib/auth-client"; 
import { useState, useEffect } from "react"; 
import { getNextTask, getDashboardData } from "@/app/actions/task";

import { Navbar } from "@/components/navbar";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { TasklistWidget } from "@/components/dashboard/tasklist-widget";
import { PomodoroWidget } from "@/components/dashboard/pomodoro-widget";

export default function DashboardPage() {
  const router = useRouter(); 
  const { data: session, isPending } = useSession(); 
  
  const [nextTask, setNextTask] = useState<any>(null);
  const [streak, setStreak] = useState<number>(0);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/Login"); 
    } 
    if (session?.user) {
      getNextTask().then(setNextTask);
      getDashboardData().then(data => {
        if (data) {
          setStreak(data.streak);
          setTasks(data.upcomingTasks);
        }
      });
    }
  }, [isPending, session, router]); 
  
  if (isPending)
    return <><Navbar /><div className="min-h-screen bg-[#E9DABB] flex items-center justify-center text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading...</div></>; 
  if (!session?.user)
    return null; 

  const { user } = session; 


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
              <div className="text-orange-500 font-bold border-2 border-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-inner bg-white/50">
                🔥
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Daily Streak</span>
                <span className="font-black text-[#780000] leading-none">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
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
          <div className="xl:col-span-2 min-h-[450px]">
            <TasklistWidget tasks={tasks} />
          </div>

          {/* Column 2: Productivity Tools (Calendar & Pomodoro) */}
          <div className="xl:col-span-1 flex flex-col gap-8">
            <div className="h-64">
               <PomodoroWidget />
            </div>

            <div className="flex-1 min-h-[350px]">
               <CalendarWidget />
            </div>
          </div>
        </div>


      </div>
    </main>
    </>
  );
}