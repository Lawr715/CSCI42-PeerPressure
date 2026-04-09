"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

type ViewMode = 'list' | 'kanban';

interface Task {
  id: number;
  taskName: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'FOR_REVIEW' | 'DONE';
  softDeadline: string | null;
  hardDeadline: string;
  repetition: number;
}

// Progress Bar helper specifically for Kanban visualization
function MiniProgressBar({ status }: { status: string }) {
  const value = status === 'DONE' ? 100 : status === 'FOR_REVIEW' ? 75 : status === 'IN_PROGRESS' ? 30 : 5;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: status === 'DONE' ? '#16a34a' : '#780000' }}
      />
    </div>
  );
}

// Updated Status Badge for the List View
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DONE: "bg-green-100 text-green-700 border-green-200",
    FOR_REVIEW: "bg-purple-100 text-purple-700 border-purple-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    BACKLOG: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider ${styles[status] || styles.BACKLOG}`}>
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
        if (Array.isArray(data)) setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No Date";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F5F5] p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#780000] tracking-tight">Task Manager</h1>
              <p className="text-gray-500 font-medium">Organize your workflow and track deadlines.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl p-1 flex shadow-sm border border-gray-100">
                <button
                  onClick={() => setView('list')}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-[#780000] text-[#E9DABB] shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  List
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
                    <th className="text-left p-4 font-bold text-xs uppercase tracking-widest">Task Name</th>
                    <th className="text-left p-4 font-bold text-xs uppercase tracking-widest">Status</th>
                    <th className="text-left p-4 font-bold text-xs uppercase tracking-widest">Soft Deadline</th>
                    <th className="text-left p-4 font-bold text-xs uppercase tracking-widest">Hard Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-400 animate-pulse font-bold uppercase text-xs tracking-widest">Loading...</td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-gray-400 italic font-medium">
                        No Tasks Found.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-800">{task.taskName}</td>
                        <td className="p-4"><StatusBadge status={task.status} /></td>
                        <td className="p-4 text-sm text-gray-500 font-semibold">{formatDate(task.softDeadline)}</td>
                        <td className="p-4 text-sm text-[#780000] font-black">{formatDate(task.hardDeadline)}</td>
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
                <div key={statusKey} className="bg-gray-100/50 rounded-2xl p-4 border border-dashed border-gray-200">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-black text-[11px] text-gray-500 uppercase tracking-widest">{statusKey.replace('_', ' ')}</h3>
                    <span className="text-[10px] font-bold text-white bg-gray-400 px-2 py-0.5 rounded-full">
                      {tasks.filter(t => t.status === statusKey).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === statusKey).length === 0 ? (
                      <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-widest">Empty</div>
                    ) : (
                      tasks.filter(t => t.status === statusKey).map((task) => (
                        <div key={task.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#780000] transition-colors cursor-pointer group">
                          <p className="font-bold text-gray-800 text-sm mb-3 group-hover:text-[#780000]">{task.taskName}</p>
                          <MiniProgressBar status={task.status} />
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Due: {formatDate(task.hardDeadline)}</span>
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
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