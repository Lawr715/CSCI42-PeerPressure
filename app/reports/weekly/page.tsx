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
        <div className="min-h-screen bg-[#E9DABB] flex flex-col font-sans text-[#780000]">
            <Navbar />
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Command Report</h1>
                            <p className="text-[#780000]/60 font-bold italic text-lg mt-2">Tactical synthesis of weekly maneuvers and collective focus.</p>
                        </div>
                        <div className="bg-white/30 backdrop-blur-md rounded-3xl px-8 py-5 border border-white/50 shadow-xl flex items-center gap-4">
                            <div className="text-4xl">🔥</div>
                            <div>
                                <p className="text-[10px] text-[#780000]/40 font-black uppercase tracking-[0.2em]">Operational Streak</p>
                                <p className="text-3xl font-black text-[#780000]">{report.streak} Days</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Hero */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Productivity Score */}
                        <div className="bg-[#780000] rounded-[3rem] p-10 text-[#E9DABB] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60 block mb-2">Weekly Coherence</span>
                                <div className="text-8xl font-black tracking-tighter leading-none">{report.score || 0}</div>
                                <div className="mt-4 inline-block px-4 py-1.5 bg-[#E9DABB] text-[#780000] rounded-full text-[10px] font-black uppercase tracking-wider">
                                    Status: {report.theme || "Calculating..."}
                                </div>
                            </div>
                            <p className="relative z-10 opacity-70 mt-10 font-bold italic leading-relaxed text-sm">
                                "{report.aiSummary}"
                            </p>
                            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
                        </div>

                        {/* Tactical Blocker & Advice */}
                        <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/60 shadow-2xl flex flex-col md:flex-row gap-10">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-black text-[#780000]/40 uppercase tracking-[0.3em] mb-3">Critical Impediment</h3>
                                    <div className="p-6 bg-red-500/10 border border-[#780000]/10 rounded-3xl">
                                        <p className="font-black text-xl leading-tight">{report.topBlocker || "Identifying bottlenecks..."}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-[#780000]/40 uppercase tracking-[0.3em] mb-4">Tactical Recommendations</h3>
                                    <div className="space-y-3">
                                        {(report.tacticalAdvice || ["Analyzing protocol..."]).map((advice: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/40 hover:translate-x-2 transition-transform cursor-default">
                                                <span className="w-6 h-6 rounded-full bg-[#780000] flex items-center justify-center text-[#E9DABB] text-[10px] font-black">{idx + 1}</span>
                                                <p className="font-bold text-sm">{advice}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Stats Sidebar */}
                            <div className="w-full md:w-56 flex flex-col justify-between gap-6">
                                <div className="bg-[#780000]/5 p-6 rounded-[2rem] border border-[#780000]/5">
                                    <p className="text-[10px] font-black text-[#780000]/40 uppercase tracking-[0.2em] mb-1">Peak Performance</p>
                                    <p className="text-2xl font-black">{report.commonTime}</p>
                                </div>
                                <div className="bg-[#780000]/5 p-6 rounded-[2rem] border border-[#780000]/5">
                                    <p className="text-[10px] font-black text-[#780000]/40 uppercase tracking-[0.2em] mb-1">Completions</p>
                                    <p className="text-4xl font-black">{report.completedTasks?.length || 0}</p>
                                </div>
                                <div className="bg-[#780000]/5 p-6 rounded-[2rem] border border-[#780000]/5">
                                    <p className="text-[10px] font-black text-[#780000]/40 uppercase tracking-[0.2em] mb-1">Overdue</p>
                                    <p className="text-4xl font-black text-red-600">{report.delayedTasks?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Archive & Task History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Success Log */}
                        <div className="bg-white/20 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/30 shadow-xl">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span> Action Success Log
                            </h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {report.completedTasks?.map((task: any, idx: number) => (
                                    <div key={idx} className="bg-white/60 p-5 rounded-2xl border border-white/60 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                        <div className="mt-1">✅</div>
                                        <div>
                                            <p className="font-black text-sm uppercase leading-tight tracking-tight">{task.taskName}</p>
                                            <p className="text-xs font-bold opacity-40 mt-1 italic">{task.taskDescription || "Completed operational objective."}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risk Log */}
                        <div className="bg-white/20 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/30 shadow-xl">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span> Operational Risks
                            </h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {report.delayedTasks?.map((task: any, idx: number) => (
                                    <div key={idx} className="bg-white/60 p-5 rounded-2xl border border-red-500/20 border-l-8 border-l-red-600 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                        <p className="font-black text-sm uppercase tracking-tight">{task.taskName}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-red-700 bg-red-100 px-3 py-1 rounded-full uppercase tracking-widest">Breach: {new Date(task.hardDeadline).toLocaleDateString()}</span>
                                            <Link href="/Tasklist" className="text-[10px] font-black text-[#780000] hover:underline underline-offset-4 tracking-[0.1em] uppercase">Resolve -&gt;</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center text-[10px] font-black text-[#780000]/20 uppercase tracking-[0.6em] pt-10">
                        Sovereign Mission Intelligence © 2026
                    </div>
                </div>
            </main>
        </div>
    );
}
