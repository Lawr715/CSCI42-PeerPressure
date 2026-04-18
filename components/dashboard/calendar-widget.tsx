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
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl text-[#780000] p-6 rounded-[2.5rem] shadow-2xl border border-white/40 flex flex-col group transition-all duration-500 hover:bg-white/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#780000] opacity-100 mb-1">Calendar Overview</h2>
          <div className="w-8 h-[2px] bg-[#780000]/20 rounded-full"></div>
        </div>
        <Link href="/Calendar" className="text-[10px] font-black tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-[#780000] transition-all uppercase flex items-center gap-2">
          Full Room ↗
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
          dayMaxEvents={1}
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
            font-size: 0.65rem;
          }

          .dashboard-calendar-mini .fc .fc-toolbar {
            margin-bottom: 1rem !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .dashboard-calendar-mini .fc .fc-toolbar-title {
            font-size: 1.1rem !important;
            font-weight: 900 !important;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            color: #780000;
          }

          .dashboard-calendar-mini .fc .fc-button {
            padding: 0.4rem 0.8rem !important;
            border-radius: 12px !important;
            font-weight: 900 !important;
            font-size: 0.6rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em;
            border: 1px solid rgba(120, 0, 0, 0.1) !important;
            background: transparent !important;
            color: #780000 !important;
            transition: all 0.2s ease;
          }

          .dashboard-calendar-mini .fc .fc-button-primary:not(:disabled).fc-button-active {
            background-color: #780000 !important;
            color: #E9DABB !important;
            border-color: #780000 !important;
          }

          .dashboard-calendar-mini .fc .fc-button:hover {
            background: rgba(120, 0, 0, 0.05) !important;
          }

          .dashboard-calendar-mini .fc-theme-standard td, 
          .dashboard-calendar-mini .fc-theme-standard th {
            border: 0.5px solid rgba(120, 0, 0, 0.08) !important;
          }

          .dashboard-calendar-mini .fc .fc-col-header-cell-cushion {
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0.3;
            padding: 8px 0 !important;
            font-size: 0.55rem;
          }

          .dashboard-calendar-mini .fc .fc-daygrid-day-number {
            font-weight: 900;
            padding: 6px 8px !important;
            opacity: 0.8;
          }

          .dashboard-calendar-mini .fc .fc-day-today {
            background-color: rgba(120, 0, 0, 0.05) !important;
          }

          .dashboard-calendar-mini .fc .fc-day-today .fc-daygrid-day-number {
            background: #780000;
            color: #E9DABB;
            border-radius: 6px;
            opacity: 1;
          }

          .dashboard-calendar-mini .fc-event {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .dashboard-calendar-mini .fc-event-main {
            padding: 2px 4px !important;
            font-weight: 800 !important;
            font-size: 0.55rem !important;
          }

          /* Indicators for small grid */
          .dashboard-calendar-mini .fc-daygrid-event-harness {
            margin: 1px 2px !important;
          }

          /* Hide scrollbars but allow functional scroll */
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
