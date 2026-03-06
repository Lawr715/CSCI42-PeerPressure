'use client'
import React, { useState, useEffect } from "react";

export function CountdownTimer(){
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    
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
    
    const changeSeconds=(e)=>{
        setSeconds(e.target.value)
    }
    const changeMinutes=(e)=>{
        setMinutes(e.target.value)
    }

    function startTimer(){
        if (minutes != 0 || seconds != 0){
           setIsRunning(true); 
        } else {
            setMinutes(25);
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
        setMinutes(25);
        setSeconds(0);
    }

    return (
        <main>
            <div>Countdown Timer</div>
            <div>
                <label>Minutes</label>
                <input value={minutes} onChange={changeMinutes} />
            </div>
            <div>
                <label>Seconds</label>
                <input value={seconds} onChange={changeSeconds} />
            </div>

            {!isRunning && (
                <button onClick={startTimer}> 
                    Start Timer 
                </button>
            )}
            {isRunning && (
                <button onClick={pauseTimer}> 
                    Pause Timer 
                </button>
            )}
            <button onClick={stopTimer}> 
                Stop Timer 
            </button>
        </main>
    )
}