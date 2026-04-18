"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

// Define the Status Enum based on your Prisma Schema
enum TaskStatus {
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  FOR_REVIEW = "FOR_REVIEW",
  DONE = "DONE"
}

interface TaskFormData {
  taskName: string;
  taskDescription: string;
  status: TaskStatus;
  softDeadline: string;
  hardDeadline: string;
  repetition: number;
}

const CreateTaskForm = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<{id: number, categoryName: string}[]>([]);
    useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  const [formData, setFormData] = useState<TaskFormData>({
    taskName: '',
    taskDescription: '',
    status: TaskStatus.BACKLOG,
    softDeadline: '',
    hardDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
    repetition: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting Task:", formData);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Task created successfully!");
        router.push('/Tasklist');
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-10 bg-[#E9DABB] rounded-3xl shadow-2xl border border-[#780000]/10">
      <h2 className="text-3xl font-bold mb-8 text-[#780000] tracking-tight text-center">Add New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Name */}
        <div className="space-y-1">
          <label className="block text-sm font-bold text-[#780000]/80 px-1">Task Name</label>
          <input
            type="text"
            name="taskName"
            required
            placeholder="e.g., Finish Project Proposal"
            className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all placeholder:text-[#780000]/50 text-[#780000] font-bold"
            value={formData.taskName}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-bold text-[#780000]/80 px-1">Description</label>
          <textarea
            name="taskDescription"
            rows={3}
            className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all text-[#780000] font-bold placeholder:text-[#780000]/50"
            value={formData.taskDescription}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-[#780000]/80 px-1">Status</label>
            <select
              name="status"
              className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all text-[#780000] font-black appearance-none cursor-pointer"
              value={formData.status}
              onChange={handleChange}
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Repetition */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-[#780000]/80 px-1">Repetition (Count)</label>
            <input
              type="number"
              name="repetition"
              min="1"
              className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all text-[#780000] font-bold"
              value={formData.repetition}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Soft Deadline */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-[#780000]/80 px-1">Soft Deadline (Optional)</label>
            <input
              type="date"
              name="softDeadline"
              className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all text-[#780000] font-bold"
              value={formData.softDeadline}
              onChange={handleChange}
            />
          </div>

          {/* Hard Deadline */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-[#780000]/80 px-1">Hard Deadline Command</label>
            <input
              type="date"
              name="hardDeadline"
              required
              className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all text-[#780000] font-bold"
              value={formData.hardDeadline}
              onChange={handleChange}
            />
          </div>
            
          {/* Category/Tags */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-[#780000]/80 px-1">Category</label>
            <div className="relative group">
              <select
                name="categoryId"
                className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all text-[#780000] font-bold appearance-none cursor-pointer"
                onChange={handleChange}
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
              <div className="mt-2 text-right">
                <Link href="/categories/create" className="text-sm font-bold text-[#780000] hover:text-[#5c0000] transition-colors inline-flex items-center gap-1">
                  <span className="text-lg">+</span> Create New Category
                </Link>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-[#780000] text-[#E9DABB] py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-[#5c0000] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}

export default CreateTaskForm;