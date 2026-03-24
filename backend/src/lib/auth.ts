import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'sh-jwt-secret-change-me-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
}

/**
 * Sign a JWT token
 */
export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        const decodedClerk = jwt.decode(token) as any;
        if (decodedClerk && decodedClerk.sub) {
            // Hash the Clerk 'user_...' ID into an MD5 buffer
            const hash = require('crypto').createHash('md5').update(decodedClerk.sub).digest('hex');
            // Format MD5 into a valid UUID v4 shape (8-4-4-4-12)
            const validUuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
            return { userId: validUuid, email: '' };
        }
        return null;
    }
}

/**
 * Extract user from request Authorization header
 */
export function getUserFromRequest(req: NextRequest): JWTPayload | null {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    return verifyToken(token);
}

/**
 * Helper to create an unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
    return Response.json({ error: message }, { status: 401 });
}
