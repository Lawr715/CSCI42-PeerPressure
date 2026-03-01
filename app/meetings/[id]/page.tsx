"use client";

import { useEffect, useState } from "react";

// Helper to generate 30-minute intervals between start and end time
function generateTimeSlots(startTime: string, endTime: string) {
    const slots = [];
    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (current < end) {
        const timeString = current.toTimeString().slice(0, 5); // "HH:mm"
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

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
    const meetingId = params.id;
    const currentUserId = "user_1"; // Mock user ID

    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Map of "YYYY-MM-DD_HH:mm" -> "Free" | "Busy" for the current user
    const [availabilities, setAvailabilities] = useState<Record<string, string>>({});

    useEffect(() => {
        async function fetchMeeting() {
            try {
                const res = await fetch(`/api/meetings/${meetingId}`);
                if (!res.ok) throw new Error("Failed to fetch meeting");
                const data = await res.json();
                setMeeting(data);

                // Pre-fill current user's existing availabilities
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading meeting schedule...</div>;
    if (!meeting) return <div className="p-8 text-center text-red-500">Meeting not found</div>;

    const dates = getDatesInRange(new Date(meeting.startDate), new Date(meeting.endDate));
    const timeSlots = generateTimeSlots(meeting.startTime, meeting.endTime);

    const toggleSlot = (dateStr: string, timeStr: string) => {
        const key = `${dateStr}_${timeStr}`;
        setAvailabilities(prev => {
            const currentStatus = prev[key] || "Busy"; // Default unknown is Busy
            const newStatus = currentStatus === "Free" ? "Busy" : "Free";
            return { ...prev, [key]: newStatus };
        });
    };

    const handleSave = async () => {
        setSaving(true);

        // Convert the dictionary map back to an array structure for the API
        const payloadAvailabilities = Object.keys(availabilities).map(key => {
            const [date, timeSlot] = key.split('_');
            return {
                date,
                timeSlot,
                status: availabilities[key]
            };
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
        <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{meeting.meetingName}</h1>
                {meeting.meetingDescription && <p className="text-gray-600 mb-4">{meeting.meetingDescription}</p>}
                <div className="flex gap-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                        {new Date(meeting.startDate).toLocaleDateString()} to {new Date(meeting.endDate).toLocaleDateString()}
                    </span>
                    <span className="bg-blue-50 px-3 py-1 rounded-full text-xs text-blue-700 font-semibold border border-blue-200">
                        {meeting.startTime.slice(0, 5)} - {meeting.endTime.slice(0, 5)}
                    </span>
                </div>
            </div>

            <div className="mb-6 flex space-x-4">
                <button className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors">
                    Auto-fill via Tasks & Habits (Coming Soon)
                </button>
                <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 text-sm font-medium transition-colors flex items-center gap-2">
                    Sync via Google Calendar
                </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="p-3 border-b border-r border-gray-200 bg-gray-50 font-semibold text-gray-700 w-24 sticky left-0 z-10 text-center text-xs uppercase tracking-wider">
                                Time
                            </th>
                            {dates.map((date, idx) => (
                                <th key={idx} className="p-3 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-center text-sm">
                                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(timeStr => (
                            <tr key={timeStr} className="hover:bg-gray-50/50">
                                <td className="p-2 border-b border-r border-gray-200 font-medium text-gray-600 sticky left-0 bg-white z-10 text-center text-sm">
                                    {timeStr}
                                </td>
                                {dates.map((date, idx) => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const key = `${dateStr}_${timeStr}`;
                                    const isFree = availabilities[key] === "Free";

                                    return (
                                        <td
                                            key={idx}
                                            className={`p-1 border-b border-gray-200 cursor-pointer transition-colors duration-150 group`}
                                            onClick={() => toggleSlot(dateStr, timeStr)}
                                        >
                                            <div className={`w-full h-10 rounded-md border flex items-center justify-center
                        ${isFree
                                                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                                                    : 'bg-white border-dashed border-gray-300 text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isFree ? 'Free' : 'Set Free'}
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

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                    {saving ? "Saving..." : "Save Availabilities"}
                </button>
            </div>
        </div>
    );
}
