"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

type ViewMode = 'list' | 'kanban';

interface Task {
  id: number;
  taskName: string;
  taskDescription: string | null;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'FOR_REVIEW' | 'DONE';
  softDeadline: string | null;
  hardDeadline: string;
  repetition: number;
  category?: { categoryName: string };
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // State for the popup
  const [isUpdating, setIsUpdating] = useState(false);

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

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state so the UI reflects the change immediately
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
        setSelectedTask(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="min-h-screen bg-[#E9DABB] p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-black text-[#780000] tracking-tighter">Task Manager</h1>
              <p className="text-[#780000]/60 font-bold italic">Sovereign Focus & Productivity</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#780000]/5 backdrop-blur-md rounded-2xl p-1.5 flex border border-[#780000]/10 shadow-inner">
                <button
                  onClick={() => setView('list')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-[#780000] text-[#E9DABB] shadow-lg scale-105' : 'text-[#780000]/40 hover:text-[#780000]'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${view === 'kanban' ? 'bg-[#780000] text-[#E9DABB] shadow-lg scale-105' : 'text-[#780000]/40 hover:text-[#780000]'}`}
                >
                  Kanban
                </button>
              </div>
              <Link
                href="/Tasklist/Create"
                className="bg-[#780000] text-[#E9DABB] font-black rounded-2xl px-6 py-3 hover:bg-[#5c0000] hover:scale-105 transition-all shadow-xl text-sm uppercase tracking-widest"
              >
                + New Task
              </Link>
            </div>
          </div>

          {/* List View */}
          {view === 'list' && (
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#780000] text-[#E9DABB]">
                    <th className="text-left p-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">Task Name</th>
                    <th className="text-left p-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">Status</th>
                    <th className="text-left p-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">Soft Deadline</th>
                    <th className="text-left p-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">Hard Deadline</th>
                    <th className="text-left p-6 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#780000]/5">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#780000]/5 transition-colors group">
                    <td 
                      className="p-6 font-bold text-[#780000] cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <span className="hover:underline decoration-2">{task.taskName}</span>
                    </td>
                    <td className="p-6"><StatusBadge status={task.status} /></td>
                        <td className="p-6 text-sm text-[#780000]/60 font-bold">{formatDate(task.softDeadline)}</td>
                        <td className="p-6 text-sm text-[#780000] font-black">{formatDate(task.hardDeadline)}</td>
                        <td className="p-6 text-[10px] font-black">
                          <span className="bg-[#780000]/10 text-[#780000] px-3 py-1 rounded-full uppercase">
                            {task.category?.categoryName || "Uncategorized"}
                          </span>
                        </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kanban View */}
          {view === 'kanban' && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {['BACKLOG', 'IN_PROGRESS', 'FOR_REVIEW', 'DONE'].map((statusKey) => (
                <div 
                  key={statusKey} 
                  className="bg-[#780000]/5 backdrop-blur-md rounded-[2.5rem] p-6 border-2 border-dashed border-[#780000]/10 transition-all"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData("taskId");
                    if (taskId) updateTaskStatus(Number(taskId), statusKey);
                  }}
                >
                  <div className="flex items-center justify-between mb-8 px-2 font-black">
                    <h3 className="text-[11px] text-[#780000]/60 uppercase tracking-[0.3em]">{statusKey.replace('_', ' ')}</h3>
                    <span className="text-[11px] text-[#E9DABB] bg-[#780000] px-2.5 py-0.5 rounded-full shadow-lg">
                      {tasks.filter(t => t.status === statusKey).length}
                    </span>
                  </div>

                  <div className="space-y-4 min-h-[300px]">
                    {tasks.filter(t => t.status === statusKey).length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-[#780000]/10 rounded-3xl text-[10px] text-[#780000]/30 font-black uppercase tracking-widest">
                        Ready to Focus
                      </div>
                    ) : (
                      tasks.filter(t => t.status === statusKey).map((task) => (
                        <div 
                          key={task.id} 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("taskId", task.id.toString());
                            e.currentTarget.style.opacity = '0.5';
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          className="p-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/80 hover:border-[#780000] hover:scale-[1.03] transition-all cursor-grab active:cursor-grabbing group ring-1 ring-[#780000]/5"
                        >
                          <p className="font-black text-[#780000] text-sm mb-4 leading-tight">{task.taskName}</p>
                          <MiniProgressBar status={task.status} />
                          <div className="mt-5 flex justify-between items-center">
                            <span className="text-[9px] font-black text-[#780000]/40 uppercase tracking-tighter">Due {formatDate(task.hardDeadline)}</span>
                            <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-[#780000]/20'}`} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* --- THE POPUP MODAL --- */}
        {selectedTask && (
          <div className="fixed inset-0 bg-[#780000]/40 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
            <div className="bg-[#E9DABB] rounded-[3rem] max-w-lg w-full p-10 shadow-[0_0_100px_rgba(120,0,0,0.2)] border border-[#780000]/10 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black text-[#780000] tracking-tighter leading-none">{selectedTask.taskName}</h2>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-[#780000]/40 hover:text-[#780000] transition-colors bg-[#780000]/5 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#780000]/40 tracking-[0.2em] px-1">Mission Description</h4>
                  <p className="text-[#780000]/80 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 font-medium leading-relaxed shadow-inner">
                    {selectedTask.taskDescription || "Clear focus requested. No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 px-1">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase text-[#780000]/40 tracking-[0.2em]">Context</h4>
                    <p className="text-sm font-black text-[#780000] underline decoration-[#780000]/20 underline-offset-4">{selectedTask.category?.categoryName || "General Focus"}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase text-[#780000]/40 tracking-[0.2em]">Hard Deadline</h4>
                    <p className="text-sm font-black text-[#780000] tabular-nums">{formatDate(selectedTask.hardDeadline)}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-[#780000]/40 tracking-[0.2em] px-1">Command Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['BACKLOG', 'IN_PROGRESS', 'FOR_REVIEW', 'DONE'].map((s) => (
                      <button
                        key={s}
                        disabled={isUpdating}
                        onClick={() => updateTaskStatus(selectedTask.id, s)}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2
                          ${selectedTask.status === s 
                            ? 'bg-[#780000] text-[#E9DABB] border-[#780000] shadow-xl scale-[1.02]' 
                            : 'bg-white/30 text-[#780000]/40 border-transparent hover:bg-white/50 hover:text-[#780000]'}`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedTask(null)}
                className="mt-12 w-full py-4 bg-[#780000]/5 text-[#780000] font-black rounded-2xl hover:bg-[#780000]/10 transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                Return to Command
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}