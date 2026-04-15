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
        <div className="flex flex-col items-center justify-center p-8 bg-[#E9DABB] min-h-[80vh] rounded-3xl shadow-inner max-w-4xl mx-auto border-8 border-white">
            
            {/* Minimalist Top Nav for Pomodoro */}
            <div className="flex gap-4 mb-12 bg-white/50 p-2 rounded-full backdrop-blur-sm border border-white/60 shadow-sm">
                <button 
                  onClick={() => { setMode('focus'); setIsRunning(false); setMinutes(focusMinutes); setSeconds(0); }}
                  className={`px-8 py-3 rounded-full font-bold transition-all ${mode === 'focus' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-[#780000] hover:bg-white/60'}`}
                >
                    Deep Focus
                </button>
                <button 
                  onClick={() => { setMode('rest'); setIsRunning(false); setMinutes(restMinutes); setSeconds(0); }}
                  className={`px-8 py-3 rounded-full font-bold transition-all ${mode === 'rest' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-[#780000] hover:bg-white/60'}`}
                >
                    Take a Break
                </button>
            </div>

            {/* Massive Circular Timer */}
            <div className="relative w-96 h-96 flex items-center justify-center mb-16 group">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" className="opacity-50" />
                    {/* Progress track */}
                    <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#780000" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * progressPercent) / 100}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                {/* Time Display */}
                <div className="flex flex-col items-center">
                    <span className="text-[120px] leading-none font-black text-[#780000] tracking-tighter">
                        {formatTime(minutes)}:{formatTime(seconds)}
                    </span>
                    <span className="text-xl font-medium tracking-widest uppercase text-[#780000]/70 mt-2">
                        {mode === 'focus' ? 'Stay Focused' : 'Relax & Breathe'}
                    </span>
                </div>
            </div>

            {/* Primary Action Controls */}
            <div className="flex items-center gap-6 mb-16">
                <button 
                    onClick={resetTimer}
                    className="w-16 h-16 rounded-full bg-white text-[#780000] flex items-center justify-center shadow-md hover:scale-105 transition-transform border border-transparent hover:border-[#780000]/20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>

                <button 
                    onClick={isRunning ? toggleTimer : () => startTimer(mode)}
                    className="w-24 h-24 rounded-full bg-[#780000] text-[#E9DABB] flex items-center justify-center shadow-xl hover:scale-105 hover:bg-[#5c0000] transition-all"
                >
                    {isRunning ? (
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                    ) : (
                        <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                </button>

                <button 
                    onClick={() => startTimer(mode === 'focus' ? 'rest' : 'focus')}
                    className="w-16 h-16 rounded-full bg-white text-[#780000] flex items-center justify-center shadow-md hover:scale-105 transition-transform border border-transparent hover:border-[#780000]/20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                </button>
            </div>

            {/* Time Adjustments */}
            <div className="flex w-full max-w-lg justify-between gap-12 pt-8 border-t border-[#780000]/10">
                <div className="flex flex-col items-center gap-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#780000]/60">Focus Time</span>
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm">
                        <button onClick={() => setFocusMinutes(Math.max(1, focusMinutes - 5))} className="text-[#780000] hover:text-[#5c0000] font-black text-xl">-</button>
                        <span className="w-10 text-center font-bold text-xl text-gray-800">{focusMinutes}</span>
                        <button onClick={() => setFocusMinutes(focusMinutes + 5)} className="text-[#780000] hover:text-[#5c0000] font-black text-xl">+</button>
                    </div>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                <form action={submitFormWithUserID}>
                <button 
                  type="submit"
                  className={`px-4 py-3 rounded-full font-bold transition-all ${mode === 'focus' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-[#780000] hover:bg-white/60'}`}
                >
                    Save Settings
                </button>
                </form>

                <button 
                  onClick={loadSettings}
                  className={`px-4 py-3 rounded-full font-bold transition-all ${mode === 'focus' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-[#780000] hover:bg-white/60'}`}
                >
                    Load Settings
                </button>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#780000]/60">Rest Time</span>
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm">
                        <button onClick={() => setRestMinutes(Math.max(1, restMinutes - 1))} className="text-[#780000] hover:text-[#5c0000] font-black text-xl">-</button>
                        <span className="w-10 text-center font-bold text-xl text-gray-800">{restMinutes}</span>
                        <button onClick={() => setRestMinutes(restMinutes + 1)} className="text-[#780000] hover:text-[#5c0000] font-black text-xl">+</button>
                    </div>
                </div>
            </div>

        </div>
    )
}