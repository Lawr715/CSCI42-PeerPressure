"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function PomodoroWidget() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");

  const presets = { pomodoro: 25, short: 5, long: 15 };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          setIsRunning(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [seconds, minutes, isRunning]);

  const switchMode = (newMode: "pomodoro" | "short" | "long") => {
    setMode(newMode);
    setIsRunning(false);
    setMinutes(presets[newMode]);
    setSeconds(0);
  };

  const formatTime = (t: number) => (t < 10 ? `0${t}` : t);

  return (
    <div className="bg-[#780000] text-[#E9DABB] shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-center h-full border border-[##780000]/10 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 text-[#E9DABB]">Focus Timer</h3>
        <Link href="/Pomodoro" className="text-[10px] font-black tracking-[0.2em] opacity-60 hover:opacity-100 transition-colors uppercase">
          Full Screen ↗
        </Link>
      </div>

      <div className="text-7xl font-black tracking-tighter mb-8 text-[#E9DABB] drop-shadow-xl z-10">
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        {/* Reset */}
        <button
          onClick={() => { setIsRunning(false); setMinutes(presets[mode]); setSeconds(0); }}
          className="w-12 h-12 rounded-2xl bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => {
            if (!isRunning && minutes === 0 && seconds === 0) {
              setMinutes(presets[mode]);
            }
            setIsRunning(!isRunning);
          }}
          className="w-16 h-16 rounded-[1.5rem] bg-[#E9DABB] text-[#780000] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all z-10"
        >
          {isRunning ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        {/* Skip */}
        <button
          onClick={() => {
            const nextMode = mode === "pomodoro" ? "short" : mode === "short" ? "long" : "pomodoro";
            switchMode(nextMode);
          }}
          className="w-12 h-12 rounded-2xl bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 w-full">
        {[
          { key: "pomodoro" as const, label: "Pomodoro" },
          { key: "short" as const, label: "Short Break" },
          { key: "long" as const, label: "Long Break" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchMode(tab.key)}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase transition-all z-10 ${
              mode === tab.key
                ? "bg-[#E9DABB] text-[#780000] shadow-md scale-105"
                : "bg-[#780000]/40 border border-[#E9DABB]/10 text-[#E9DABB]/60 hover:bg-[#780000]/60 hover:text-[#E9DABB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
