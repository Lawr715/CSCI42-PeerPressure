"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "@/app/actions/calendar";
import { Navbar } from "@/components/navbar";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
    <>
    <Navbar />
    <main className="min-h-screen bg-[#E9DABB] px-8 py-6">
      <div className="max-w-7xl mx-auto">

        {/* Calendar Card */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60">
          
          {/* Calendar Header Bar */}
          <div className="px-8 pt-10 pb-4">
            <FullCalendar
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
                  <div className="flex flex-col px-3 py-1 overflow-hidden">
                    {eventInfo.timeText && (
                      <div className="text-[10px] font-black opacity-60 leading-tight tracking-wider uppercase">
                        {eventInfo.timeText}
                      </div>
                    )}
                    <div 
                      className="text-[12px] leading-snug break-words whitespace-normal font-black text-[#780000]"
                      style={{ wordBreak: 'break-word' }}
                    >
                      {eventInfo.event.title}
                    </div>
                  </div>
                );
              }}

              headerToolbar={{
                left: "title prev,today,next",
                center: "",
                right: "dayGridMonth,timeGridWeek,timeGridDay addEventButton addTaskButton", 
              }}
              customButtons={{
                addEventButton: {
                  text: '+ Event',
                  click: function() {
                    router.push('/meetings/create');
                  }
                },
                addTaskButton: {
                  text: '+ Task',
                  click: function() {
                    router.push('/Tasklist/Create');
                  }
                }
              }}
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
              }}
              height="75vh"
              dayMaxEvents={3}
            />
          </div>

          {/* Legend */}
          <div className="px-10 py-6 border-t border-[#780000]/5 flex flex-wrap items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#780000] shadow-sm"></span>
              <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Hard Deadlines</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#D2691E] shadow-sm"></span>
              <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Soft Deadlines</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#059669] shadow-sm"></span>
              <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Confirmed Meetings</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#1E3A8A] shadow-sm"></span>
              <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Pending Polls</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-sm"></span>
              <span className="text-[10px] text-[#780000]/60 font-black uppercase tracking-widest">Google Tasks</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-10 text-[10px] text-[#780000]/40 font-black uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#780000] flex items-center justify-center shadow-lg">
              <span className="text-[#E9DABB] text-[8px] font-black">PP</span>
            </div>
            <span>Sovereign Scheduler © 2026</span>
          </div>
          <div className="flex gap-8">
            <span className="hover:text-[#780000] cursor-pointer transition-colors">Help Center</span>
            <span className="hover:text-[#780000] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#780000] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>

      </div>

      {/* FullCalendar Sovereign Overrides */}
      <style jsx global>{`
        .fc {
          --fc-border-color: rgba(120, 0, 0, 0.05);
          --fc-button-bg-color: rgba(120, 0, 0, 0.05);
          --fc-button-border-color: transparent;
          --fc-button-text-color: #780000;
          --fc-button-hover-bg-color: rgba(120, 0, 0, 0.1);
          --fc-button-hover-border-color: transparent;
          --fc-button-active-bg-color: #780000;
          --fc-button-active-border-color: #780000;
          --fc-button-active-text-color: #E9DABB !important;
          --fc-today-bg-color: rgba(120, 0, 0, 0.04);
          --fc-event-bg-color: rgba(120, 0, 0, 0.1);
          --fc-event-border-color: #780000;
          font-family: inherit;
        }
        .fc .fc-toolbar-title {
          font-size: 2rem !important;
          font-weight: 900 !important;
          color: #780000;
          letter-spacing: -0.05em;
        }
        .fc .fc-button {
          border-radius: 2rem !important;
          font-weight: 900 !important;
          font-size: 0.75rem !important;
          padding: 0.6rem 1.4rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em;
          transition: all 0.3s ease;
          outline: none !important;
          box-shadow: none !important;
          margin: 0 4px !important;
          border: 2px solid rgba(120, 0, 0, 0.1) !important;
          color: #780000 !important;
          background-color: transparent !important;
        }
        .fc .fc-button-primary.fc-button-active {
          background-color: #780000 !important;
          color: #E9DABB !important;
          border-color: #780000 !important;
          box-shadow: 0 4px 12px rgba(120, 0, 0, 0.2) !important;
        }
        .fc .fc-button-primary:hover:not(.fc-button-active) {
          background-color: rgba(120, 0, 0, 0.05) !important;
          border-color: rgba(120, 0, 0, 0.2) !important;
        }
        .fc .fc-addEventButton-button, .fc .fc-addTaskButton-button {
          background-color: #780000 !important;
          border-color: #780000 !important;
          color: #E9DABB !important;
          box-shadow: 0 4px 15px rgba(120, 0, 0, 0.2);
          margin-left: 8px !important;
        }
        .fc .fc-addEventButton-button:hover, .fc .fc-addTaskButton-button:hover {
          background-color: #5c0000 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(120, 0, 0, 0.3);
        }
        .fc .fc-col-header-cell-cushion {
          font-weight: 900;
          color: #780000;
          opacity: 0.4;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 10px 0;
        }
        .fc .fc-daygrid-day-number {
          font-weight: 900;
          color: #780000;
          font-size: 1rem;
          padding: 12px 14px;
          opacity: 0.8;
        }
        .fc .fc-day-today {
          background-color: rgba(120, 0, 0, 0.03) !important;
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          background-color: #780000;
          color: #E9DABB;
          border-radius: 12px;
          opacity: 1;
          box-shadow: 0 4px 10px rgba(120, 0, 0, 0.2);
        }
        .fc .fc-timegrid-slot-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #780000;
          opacity: 0.3;
          border: none !important;
        }
        .fc .fc-event {
          border-radius: 0.8rem !important;
          border: none !important;
          border-left: 6px solid var(--fc-event-border-color, #780000) !important;
          background: white !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important;
          margin-bottom: 4px !important;
          transition: all 0.2s ease;
        }
        .fc .fc-event:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 15px rgba(0,0,0,0.1) !important;
          z-index: 10;
        }
        .fc .fc-daygrid-day-frame {
          min-height: 120px;
        }
      `}</style>
    </main>
    </>
  );
}