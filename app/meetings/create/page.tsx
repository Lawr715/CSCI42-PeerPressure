"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

interface GroupOption {
    id: string;
    name: string;
    members: { id: string; user: { id: string; name: string; image: string | null } }[];
}

export default function MeetingCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [groups, setGroups] = useState<GroupOption[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");

    const [formData, setFormData] = useState({
        meetingName: "",
        meetingDescription: "",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        taskId: "",
    });

    useEffect(() => {
        fetch("/api/groups")
            .then(res => res.json())
            .then((data: any[]) => {
                setGroups(data.map(g => ({
                    id: g.id,
                    name: g.name,
                    members: g.members || [],
                })));
            })
            .catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
                endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
                ...(selectedGroupId ? { groupId: selectedGroupId } : {}),
            };

            const res = await fetch("/api/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create meeting");
            }

            const newMeeting = await res.json();
            router.push(`/meetings/${newMeeting.id}`);
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("Failed to create meeting schedule. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-[#E9DABB] px-8 py-10 font-sans text-[#780000]">
            <div className="max-w-6xl mx-auto space-y-10">
                
                {/* Page Header */}
                <div className="pt-4">
                    <h1 className="text-5xl font-black tracking-tighter uppercase">Command Meeting</h1>
                    <p className="text-[#780000]/60 font-bold italic text-lg mt-2">Define the objective and synchronize your collective focus.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column: Meeting Details Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 p-10">
                            <h2 className="text-2xl font-black mb-8 tracking-tight">Mission Parameters</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Meeting Title</label>
                                    <input
                                        required
                                        type="text"
                                        name="meetingName"
                                        value={formData.meetingName}
                                        onChange={handleChange}
                                        placeholder="e.g., Strategic Alignment, Thesis Review"
                                        className="w-full px-5 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-bold focus:outline-none focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 transition-all placeholder:text-[#780000]/30"
                                    />
                                </div>

                                {/* Group Selector */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Group</label>
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="w-full px-5 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-bold focus:outline-none focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">No Group (Personal)</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                    {groups.length === 0 && (
                                        <p className="text-[10px] font-bold text-[#780000]/40 mt-2 px-1">Join or create a group first to schedule group meetings.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Description</label>
                                    <textarea
                                        name="meetingDescription"
                                        value={formData.meetingDescription}
                                        onChange={handleChange}
                                        placeholder="What is the intent of this engagement?"
                                        rows={4}
                                        className="w-full px-5 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-bold focus:outline-none focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 transition-all placeholder:text-[#780000]/30"
                                    />
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Engagement Window</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <input
                                            required
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-black focus:outline-none focus:border-[#780000] transition-all"
                                        />
                                        <input
                                            required
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate}
                                            className="w-full px-5 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-black focus:outline-none focus:border-[#780000] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Time Constraints */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 px-1">Focus Hours</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="relative">
                                            <span className="text-[10px] font-black uppercase opacity-40 absolute top-2 left-5">Earliest</span>
                                            <input
                                                required
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleChange}
                                                className="w-full pt-6 pb-3 px-5 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-black focus:outline-none focus:border-[#780000] transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="text-[10px] font-black uppercase opacity-40 absolute top-2 left-5">Latest</span>
                                            <input
                                                required
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleChange}
                                                className="w-full pt-6 pb-3 px-5 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-black focus:outline-none focus:border-[#780000] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col md:flex-row items-center gap-4 pt-8 border-t border-[#780000]/5">
                                    <div className="hidden md:block flex-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="w-full md:w-auto px-6 py-3 text-[#780000]/40 font-black uppercase tracking-widest text-[10px] hover:text-[#780000] transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full md:w-auto px-10 py-4 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#5c0000] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Deploying..." : "Finalize & Summon"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Group Members Preview */}
                    <div className="space-y-8">
                        {/* Group Members Card */}
                        <div className="bg-[#780000] rounded-[2.5rem] shadow-2xl p-8 text-[#E9DABB] relative overflow-hidden">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-6">
                                {selectedGroup ? "Meeting Attendees" : "Select a Group"}
                            </h3>
                            {selectedGroup ? (
                                <>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-6xl font-black tracking-tighter">{selectedGroup.members.length}</span>
                                        <span className="text-2xl font-bold opacity-40">members</span>
                                    </div>
                                    <p className="text-xs font-bold italic opacity-80 mb-8">All group members will be notified</p>
                                    
                                    <div className="w-full bg-white/10 rounded-full h-3 mb-3">
                                        <div className="bg-[#E9DABB] h-3 rounded-full shadow-[0_0_15px_rgba(233,218,187,0.5)] transition-all" style={{ width: '100%' }}></div>
                                    </div>
                                    <p className="text-[10px] font-black text-right opacity-60 tracking-widest uppercase">Ready to Synchronize</p>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl mb-4 opacity-40">👥</div>
                                    <p className="text-xs font-bold italic opacity-60">Choose a group from the form to see attendees.</p>
                                </>
                            )}
                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Members List Card */}
                        {selectedGroup && (
                            <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 p-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/40 mb-6">Attendees</h3>
                                <div className="space-y-6">
                                    {selectedGroup.members.map((member) => {
                                        const initials = member.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
                                        return (
                                            <div key={member.id} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-[#780000]/10 flex items-center justify-center text-[10px] font-black text-[#780000] group-hover:bg-[#780000] group-hover:text-[#E9DABB] transition-all duration-300">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#780000] tracking-tight">{member.user.name}</p>
                                                    <p className="text-[10px] font-bold text-[#780000]/40 uppercase tracking-wider">Will be notified</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No Group Selected - Prompt */}
                        {!selectedGroup && groups.length > 0 && (
                            <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 p-8 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/30">Select a group to see members</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="text-center text-[10px] font-black text-[#780000]/20 uppercase tracking-[0.5em] pt-10 pb-4">
                    Sovereign Meeting Orchestrator © 2026
                </div>

            </div>
        </div>
        </>
    );
}
