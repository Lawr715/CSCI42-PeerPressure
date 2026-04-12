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
      const taskRes = await fetch('/api/tasks');
      const dbTasks = await taskRes.json();

      // 2. Fetch Google Calendar events
      const calRes = await fetch('/api/calendar');
      const googleEvents = await calRes.json();
      const googleTasks = googleEvents.map((event: any) => ({
        id: `g-${event.id}`, // avoid ID conflicts
        taskName: event.title,
        taskDescription: "Google Calendar Event",
        status: "BACKLOG",
        softDeadline: null,
        hardDeadline: event.start,
        repetition: 0,
        category: { categoryName: "Google Calendar" }
      }));
      //Merge 
      setTasks([
        ...dbTasks,
        ...googleTasks
      ]);

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
                    <th className="text-left p-4 font-bold text-xs uppercase tracking-widest">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td 
                      className="p-4 font-bold text-[#780000] cursor-pointer hover:underline"
                      onClick={() => setSelectedTask(task)} // Trigger popup
                    >
                      {task.taskName}
                    </td>
                    <td className="p-4"><StatusBadge status={task.status} /></td>
                        <td className="p-4 text-sm text-gray-500 font-semibold">{formatDate(task.softDeadline)}</td>
                        <td className="p-4 text-sm text-[#780000] font-black">{formatDate(task.hardDeadline)}</td>
                        <td className="p-4 text-xs font-bold">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {task.category?.categoryName || "No Tags"}
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

        {/* --- THE POPUP MODAL --- */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-[#780000]">{selectedTask.taskName}</h2>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {selectedTask.taskDescription || "No description provided."}
                    {/* unsure why taskDescription is being marked as unrecognized in my local device when it loads just fine*/}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Category</h4>
                    <p className="text-sm font-bold text-gray-800">{selectedTask.category?.categoryName || "Uncategorized"}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">Due Date</h4>
                    <p className="text-sm font-bold text-[#780000]">{formatDate(selectedTask.hardDeadline)}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {['BACKLOG', 'IN_PROGRESS', 'FOR_REVIEW', 'DONE'].map((s) => (
                      <button
                        key={s}
                        disabled={isUpdating}
                        onClick={() => updateTaskStatus(selectedTask.id, s)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all border
                          ${selectedTask.status === s 
                            ? 'bg-[#780000] text-white border-[#780000]' 
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedTask(null)}
                className="mt-8 w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}