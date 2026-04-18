import Link from "next/link";

export function TasklistWidget({ tasks = [] }: { tasks?: any[] }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="w-full bg-white/50 backdrop-blur-3xl text-[#780000] p-6 rounded-[2.5rem] shadow-xl border border-white h-full flex flex-col justify-center items-center">
                <div className="flex w-full justify-between items-center absolute top-6 left-6 right-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Task List & Kanban</h2>
                    <Link href="/Tasklist" className="text-[10px] font-black tracking-[0.2em] opacity-60 hover:opacity-100 transition-colors uppercase pr-12">Full Screen ↗</Link>
                </div>
                <p className="text-sm font-bold opacity-60 italic mt-8">No impending tasks detected.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white/50 backdrop-blur-3xl text-[#780000] p-6 rounded-[2.5rem] shadow-xl border border-white h-full flex flex-col relative">
             <div className="flex justify-between items-center pb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Task List & Kanban</h2>
                <div className="space-x-4 flex items-center">
                    <Link href="/Tasklist" className="text-[10px] font-black tracking-[0.2em] opacity-60 hover:opacity-100 transition-colors uppercase">Full Screen ↗</Link>
                    <div className="space-x-2 hidden md:block">
                        <button className="px-3 py-1 text-[9px] uppercase tracking-widest font-black rounded-lg bg-[#780000]/10 text-[#780000] hover:bg-[#780000]/20 transition-colors">List View</button>
                        <button className="px-3 py-1 text-[9px] uppercase tracking-widest font-black rounded-lg bg-white text-[#780000]/40 hover:text-[#780000] transition-colors border border-white tracking-widest">Kanban View</button>
                    </div>
                </div>
            </div>
            
            <div className="overflow-auto flex-1 pb-4">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-[#780000]/50 border-b border-[#780000]/10">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Progress</th>
                            <th className="p-3">Soft Deadline</th>
                            <th className="p-3">Hard Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} className="border-b border-[#780000]/5 hover:bg-[#780000]/5 transition-colors group">
                                <td className="p-3 font-black">{task.taskName}</td>
                                <td className="p-3">
                                    <span className={`text-[10px] px-2 py-1 rounded-md font-black tracking-widest uppercase ${
                                        task.status === 'DONE' ? 'bg-green-500/20 text-green-700' :
                                        task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-700' :
                                        'bg-[#780000]/10 text-[#780000]'
                                    }`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-3 font-semibold text-[#780000]/60 text-xs">
                                    {task.softDeadline ? new Date(task.softDeadline).toLocaleDateString() : '—'}
                                </td>
                                <td className="p-3 font-semibold text-[#780000]/80 text-xs tabular-nums">
                                    {new Date(task.hardDeadline).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
