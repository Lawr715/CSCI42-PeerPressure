"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";

// Helper to generate 30-minute intervals
function generateTimeSlots(startTime: string, endTime: string) {
    const slots: string[] = [];
    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (current < end) {
        slots.push(current.toTimeString().slice(0, 5));
        current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
}

function getDatesInRange(startDate: Date, endDate: Date) {
    const dates: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

interface GroupMemberUser {
    id: string;
    name: string;
    image: string | null;
}

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: meetingId } = use(params);
    const { data: session } = useSession();
    const currentUserId = session?.user?.id || "";

    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // User's own availability mapped by `YYYY-MM-DD_HH:MM`
    const [myAvailabilities, setMyAvailabilities] = useState<Record<string, string>>({});
    
    // Global availability counts
    const [globalCounts, setGlobalCounts] = useState<Record<string, number>>({});
    const [maxConsensus, setMaxConsensus] = useState(0);

    // Finalization state
    const [isFinalizeMode, setIsFinalizeMode] = useState(false);
    const [selectedFinalSlots, setSelectedFinalSlots] = useState<string[]>([]);

    useEffect(() => {
        async function fetchMeeting() {
            try {
                const res = await fetch(`/api/meetings/${meetingId}`);
                if (!res.ok) throw new Error("Failed to fetch meeting");
                const data = await res.json();
                setMeeting(data);

                const myMap: Record<string, string> = {};
                const counts: Record<string, number> = {};
                let localMax = 0;

                data.availabilities?.forEach((av: any) => {
                    const dateStr = new Date(av.date).toISOString().split('T')[0];
                    const key = `${dateStr}_${av.timeSlot}`;
                    
                    if (av.userId === currentUserId) {
                        myMap[key] = av.status;
                    }
                    
                    if (av.status === "Free") {
                        counts[key] = (counts[key] || 0) + 1;
                        if (counts[key] > localMax) localMax = counts[key];
                    }
                });

                setMyAvailabilities(myMap);
                setGlobalCounts(counts);
                setMaxConsensus(localMax);
            } catch (error) {
                console.error("Error loading meeting:", error);
            } finally {
                setLoading(false);
            }
        }

        if (meetingId && currentUserId) fetchMeeting();
    }, [meetingId, currentUserId]);

    if (loading) return <><Navbar /><div className="min-h-screen bg-[#E9DABB] flex items-center justify-center text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading meeting...</div></>;
    if (!meeting) return <><Navbar /><div className="min-h-screen bg-[#E9DABB] flex items-center justify-center text-red-500 font-medium">Meeting not found</div></>;

    const dates = getDatesInRange(new Date(meeting.startDate), new Date(meeting.endDate));
    const timeSlots = generateTimeSlots(meeting.startTime, meeting.endTime);
    const groupMembers: GroupMemberUser[] = meeting.group?.members?.map((m: any) => m.user) || [];

    const isCreator = currentUserId === meeting.startedById;
    const isGroupOwner = currentUserId === meeting.group?.ownerId;
    const canFinalize = isCreator || isGroupOwner;

    const toggleSlot = (dateStr: string, timeStr: string) => {
        const key = `${dateStr}_${timeStr}`;

        if (isFinalizeMode) {
            setSelectedFinalSlots(prev => 
                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
            );
            return;
        }

        setMyAvailabilities(prev => {
            const currentStatus = prev[key] || "Busy";
            const newStatus = currentStatus === "Free" ? "Busy" : "Free";
            return { ...prev, [key]: newStatus };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const payloadAvailabilities = Object.keys(myAvailabilities).map(key => {
            const [date, timeSlot] = key.split('_');
            return { date, timeSlot, status: myAvailabilities[key] };
        });

        try {
            const res = await fetch(`/api/meetings/${meetingId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ availabilities: payloadAvailabilities })
            });

            if (!res.ok) throw new Error("Failed to save availabilities");
            // Auto reload to update global counts
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error saving availabilities.");
        } finally {
            setSaving(false);
        }
    };

    const handleFinalize = async () => {
        if (selectedFinalSlots.length === 0) return alert("Please select at least one time slot to finalize the meeting.");
        setSaving(true);
        
        const dates = selectedFinalSlots.map(s => s.split('_')[0]);
        const uniqueDates = [...new Set(dates)];
        if (uniqueDates.length > 1) {
            setSaving(false);
            return alert("Please select continuous slots on a single date.");
        }
        
        const finalDateObj = uniqueDates[0];
        const times = selectedFinalSlots.map(s => s.split('_')[1]).sort();
        const startTime = times[0];
        
        const lastTime = times[times.length - 1];
        const endD = new Date(`1970-01-01T${lastTime}:00`);
        endD.setMinutes(endD.getMinutes() + 30);
        const endTime = endD.toTimeString().slice(0, 5);

        const finalTimeSlotStr = selectedFinalSlots.length === 1 
            ? startTime 
            : `${startTime} – ${endTime}`;

        try {
            const res = await fetch(`/api/meetings/${meetingId}/finalize`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ finalDate: finalDateObj, finalTimeSlot: finalTimeSlotStr })
            });
            if (!res.ok) throw new Error("Failed to finalize meeting");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Failed to finalize meeting.");
            setSaving(false);
        }
    };

    const handleDeleteMeeting = async () => {
        if (!confirm("Are you sure you want to delete this meeting? This cannot be undone.")) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/meetings/${meetingId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete meeting");
            router.push("/meetings");
        } catch (error) {
            console.error(error);
            alert("Failed to delete meeting.");
        } finally {
            setDeleting(false);
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
                            <span className="bg-white/40 backdrop-blur-md border border-[#780000]/10 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                📅 {new Date(meeting.startDate).toLocaleDateString()} → {new Date(meeting.endDate).toLocaleDateString()}
                            </span>
                            <span className="bg-[#780000] px-6 py-2 rounded-2xl text-[10px] text-[#E9DABB] font-black uppercase tracking-widest shadow-xl">
                                🕐 {meeting.startTime.slice(0, 5)} – {meeting.endTime.slice(0, 5)}
                            </span>
                            {meeting.group && (
                                <span className="bg-white/40 backdrop-blur-md border border-[#780000]/10 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    👥 {meeting.group.name}
                                </span>
                            )}
                        </div>
                    </div>
                    {canFinalize && !meeting.isFinalized && (
                        <button
                            onClick={handleDeleteMeeting}
                            disabled={deleting}
                            className="px-6 py-3 bg-red-600/10 border-2 border-red-600/20 text-red-600 font-black rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : "Delete Meeting"}
                        </button>
                    )}
                </div>

                {meeting.isFinalized ? (
                    // LOCKED STATE
                    <div className="bg-[#780000] text-[#E9DABB] rounded-[3rem] shadow-2xl p-16 text-center relative overflow-hidden border border-[#780000]/10">
                        <div className="z-10 relative">
                            <span className="text-xs font-black uppercase tracking-[0.4em] opacity-60 mb-6 block">Meeting Locked & Finalized</span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                                {new Date(meeting.finalDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                            <p className="text-2xl font-bold opacity-80 uppercase tracking-widest">
                                At {meeting.finalTimeSlot}
                            </p>
                        </div>
                        <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none"></div>
                    </div>
                ) : (
                    <>
                        {/* Group Members Row */}
                        {groupMembers.length > 0 && (
                            <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#780000]/40 mb-4">Attendees</p>
                                <div className="flex flex-wrap gap-3">
                                    {groupMembers.map((member: GroupMemberUser) => {
                                        const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
                                        const hasResponded = meeting.availabilities?.some((a: any) => a.userId === member.id);
                                        return (
                                            <div key={member.id} className="flex items-center gap-2 bg-white/50 rounded-xl px-4 py-2 border border-[#780000]/5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                                    member.id === currentUserId 
                                                        ? "bg-[#780000] text-[#E9DABB]" 
                                                        : "bg-[#780000]/10 text-[#780000]"
                                                }`}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black">{member.name}</p>
                                                    <p className="text-[9px] font-bold text-[#780000]/40 uppercase">
                                                        {hasResponded ? "✓ Responded" : "Awaiting"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Availability Grid Card */}
                        <div className={`backdrop-blur-xl rounded-[3rem] shadow-2xl border transition-all duration-500 overflow-hidden ${
                            isFinalizeMode ? 'bg-orange-50/90 border-orange-500/30 ring-4 ring-orange-500/20' : 'bg-white/30 border-white/40'
                        }`}>
                            <div className={`p-10 border-b ${isFinalizeMode ? 'border-orange-500/10' : 'border-[#780000]/5'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                            {isFinalizeMode ? "Finalize Meeting Scope" : "Focus Synchronization Grid"}
                                            {isFinalizeMode && <span className="text-[10px] bg-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-widest">Admin Mode</span>}
                                        </h2>
                                        <p className="opacity-40 font-bold text-xs uppercase tracking-widest mt-1">
                                            {isFinalizeMode 
                                                ? "Select the precise engagement window to lock the meeting." 
                                                : "Select your availability. Majority consensus is highlighted."}
                                        </p>
                                    </div>
                                    
                                    {canFinalize && (
                                        <button
                                            onClick={() => setIsFinalizeMode(!isFinalizeMode)}
                                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                                isFinalizeMode 
                                                    ? 'bg-[#780000]/10 text-[#780000] hover:bg-[#780000]/20' 
                                                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                                            }`}
                                        >
                                            {isFinalizeMode ? "Cancel Finalization" : "Lock Majority Slot"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                                    <thead>
                                        <tr>
                                            <th className="p-6 border-b border-r border-[#780000]/5 bg-black/5 font-black text-[#780000] w-32 sticky left-0 z-10 text-center text-[10px] uppercase tracking-[0.2em]">
                                                Time
                                            </th>
                                            {dates.map((date, idx) => (
                                                <th key={idx} className="p-6 border-b border-[#780000]/5 bg-black/5 font-black text-[#780000] text-center text-[10px] uppercase tracking-[0.2em]">
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

                                                    const iAmFree = myAvailabilities[key] === "Free";
                                                    const globalFree = globalCounts[key] || 0;
                                                    const totalMembers = groupMembers.length || 1; 
                                                    
                                                    // Consensus Logic
                                                    const isMajority = maxConsensus > 0 && globalFree === maxConsensus;
                                                    const isSelectedFinal = selectedFinalSlots.includes(key);

                                                    let cellClasses = 'bg-white/40 border-dashed border-[#780000]/10 text-[#780000]/20 hover:border-[#780000]/30 hover:bg-white/60';
                                                    let content = null;

                                                    if (isFinalizeMode) {
                                                        if (isSelectedFinal) {
                                                            cellClasses = 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105 z-20';
                                                        } else if (isMajority) {
                                                            cellClasses = 'bg-orange-500/20 border-orange-500/50 text-orange-700 animate-pulse';
                                                        }
                                                        content = (
                                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                                {isSelectedFinal ? 'TARGET LOCKED' : `${globalFree}/${totalMembers} Free`}
                                                            </span>
                                                        );
                                                    } else {
                                                        if (iAmFree) {
                                                            cellClasses = 'bg-[#780000] border-[#780000] text-[#E9DABB] shadow-lg';
                                                        } else if (isMajority) {
                                                            // Highlight where everyone else is free even if I am not
                                                            cellClasses = 'bg-black/5 border-[#780000]/20 text-[#780000] shadow-inner';
                                                        }

                                                        content = (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <span className="text-[10px] font-black uppercase tracking-widest group-hover:hidden">
                                                                    {iAmFree ? 'Free' : (globalFree > 0 ? `${globalFree}/${totalMembers}` : '')}
                                                                </span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block">
                                                                    {iAmFree ? '✓ Free' : 'Set Free'}
                                                                </span>
                                                                {isMajority && !iAmFree && (
                                                                    <span className="absolute top-1 right-1 text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full tracking-widest uppercase">Majority</span>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <td
                                                            key={idx}
                                                            className="p-1.5 border-b border-[#780000]/5 cursor-pointer transition-all duration-300 group"
                                                            onClick={() => toggleSlot(dateStr, timeStr)}
                                                        >
                                                            <div className={`w-full h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 transform group-active:scale-95 relative ${cellClasses}`}>
                                                                {content}
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

                        {/* Save / Finalize Button Row */}
                        <div className="flex justify-between items-center py-6">
                            <button
                                onClick={() => router.push("/meetings")}
                                className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/40 hover:text-[#780000] transition-colors"
                            >
                                ← Back to Meetings
                            </button>
                            
                            {isFinalizeMode ? (
                                <button
                                    onClick={handleFinalize}
                                    disabled={saving || selectedFinalSlots.length === 0}
                                    className="px-12 py-5 bg-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? "Finalizing..." : "Confirm Finalization"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-12 py-5 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl hover:bg-[#5c0000] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? "Synchronizing..." : "Save Availability"}
                                </button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
        </>
    );
}
