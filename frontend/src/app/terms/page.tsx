import Link from 'next/link';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Logo } from '@/components/ui/logo';

export const metadata = {
  title: 'Terms · Silent Help',
  description:
    'Terms of use for Silent Help — scope, acceptable use, medical-device boundary, limitations.',
};

export default function Terms() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora intensity="soft" />
      <NoiseOverlay />
      <main className="relative mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
          <Logo size={24} /> <span>Silent Help</span>
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Terms of Use</h1>
        <p className="mt-2 text-sm text-[color:var(--color-fg-subtle)]">
          Version v1 · Effective date: 22 April 2026
        </p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-[color:var(--color-fg-muted)]">
          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">1. Who we are</h2>
            <p>
              Silent Help is operated under UK law. Contact:{' '}
              <a className="underline" href="mailto:hello@silenthelp.app">hello@silenthelp.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">2. What Silent Help is</h2>
            <p>
              Silent Help is a <strong>wellness companion</strong>: guided assessment, private journal,
              AI-assisted chat, evidence-informed coping tools (CBT reframes, grounding, breathing,
              self-compassion), and a crisis-support surface (SOS).
            </p>
            <p>
              Silent Help is <strong>not a medical device, not a diagnostic tool, not a substitute
              for professional mental-health care</strong>. It does not diagnose, treat, cure, or
              monitor any condition. If you are in crisis, call 999 (UK) / 112 (EU) / your local
              emergency number, or contact Samaritans (116 123 in the UK).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">3. Eligibility</h2>
            <p>
              You must be at least <strong>13 years old</strong> to use Silent Help. Users aged
              13–17 are placed in a safer-by-default mode (see Privacy Notice §Children).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">4. Acceptable use</h2>
            <ul className="list-disc pl-6">
              <li>Don&apos;t use Silent Help to harm yourself or others.</li>
              <li>Don&apos;t upload content that is illegal in your jurisdiction.</li>
              <li>Don&apos;t attempt to extract or reverse-engineer our models.</li>
              <li>Don&apos;t use Silent Help to impersonate a clinician or provide clinical advice
                to a third party.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">5. Content &amp; safety</h2>
            <p>
              Silent Help runs safety classifiers to detect potential crisis content and surface
              the SOS panel. We follow the <strong>Samaritans media guidelines</strong> — we never
              reference self-harm methods, we lead with help-seeking framing, and we keep crisis
              resources one tap away.
            </p>
            <p>
              Under the UK Online Safety Act 2023 we maintain an internal policy for priority
              illegal content and self-harm content; see{' '}
              <Link href="/" className="underline">ONLINE-SAFETY.md</Link> in our repo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">6. Data &amp; privacy</h2>
            <p>
              See the <Link href="/privacy" className="underline">Privacy Notice</Link>. Your mood,
              journal, and chat are special-category data under UK/EU GDPR Article 9 and are only
              processed with your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">7. Changes &amp; termination</h2>
            <p>
              We may update these Terms and will notify you of material changes in-app. You may end
              your use at any time via <Link href="/settings/data" className="underline">Settings → Data → Delete account</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">8. Governing law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Nothing in these Terms
              limits your statutory consumer rights in your country of residence.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
