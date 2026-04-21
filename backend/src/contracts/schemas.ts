/**
 * Shared zod schemas — one source of truth for API request/response shapes.
 * Frontend imports types from here via a relative path for end-to-end type safety.
 */
import { z } from 'zod';

// ── Memories ──────────────────────────────────────────────────────────────
export const MemoryKindSchema = z.enum([
    'context',
    'preference',
    'goal',
    'boundary',
    'relationship',
    'event',
]);
export type MemoryKind = z.infer<typeof MemoryKindSchema>;

export const MemoryCreateSchema = z.object({
    content: z.string().trim().min(3).max(1000),
    kind: MemoryKindSchema.default('context'),
});
export type MemoryCreateInput = z.infer<typeof MemoryCreateSchema>;

// ── Journal ───────────────────────────────────────────────────────────────
export const JournalSearchQuerySchema = z.object({
    q: z.string().trim().min(2).max(200),
    limit: z.coerce.number().int().min(1).max(20).default(8),
});
export type JournalSearchQuery = z.infer<typeof JournalSearchQuerySchema>;

// ── Safety plan ───────────────────────────────────────────────────────────
const SupportPersonSchema = z.object({
    name: z.string().trim().min(1).max(80),
    phone: z.string().trim().min(3).max(32).optional().or(z.literal('')),
    relationship: z.string().trim().max(60).optional().or(z.literal('')),
});
const ProfessionalSchema = z.object({
    name: z.string().trim().min(1).max(80),
    phone: z.string().trim().min(3).max(32).optional().or(z.literal('')),
    role: z.string().trim().max(60).optional().or(z.literal('')),
});

export const SafetyPlanSchema = z.object({
    warningSigns: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
    copingStrategies: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
    reasonsToLive: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
    supportPeople: z.array(SupportPersonSchema).max(10).default([]),
    professionals: z.array(ProfessionalSchema).max(10).default([]),
    safeSpaces: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
});
export type SafetyPlanInput = z.infer<typeof SafetyPlanSchema>;

// ── Reminders ─────────────────────────────────────────────────────────────
export const ReminderCreateSchema = z.object({
    kind: z.enum(['check_in', 'journal', 'tool', 'custom']),
    message: z.string().trim().min(1).max(200),
    dueAt: z.string().datetime(),
});
export type ReminderCreateInput = z.infer<typeof ReminderCreateSchema>;

// ── Coach ─────────────────────────────────────────────────────────────────
export const CoachSuggestInputSchema = z.object({
    feeling: z.string().trim().max(200).optional(),
}).default({});
export type CoachSuggestInput = z.infer<typeof CoachSuggestInputSchema>;
