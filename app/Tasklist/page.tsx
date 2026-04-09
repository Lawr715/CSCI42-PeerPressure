"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

type ViewMode = 'list' | 'kanban';

// Define the interface based on your Prisma Schema
interface Task {
  id: number;
  taskName: string;
  status: string;
  softDeadline: string | null;
  hardDeadline: string;
  repetition: number;
  // We'll calculate a pseudo-progress based on status for the UI
}

function ProgressBar({ status }: { status: string }) {
  const value = status === 'DONE' ? 100 : status === 'FOR_REVIEW' ? 90 : status === 'IN_PROGRESS' ? 50 : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: value === 100 ? '#16a34a' : '#780000' }}
      />
    </div>
  );
}

function TagBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DONE: "bg-green-100 text-green-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    BACKLOG: "bg-gray-100 text-gray-600",
    FOR_REVIEW: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function TaskList() {
  const [view, setView] = useState<ViewMode>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        if (Array.isArray(data)) {
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F5F5] p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header (Stayed Same) */}
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
              <Link
                href="/Tasklist/Create"
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
                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse font-medium">
                        Loading your tasks...
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400 italic font-medium">
                        No Tasks Found. Start by creating a new one!
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-semibold text-gray-800">{task.taskName}</td>
                        <td className="p-4">
                           <ProgressBar status={task.status} />
                        </td>
                        <td className="p-4 text-sm text-gray-500 font-medium">{formatDate(task.softDeadline)}</td>
                        <td className="p-4 text-sm text-gray-500 font-medium">{formatDate(task.hardDeadline)}</td>
                        <td className="p-4"><TagBadge status={task.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Kanban View */}
          {view === 'kanban' && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['BACKLOG', 'IN_PROGRESS', 'FOR_REVIEW', 'DONE'].map((statusKey) => (
                <div key={statusKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <h3 className="font-bold text-gray-800 text-sm">{statusKey.replace('_', ' ')}</h3>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tasks.filter(t => t.status === statusKey).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === statusKey).length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">Empty</p>
                    ) : (
                      tasks.filter(t => t.status === statusKey).map((task) => (
                        <div key={task.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="font-semibold text-gray-800 text-sm mb-2">{task.taskName}</p>
                          <ProgressBar status={task.status} />
                          <div className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            Hard: {formatDate(task.hardDeadline)}
                          </div>
                        </div>
                      ))
                    )}
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