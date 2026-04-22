/**
 * Silent Help API Client
 * All backend communication goes through this module.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const GUEST_TOKEN_KEY = 'sh_guest_token';
const GUEST_NAME_KEY = 'sh_guest_name';

// Support type definition to prevent ESLint 'any' warnings for window injection
interface ClerkWindow extends Window {
    Clerk?: {
        loaded?: boolean;
        session?: {
            getToken: () => Promise<string>;
        };
    };
}

/**
 * Wait briefly for the Clerk SDK (`window.Clerk`) to finish hydrating. Without
 * this, API calls that fire on first render attach no Authorization header
 * because `window.Clerk` hasn't been populated yet — every protected endpoint
 * then responds with 401 even though the user is actually signed in.
 */
async function waitForClerk(timeoutMs = 1500): Promise<void> {
    if (typeof window === 'undefined') return;
    const clerkWin = window as unknown as ClerkWindow;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (clerkWin.Clerk?.loaded) return;
        await new Promise((r) => setTimeout(r, 50));
    }
}

/**
 * Fetch a backend-signed JWT for the current guest session, caching it in
 * localStorage so we only mint one per device. Lets guest users (no Clerk
 * account) call protected endpoints like journal/mood/chat without hitting 401.
 */
async function ensureGuestToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const existing = localStorage.getItem(GUEST_TOKEN_KEY);
    if (existing) return existing;
    try {
        const res = await fetch(`${API_BASE}/api/auth/guest`, { method: 'POST' });
        if (!res.ok) return null;
        const data = await res.json();
        if (typeof data.token === 'string') {
            localStorage.setItem(GUEST_TOKEN_KEY, data.token);
            return data.token;
        }
    } catch {
        /* network error — caller will get 401 and retry next time */
    }
    return null;
}

export async function getAuthToken(): Promise<string | null> {
    const h = await getAuthHeaders();
    const a = h['Authorization'];
    if (typeof a === 'string' && a.startsWith('Bearer ')) return a.slice('Bearer '.length);
    return null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window === 'undefined') return headers;

    await waitForClerk();
    const clerkWin = window as unknown as ClerkWindow;

    // Signed-in Clerk user → use their session token
    if (clerkWin.Clerk?.session) {
        try {
            const token = await clerkWin.Clerk.session.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                return headers;
            }
        } catch {
            /* fall through to guest fallback */
        }
    }

    // Guest session (either explicit guest_name flag, or legacy guest with only a cached token)
    const hasGuestName = !!localStorage.getItem(GUEST_NAME_KEY);
    const hasGuestToken = !!localStorage.getItem(GUEST_TOKEN_KEY);
    if (hasGuestName || hasGuestToken) {
        const guestToken = await ensureGuestToken();
        if (guestToken) headers['Authorization'] = `Bearer ${guestToken}`;
    }

    return headers;
}

/**
 * Public helper so code paths outside `apiFetch` (e.g. the onboarding submit in
 * `app/auth/page.tsx`) can mint the guest token proactively when a user picks
 * the guest flow, rather than waiting for the first protected call to 401.
 */
export async function provisionGuestAuth(): Promise<string | null> {
    return ensureGuestToken();
}

export function clearGuestAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...authHeaders, ...options.headers },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// Legacy Auth Methods Removed
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
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
            method: 'POST',
            headers: authHeaders,
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

export async function getJournalInsight() {
    return apiFetch<{ insight: string | null; message?: string; entryCount?: number }>('/api/journal/insight', {
        method: 'POST',
    });
}

// ─── Mood ───────────────────────────────────────────────────

export async function getMoodHistory() {
    return apiFetch<{ logs: MoodLog[] }>('/api/mood');
}

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

// ─── Memory (RAG) ───────────────────────────────────────────

export interface Memory {
    id: string;
    content: string;
    kind: 'context' | 'preference' | 'goal' | 'boundary' | 'relationship' | 'event';
    salience: number;
    source: string;
    createdAt: string;
}

export async function listMemories() {
    return apiFetch<{ memories: Memory[] }>('/api/memory');
}

export async function createMemory(content: string, kind: Memory['kind'] = 'context') {
    return apiFetch<{ memory: Memory }>('/api/memory', {
        method: 'POST',
        body: JSON.stringify({ content, kind }),
    });
}

export async function deleteMemory(id: string) {
    return apiFetch<{ ok: boolean }>(`/api/memory/${id}`, { method: 'DELETE' });
}

// ─── Semantic journal search ────────────────────────────────

export interface JournalSearchHit {
    id: string;
    content: string;
    mood: string | null;
    createdAt: string;
    similarity: number;
}

export async function searchJournal(q: string, limit = 8) {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return apiFetch<{ results: JournalSearchHit[]; query: string }>(`/api/journal/search?${params}`);
}

// ─── Weekly digest ──────────────────────────────────────────

export interface WeeklyDigest {
    period: string;
    periodKey: string;
    summary: string;
    highlights: string[];
    themes: string[];
    nudge: string;
    generatedAt: string;
}

export async function getWeeklyDigest(refresh = false) {
    const path = refresh ? '/api/insights/weekly?refresh=true' : '/api/insights/weekly';
    return apiFetch<{ digest: WeeklyDigest }>(path);
}

// ─── Adaptive coach ─────────────────────────────────────────

export interface CoachSuggestion {
    title: string;
    body: string;
    durationMinutes: number;
    toolId: string | null;
    source: 'learned' | 'ai' | 'default';
    rationale: string;
}

export async function suggestCoachAction(feeling?: string) {
    return apiFetch<{ suggestion: CoachSuggestion }>('/api/coach/suggest', {
        method: 'POST',
        body: feeling ? JSON.stringify({ feeling }) : JSON.stringify({}),
    });
}

// ─── Safety plan ────────────────────────────────────────────

export interface SafetyPlan {
    warningSigns: string[];
    copingStrategies: string[];
    reasonsToLive: string[];
    supportPeople: { name: string; contact?: string; note?: string }[];
    professionals: { name: string; contact?: string; note?: string }[];
    safeSpaces: string[];
}

export async function getSafetyPlan() {
    return apiFetch<{ plan: (SafetyPlan & { id: string; updatedAt: string }) | null }>(
        '/api/safety-plan',
    );
}

export async function saveSafetyPlan(plan: SafetyPlan) {
    return apiFetch<{ plan: SafetyPlan & { id: string; updatedAt: string } }>(
        '/api/safety-plan',
        { method: 'PUT', body: JSON.stringify(plan) },
    );
}

// ─── Stats ──────────────────────────────────────────────────

export interface WellnessStats {
    streak: number;
    totalActiveDays: number;
    wellnessScore: number;
    moodAverage: number | null;
    toolsCompleted: number;
    journalDays: number;
}

export async function getWellnessStats() {
    return apiFetch<WellnessStats>('/api/stats/streak');
}

// ─── Privacy (GDPR) ─────────────────────────────────────────

export async function deleteAccount() {
    return apiFetch<{ ok: boolean; deletedAt: string; note: string }>('/api/me', {
        method: 'DELETE',
    });
}

export function exportAccountUrl() {
    return `${API_BASE}/api/me/export`;
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
    stressLevel: 'low' | 'mid-low' | 'mid-high' | 'high' | 'light' | 'elevated' | 'intense' | 'urgent';
    emotionalProfile?: 'overwhelmed' | 'anxious' | 'frustrated' | 'sad' | 'pressure';
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

