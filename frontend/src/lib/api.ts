/**
 * Silent Help API Client
 * All backend communication goes through this module.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sh_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// ─── Auth ────────────────────────────────────────────────────

export async function register(email: string, password: string, name: string) {
    return apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
}

export async function login(email: string, password: string) {
    return apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function getMe() {
    return apiFetch<{ user: User }>('/api/auth/me');
}

// ─── Conversations ──────────────────────────────────────────

export async function listConversations() {
    return apiFetch<{ conversations: ConversationPreview[] }>('/api/conversations');
}

export async function createConversation(title?: string) {
    return apiFetch<{ conversation: Conversation }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ title }),
    });
}

export async function getConversation(id: string) {
    return apiFetch<{ conversation: Conversation }>(`/api/chat/${id}`);
}

export async function deleteConversation(id: string) {
    return apiFetch<{ success: boolean }>(`/api/chat/${id}`, { method: 'DELETE' });
}

// ─── Chat Messages (Streaming) ──────────────────────────────

export async function sendMessage(
    conversationId: string,
    content: string,
    onChunk: (text: string) => void,
    onDone: (data: { messageId: string; crisis?: CrisisInfo | null }) => void,
    onError: (error: string) => void,
) {
    try {
        const token = localStorage.getItem('sh_token');
        const res = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Failed' }));
            onError(data.error || 'Failed to send message');
            return;
        }

        const contentType = res.headers.get('content-type') || '';

        // Non-streaming response (when no OpenAI key)
        if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data.message) {
                onChunk(data.message.content);
                onDone({ messageId: data.message.id, crisis: data.crisis });
            }
            return;
        }

        // SSE streaming response
        const reader = res.body?.getReader();
        if (!reader) { onError('No response stream'); return; }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.content) onChunk(data.content);
                        if (data.done) onDone({ messageId: data.messageId, crisis: data.crisis });
                        if (data.error) onError(data.error);
                    } catch { /* skip malformed */ }
                }
            }
        }
    } catch (err) {
        onError(err instanceof Error ? err.message : 'Network error');
    }
}

// ─── Journal ────────────────────────────────────────────────

export async function listJournalEntries() {
    return apiFetch<{ entries: JournalEntry[] }>('/api/journal');
}

export async function createJournalEntry(content: string, mood?: string) {
    return apiFetch<{ entry: JournalEntry }>('/api/journal', {
        method: 'POST',
        body: JSON.stringify({ content, mood }),
    });
}

// ─── Mood ───────────────────────────────────────────────────

export async function logMood(mood: string, intensity: number, note?: string) {
    return apiFetch<{ moodLog: MoodLog }>('/api/mood', {
        method: 'POST',
        body: JSON.stringify({ mood, intensity, note }),
    });
}

// ─── Onboarding ─────────────────────────────────────────────

export interface OnboardingAnswers {
    energy: string;
    concern: string;
    context: string;
    approach: string;
    support_style: string;
    time: string;
}

export async function submitOnboarding(answers: OnboardingAnswers) {
    return apiFetch<{ success: boolean; profile: WellnessProfile }>('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(answers),
    });
}

export async function getWellnessProfile() {
    return apiFetch<{ hasProfile: boolean; profile: WellnessProfile | null }>('/api/onboarding');
}

// ─── Health ─────────────────────────────────────────────────

export async function checkHealth() {
    return apiFetch<{ status: string; database: string }>('/api/health');
}

// ─── Types ──────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt?: string;
}

export interface ConversationPreview {
    id: string;
    title: string;
    lastMessage: string | null;
    lastMessageRole: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    id: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    messages: Message[];
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
}

export interface JournalEntry {
    id: string;
    content: string;
    mood: string | null;
    createdAt: string;
}

export interface MoodLog {
    id: string;
    mood: string;
    intensity: number;
    note: string | null;
    createdAt: string;
}

export interface CrisisInfo {
    isCrisis: boolean;
    severity: string;
    resources: Record<string, { name: string; number: string; description: string }>;
    safetyMessage: string;
}

export interface WellnessTool {
    id: string;
    name: string;
    description: string;
    icon: string;
    duration: number;
    priority: number;
    category: string;
    technique: string;
    instructions: string;
}

export interface DashboardTheme {
    gradient: string;
    accent: string;
    mood: string;
    greeting: string;
    ambiance: string;
}

export interface AIPersonality {
    tone: string;
    style: string;
    systemPromptBase: string;
    openingMessage: string;
    avoidTopics: string[];
}

export interface WellnessProfile {
    archetype: string;
    state: string;
    urgencyLevel: string;
    tools: WellnessTool[];
    primaryTool: WellnessTool;
    quickRelief: WellnessTool;
    deeperWork: WellnessTool;
    theme: DashboardTheme;
    aiPersonality: AIPersonality;
    journalPrompt: string;
    affirmation: string;
    bodyFocus: string;
    aiInsight: string;
    answers: OnboardingAnswers;
}

