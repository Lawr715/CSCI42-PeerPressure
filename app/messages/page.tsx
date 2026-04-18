"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";

interface MemberUser {
    id: string;
    name: string;
    image: string | null;
}

interface Group {
    id: string;
    name: string;
    members: { id: string; user: MemberUser }[];
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender: MemberUser;
    groupId: string | null;
    recipientId: string | null;
}

interface Conversation {
    type: "group" | "dm";
    groupId: string;
    groupName: string;
    recipientId?: string;
    recipientName?: string;
    label: string;
}

export default function MessagesPage() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id || "";

    const [groups, setGroups] = useState<Group[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch groups and build conversation list
    useEffect(() => {
        async function loadGroups() {
            try {
                const res = await fetch("/api/groups");
                if (!res.ok) return;
                const data = await res.json();
                setGroups(data);

                // Build conversation list: each group has a group chat + DMs with each member
                const convs: Conversation[] = [];
                data.forEach((g: Group) => {
                    // Group chat
                    convs.push({
                        type: "group",
                        groupId: g.id,
                        groupName: g.name,
                        label: `${g.name} — Group Chat`,
                    });

                    // DMs with each member (excluding self)
                    g.members.forEach((m: any) => {
                        if (m.user.id !== currentUserId) {
                            convs.push({
                                type: "dm",
                                groupId: g.id,
                                groupName: g.name,
                                recipientId: m.user.id,
                                recipientName: m.user.name,
                                label: m.user.name,
                            });
                        }
                    });
                });

                setConversations(convs);
                if (convs.length > 0) setActiveConv(convs[0]);
            } catch (error) {
                console.error("Error loading groups:", error);
            } finally {
                setLoading(false);
            }
        }

        if (currentUserId) loadGroups();
    }, [currentUserId]);

    // Fetch messages for active conversation
    const fetchMessages = useCallback(async () => {
        if (!activeConv) return;

        try {
            const params = new URLSearchParams({ groupId: activeConv.groupId });
            if (activeConv.type === "dm" && activeConv.recipientId) {
                params.set("recipientId", activeConv.recipientId);
            }

            const res = await fetch(`/api/messages?${params}`);
            if (!res.ok) return;
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [activeConv]);

    // Load messages when conversation changes + start polling
    useEffect(() => {
        fetchMessages();

        // Clear existing polling
        if (pollingRef.current) clearInterval(pollingRef.current);

        // Poll every 4 seconds
        pollingRef.current = setInterval(fetchMessages, 4000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchMessages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv) return;
        setSending(true);

        try {
            const payload: any = {
                content: newMessage.trim(),
                groupId: activeConv.groupId,
            };
            if (activeConv.type === "dm" && activeConv.recipientId) {
                payload.recipientId = activeConv.recipientId;
            }

            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to send message");

            setNewMessage("");
            await fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    }

    // Group conversations by group for sidebar
    const groupedConvs: { groupName: string; convs: Conversation[] }[] = [];
    const seenGroups = new Set<string>();
    conversations.forEach((c) => {
        if (!seenGroups.has(c.groupId)) {
            seenGroups.add(c.groupId);
            groupedConvs.push({
                groupName: c.groupName,
                convs: conversations.filter((x) => x.groupId === c.groupId),
            });
        }
    });

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#E9DABB] flex items-center justify-center">
                    <p className="text-[#780000]/60 font-black text-sm uppercase tracking-widest animate-pulse">Loading messages...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="h-[calc(100vh-73px)] bg-[#E9DABB] flex font-sans text-[#780000]">

                {/* Sidebar */}
                <div className="w-80 bg-white/20 backdrop-blur-md border-r border-[#780000]/5 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#780000]/5">
                        <h2 className="text-lg font-black tracking-tight">Messages</h2>
                        <p className="text-[10px] font-bold text-[#780000]/40 uppercase tracking-widest mt-1">Group chats & direct messages</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {groupedConvs.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-[#780000]/30 text-sm font-bold">Join a group to start messaging.</p>
                            </div>
                        ) : (
                            groupedConvs.map((section) => (
                                <div key={section.groupName} className="mb-2">
                                    <p className="px-6 pt-5 pb-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#780000]/30">
                                        {section.groupName}
                                    </p>
                                    {section.convs.map((conv, idx) => {
                                        const isActive = activeConv?.groupId === conv.groupId
                                            && activeConv?.type === conv.type
                                            && activeConv?.recipientId === conv.recipientId;

                                        return (
                                            <button
                                                key={`${conv.groupId}-${conv.type}-${conv.recipientId || idx}`}
                                                onClick={() => setActiveConv(conv)}
                                                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-all ${
                                                    isActive
                                                        ? "bg-[#780000] text-[#E9DABB]"
                                                        : "hover:bg-white/40 text-[#780000]"
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                                    isActive ? "bg-[#E9DABB]/20" : "bg-[#780000]/10"
                                                }`}>
                                                    {conv.type === "group" ? "💬" : conv.recipientName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-black truncate">
                                                        {conv.type === "group" ? "Group Chat" : conv.recipientName}
                                                    </p>
                                                    {conv.type === "dm" && (
                                                        <p className={`text-[9px] font-bold truncate ${isActive ? "opacity-60" : "text-[#780000]/30"}`}>
                                                            Direct Message
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    {activeConv ? (
                        <>
                            <div className="px-8 py-5 bg-white/30 backdrop-blur-md border-b border-[#780000]/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#780000]/10 flex items-center justify-center text-sm font-black">
                                    {activeConv.type === "group" ? "💬" : activeConv.recipientName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-tight">
                                        {activeConv.type === "group" ? `${activeConv.groupName} — Group Chat` : activeConv.recipientName}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[#780000]/40 uppercase tracking-widest">
                                        {activeConv.type === "group" ? "Everyone in the group" : `via ${activeConv.groupName}`}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl mb-4 opacity-30">💬</div>
                                            <p className="text-[#780000]/30 font-bold text-sm">No messages yet. Start the conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.senderId === currentUserId;
                                        const initials = msg.sender.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
                                        const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                                        return (
                                            <div key={msg.id} className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
                                                {!isMine && (
                                                    <div className="w-8 h-8 rounded-lg bg-[#780000]/10 flex items-center justify-center text-[10px] font-black text-[#780000] flex-shrink-0 mt-1">
                                                        {initials}
                                                    </div>
                                                )}
                                                <div className={`max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>
                                                    {!isMine && (
                                                        <p className="text-[10px] font-black text-[#780000]/40 mb-1 px-1">{msg.sender.name}</p>
                                                    )}
                                                    <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                                                        isMine
                                                            ? "bg-[#780000] text-[#E9DABB] rounded-br-md"
                                                            : "bg-white/60 text-[#780000] rounded-bl-md border border-white/80"
                                                    }`}>
                                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                    <p className={`text-[9px] font-bold mt-1 px-1 ${isMine ? "text-right text-[#780000]/30" : "text-[#780000]/30"}`}>
                                                        {time}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="px-8 py-5 bg-white/20 backdrop-blur-md border-t border-[#780000]/5">
                                <form onSubmit={handleSend} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-5 py-3 bg-white/70 border-2 border-[#780000]/10 rounded-2xl text-[#780000] font-medium focus:outline-none focus:border-[#780000] focus:ring-4 focus:ring-[#780000]/5 transition-all placeholder:text-[#780000]/30"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="px-8 py-3 bg-[#780000] text-[#E9DABB] font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:bg-[#5c0000] hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-6 opacity-20">💬</div>
                                <h3 className="text-xl font-black text-[#780000]/30 tracking-tight">No Conversations</h3>
                                <p className="text-[#780000]/20 font-bold text-sm mt-2">Join a group to start messaging your team.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
