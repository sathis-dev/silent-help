import prisma from '@/lib/prisma';

/**
 * GET /api/health — Backend health check
 */
export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return Response.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return Response.json({
            status: 'error',
            database: 'disconnected',
        }, { status: 503 });
    }
}
