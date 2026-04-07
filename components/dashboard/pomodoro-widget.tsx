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
    <div className="bg-[#2D0000] text-white rounded-xl p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#E9DABB]/80">Focus Timer</h3>
        <Link href="/Pomodoro" className="text-xs font-semibold text-[#E9DABB]/60 hover:text-[#E9DABB] transition-colors">
          Full Screen ↗
        </Link>
      </div>

      {/* Timer Display */}
      <div className="text-6xl font-black tracking-tight mb-6 text-white">
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        {/* Reset */}
        <button
          onClick={() => { setIsRunning(false); setMinutes(presets[mode]); setSeconds(0); }}
          className="w-10 h-10 rounded-full bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-colors"
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
          className="w-14 h-14 rounded-full bg-[#780000] text-[#E9DABB] flex items-center justify-center shadow-lg hover:bg-[#5c0000] transition-colors"
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
          className="w-10 h-10 rounded-full bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-colors"
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
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === tab.key
                ? "bg-[#780000] text-[#E9DABB]"
                : "bg-white/10 text-white/60 hover:bg-white/15"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
