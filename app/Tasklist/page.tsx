import { Navbar } from "@/components/navbar"
import Head from "next/head";

function Header() {
    return (
        <div className="px-2">
        <table className="table-fixed w-full">
            <tr className="bg-[#780000] text-[#E9DABB] font-bold">
                <th className="w-1/4 text-left p-2 rounded-l-xl">Name</th>
                <th className="w-1/6 text-left p-2">Progress</th>
                <th className="w-1/5 text-left p-2">Soft Deadline</th>
                <th className="w-1/5 text-left p-2">Hard Deadline</th>
                <th className="w-1/6 text-left p-2 rounded-r-xl">Tags</th>
            </tr>
        </table>
        </div>
    );
}

function Row() {
    return (
        <div className="px-2">
            <table className="table-fixed w-full ">
                <tr className="text-[#780000] border-b border-gray-700">
                    <th className="w-1/4 text-left p-2 border-r border-gray-700">Sample Name</th>
                    <th className="w-1/6 text-left p-2 border-r border-gray-700">Sample Progress</th>
                    <th className="w-1/5 text-left p-2 border-r border-gray-700">March 13, 2026</th>
                    <th className="w-1/5 text-left p-2 border-r border-gray-700">March 13, 2026</th>
                    <th className="w-1/6 text-left p-2 ">No Tags Attached</th>
                </tr>
            </table>
        </div>
    );
}

function Main() {
    return (
        <div>
            <div className="flex justify-between items-center pt-8 pb-2">
            <div>
                <button className="m-2 p-2 rounded-lg text-[#E9DABB] bg-[#CA615E]">Kanban Board</button>
                <button className="m-2 p-2 rounded-lg text-[#E9DABB] bg-[#CA615E]">Calendar View</button>
            </div>
            <div>
                <button className="m-2 py-2 px-6 rounded-lg text-black bg-gray-400 font-bold">Filter</button>
            </div>
            </div>
            <div className="pb-2">
                <Header />
                <Row />
                <Row />
                <Row />
                <Row />
            </div>
        </div>
    );
}

export default function TaskList() {
    return(
        <div className="bg-[#E9DABB]">
            <Navbar />
            <Main />
        </div>
    );
}