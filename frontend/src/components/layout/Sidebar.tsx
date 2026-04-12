'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { listConversations, createConversation, deleteConversation, type ConversationPreview } from '@/lib/api';


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<ConversationPreview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    async function loadConversations() {
        try {
            const data = await listConversations();
            setConversations(data.conversations);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleNewChat() {
        try {
            const data = await createConversation();
            setConversations(prev => [
                { id: data.conversation.id, title: 'New conversation', lastMessage: null, lastMessageRole: null, createdAt: data.conversation.createdAt, updatedAt: data.conversation.updatedAt },
                ...prev,
            ]);
            router.push(`/chat/${data.conversation.id}`);
            onClose();
        } catch (err) {
            console.error('Failed to create conversation:', err);
        }
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        try {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (pathname === `/chat/${id}`) {
                router.push('/chat');
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
        }
    }

    const currentId = pathname.startsWith('/chat/') ? pathname.split('/chat/')[1] : null;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                        <div className="flex items-center gap-2">
                            <span style={{ fontSize: '1.4rem' }}>🌙</span>
                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Silent Help</span>
                        </div>
                        <button
                            className="btn-ghost"
                            onClick={onClose}
                            style={{ padding: '4px 8px', fontSize: '1.2rem', border: 'none', display: 'none', cursor: 'pointer', background: 'none', color: 'var(--text-muted)' }}
                            aria-label="Close sidebar"
                        >
                            ✕
                        </button>
                    </div>
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleNewChat}
                        style={{ gap: '6px' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Conversations list */}
                <div className="sidebar-content">
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <div className="loading-dots"><span /><span /><span /></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No conversations yet.<br />Start a new chat!
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`sidebar-item ${currentId === conv.id ? 'active' : ''}`}
                                onClick={() => { router.push(`/chat/${conv.id}`); onClose(); }}
                                style={{ position: 'relative' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {conv.title}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(conv.id, e)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', padding: '2px', fontSize: '0.9rem',
                                        opacity: 0.5, transition: 'opacity 0.2s',
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                                    aria-label="Delete conversation"
                                >
                                    🗑
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </>
    );
}
