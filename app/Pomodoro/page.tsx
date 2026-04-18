import { CountdownTimer } from "./countdownTimer"
import { Navbar } from "@/components/navbar"

export default function PomodoroPage() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#E9DABB] px-8 py-10 font-sans text-[#780000]">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">Focus Control</h1>
            <p className="text-[#780000]/60 font-bold italic text-lg mt-2">Eliminate distractions. Command your attention.</p>
          </div>
        </div>
        <CountdownTimer />
      </div>
    </div>
    </>
  );
}
