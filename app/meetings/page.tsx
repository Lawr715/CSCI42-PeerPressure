"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";

export default function MeetingsPortal() {
    const router = useRouter();
    const { data: session } = useSession();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMeetings() {
            try {
                const res = await fetch("/api/meetings");
                if (res.ok) {
                    const data = await res.json();
                    setMeetings(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (session?.user) {
            fetchMeetings();
        }
    }, [session]);

    if (loading) return <><Navbar /><div className="min-h-screen bg-[#E9DABB] flex items-center justify-center text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading meetings...</div></>;

    const upcomingMeetings = meetings.filter(m => !m.isFinalized);
    const finalizedMeetings = meetings.filter(m => m.isFinalized);

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-[#E9DABB] px-8 py-10 font-sans text-[#780000]">
            <div className="max-w-6xl mx-auto space-y-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase">Meetings Portal</h1>
                        <p className="text-[#780000]/60 font-bold italic text-lg mt-2">Coordinate your group schedules in real-time.</p>
                    </div>
                    <button
                        onClick={() => router.push("/meetings/create")}
                        className="px-8 py-4 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#5c0000] hover:scale-105 active:scale-95 transition-all"
                    >
                        + Create Encounter
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Active Voting */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
                            <h2 className="text-xl font-black uppercase tracking-widest">Active Polling</h2>
                        </div>
                        {upcomingMeetings.length === 0 ? (
                            <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] border border-white/40 p-10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/30">No active polls</p>
                            </div>
                        ) : upcomingMeetings.map(meeting => (
                            <div 
                                key={meeting.id}
                                onClick={() => router.push(`/meetings/${meeting.id}`)}
                                className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/40 p-8 cursor-pointer hover:bg-white/50 transition-all hover:-translate-y-1 hover:shadow-2xl group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-black tracking-tight group-hover:text-[#780000] transition-colors">{meeting.meetingName}</h3>
                                    {meeting.group && (
                                        <span className="bg-black/5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#780000]/60">
                                            {meeting.group.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-[#780000]/60 italic mb-6">
                                    {meeting.meetingDescription || "No description."}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[10px] font-black bg-[#780000]/5 text-[#780000] px-3 py-1.5 rounded-lg tracking-widest uppercase">
                                        📅 {new Date(meeting.startDate).toLocaleDateString()} - {new Date(meeting.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Finalized Meetings */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <h2 className="text-xl font-black uppercase tracking-widest opacity-60">Locked Encounters</h2>
                        </div>
                        {finalizedMeetings.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-[#780000]/10 p-10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/30">No locked meetings</p>
                            </div>
                        ) : finalizedMeetings.map(meeting => (
                            <div 
                                key={meeting.id}
                                onClick={() => router.push(`/meetings/${meeting.id}`)}
                                className="bg-[#780000] text-[#E9DABB] rounded-[2.5rem] shadow-xl border border-[#780000]/10 p-8 cursor-pointer hover:bg-[#5c0000] transition-all hover:-translate-y-1 relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <h3 className="text-2xl font-black tracking-tight">{meeting.meetingName}</h3>
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-2xl font-black">
                                        {new Date(meeting.finalDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest">
                                        @ {meeting.finalTimeSlot}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div>
        </>
    );
}
