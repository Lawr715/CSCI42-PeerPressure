"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCategory() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName: name }),
    });

    if (response.ok) {
      alert("Category created!");
      router.push('/Tasklist/Create');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#780000]">New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#780000] outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Work, Personal, School"
            required
          />
        </div>
        <button type="submit" className="w-full bg-[#780000] text-[#E9DABB] py-2 rounded-lg font-bold hover:bg-[#5c0000] transition-colors">
          Save Category
        </button>
      </form>
    </div>
  );
}