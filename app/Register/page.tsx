"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client"; 

export default function RegisterPage() {
  const router = useRouter(); 
  const [error, setError] = useState<string | null>(null); 

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); 
        setError(null); 

        const formData = new FormData(e.currentTarget); 

        const res = await signUp.email({
            name: formData.get("name") as string, 
            email: formData.get("email") as string, 
            password: formData.get("password") as string, 
        }); 
        if (res.error) {
            setError(res.error.message || "Something went wrong."); 
        } else {
            router.push("/profile"); 
        } 
    } 
  return (
    <main className="min-h-screen flex text-black">
      {/* Left side banner */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#780000] text-[#E9DABB] p-12">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Peer Pressure</h1>
        <p className="text-xl opacity-90">Elevated Connections. Superior Workflows.</p>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#E9DABB] p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl flex flex-col space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#780000] mb-2">Create Account</h2>
            <p className="text-gray-500">Sign up to get started.</p>
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#780000] transition-all"
              />
            </div>
          
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#780000] transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#780000] transition-all"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#780000] text-[#E9DABB] font-bold rounded-lg px-4 py-3 hover:bg-[#5c0000] transition-colors shadow-md mt-6"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <a href="/Login" className="text-blue-600 font-semibold hover:underline">Log in here</a>
          </p>
        </div>
      </div>
    </main>
  );
}