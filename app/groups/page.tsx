"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

interface GroupMember {
    id: string;
    user: { id: string; name: string; image: string | null };
}

interface Group {
    id: string;
    name: string;
    joinCode: string;
    createdAt: string;
    ownerId: string;
    owner: { id: string; name: string; image: string | null };
    members: GroupMember[];
}

export default function GroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    // Create group state
    const [showCreate, setShowCreate] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [creating, setCreating] = useState(false);

    // Join group state
    const [showJoin, setShowJoin] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState("");

    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        try {
            const res = await fetch("/api/groups");
            if (!res.ok) throw new Error("Failed to fetch groups");
            const data = await res.json();
            setGroups(data);
        } catch (error) {
            console.error("Error loading groups:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateGroup(e: React.FormEvent) {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        setCreating(true);

        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newGroupName.trim() }),
            });

            if (!res.ok) throw new Error("Failed to create group");

            setNewGroupName("");
            setShowCreate(false);
            await fetchGroups();
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            setCreating(false);
        }
    }

    async function handleJoinGroup(e: React.FormEvent) {
        e.preventDefault();
        if (!joinCode.trim()) return;
        setJoining(true);
        setJoinError("");

        try {
            const res = await fetch("/api/groups/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joinCode: joinCode.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setJoinError(data.error || "Failed to join group");
                return;
            }

            setJoinCode("");
            setShowJoin(false);
            await fetchGroups();
        } catch (error) {
            console.error("Error joining group:", error);
            setJoinError("Something went wrong. Please try again.");
        } finally {
            setJoining(false);
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#E9DABB] flex items-center justify-center">
                    <p className="text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading groups...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#E9DABB] px-8 py-10 font-sans text-[#780000]">
                <div className="max-w-5xl mx-auto space-y-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase">Groups</h1>
                            <p className="text-[#780000]/60 font-bold italic text-lg mt-2">Your collaborative squads and project teams.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowCreate(true); setShowJoin(false); }}
                                className="px-8 py-4 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#5c0000] hover:scale-105 active:scale-95 transition-all"
                            >
                                + Create Group
                            </button>
                            <button
                                onClick={() => { setShowJoin(true); setShowCreate(false); }}
                                className="px-8 py-4 bg-white/40 border-2 border-[#780000]/10 text-[#780000] font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:bg-white/60 hover:scale-105 active:scale-95 transition-all"
                            >
                                Join Group
                            </button>
                        </div>
                    </div>

                    {/* Create Group Inline Form */}
                    {showCreate && (
                        <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 p-10 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-2xl font-black tracking-tight mb-6">Create a New Group</h2>
                            <form onSubmit={handleCreateGroup} className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Group name (e.g., CSCI 42 Team)"
                                    className="flex-1 px-6 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-bold focus:outline-none focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 transition-all placeholder:text-[#780000]/30"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-10 py-4 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#5c0000] transition-all disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-6 py-4 text-[#780000]/40 font-black uppercase tracking-widest text-xs hover:text-[#780000] transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Join Group Inline Form */}
                    {showJoin && (
                        <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 p-10 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-2xl font-black tracking-tight mb-2">Join a Group</h2>
                            <p className="text-[#780000]/40 font-bold text-xs uppercase tracking-widest mb-6">Enter the 6-character code shared by the group owner.</p>
                            <form onSubmit={handleJoinGroup} className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                                    placeholder="e.g., XK9M2P"
                                    maxLength={6}
                                    className="flex-1 px-6 py-4 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-black text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 transition-all placeholder:text-[#780000]/20 placeholder:text-lg placeholder:tracking-widest uppercase"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={joining || joinCode.length !== 6}
                                    className="px-10 py-4 bg-[#780000] text-[#E9DABB] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#5c0000] transition-all disabled:opacity-50"
                                >
                                    {joining ? "Joining..." : "Join"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowJoin(false); setJoinError(""); }}
                                    className="px-6 py-4 text-[#780000]/40 font-black uppercase tracking-widest text-xs hover:text-[#780000] transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                            {joinError && (
                                <p className="mt-4 text-red-600 font-bold text-sm">{joinError}</p>
                            )}
                        </div>
                    )}

                    {/* Groups Grid */}
                    {groups.length === 0 ? (
                        <div className="bg-white/20 backdrop-blur-md rounded-[3rem] p-20 text-center border-2 border-dashed border-[#780000]/10">
                            <div className="text-6xl mb-6">👥</div>
                            <h3 className="text-2xl font-black tracking-tight mb-2">No Groups Yet</h3>
                            <p className="text-[#780000]/40 font-bold text-sm max-w-md mx-auto">
                                Create your first group and invite your team, or join an existing group with a code.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <Link
                                    key={group.id}
                                    href={`/groups/${group.id}`}
                                    className="group bg-white/30 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/40 p-8 hover:shadow-2xl hover:scale-[1.02] hover:border-[#780000]/20 transition-all duration-300 flex flex-col"
                                >
                                    {/* Group Name */}
                                    <h3 className="text-xl font-black tracking-tight mb-1 group-hover:text-[#780000] transition-colors">
                                        {group.name}
                                    </h3>

                                    {/* Owner */}
                                    <p className="text-[10px] font-bold text-[#780000]/40 uppercase tracking-widest mb-6">
                                        Created by {group.owner.name}
                                    </p>

                                    {/* Member Avatars */}
                                    <div className="flex -space-x-2 mb-6">
                                        {group.members.slice(0, 5).map((member) => (
                                            <div
                                                key={member.id}
                                                className="w-9 h-9 rounded-xl bg-[#780000]/10 border-2 border-[#E9DABB] flex items-center justify-center text-[10px] font-black text-[#780000] group-hover:border-white transition-colors"
                                                title={member.user.name}
                                            >
                                                {member.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                            </div>
                                        ))}
                                        {group.members.length > 5 && (
                                            <div className="w-9 h-9 rounded-xl bg-[#780000] border-2 border-[#E9DABB] flex items-center justify-center text-[10px] font-black text-[#E9DABB]">
                                                +{group.members.length - 5}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#780000]/5">
                                        <span className="text-[10px] font-black text-[#780000]/30 uppercase tracking-widest">
                                            {group.members.length} {group.members.length === 1 ? "member" : "members"}
                                        </span>
                                        <span className="text-[10px] font-black text-[#780000]/30 uppercase tracking-widest bg-[#780000]/5 px-3 py-1 rounded-lg">
                                            {group.joinCode}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center text-[10px] font-black text-[#780000]/20 uppercase tracking-[0.5em] pt-10 pb-4">
                        Sovereign Group Hub © 2026
                    </div>
                </div>
            </div>
        </>
    );
}
