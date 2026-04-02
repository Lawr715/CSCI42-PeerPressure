"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TaskEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const taskId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [taskData, setTaskData] = useState({
        taskName: "",
        taskDescription: "",
        status: "Backlog",
        softDeadline: "",
        hardDeadline: "",
        categoryId: "",
        repetition: "0"
    });

    useEffect(() => {
        async function fetchTask() {
            try {
                const res = await fetch(`/api/tasks/${taskId}`);
                if (!res.ok) throw new Error("Failed to fetch task");
                const data = await res.json();

                // Format dates for input[type="datetime-local"]
                const formatDateTime = (dateStr: string) => {
                    if (!dateStr) return "";
                    const d = new Date(dateStr);
                    // Need to shift for local timezone to display correctly in input
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    return d.toISOString().slice(0, 16);
                };

                setTaskData({
                    taskName: data.taskName || "",
                    taskDescription: data.taskDescription || "",
                    status: data.status || "Backlog",
                    softDeadline: data.softDeadline ? formatDateTime(data.softDeadline) : "",
                    hardDeadline: data.hardDeadline ? formatDateTime(data.hardDeadline) : "",
                    categoryId: data.categoryId ? String(data.categoryId) : "",
                    repetition: String(data.repetition) || "0"
                });
            } catch (error) {
                console.error("Error loading task:", error);
            } finally {
                setLoading(false);
            }
        }

        if (taskId) fetchTask();
    }, [taskId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });

            if (!res.ok) throw new Error("Failed to save changes");

            // Navigate back to task detail or list
            router.push('/tasks');
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading task data...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Task</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                    <input
                        required
                        type="text"
                        name="taskName"
                        value={taskData.taskName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="taskDescription"
                        value={taskData.taskDescription}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={taskData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Backlog">Backlog</option>
                            <option value="In Progress">In Progress</option>
                            <option value="For Review">For Review</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repetition</label>
                        <select
                            name="repetition"
                            value={taskData.repetition}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="0">Do not repeat</option>
                            <option value="1">Daily</option>
                            <option value="7">Weekly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soft Deadline (Optional)</label>
                        <input
                            type="datetime-local"
                            name="softDeadline"
                            value={taskData.softDeadline}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hard Deadline</label>
                        <input
                            required
                            type="datetime-local"
                            name="hardDeadline"
                            value={taskData.hardDeadline}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
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
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
