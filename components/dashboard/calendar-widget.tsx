"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "@/app/actions/calendar";

export function CalendarWidget() {
  const [events, setEvents] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadEvents() {
      try {
        const data = await getCalendarEvents();
        setEvents(data || []);
      } catch (e: any) {
        console.error("Auth/Data error:", e);
        // If the error is specifically the Google token missing error
        if (e.message?.includes("Google account not connected")) {
            setEvents([]);
            // We can optionally set an internal error state here to show a message later
        }
      }
    }
    loadEvents();
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full bg-white text-black p-4 rounded shadow h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg">Calendar overview</h2>
        <Link href="/Calendar" className="text-sm text-blue-600 hover:underline">
          Full Screen ↗
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        allDaySlot={true}          
        allDayText="All Day"       
        displayEventEnd={true}     
        eventDisplay="block" 
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek", 
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week'
        }}
        height="100%"
        />
      </div>
    </div>
  );
}
