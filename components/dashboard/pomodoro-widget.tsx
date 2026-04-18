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
    <div className="bg-[#780000] text-[#E9DABB] shadow-2xl rounded-[3rem] p-6 flex flex-col justify-between h-full border border-[##780000]/10 relative overflow-hidden group">
      {/* Decorative background circle */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

      {/* Header */}
      <div className="w-full flex justify-between items-center z-10 px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80 text-[#E9DABB]">Focus Timer</h3>
        <Link href="/Pomodoro" className="text-[10px] font-black tracking-[0.2em] opacity-50 hover:opacity-100 transition-all uppercase flex items-center gap-2">
          Full Room ↗
        </Link>
      </div>

      {/* Timer Display */}
      <div className="flex justify-center items-center flex-1 my-4 z-10">
        <div className="text-[5rem] leading-none font-black tracking-tighter text-[#E9DABB] drop-shadow-xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(minutes)}:{formatTime(seconds)}
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full flex flex-col gap-5 z-10">
        
        {/* Play / Pause / Reset / Skip */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => { setIsRunning(false); setMinutes(presets[mode]); setSeconds(0); }}
            className="w-12 h-12 rounded-[1rem] bg-black/20 text-[#E9DABB]/60 flex items-center justify-center hover:bg-black/30 hover:text-[#E9DABB] transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>

          <button
            onClick={() => {
              if (!isRunning && minutes === 0 && seconds === 0) {
                setMinutes(presets[mode]);
              }
              setIsRunning(!isRunning);
            }}
            className="w-16 h-16 rounded-full bg-[#E9DABB] text-[#780000] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isRunning ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            ) : (
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button
            onClick={() => {
              const nextMode = mode === "pomodoro" ? "short" : mode === "short" ? "long" : "pomodoro";
              switchMode(nextMode);
            }}
            className="w-12 h-12 rounded-[1rem] bg-black/20 text-[#E9DABB]/60 flex items-center justify-center hover:bg-black/30 hover:text-[#E9DABB] transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Mode Tabs (Integrated Pill Container) */}
        <div className="flex bg-black/20 backdrop-blur-sm p-1.5 rounded-[1.25rem] w-full">
          {[
            { key: "pomodoro" as const, label: "Pomodoro" },
            { key: "short" as const, label: "Short" },
            { key: "long" as const, label: "Long" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchMode(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center ${
                mode === tab.key
                  ? "bg-[#E9DABB] text-[#780000] shadow-md"
                  : "text-[#E9DABB]/60 hover:text-[#E9DABB] hover:bg-white/5"
              }`}
            >
              <span className="translate-y-[1px]">{tab.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
