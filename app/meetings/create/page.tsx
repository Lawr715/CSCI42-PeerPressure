"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default function MeetingCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        meetingName: "",
        meetingDescription: "",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        taskId: "",
        startedById: "user-1"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-[#F9F5F1] px-8 py-6">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Schedule New Meeting</h1>
                    <p className="text-gray-500 font-medium mt-1">Define the parameters for your group&apos;s availability poll.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Meeting Details Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-5">Meeting Details</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Meeting Title</label>
                                    <input
                                        required
                                        type="text"
                                        name="meetingName"
                                        value={formData.meetingName}
                                        onChange={handleChange}
                                        placeholder="e.g., Sprint Planning, Group Study"
                                        className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Attendees */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Add Attendees</label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            className="w-full pl-10 pr-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                                    <textarea
                                        name="meetingDescription"
                                        value={formData.meetingDescription}
                                        onChange={handleChange}
                                        placeholder="What is this meeting about?"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Date Range</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all"
                                        />
                                        <input
                                            required
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate}
                                            className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Time Constraints */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Time Constraints</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-500 font-medium mb-1 block">Earliest</span>
                                            <input
                                                required
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 font-medium mb-1 block">Latest</span>
                                            <input
                                                required
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Associated Task ID (Optional)</label>
                                    <input
                                        type="number"
                                        name="taskId"
                                        value={formData.taskId}
                                        onChange={handleChange}
                                        placeholder="Link to an existing task"
                                        className="w-full px-4 py-3 bg-[#F9F5F1] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#BE123C] transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        className="px-5 py-2.5 bg-[#F9F5F1] border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                    >
                                        Auto-fill from Tasks
                                    </button>
                                    <button
                                        type="button"
                                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Sync Google Calendar
                                    </button>
                                    <div className="flex-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#BE123C] text-white font-bold rounded-lg hover:bg-[#9f1239] transition-colors shadow-sm disabled:opacity-50 text-sm"
                                    >
                                        {saving ? "Creating..." : "Save & Send Invites"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Group Progress & Pending */}
                    <div className="space-y-6">
                        {/* Group Progress Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Group Progress</h3>
                            <div className="text-center mb-4">
                                <span className="text-4xl font-black text-[#1F2937]">8</span>
                                <span className="text-lg text-gray-400 font-medium">/12</span>
                                <p className="text-xs text-gray-500 mt-1">responses received</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div className="bg-[#BE123C] h-2 rounded-full transition-all" style={{ width: '66%' }}></div>
                            </div>
                            <p className="text-xs text-gray-400 text-right">66% complete</p>
                        </div>

                        {/* Pending Responses */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Pending Responses</h3>
                            <div className="space-y-3">
                                {["Sarah Jenkins", "Mike Ross", "Donna Paulsen", "Harvey Specter"].map((name) => (
                                    <div key={name} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{name}</p>
                                            <p className="text-xs text-gray-400">No response yet</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 text-sm font-semibold text-[#BE123C] hover:text-[#9f1239] transition-colors">
                                Send Reminders →
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pt-4 pb-2">
                    © 2024 Peer Pressure Meeting Orchestrator
                </div>

            </div>
        </div>
        </>
    );
}
