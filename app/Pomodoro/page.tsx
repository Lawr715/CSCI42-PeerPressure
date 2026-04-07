import { CountdownTimer } from "./countdownTimer"
import { Navbar } from "@/components/navbar"

export default function PomodoroPage() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#780000] tracking-tight">Focus Mode</h1>
            <p className="text-gray-500 font-medium">Eliminate distractions. Stay in the zone.</p>
          </div>
        </div>
        <CountdownTimer />
      </div>
    </div>
    </>
  );
}
