import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { jsonOk, jsonError } from '@/lib/http';
import { requestLogger } from '@/lib/logger';

/**
 * GET /api/stats/streak — consecutive-day streak of wellness engagement +
 * overall wellness score (0-100) derived from mood, tool completion, and journal frequency.
 */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [moods, tools, journals] = await Promise.all([
            prisma.moodLog.findMany({ where: { userId: payload.userId, createdAt: { gte: since } }, select: { createdAt: true, intensity: true } }),
            prisma.toolUsage.findMany({ where: { userId: payload.userId, createdAt: { gte: since } }, select: { createdAt: true, action: true, moodBefore: true, moodAfter: true } }),
            prisma.journalEntry.findMany({ where: { userId: payload.userId, createdAt: { gte: since } }, select: { createdAt: true } }),
        ]);

        const days = new Set<string>();
        for (const r of moods) days.add(toDayKey(r.createdAt));
        for (const r of tools) if (r.action === 'completed') days.add(toDayKey(r.createdAt));
        for (const r of journals) days.add(toDayKey(r.createdAt));

        // Current streak: consecutive days ending at today (or yesterday).
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            if (days.has(toDayKey(d))) streak++;
            else if (i === 0) continue; // grace for "not yet today"
            else break;
        }

        // Wellness score — naive composite:
        const moodAvg = moods.length ? moods.reduce((s, m) => s + m.intensity, 0) / moods.length : null;
        const completions = tools.filter((t) => t.action === 'completed').length;
        const effectiveCompletions = tools.filter((t) => t.action === 'completed' && t.moodBefore != null && t.moodAfter != null && t.moodAfter < t.moodBefore).length;
        const journalDays = new Set(journals.map((j) => toDayKey(j.createdAt))).size;

        const engagement = Math.min(1, (completions * 2 + journalDays * 3 + moods.length) / 30);
        const wellbeing = moodAvg != null ? 1 - (moodAvg - 1) / 9 : 0.5; // 1=calm, 10=overwhelmed → flip
        const efficacy = completions > 0 ? effectiveCompletions / completions : 0.5;
        const score = Math.round((engagement * 40 + wellbeing * 35 + efficacy * 25));

        return jsonOk({
            streak,
            totalActiveDays: days.size,
            wellnessScore: score,
            moodAverage: moodAvg == null ? null : Math.round(moodAvg * 10) / 10,
            toolsCompleted: completions,
            journalDays,
        });
    } catch (e) {
        log.error({ err: String(e) }, 'stats.streak.failed');
        return jsonError(500, 'Could not compute stats');
    }
}

function toDayKey(d: Date | string): string {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
