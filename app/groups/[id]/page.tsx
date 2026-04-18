"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";

interface MemberUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

interface GroupMemberEntry {
    id: string;
    userId: string;
    joinedAt: string;
    user: MemberUser;
}

interface GroupDetail {
    id: string;
    name: string;
    joinCode: string;
    createdAt: string;
    ownerId: string;
    owner: MemberUser;
    members: GroupMemberEntry[];
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: groupId } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchGroup();
    }, [groupId]);

    async function fetchGroup() {
        try {
            const res = await fetch(`/api/groups/${groupId}`);
            if (!res.ok) throw new Error("Failed to fetch group");
            const data = await res.json();
            setGroup(data);
        } catch (error) {
            console.error("Error loading group:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCopyCode() {
        if (!group) return;
        await navigator.clipboard.writeText(group.joinCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleLeaveGroup() {
        if (!confirm("Are you sure you want to leave this group?")) return;
        setActionLoading("leave");

        try {
            const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to leave group");
            router.push("/groups");
        } catch (error) {
            console.error("Error leaving group:", error);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleDeleteGroup() {
        if (!confirm("Are you sure you want to DELETE this entire group? This action cannot be undone.")) return;
        setActionLoading("delete");

        try {
            const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete group");
            router.push("/groups");
        } catch (error) {
            console.error("Error deleting group:", error);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleKickMember(memberId: string, memberName: string) {
        if (!confirm(`Remove ${memberName} from this group?`)) return;
        setActionLoading(memberId);

        try {
            const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to kick member");
            await fetchGroup();
        } catch (error) {
            console.error("Error kicking member:", error);
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#E9DABB] flex items-center justify-center">
                    <p className="text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading group...</p>
                </div>
            </>
        );
    }

    if (!group) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#E9DABB] flex items-center justify-center">
                    <p className="text-red-600 font-black text-sm uppercase tracking-widest">Group not found or access denied.</p>
                </div>
            </>
        );
    }

    const isOwner = session?.user?.id === group.ownerId;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#E9DABB] px-8 py-10 font-sans text-[#780000]">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* Back */}
                    <button
                        onClick={() => router.push("/groups")}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-[#780000]/40 hover:text-[#780000] transition-colors"
                    >
                        ← Back to Groups
                    </button>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter uppercase">{group.name}</h1>
                            <p className="text-[#780000]/60 font-bold italic text-lg mt-2">
                                Created by {group.owner.name} · {group.members.length} {group.members.length === 1 ? "member" : "members"}
                            </p>
                        </div>
                    </div>

                    {/* Join Code Card */}
                    <div className="bg-[#780000] rounded-[2.5rem] shadow-2xl p-10 text-[#E9DABB] relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-3">Share this code to invite members</p>
                            <div className="flex items-center gap-6">
                                <span className="text-5xl font-black tracking-[0.5em]">{group.joinCode}</span>
                                <button
                                    onClick={handleCopyCode}
                                    className="px-6 py-3 bg-[#E9DABB] text-[#780000] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-colors shadow-lg"
                                >
                                    {copied ? "✓ Copied!" : "Copy Code"}
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Members List */}
                    <div className="bg-white/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden">
                        <div className="p-10 border-b border-[#780000]/5">
                            <h2 className="text-2xl font-black tracking-tight">Members</h2>
                            <p className="text-[#780000]/40 font-bold text-xs uppercase tracking-widest mt-1">
                                {group.members.length} people in this group
                            </p>
                        </div>

                        <div className="divide-y divide-[#780000]/5">
                            {group.members.map((member) => {
                                const initials = member.user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase();
                                const isMemberOwner = member.userId === group.ownerId;
                                const isCurrentUser = member.userId === session?.user?.id;

                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between px-10 py-6 hover:bg-white/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg ${
                                                isMemberOwner
                                                    ? "bg-[#780000] text-[#E9DABB]"
                                                    : "bg-[#780000]/10 text-[#780000]"
                                            }`}>
                                                {initials}
                                            </div>

                                            {/* Info */}
                                            <div>
                                                <p className="font-black text-sm tracking-tight">
                                                    {member.user.name}
                                                    {isCurrentUser && <span className="text-[#780000]/30 ml-2">(you)</span>}
                                                </p>
                                                <p className="text-[10px] font-bold text-[#780000]/40 uppercase tracking-widest">
                                                    {isMemberOwner ? "Owner" : "Member"} · Joined {new Date(member.joinedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Kick Button (only visible to owner, not for self) */}
                                        {isOwner && !isCurrentUser && (
                                            <button
                                                onClick={() => handleKickMember(member.userId, member.user.name)}
                                                disabled={actionLoading === member.userId}
                                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-red-600/60 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === member.userId ? "Removing..." : "Remove"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center pt-4">
                        {isOwner ? (
                            <button
                                onClick={handleDeleteGroup}
                                disabled={actionLoading === "delete"}
                                className="px-10 py-4 bg-red-600/10 border-2 border-red-600/20 text-red-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading === "delete" ? "Deleting..." : "Delete Group"}
                            </button>
                        ) : (
                            <button
                                onClick={handleLeaveGroup}
                                disabled={actionLoading === "leave"}
                                className="px-10 py-4 bg-[#780000]/5 border-2 border-[#780000]/10 text-[#780000] font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#780000] hover:text-[#E9DABB] transition-all disabled:opacity-50"
                            >
                                {actionLoading === "leave" ? "Leaving..." : "Leave Group"}
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-[10px] font-black text-[#780000]/20 uppercase tracking-[0.5em] pt-6 pb-4">
                        Sovereign Group Command © 2026
                    </div>
                </div>
            </div>
        </>
    );
}
