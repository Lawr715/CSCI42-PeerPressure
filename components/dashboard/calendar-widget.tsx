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
        if (e.message?.includes("Google account not connected")) {
            setEvents([]);
        }
      }
    }
    loadEvents();
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl text-[#780000] p-8 rounded-[3rem] shadow-2xl border border-white/40 flex flex-col group transition-all duration-500 hover:bg-white/30">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-[#780000] opacity-100 mb-2">Calendar Overview</h2>
          <div className="w-12 h-[3px] bg-[#780000]/20 rounded-full"></div>
        </div>
        <Link href="/Calendar" className="text-[10px] font-black tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-[#780000] transition-all uppercase flex items-center gap-3">
          Sovereign View ↗
        </Link>
      </div>
      
      <div className="flex-1 overflow-hidden relative dashboard-calendar-mini">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          allDaySlot={true}          
          displayEventEnd={true}     
          eventDisplay="block" 
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek", 
          }}
          height="100%"
          dayMaxEvents={2}
          stickyHeaderDates={true}
        />

        <style jsx global>{`
          .dashboard-calendar-mini .fc {
            --fc-border-color: rgba(120, 0, 0, 0.08);
            --fc-button-bg-color: rgba(120, 0, 0, 0.05);
            --fc-button-hover-bg-color: rgba(120, 0, 0, 0.1);
            --fc-button-active-bg-color: #780000;
            --fc-today-bg-color: rgba(120, 0, 0, 0.03);
            font-family: inherit;
            font-size: 0.75rem;
          }

          .dashboard-calendar-mini .fc .fc-toolbar {
            margin-bottom: 1.5rem !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }

          .dashboard-calendar-mini .fc .fc-toolbar-title {
            font-size: 1.5rem !important;
            font-weight: 900 !important;
            text-transform: uppercase;
            letter-spacing: -0.05em;
            color: #780000;
            padding: 0 0.5rem;
          }

          .dashboard-calendar-mini .fc .fc-button {
            padding: 0.6rem 1.2rem !important;
            border-radius: 16px !important;
            font-weight: 900 !important;
            font-size: 0.7rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.15em;
            border: 1px solid rgba(120, 0, 0, 0.1) !important;
            background: transparent !important;
            color: #780000 !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: none !important;
          }

          .dashboard-calendar-mini .fc .fc-button-primary:not(:disabled).fc-button-active {
            background-color: #780000 !important;
            color: #E9DABB !important;
            border-color: #780000 !important;
            box-shadow: 0 4px 12px rgba(120, 0, 0, 0.2) !important;
          }

          .dashboard-calendar-mini .fc .fc-button:hover {
            background: rgba(120, 0, 0, 0.08) !important;
            transform: translateY(-1px);
          }

          .dashboard-calendar-mini .fc-theme-standard td, 
          .dashboard-calendar-mini .fc-theme-standard th {
            border: 0.5px solid rgba(120, 0, 0, 0.06) !important;
          }

          .dashboard-calendar-mini .fc .fc-col-header-cell-cushion {
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            opacity: 0.4;
            padding: 12px 0 !important;
            font-size: 0.65rem;
          }

          .dashboard-calendar-mini .fc .fc-daygrid-day-number {
            font-weight: 900;
            padding: 10px 12px !important;
            opacity: 0.8;
            font-size: 0.9rem;
          }

          .dashboard-calendar-mini .fc .fc-day-today {
            background-color: rgba(120, 0, 0, 0.04) !important;
          }

          .dashboard-calendar-mini .fc .fc-day-today .fc-daygrid-day-number {
            background: #780000;
            color: #E9DABB;
            border-radius: 10px;
            opacity: 1;
            box-shadow: 0 4px 10px rgba(120, 0, 0, 0.2);
          }

          .dashboard-calendar-mini .fc-event {
            border: none !important;
            background: #780000 !important;
            border-radius: 6px !important;
            margin: 1px 2px !important;
          }

          .dashboard-calendar-mini .fc-event-main {
            padding: 3px 6px !important;
            font-weight: 800 !important;
            font-size: 0.6rem !important;
            color: #E9DABB !important;
          }

          .dashboard-calendar-mini .fc-daygrid-event-harness {
            margin: 2px 4px !important;
          }

          .dashboard-calendar-mini .fc-scroller {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .dashboard-calendar-mini .fc-scroller::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
