"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

type ViewMode = 'list' | 'kanban';

// Sample demo tasks
const sampleTasks = [
  { id: 1, name: "Finalize Brand Guidelines", progress: 75, softDeadline: "Mar 15, 2026", hardDeadline: "Mar 18, 2026", tag: "Design", status: "In Progress" },
  { id: 2, name: "Prepare Investor Presentation", progress: 40, softDeadline: "Mar 20, 2026", hardDeadline: "Mar 22, 2026", tag: "Business", status: "In Progress" },
  { id: 3, name: "Website UI Audit", progress: 100, softDeadline: "Mar 10, 2026", hardDeadline: "Mar 12, 2026", tag: "Development", status: "Done" },
  { id: 4, name: "Meeting with Dev Team", progress: 0, softDeadline: "Mar 25, 2026", hardDeadline: "Mar 28, 2026", tag: "Team", status: "To Do" },
  { id: 5, name: "API Integration Testing", progress: 20, softDeadline: "Mar 22, 2026", hardDeadline: "Mar 24, 2026", tag: "Development", status: "To Do" },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: value === 100 ? '#16a34a' : '#780000' }}
      />
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    Design: "bg-purple-100 text-purple-700",
    Business: "bg-blue-100 text-blue-700",
    Development: "bg-green-100 text-green-700",
    Team: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors[tag] || "bg-gray-100 text-gray-600"}`}>
      {tag}
    </span>
  );
}

export default function TaskList() {
  const [view, setView] = useState<ViewMode>('list');

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#780000] tracking-tight">Task Manager</h1>
            <p className="text-gray-500 font-medium">Track, manage, and conquer your workload.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1 flex shadow-sm border border-gray-100">
              <button
                onClick={() => setView('list')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                List View
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === 'kanban' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Kanban
              </button>
            </div>
            <button className="bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors shadow-sm text-sm">
              Filter
            </button>
            <Link
              href="/tasks/create"
              className="bg-[#780000] text-[#E9DABB] font-bold rounded-xl px-5 py-2.5 hover:bg-[#5c0000] transition-colors shadow-md text-sm"
            >
              + New Task
            </Link>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#780000] text-[#E9DABB]">
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Task Name</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider w-48">Progress</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Soft Deadline</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Hard Deadline</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Tag</th>
                </tr>
              </thead>
              <tbody>
                {sampleTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{task.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={task.progress} />
                        <span className="text-xs font-bold text-gray-500 w-10">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-medium">{task.softDeadline}</td>
                    <td className="p-4 text-sm text-gray-500 font-medium">{task.hardDeadline}</td>
                    <td className="p-4"><TagBadge tag={task.tag} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['To Do', 'In Progress', 'Done'].map((status) => (
              <div key={status} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-3 h-3 rounded-full ${status === 'To Do' ? 'bg-gray-400' : status === 'In Progress' ? 'bg-[#780000]' : 'bg-green-500'}`} />
                  <h3 className="font-bold text-gray-800">{status}</h3>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {sampleTasks.filter(t => t.status === status).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sampleTasks.filter(t => t.status === status).map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                      <p className="font-semibold text-gray-800 text-sm mb-2">{task.name}</p>
                      <ProgressBar value={task.progress} />
                      <div className="flex justify-between items-center mt-3">
                        <TagBadge tag={task.tag} />
                        <span className="text-xs text-gray-400 font-medium">{task.hardDeadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
    </>
  );
}