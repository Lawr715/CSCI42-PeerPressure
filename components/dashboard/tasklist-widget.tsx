import Link from "next/link";

export function TasklistWidget() {
    return (
        <div className="w-full bg-white text-black p-4 rounded shadow overflow-auto h-[400px]">
             <div className="flex justify-between items-center pb-2">
                <h2 className="font-bold text-lg">Task List & Kanban</h2>
                <div className="space-x-4 flex items-center">
                    <Link href="/Tasklist" className="text-sm text-blue-600 hover:underline">Full Screen ↗</Link>
                    <div className="space-x-2">
                        <button className="px-2 py-1 text-xs rounded bg-gray-200">List View</button>
                        <button className="px-2 py-1 text-xs rounded bg-gray-200">Kanban View</button>
                    </div>
                </div>
            </div>
            
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Progress</th>
                        <th className="p-2">Soft Deadline</th>
                        <th className="p-2">Hard Deadline</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                        <td className="p-2">Sample Name</td>
                        <td className="p-2">Sample Progress</td>
                        <td className="p-2">March 13, 2026</td>
                        <td className="p-2">March 13, 2026</td>
                    </tr>
                    <tr className="border-b">
                        <td className="p-2">Another Task</td>
                        <td className="p-2">In Progress</td>
                        <td className="p-2">March 15, 2026</td>
                        <td className="p-2">March 18, 2026</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
