import React, { useState } from 'react';

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
    
    // Here you would call your API route (e.g., /api/tasks) 
    // and pass the formData to Prisma via a Server Action or API handler
    console.log("Submitting Task:", formData);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Task created successfully!");
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Task Name</label>
          <input
            type="text"
            name="taskName"
            required
            placeholder="e.g., Finish Project Proposal"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.taskName}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="taskDescription"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.taskDescription}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.status}
              onChange={handleChange}
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Repetition */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Repetition (Count)</label>
            <input
              type="number"
              name="repetition"
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.repetition}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Soft Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Soft Deadline (Optional)</label>
            <input
              type="date"
              name="softDeadline"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.softDeadline}
              onChange={handleChange}
            />
          </div>

          {/* Hard Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Hard Deadline</label>
            <input
              type="date"
              name="hardDeadline"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.hardDeadline}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default CreateTaskForm;