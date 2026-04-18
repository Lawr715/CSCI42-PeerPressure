'use client'
import React, { useState, useEffect } from "react";
import Form from "next/form";
import { PomodoroForm, PomodoroSettings } from "./pomodoroForm";

import { useRouter } from "next/navigation"; 
import { useSession, signOut } from "@/lib/auth-client"; 

export function CountdownTimer(){
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [restMinutes, setRestMinutes] = useState(5);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<'focus' | 'rest'>('focus');
    
    // Calculate total seconds for the progress ring
    const totalSeconds = mode === 'focus' ? focusMinutes * 60 : restMinutes * 60;
    const currentSeconds = (minutes * 60) + seconds;
    const progressPercent = isRunning ? ((totalSeconds - currentSeconds) / totalSeconds) * 100 : 0;
    
    const router = useRouter(); 
    const { data: session, isPending } = useSession(); 
    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/Login"); 
        } 
    }, [isPending, session, router]); 

    // Auto-load settings on mount - Moved to top level per Rules of Hooks
    useEffect(() => {
        if (session?.user?.id) {
            loadSettings();
        }
    }, [session?.user?.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning){
            interval = setInterval(() => {
                if (seconds > 0){
                    setSeconds((seconds) => seconds-1);
                } else if (minutes > 0){
                    setMinutes((minutes) => minutes-1);
                    setSeconds(59);
                } else {
                    // Timer finished
                    setIsRunning(false);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [seconds, minutes, isRunning]);

    
    if (isPending)
        return <p className="text-center mt-8 text-white">Loading...</p>;
    if (!session?.user){
        return <p> Redirecting </p>
    } 
    const { user } = session;

    const startTimer = (newMode: 'focus' | 'rest') => {
        setMode(newMode);
        setMinutes(newMode === 'focus' ? focusMinutes : restMinutes);
        setSeconds(0);
        setIsRunning(true);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setMinutes(mode === 'focus' ? focusMinutes : restMinutes);
        setSeconds(0);
    };

    const formatTime = (time: number) => time < 10 ? `0${time}` : time;
    const submitFormWithUserID = PomodoroForm.bind(null, user.id, focusMinutes, restMinutes)

    const loadSettings = async () => {
        try {
            const data = await PomodoroSettings(user.id);
            if (data && data.length > 0) {
                setFocusMinutes(data[0].focusTime);
                setRestMinutes(data[0].restTime);
                
                // If the timer isn't running, update the current display too
                if (!isRunning) {
                  setMinutes(mode === 'focus' ? data[0].focusTime : data[0].restTime);
                  setSeconds(0);
                }
            }
        } catch (error) {
            console.error("Failed to load Pomodoro settings:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-[#780000] min-h-[70vh] rounded-[3rem] shadow-2xl relative overflow-hidden border border-[#780000]/10">
            {/* Background elements */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none"></div>
            
            {/* Minimalist Top Nav for Pomodoro */}
            <div className="flex gap-4 mb-16 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl z-10 relative">
                <button 
                  onClick={() => { setMode('focus'); setIsRunning(false); setMinutes(focusMinutes); setSeconds(0); }}
                  className={`px-10 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${mode === 'focus' ? 'bg-[#E9DABB] text-[#780000] shadow-xl scale-105' : 'text-[#E9DABB]/60 hover:text-[#E9DABB] hover:bg-white/5'}`}
                >
                    Deep Focus
                </button>
                <button 
                  onClick={() => { setMode('rest'); setIsRunning(false); setMinutes(restMinutes); setSeconds(0); }}
                  className={`px-10 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${mode === 'rest' ? 'bg-[#E9DABB] text-[#780000] shadow-xl scale-105' : 'text-[#E9DABB]/60 hover:text-[#E9DABB] hover:bg-white/5'}`}
                >
                    Take a Break
                </button>
            </div>

            {/* Massive Circular Timer */}
            <div className="relative w-96 h-96 flex items-center justify-center mb-16 group z-10">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="1" className="opacity-10" />
                    {/* Progress track */}
                    <circle 
                        cx="50" cy="50" r="46" 
                        fill="none" 
                        stroke="#E9DABB" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeDasharray="289" 
                        strokeDashoffset={289 - (289 * progressPercent) / 100}
                        className="transition-all duration-1000 ease-linear shadow-white"
                    />
                </svg>

                {/* Time Display */}
                <div className="flex flex-col items-center z-10 relative">
                    <span className="text-[120px] leading-none font-black text-[#E9DABB] tracking-tighter drop-shadow-lg">
                        {formatTime(minutes)}:{formatTime(seconds)}
                    </span>
                    <span className="text-xl font-black tracking-widest uppercase text-[#E9DABB]/60 mt-2">
                        {mode === 'focus' ? 'Stay Focused' : 'Relax & Breathe'}
                    </span>
                </div>
            </div>

            {/* Primary Action Controls */}
            <div className="flex items-center gap-6 mb-16 z-10 relative">
                <button 
                    onClick={resetTimer}
                    className="w-16 h-16 rounded-full bg-white/10 text-[#E9DABB] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-white/20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>

                <button 
                    onClick={isRunning ? toggleTimer : () => startTimer(mode)}
                    className="w-24 h-24 rounded-full bg-[#E9DABB] text-[#780000] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    {isRunning ? (
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                    ) : (
                        <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                </button>

                <button 
                    onClick={() => startTimer(mode === 'focus' ? 'rest' : 'focus')}
                    className="w-16 h-16 rounded-full bg-white/10 text-[#E9DABB] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-white/20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                </button>
            </div>

            {/* Time Adjustments */}
            <div className="flex w-full max-w-2xl justify-between gap-8 pt-10 border-t border-white/10 z-10 relative">
                <div className="flex flex-col items-center gap-3 w-1/3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E9DABB]/60">Focus Target</span>
                    <div className="flex justify-between items-center w-full bg-white/10 px-4 py-2 rounded-2xl shadow-inner border border-white/10">
                        <button onClick={() => setFocusMinutes(Math.max(1, focusMinutes - 5))} className="text-[#E9DABB] hover:text-white font-black text-xl hover:scale-110 active:scale-90 transition-all">-</button>
                        <span className="w-10 text-center font-black text-xl text-[#E9DABB]">{focusMinutes}</span>
                        <button onClick={() => setFocusMinutes(focusMinutes + 5)} className="text-[#E9DABB] hover:text-white font-black text-xl hover:scale-110 active:scale-90 transition-all">+</button>
                    </div>
                </div>
                
                <div className="flex flex-col justify-end gap-3 w-1/3">
                    <form action={submitFormWithUserID} className="w-full">
                        <button 
                        type="submit"
                        className="w-full px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all bg-[#E9DABB] text-[#780000] hover:bg-white shadow-xl hover:-translate-y-1"
                        >
                            Save Spec
                        </button>
                    </form>

                    <button 
                    onClick={loadSettings}
                    className="w-full px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all bg-white/10 text-[#E9DABB] border border-white/20 hover:bg-white/20"
                    >
                        Load Spec
                    </button>
                </div>

                <div className="flex flex-col items-center gap-3 w-1/3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E9DABB]/60">Rest Target</span>
                    <div className="flex justify-between items-center w-full bg-white/10 px-4 py-2 rounded-2xl shadow-inner border border-white/10">
                        <button onClick={() => setRestMinutes(Math.max(1, restMinutes - 1))} className="text-[#E9DABB] hover:text-white font-black text-xl hover:scale-110 active:scale-90 transition-all">-</button>
                        <span className="w-10 text-center font-black text-xl text-[#E9DABB]">{restMinutes}</span>
                        <button onClick={() => setRestMinutes(restMinutes + 1)} className="text-[#E9DABB] hover:text-white font-black text-xl hover:scale-110 active:scale-90 transition-all">+</button>
                    </div>
                </div>
            </div>

        </div>
    )
}