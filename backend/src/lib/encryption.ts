/**
 * AES-256-GCM encryption for at-rest private data (e.g. journal entries).
 *
 * Keying:
 *   - Master key comes from env `ENCRYPTION_MASTER_KEY` (>=32 bytes).
 *   - Per-user key is derived via HKDF (`userId` as salt). This gives
 *     per-user isolation while still allowing a single key in the
 *     environment for ops simplicity.
 *   - Each write uses a fresh 12-byte IV.
 *
 * Format on disk (base64 single string):
 *   b64(iv[12] | tag[16] | ciphertext)
 *
 * If no master key is configured, callers fall back to plaintext storage —
 * this keeps the dev experience frictionless while allowing production to
 * enforce encryption via the `ENCRYPTION_REQUIRED=true` env flag.
 */
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

export class EncryptionDisabledError extends Error {
    constructor() {
        super('Encryption required but ENCRYPTION_MASTER_KEY is not configured');
    }
}

function masterKey(): Buffer | null {
    const raw = process.env.ENCRYPTION_MASTER_KEY;
    if (!raw) return null;
    // Accept hex (64 chars), base64, or raw text. Normalise to 32 bytes via SHA-256.
    return crypto.createHash('sha256').update(raw).digest();
}

function deriveUserKey(master: Buffer, userId: string): Buffer {
    // HKDF — RFC 5869. "silent-help:journal" gives us room to expand to other namespaces.
    const salt = Buffer.from(userId, 'utf8');
    const info = Buffer.from('silent-help:journal', 'utf8');
    return Buffer.from(crypto.hkdfSync('sha256', master, salt, info, 32));
}

export function isEncryptionEnabled(): boolean {
    return Boolean(masterKey());
}

export interface EncryptedPayload {
    cipherText: string | null; // base64 iv|tag|ct
    plaintextFallback: string | null; // for when encryption is disabled (legacy + dev)
}

/**
 * Encrypt a string for a specific user.
 * Returns { cipherText } in prod; { plaintextFallback } in dev with no master key.
 */
export function encryptForUser(userId: string, plaintext: string): EncryptedPayload {
    const master = masterKey();
    if (!master) {
        if (process.env.ENCRYPTION_REQUIRED === 'true') throw new EncryptionDisabledError();
        return { cipherText: null, plaintextFallback: plaintext };
    }
    const key = deriveUserKey(master, userId);
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const packed = Buffer.concat([iv, tag, ct]).toString('base64');
    return { cipherText: packed, plaintextFallback: null };
}

/**
 * Decrypt. Accepts either a ciphertext string (preferred) or a plaintext
 * fallback (legacy) and returns the plaintext either way.
 */
export function decryptForUser(
    userId: string,
    cipherText: string | null,
    plaintextFallback: string | null,
): string {
    if (!cipherText) return plaintextFallback ?? '';
    const master = masterKey();
    if (!master) {
        // Can't decrypt — return fallback if present, otherwise empty.
        return plaintextFallback ?? '';
    }
    try {
        const key = deriveUserKey(master, userId);
        const packed = Buffer.from(cipherText, 'base64');
        const iv = packed.subarray(0, IV_LEN);
        const tag = packed.subarray(IV_LEN, IV_LEN + TAG_LEN);
        const ct = packed.subarray(IV_LEN + TAG_LEN);
        const decipher = crypto.createDecipheriv(ALGO, key, iv);
        decipher.setAuthTag(tag);
        const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
        return pt.toString('utf8');
    } catch {
        // Corrupt or key mismatch — degrade gracefully rather than breaking UI.
        return plaintextFallback ?? '';
    }
}

/**
 * Helper for SHA-256 hashing (for audit log IP anonymisation etc.).
 */
export function sha256(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
}
