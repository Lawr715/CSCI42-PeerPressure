"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "@/app/actions/calendar";
import { Navbar } from "@/components/navbar";

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
    <>
    <Navbar />
    <main className="min-h-screen bg-[#F4F4F4] px-8 py-6">
      <div className="max-w-7xl mx-auto">

        {/* Calendar Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          
          {/* Calendar Header Bar */}
          <div className="px-6 pt-6 pb-2">
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
                  <div className="flex flex-col px-2 py-0.5 overflow-hidden">
                    {eventInfo.timeText && (
                      <div className="text-[10px] font-bold opacity-80 leading-tight">
                        {eventInfo.timeText}
                      </div>
                    )}
                    <div 
                      className="text-[11px] leading-tight break-words whitespace-normal font-semibold"
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
                right: "dayGridMonth,timeGridWeek,timeGridDay addEventButton", 
              }}
              customButtons={{
                addEventButton: {
                  text: '+ Event',
                  click: function() {
                    alert('Add Event clicked');
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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C]"></span>
              <span className="text-xs text-gray-600 font-medium">Hard Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D2691E]"></span>
              <span className="text-xs text-gray-600 font-medium">Soft Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span className="text-xs text-gray-600 font-medium">Meetings</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#BE123C] flex items-center justify-center">
              <span className="text-white text-[8px] font-black">PP</span>
            </div>
            <span>Peer Pressure © 2024</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gray-600 cursor-pointer">Help Center</span>
            <span className="hover:text-gray-600 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms</span>
          </div>
        </div>

      </div>

      {/* FullCalendar Stitch-matched Overrides */}
      <style jsx global>{`
        .fc {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: #f3f4f6;
          --fc-button-border-color: #d1d5db;
          --fc-button-text-color: #374151;
          --fc-button-hover-bg-color: #e5e7eb;
          --fc-button-hover-border-color: #9ca3af;
          --fc-button-active-bg-color: #BE123C;
          --fc-button-active-border-color: #BE123C;
          --fc-button-active-text-color: #ffffff;
          --fc-today-bg-color: rgba(190, 18, 60, 0.04);
          --fc-event-bg-color: #BE123C;
          --fc-event-border-color: #BE123C;
          font-family: inherit;
        }
        .fc .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 800 !important;
          color: #111827;
        }
        .fc .fc-button {
          border-radius: 0.5rem !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
          padding: 0.35rem 0.85rem !important;
          text-transform: capitalize !important;
        }
        .fc .fc-addEventButton-button {
          background-color: #BE123C !important;
          border-color: #BE123C !important;
          color: white !important;
          border-radius: 0.5rem !important;
          font-weight: 700 !important;
        }
        .fc .fc-addEventButton-button:hover {
          background-color: #9f1239 !important;
          border-color: #9f1239 !important;
        }
        .fc .fc-col-header-cell-cushion {
          font-weight: 700;
          color: #6b7280;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .fc .fc-daygrid-day-number {
          font-weight: 600;
          color: #374151;
          font-size: 0.85rem;
          padding: 6px 8px;
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          background-color: #BE123C;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fc .fc-timegrid-slot-label {
          font-size: 0.7rem;
          color: rgba(0,0,0,0.4);
          border: none !important;
        }
        .fc .fc-timegrid-axis-cushion {
          font-size: 0.7rem;
          color: rgba(0,0,0,0.4);
        }
        .fc .fc-event {
          border-radius: 0.25rem !important;
          font-size: 0.75rem !important;
          border: none !important;
        }
        .fc .fc-daygrid-day-frame {
          min-height: 100px;
        }
      `}</style>
    </main>
    </>
  );
}