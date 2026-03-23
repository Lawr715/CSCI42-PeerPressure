"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function WeeklyReportPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch("/api/reports/weekly");
                if (!res.ok) throw new Error("Failed to fetch report");
                const data = await res.json();
                setReport(data);
            } catch (error) {
                console.error("Error loading weekly report:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-gray-500 font-medium">Generating your weekly digest...</div>;
    if (!report) return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-red-500 font-medium">Failed to load weekly report</div>;

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-[#F5F5F5] p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#780000] tracking-tight">Weekly Progress Digest</h1>
                        <p className="text-gray-500 font-medium mt-1">Here is a summary of your productivity this week.</p>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-3 flex items-center gap-3">
                        <div className="text-2xl">🔥</div>
                        <div>
                            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Current Streak</p>
                            <p className="text-lg font-bold text-orange-700 leading-none">{report.streak} Days</p>
                        </div>
                    </div>
                </div>

                {/* Productivity Score Hero */}
                <div className="bg-[#780000] rounded-2xl p-8 text-[#E9DABB] shadow-md flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-sm font-bold tracking-widest uppercase opacity-80 block mb-1">Productivity Score</span>
                        <div className="text-7xl font-black tracking-tighter">85</div>
                        <p className="opacity-80 mt-1 text-sm">You&apos;re in the top 15% this week!</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6 relative z-10">
                        <div className="text-center">
                            <div className="text-4xl font-black">{report.completedTasks?.length || 0}</div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Completed</div>
                        </div>
                        <div className="w-px h-16 bg-[#E9DABB]/30"></div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-red-300">{report.delayedTasks?.length || 0}</div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Overdue</div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                </div>

                {/* AI Suggestions Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-blue-500">💡</span> Suggested Next Actions
                    </h2>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <p className="text-blue-800 font-medium leading-relaxed">{report.suggestions}</p>
                    </div>
                </div>

                {/* Completed vs Overdue Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Completed Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-green-500">✅</span> Completed ({report.completedTasks?.length || 0})
                        </h2>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {report.completedTasks && report.completedTasks.length > 0 ? (
                                report.completedTasks.map((task: any) => (
                                    <div key={task.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                                        <span className="text-green-500 mt-0.5 font-bold">✓</span>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{task.taskName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Completed this week</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-32 text-sm text-gray-400 italic">
                                    No tasks completed yet this week.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Overdue Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-red-500">⚠️</span> Overdue ({report.delayedTasks?.length || 0})
                        </h2>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {report.delayedTasks && report.delayedTasks.length > 0 ? (
                                report.delayedTasks.map((task: any) => (
                                    <div key={task.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 border-l-4 border-l-red-400 flex flex-col gap-1">
                                        <p className="font-semibold text-gray-800 text-sm">{task.taskName}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                                Due: {new Date(task.hardDeadline).toLocaleDateString()}
                                            </span>
                                            <Link href={`/tasks/${task.id}/edit`} className="text-xs text-blue-600 hover:underline font-semibold">
                                                Reschedule
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-32 text-sm text-gray-400 italic">
                                    No overdue tasks! You&apos;re on track. 🎉
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Productivity Insights */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Productivity Insights</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium">Your most productive time of day this week:</p>
                        <span className="px-5 py-2 bg-[#780000] text-[#E9DABB] font-bold rounded-full text-sm shadow-sm">
                            {report.commonTime}
                        </span>
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}
