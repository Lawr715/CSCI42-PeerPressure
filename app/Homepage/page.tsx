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

      <main className="min-h-screen bg-[#F5F5F5] p-8 text-black font-sans">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Greeting */}
          <div>
            <h1 className="text-4xl font-extrabold text-[#780000]">
              Yo, {user.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Ready to work?
            </p>
          </div>

          {/* Up Next Section */}
          <div className="bg-[#CE2632] rounded-2xl p-6 text-[#E9DABB] shadow-md flex justify-between items-center relative overflow-hidden">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80 block mb-2">
                Up Next
              </span>

              {/* Replace this with real task later */}
              <h2 className="text-2xl font-bold">
                {nextTask ? nextTask.taskName : "No tasks yet"}
              </h2>

              <p className="opacity-90">
                {nextTask
                  ? new Date(nextTask.hardDeadline).toLocaleString()
                  : "You're all caught up 🎉"}
              </p>
            </div>

            <button onClick={() => router.push("/Tasklist")} className="bg-[#E9DABB] text-[#780000] font-bold px-6 py-3 rounded-xl hover:bg-white transition">
              View Tasks
            </button>

            {/* background effect */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-lg mb-2">Quick Start</h3>
              <p className="text-gray-600 text-sm mb-4">
                Jump into your tasks or continue where you left off.
              </p>
              <button onClick={() => router.push("/Tasklist")} className="bg-[#780000] text-white px-4 py-2 rounded-lg hover:bg-[#5a0000]">
                Go to Tasklist
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-lg mb-2">Focus</h3>
              <p className="text-gray-600 text-sm mb-4">
                Start a Pomodoro session and get in the zone.
              </p>
              <button onClick={() => router.push("/Pomodoro")} className="bg-[#CE2632] text-white px-4 py-2 rounded-lg hover:opacity-90">
                Start Timer
              </button>
            </div>

          </div>

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl px-5 py-3 hover:bg-gray-50"
          >
            Log Out
          </button>

        </div>
      </main>
    </>
  );
}