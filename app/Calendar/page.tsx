"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"; // Added for the vertical grid
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "@/app/actions/calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadEvents() {
    
      try {
        const data = await getCalendarEvents();
        setEvents(data || []);
      } catch (e) {
        console.error("Auth/Data error:", e);
      }
    }
    
    loadEvents();
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#c4b69c] p-4">
      <div className="max-w-6xl mx-auto shadow-xl border-4 border-[#7b0a11]">
        <FullCalendar
          // Added timeGridPlugin here
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}

          allDaySlot={true}          
          allDayText="All Day"       
          displayEventEnd={true}     
          eventDisplay="block" 
          
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false 
          }}

          eventContent={(eventInfo) => {
            return (
              <div className="flex flex-col p-1 overflow-hidden">
                {eventInfo.timeText && (
                  <div className="text-[10px] font-bold opacity-80 leading-tight">
                    {eventInfo.timeText}
                  </div>
                )}
                <div 
                  className="text-[11px] leading-tight break-words whitespace-normal"
                  style={{ wordBreak: 'break-word' }}
                >
                  {eventInfo.event.title}
                </div>
              </div>
            );
          }}

          headerToolbar={{
            left: "prev,next",
            center: "title",
            // Changed dayGridWeek to timeGridWeek to show the vertical time axis
            right: "dayGridMonth,timeGridWeek", 
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week'
          }}
          height="85vh"
        />
      </div>

      {/* Google Calendar Style*/}
      <style jsx global>{`
        .fc .fc-timegrid-slot-label {
          font-size: 0.7rem;
          color: rgba(0,0,0,0.4);
          border: none !important;
        }
        .fc .fc-timegrid-axis-cushion {
          font-size: 0.7rem;
          color: rgba(0,0,0,0.4);
        }
      `}</style>
    </main>
  );
}