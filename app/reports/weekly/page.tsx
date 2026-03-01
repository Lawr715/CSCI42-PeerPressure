"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Generating your weekly digest...</div>;
    if (!report) return <div className="p-8 text-center text-red-500">Failed to load weekly report</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <header className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Weekly Progress Digest</h1>
                        <p className="text-gray-500 mt-2">Here is a summary of your productivity this week.</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center justify-center bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                            <span className="text-2xl mr-2">🔥</span>
                            <div>
                                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider">Current Streak</p>
                                <p className="text-lg font-bold text-orange-700">{report.streak} Days</p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-blue-500">💡</span> Suggested Next Actions
                    </h2>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                        <p className="text-blue-800 font-medium leading-relaxed">{report.suggestions}</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-green-500">✅</span> Completed Tasks ({report.completedTasks?.length || 0})
                        </h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
                            {report.completedTasks && report.completedTasks.length > 0 ? (
                                <ul className="space-y-3">
                                    {report.completedTasks.map((task: any) => (
                                        <li key={task.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm flex items-start gap-3">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{task.taskName}</p>
                                                <p className="text-xs text-gray-400 mt-1">Completed this week</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">
                                    No tasks completed yet this week.
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-red-500">⚠️</span> Overdue Tasks ({report.delayedTasks?.length || 0})
                        </h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
                            {report.delayedTasks && report.delayedTasks.length > 0 ? (
                                <ul className="space-y-3">
                                    {report.delayedTasks.map((task: any) => (
                                        <li key={task.id} className="bg-white p-3 rounded border border-red-100 shadow-sm flex items-start flex-col gap-1 border-l-4 border-l-red-400">
                                            <p className="font-medium text-gray-800 text-sm">{task.taskName}</p>
                                            <div className="flex justify-between w-full items-center mt-1">
                                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                                    Due: {new Date(task.hardDeadline).toLocaleDateString()}
                                                </span>
                                                <Link href={`/tasks/${task.id}/edit`} className="text-xs text-blue-600 hover:underline font-medium">
                                                    Reschedule
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">
                                    No overdue tasks! You're on track.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Productivity Insights</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-700">Your most productive time of day this week:</p>
                        </div>
                        <div>
                            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 font-bold rounded-full text-sm">
                                {report.commonTime}
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
