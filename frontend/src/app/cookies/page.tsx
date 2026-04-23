import Link from 'next/link';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Logo } from '@/components/ui/logo';

export const metadata = {
  title: 'Cookie Policy · Silent Help',
  description:
    'Silent Help uses only strictly-necessary storage. No tracking, no advertising cookies.',
};

export default function CookiePolicy() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora intensity="soft" />
      <NoiseOverlay />
      <main className="relative mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
          <Logo size={24} /> <span>Silent Help</span>
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-[color:var(--color-fg-subtle)]">
          Version v1 · Effective date: 22 April 2026
        </p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-[color:var(--color-fg-muted)]">
          <section>
            <p>
              Silent Help uses <strong>strictly-necessary storage only</strong>. We do not use
              advertising, analytics, tracking, or social cookies. Under PECR / the UK Privacy and
              Electronic Communications Regulations and the EU ePrivacy Directive, strictly-necessary
              storage does not require a consent banner — but you deserve to know what we store.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">What we store</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[color:var(--color-fg-subtle)]">
                  <th className="py-2">Key</th>
                  <th className="py-2">Purpose</th>
                  <th className="py-2">Lifetime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-2 font-mono text-xs">sh_guest_token</td>
                  <td className="py-2">Authenticates your guest session.</td>
                  <td className="py-2">7 days</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">sh_guest_name</td>
                  <td className="py-2">Remembers your chosen guest display name.</td>
                  <td className="py-2">Until you clear it</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">sh_country</td>
                  <td className="py-2">Remembers your SOS country preference.</td>
                  <td className="py-2">Until you clear it</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">sh_child_mode</td>
                  <td className="py-2">
                    Applies the ICO Children&apos;s Code safer-defaults in the UI.
                  </td>
                  <td className="py-2">Until you clear it</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">sh_a11y_*</td>
                  <td className="py-2">Your accessibility choices (font scale, dyslexic, quiet mode).</td>
                  <td className="py-2">Until you clear it</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm">
              Everything is stored in <code>localStorage</code> on your device, not as a browser
              cookie. Nothing is sent to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Clearing storage</h2>
            <p>
              You can clear all Silent Help storage at any time via your browser settings, or via{' '}
              <Link href="/settings/data" className="underline">Settings → Data → Delete account</Link>
              . The service worker cache (used for offline SOS + Box Breathing) can be cleared in
              the same place.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
