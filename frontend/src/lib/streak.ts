'use client';

/**
 * Wellness Streak Tracker
 * 
 * Tracks daily engagement with the platform (journal, mood log, chat, or exercise).
 * Uses localStorage so it works for both guest and authenticated users.
 * Implements "Grace Days" — missing one day doesn't break the streak.
 */

const STREAK_KEY = 'sh_wellness_streak';

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // ISO date string (YYYY-MM-DD)
    graceDayUsed: boolean;
    totalActiveDays: number;
}

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function getDayBeforeYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
}

function loadStreak(): StreakData {
    if (typeof window === 'undefined') {
        return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', graceDayUsed: false, totalActiveDays: 0 };
    }
    try {
        const raw = localStorage.getItem(STREAK_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* corrupted data, reset */ }
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', graceDayUsed: false, totalActiveDays: 0 };
}

function saveStreak(data: StreakData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

/**
 * Call this whenever the user performs a meaningful wellness action
 * (journal entry, mood log, chat message, completing an exercise).
 */
export function recordActivity(): StreakData {
    const streak = loadStreak();
    const today = getToday();

    // Already recorded today
    if (streak.lastActiveDate === today) return streak;

    const yesterday = getYesterday();
    const dayBefore = getDayBeforeYesterday();

    if (streak.lastActiveDate === yesterday) {
        // Consecutive day — extend streak
        streak.currentStreak += 1;
        streak.graceDayUsed = false;
    } else if (streak.lastActiveDate === dayBefore && !streak.graceDayUsed) {
        // Missed yesterday but grace day saves it
        streak.currentStreak += 1;
        streak.graceDayUsed = true;
    } else if (streak.lastActiveDate !== '') {
        // Streak broken — reset
        streak.currentStreak = 1;
        streak.graceDayUsed = false;
    } else {
        // First ever activity
        streak.currentStreak = 1;
    }

    streak.lastActiveDate = today;
    streak.totalActiveDays += 1;
    if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
    }

    saveStreak(streak);
    return streak;
}

/**
 * Get current streak state (read-only, doesn't modify anything).
 */
export function getStreak(): StreakData {
    const streak = loadStreak();
    const today = getToday();
    const yesterday = getYesterday();
    const dayBefore = getDayBeforeYesterday();

    // Check if the streak is still alive
    if (
        streak.lastActiveDate !== today &&
        streak.lastActiveDate !== yesterday &&
        !(streak.lastActiveDate === dayBefore && !streak.graceDayUsed)
    ) {
        // Streak has expired but we don't reset until they next record
        // Return a "preview" with 0 current
        if (streak.lastActiveDate && streak.lastActiveDate !== today) {
            return { ...streak, currentStreak: 0 };
        }
    }

    return streak;
}

export function isActiveToday(): boolean {
    const streak = loadStreak();
    return streak.lastActiveDate === getToday();
}
