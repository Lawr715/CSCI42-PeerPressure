"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen h-screen w-full bg-[#E9DABB] text-[#780000] overflow-hidden p-6 text-center">
      {/* Editorial Navigation */}
      <nav className="absolute top-0 w-full flex justify-between items-center p-8 max-w-7xl mx-auto">
        <span className="text-xl font-black tracking-tighter uppercase">Peer Pressure</span>
        <Link 
          href="/Login" 
          className="text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          Login
        </Link>
      </nav>

      {/* Hero Content */}
      <div className="flex flex-col items-center space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase">
          Elevated Connections.<br />
          Superior Workflows.
        </h1>
        
        <div className="flex flex-col space-y-6 w-full max-w-xs">
          <button
            onClick={() => router.push("/Register")}
            className="w-full bg-[#780000] text-[#E9DABB] font-black uppercase py-5 px-10 text-xs tracking-[0.3em] shadow-2xl hover:bg-[#5c0000] transition-colors"
          >
            Join the Pressure
          </button>
        </div>
      </div>

      {/* Subtle Footer branding */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.6em] opacity-30 whitespace-nowrap">
        Social Productivity Ecosystem
      </footer>
    </main>
  );
}
