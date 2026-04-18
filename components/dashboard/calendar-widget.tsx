"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "@/app/actions/calendar";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color: string;
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
    <div className="w-full bg-white/50 backdrop-blur-3xl text-[#780000] p-6 rounded-[2.5rem] shadow-xl border border-white h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 text-[#780000]">Calendar overview</h2>
        <Link href="/Calendar" className="text-[10px] font-black tracking-[0.2em] opacity-60 hover:opacity-100 transition-colors uppercase">
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
