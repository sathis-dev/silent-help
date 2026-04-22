import Link from 'next/link';

export const metadata = {
    title: 'Offline · Silent Help',
};

export default function OfflinePage() {
    return (
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-fg-muted)]">
                Offline
            </div>
            <h1 className="font-display text-3xl italic sm:text-4xl">
                You&rsquo;re out of signal, not out of support.
            </h1>
            <p className="text-[color:var(--color-fg-muted)]">
                The crisis screen and Box Breathing still work without internet. Your draft
                journal entries will save locally and sync when you&rsquo;re back online.
            </p>
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/sos"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm hover:bg-white/[0.08]"
                >
                    Open SOS
                </Link>
                <Link
                    href="/tools"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm hover:bg-white/[0.08]"
                >
                    Box Breathing
                </Link>
            </div>
        </div>
    );
}
