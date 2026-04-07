"use client";

import { useEffect, useState, use } from "react";
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
    }, [meetingId]);

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
        <div className="min-h-screen bg-[#F9F5F1] px-8 py-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">{meeting.meetingName}</h1>
                        {meeting.meetingDescription && <p className="text-gray-500 font-medium mt-1">{meeting.meetingDescription}</p>}
                        <div className="flex gap-3 mt-3">
                            <span className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                                📅 {new Date(meeting.startDate).toLocaleDateString()} → {new Date(meeting.endDate).toLocaleDateString()}
                            </span>
                            <span className="bg-[#BE123C] px-4 py-1.5 rounded-full text-xs text-white font-bold shadow-sm">
                                🕐 {meeting.startTime.slice(0, 5)} – {meeting.endTime.slice(0, 5)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors shadow-sm">
                            Auto-fill from Tasks
                        </button>
                        <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors shadow-sm">
                            Sync Google Calendar
                        </button>
                    </div>
                </div>

                {/* Availability Grid */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="p-3 border-b border-r border-gray-100 bg-gray-50 font-bold text-gray-600 w-24 sticky left-0 z-10 text-center text-xs uppercase tracking-wider">
                                        Time
                                    </th>
                                    {dates.map((date, idx) => (
                                        <th key={idx} className="p-3 border-b border-gray-100 bg-gray-50 font-bold text-gray-600 text-center text-xs uppercase tracking-wider">
                                            {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map(timeStr => (
                                    <tr key={timeStr} className="hover:bg-gray-50/30">
                                        <td className="p-2 border-b border-r border-gray-100 font-semibold text-gray-500 sticky left-0 bg-white z-10 text-center text-sm">
                                            {timeStr}
                                        </td>
                                        {dates.map((date, idx) => {
                                            const dateStr = date.toISOString().split('T')[0];
                                            const key = `${dateStr}_${timeStr}`;
                                            const isFree = availabilities[key] === "Free";

                                            return (
                                                <td
                                                    key={idx}
                                                    className="p-1 border-b border-gray-100 cursor-pointer transition-colors duration-150 group"
                                                    onClick={() => toggleSlot(dateStr, timeStr)}
                                                >
                                                    <div className={`w-full h-10 rounded-md border flex items-center justify-center transition-all
                                                        ${isFree
                                                            ? 'bg-[#D1FAE5] border-green-300 text-green-700 hover:bg-green-200'
                                                            : 'bg-white border-dashed border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                                                    >
                                                        <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {isFree ? '✓ Free' : 'Set Free'}
                                                        </span>
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
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-[#BE123C] text-white font-bold rounded-lg hover:bg-[#9f1239] transition-colors shadow-sm disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Availabilities"}
                    </button>
                </div>

            </div>
        </div>
        </>
    );
}
