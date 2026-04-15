"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter(); 
  const [error, setError] = useState<string | null>(null); 

    // Google Sign-In Handler
    async function handleGoogleSignIn() {
      await signIn.social({
        provider: "google",
        callbackURL: "/Homepage",
      });
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); 
        setError(null); 

        const formData = new FormData(e.currentTarget); 

        const res = await signIn.email({
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
            <h2 className="text-3xl font-bold text-[#780000] mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#780000] transition-all"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#780000] text-[#E9DABB] font-bold rounded-lg px-4 py-3 hover:bg-[#5c0000] transition-colors shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative w-full py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-gray-500">
              <span className="bg-white px-3">Or continue with</span>
            </div>
          </div>

          {/* Google Button - Disabled until configured
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold rounded-lg px-4 py-3 border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
            </svg>
            Sign in with Google
          </button>
          */}

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account? <a href="/Register" className="text-blue-600 font-semibold hover:underline">Create one here</a>
          </p>
        </div>
      </div>
    </main>
  );
}