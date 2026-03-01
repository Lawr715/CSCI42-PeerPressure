"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MeetingCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Note: For a real app, 'startedById' should be fetched from the logged-in user session.
    // Using a mock user ID "user_1" for demonstration purposes as auth integration is pending.
    const [formData, setFormData] = useState({
        meetingName: "",
        meetingDescription: "",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        taskId: "",
        startedById: "user_1"
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
                // Format times to strictly "HH:mm:ss" for Prisma
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

            // Navigate to the newly created meeting detail page to set availabilities
            router.push(`/meetings/${newMeeting.id}`);
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("Failed to create meeting schedule. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 border border-gray-100">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Schedule a Meeting</h1>
            <p className="text-gray-500 mb-6 text-sm">Create a new meeting and define the possible dates and times for participants to choose from.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Name</label>
                    <input
                        required
                        type="text"
                        name="meetingName"
                        value={formData.meetingName}
                        onChange={handleChange}
                        placeholder="e.g., Sprint Planning, Group Study"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                        name="meetingDescription"
                        value={formData.meetingDescription}
                        onChange={handleChange}
                        placeholder="What is this meeting about?"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date Range</label>
                        <input
                            required
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date Range</label>
                        <input
                            required
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate} // Ensure end date is after start date
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Earliest Time</label>
                        <input
                            required
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">When does the day start?</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latest Time</label>
                        <input
                            required
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">When does the day end?</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Associated Task ID (Optional)</label>
                    <input
                        type="number"
                        name="taskId"
                        value={formData.taskId}
                        onChange={handleChange}
                        placeholder="Link to an existing task"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? "Creating..." : "Create Meeting Schedule"}
                    </button>
                </div>
            </form>
        </div>
    );
}
