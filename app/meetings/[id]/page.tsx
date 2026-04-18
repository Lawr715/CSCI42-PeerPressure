"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

// Helper to generate 30-minute intervals between start and end time
function generateTimeSlots(startTime: string, endTime: string) {
    const slots = [];
    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (current < end) {
        const timeString = current.toTimeString().slice(0, 5);
        slots.push(timeString);
        current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
}

// Helper to get array of dates between start and end
function getDatesInRange(startDate: Date, endDate: Date) {
    const dates = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: meetingId } = use(params);
    const currentUserId = "user-1";

    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availabilities, setAvailabilities] = useState<Record<string, string>>({});

    useEffect(() => {
        async function fetchMeeting() {
            try {
                const res = await fetch(`/api/meetings/${meetingId}`);
                if (!res.ok) throw new Error("Failed to fetch meeting");
                const data = await res.json();
                setMeeting(data);

                const existingMap: Record<string, string> = {};
                data.availabilities?.forEach((av: any) => {
                    if (av.userId === currentUserId) {
                        const dateStr = new Date(av.date).toISOString().split('T')[0];
                        const key = `${dateStr}_${av.timeSlot}`;
                        existingMap[key] = av.status;
                    }
                });
                setAvailabilities(existingMap);
            } catch (error) {
                console.error("Error loading meeting:", error);
            } finally {
                setLoading(false);
            }
        }

        if (meetingId) fetchMeeting();
    }, [meetingId, currentUserId]);

    if (loading) return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-gray-500 font-medium">Loading meeting schedule...</div>;
    if (!meeting) return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-red-500 font-medium">Meeting not found</div>;

    const dates = getDatesInRange(new Date(meeting.startDate), new Date(meeting.endDate));
    const timeSlots = generateTimeSlots(meeting.startTime, meeting.endTime);

    const toggleSlot = (dateStr: string, timeStr: string) => {
        const key = `${dateStr}_${timeStr}`;
        setAvailabilities(prev => {
            const currentStatus = prev[key] || "Busy";
            const newStatus = currentStatus === "Free" ? "Busy" : "Free";
            return { ...prev, [key]: newStatus };
        });
    };

    const handleSave = async () => {
        setSaving(true);

        const payloadAvailabilities = Object.keys(availabilities).map(key => {
            const [date, timeSlot] = key.split('_');
            return { date, timeSlot, status: availabilities[key] };
        });

        try {
            const res = await fetch(`/api/meetings/${meetingId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUserId,
                    availabilities: payloadAvailabilities
                })
            });

            if (!res.ok) throw new Error("Failed to save availabilities");
            alert("Availabilities successfully saved!");
        } catch (error) {
            console.error(error);
            alert("Error saving availabilities.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-[#E9DABB] px-8 py-10 font-sans text-[#780000]">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase">{meeting.meetingName}</h1>
                        {meeting.meetingDescription && <p className="text-[#780000]/60 font-bold italic text-lg mt-2">{meeting.meetingDescription}</p>}
                        <div className="flex flex-wrap gap-4 mt-6">
                            <span className="bg-white/40 backdrop-blur-md border-2 border-[#780000]/10 px-6 py-2 rounded-2xl text-[10px] font-black text-[#780000] uppercase tracking-widest shadow-xl">
                                📅 {new Date(meeting.startDate).toLocaleDateString()} → {new Date(meeting.endDate).toLocaleDateString()}
                            </span>
                            <span className="bg-[#780000] px-6 py-2 rounded-2xl text-[10px] text-[#E9DABB] font-black uppercase tracking-widest shadow-xl">
                                🕐 {meeting.startTime.slice(0, 5)} – {meeting.endTime.slice(0, 5)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-[#780000]/5 border-2 border-[#780000]/10 text-[#780000] font-black rounded-2xl hover:bg-[#780000]/10 text-[10px] uppercase tracking-widest transition-all shadow-lg">
                            Extract Tasks
                        </button>
                        <button className="px-6 py-3 bg-white/40 border-2 border-[#780000]/10 text-[#780000] font-black rounded-2xl hover:bg-white/60 text-[10px] uppercase tracking-widest transition-all shadow-lg">
                            External Sync
                        </button>
                    </div>
                </div>

                {/* Availability Grid Card */}
                <div className="bg-white/30 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden">
                    <div className="p-10 border-b border-[#780000]/5">
                        <h2 className="text-2xl font-black tracking-tight">Focus Synchronization Grid</h2>
                        <p className="text-[#780000]/40 font-bold text-xs uppercase tracking-widest mt-1">Select your availability to coordinate collective focus.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                            <thead>
                                <tr>
                                    <th className="p-6 border-b border-r border-[#780000]/5 bg-[#780000]/5 font-black text-[#780000] w-32 sticky left-0 z-10 text-center text-[10px] uppercase tracking-[0.2em]">
                                        Time
                                    </th>
                                    {dates.map((date, idx) => (
                                        <th key={idx} className="p-6 border-b border-[#780000]/5 bg-[#780000]/5 font-black text-[#780000] text-center text-[10px] uppercase tracking-[0.2em]">
                                            {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map(timeStr => (
                                    <tr key={timeStr} className="hover:bg-white/20 transition-colors">
                                        <td className="p-4 border-b border-r border-[#780000]/5 font-black text-[#780000]/40 sticky left-0 bg-white/60 backdrop-blur-md z-10 text-center text-xs tracking-widest">
                                            {timeStr}
                                        </td>
                                        {dates.map((date, idx) => {
                                            const dateStr = date.toISOString().split('T')[0];
                                            const key = `${dateStr}_${timeStr}`;
                                            const isFree = availabilities[key] === "Free";

                                            return (
                                                <td
                                                    key={idx}
                                                    className="p-1.5 border-b border-[#780000]/5 cursor-pointer transition-all duration-300 group"
                                                    onClick={() => toggleSlot(dateStr, timeStr)}
                                                >
                                                    <div className={`w-full h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 transform group-active:scale-95 relative
                                                        ${isFree
                                                            ? 'bg-[#780000] border-[#780000] text-[#E9DABB] shadow-lg shadow-[#780000]/20'
                                                            : 'bg-white/40 border-dashed border-[#780000]/10 text-[#780000]/20 hover:border-[#780000]/30 hover:bg-white/60'}`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {isFree ? '✓ Free' : 'Set Free'}
                                                        </span>
                                                        {isFree && <span className="absolute text-[10px] font-black uppercase tracking-widest group-hover:hidden">Free</span>}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-between items-center py-6">
                    <button
                        onClick={() => router.back()}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/40 hover:text-[#780000] transition-colors"
                    >
                        ← Back to Calendar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-12 py-5 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl hover:bg-[#5c0000] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? "Synchronizing..." : "Save Availability"}
                    </button>
                </div>

            </div>
        </div>
        </>
    );
}
