'use client'
import React, { useState, useEffect } from "react";
import Form from "next/form";
import { PomodoroForm } from "./pomodoroForm";

import { useRouter } from "next/navigation"; 
import { useSession, signOut } from "@/lib/auth-client"; 

// Source: https://www.youtube.com/watch?v=GA2LdsTmW1k
export function CountdownTimer(){
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [focusMinutes, setFocusMinutes] = useState(0);
    const [restMinutes, setRestMinutes] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const router = useRouter(); 
    const { data: session, isPending } = useSession(); 
    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/Login"); 
        } 
    }, [isPending, session, router]); 
    
    useEffect(() => {
        let interval;
        if (isRunning){
            interval = setInterval(() => {
                if (seconds > 0){
                    setSeconds((seconds) => seconds-1);
                } else if (minutes > 0){
                    setMinutes((minutes) => minutes-1);
                    setSeconds(59);
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

    const changeFocusMinutes=(e)=>{
        setFocusMinutes(e.target.value)
    }

    const changeRestMinutes=(e)=>{
        setRestMinutes(e.target.value)
    }

    function startFocusTimer(){
        setMinutes(focusMinutes);
        if (focusMinutes > 0){
           setIsRunning(true); 
        } else {
            setMinutes(focusMinutes);
        }
    }

    function startRestTimer(){
        setMinutes(restMinutes);
        if (restMinutes > 0){
           setIsRunning(true); 
        } else {
            setMinutes(25);
        }
    }

    function resumeTimer(){
        if (minutes > 0 || seconds > 0){
            setIsRunning(true);
        } else {
            setMinutes(focusMinutes)
        }
    }

    function pauseTimer(){
        setIsRunning(false);
    }

    function stopTimer(){
        resetTimer();
    }

    function resetTimer(){
        setIsRunning(false);
        setMinutes(focusMinutes);
        setSeconds(0);
    }
    
    const submitFormWithUserID = PomodoroForm.bind(null, user.id)
    
    return (
        <main>
            <h1>Welcome, {user.name || "User"}!</h1>
            <p>Your ID is: {user.id} </p>
            <div>
                {minutes} : {seconds}
            </div>

            <form action={submitFormWithUserID}>
            
            <div>
                <label>Focus Minutes</label>
                <input id="focusTime" name="focusTime" />
                <label>Rest Minutes</label>
                <input id="restTime" name="restTime" />
            </div>

            <button type="submit"> 
                Save Settings 
            </button>

            </form>
            
            <button onClick={startFocusTimer}> 
                Start Focus Timer 
            </button>

            <button onClick={startRestTimer}> 
                Start Rest Timer 
            </button>

            <button onClick={resumeTimer}> 
                Resume Timer 
            </button>

            <button onClick={pauseTimer}> 
                Pause Timer 
            </button>

            <button onClick={stopTimer}> 
                Stop Timer 
            </button>
        </main>
    )
}