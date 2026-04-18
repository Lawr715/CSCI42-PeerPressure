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
    <div className="max-w-md mx-auto mt-20 p-8 bg-[#E9DABB] rounded-3xl shadow-xl border border-[#780000]/20">
      <h2 className="text-3xl font-bold mb-8 text-[#780000] tracking-tight text-center">New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-[#780000]/80 mb-2 px-1">Category Name</label>
          <input
            type="text"
            className="w-full p-3 bg-white/70 border-2 border-[#780000]/20 rounded-xl focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 outline-none transition-all placeholder:text-[#780000]/50 text-[#780000] font-bold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Work, Personal, School"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-[#780000] text-[#E9DABB] py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#5c0000] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Save Category
        </button>
      </form>
    </div>
  );
}