"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { getNextTask } from "@/app/actions/task";

import { Navbar } from "@/components/navbar";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [nextTask, setNextTask] = useState<any>(null);

  useEffect(() => {
  if (!isPending && !session?.user) {
      router.push("/Login"); 
    } 
  if (session?.user) {
    getNextTask().then(setNextTask);
  }
}, [session]);

  if (isPending)
    return <p className="text-center mt-8 text-black">Loading...</p>;

  if (!session?.user)
    return <p className="text-center mt-8 text-black">Redirecting...</p>;

  const { user } = session;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#E9DABB] p-8 text-[#780000] font-sans">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Greeting */}
          <div className="pt-8">
            <h1 className="text-5xl font-black text-[#780000] tracking-tighter">
              Yo, {user.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-xl text-[#780000]/60 mt-3 font-bold italic">
              Ready to command your focus?
            </p>
          </div>

          {/* Up Next Section */}
          <div className="bg-[#780000] rounded-[2.5rem] p-10 text-[#E9DABB] shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden border border-[#780000]/10">
            <div className="z-10 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60 block mb-4">
                Current Objective
              </span>

              <h2 className="text-4xl font-black tracking-tight mb-2">
                {nextTask ? nextTask.taskName : "No tasks yet"}
              </h2>

              <p className="font-bold opacity-80 text-lg italic">
                {nextTask
                  ? `Due ${new Date(nextTask.hardDeadline).toLocaleDateString()}`
                  : "You've mastered your schedule 🎉"}
              </p>
            </div>

            <button 
              onClick={() => router.push("/Tasklist")} 
              className="mt-8 md:mt-0 z-10 bg-[#E9DABB] text-[#780000] font-black px-10 py-5 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs"
            >
              Engage Tasks
            </button>

            {/* background effect */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]"></div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">

            <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-10 group hover:bg-white/40 transition-all">
              <h3 className="font-black text-2xl mb-3 tracking-tight">Quick Start</h3>
              <p className="text-[#780000]/70 font-bold mb-8">
                Jump into your tasks or continue where you left off.
              </p>
              <button 
                onClick={() => router.push("/Tasklist")} 
                className="w-full md:w-auto bg-[#780000] text-[#E9DABB] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#5c0000] transition-all"
              >
                Go to Tasklist
              </button>
            </div>

            <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-10 group hover:bg-white/40 transition-all">
              <h3 className="font-black text-2xl mb-3 tracking-tight">Focus Zone</h3>
              <p className="text-[#780000]/70 font-bold mb-8">
                Start a Pomodoro session and get in the zone.
              </p>
              <button 
                onClick={() => router.push("/Pomodoro")} 
                className="w-full md:w-auto bg-[#780000] text-[#E9DABB] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#5c0000] transition-all"
              >
                Start Timer
              </button>
            </div>

          </div>

          {/* Logout */}
          <div className="flex justify-center pt-8">
            <button
              onClick={() => signOut()}
              className="bg-[#780000]/5 text-[#780000]/40 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl px-12 py-4 hover:bg-[#780000]/10 hover:text-[#780000] transition-all"
            >
              Log Out
            </button>
          </div>

        </div>
      </main>
    </>
  );
}