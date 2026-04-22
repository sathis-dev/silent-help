import Link from 'next/link';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Logo } from '@/components/ui/logo';

export const metadata = {
  title: 'Privacy Notice · Silent Help',
  description:
    'How Silent Help collects, uses, and protects your data under UK GDPR, EU GDPR, and global privacy frameworks.',
};

export default function PrivacyNotice() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora intensity="soft" />
      <NoiseOverlay />
      <main className="relative mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
          <Logo size={24} /> <span>Silent Help</span>
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Privacy Notice</h1>
        <p className="mt-2 text-sm text-[color:var(--color-fg-subtle)]">
          Version v1 · Effective date: 22 April 2026
        </p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-[color:var(--color-fg-muted)]">
          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Summary</h2>
            <p>
              Silent Help is a UK-built wellness companion. We process your mood, journal, and
              chat entries to support you. These are <strong>special-category personal data</strong>{' '}
              under Article 9 of the UK &amp; EU GDPR, which means we only process them with your
              explicit consent (Article 9(2)(a)).
            </p>
            <p>
              We do <strong>not</strong> sell your data, show you ads, or train external AI models
              on your words. You can export or permanently delete everything at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">What we collect</h2>
            <ul className="list-disc pl-6">
              <li>Account data: a display name, email (or guest identifier), birth year.</li>
              <li>Wellness data: assessment answers, mood logs, journal entries (encrypted), chat
                messages, tool usage.</li>
              <li>Technical data: device type, locale, coarse region, server logs (pseudonymised).</li>
              <li>Consent records: what you agreed to, when, and on which version.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Lawful basis</h2>
            <ul className="list-disc pl-6">
              <li>Article 6(1)(b) UK/EU GDPR — performance of the service you asked us to provide.</li>
              <li>Article 9(2)(a) UK/EU GDPR — your explicit consent to process special-category
                data (mood, journal, chat).</li>
            </ul>
            <p>You can withdraw consent at any time via <Link href="/settings/data">Settings → Data</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">AI &amp; processors</h2>
            <p>
              Silent Help can run in three AI modes. In <strong>local</strong> mode, all AI runs on
              our own servers or directly in your browser — no third-party AI vendor ever sees your
              words. In <strong>hybrid</strong> mode, large-language-model completions may be handled
              by Google Gemini (Google LLC, USA) under the standard contractual clauses /
              UK International Data Transfer Addendum. In <strong>cloud</strong> mode, Gemini and
              OpenAI (OpenAI, L.L.C., USA) may both be used. Users aged 13–17 are always in local
              mode regardless of the server setting.
            </p>
            <p>
              Our infrastructure processors include a managed Postgres database (primary region
              EU-West unless stated otherwise), Cloudflare (CDN), Vercel (static hosting), and
              Fly.io (application hosting). See our{' '}
              <Link href="/terms" className="underline">Terms</Link> for the full processor list.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Retention</h2>
            <p>
              You choose retention at onboarding: <em>Auto-delete after 90 days</em>, <em>Auto-delete after 1 year</em>,
              or <em>Keep until I delete</em> (explicit opt-in). You can change your choice at any
              time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Your rights</h2>
            <p>Under UK and EU GDPR, and equivalent laws in other regions, you have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your data (<code>GET /api/me/export</code>).</li>
              <li>Rectify inaccurate data.</li>
              <li>Erase all your data (<code>DELETE /api/me</code>).</li>
              <li>Restrict or object to processing.</li>
              <li>Data portability (JSON export).</li>
              <li>Withdraw consent at any time.</li>
              <li>Lodge a complaint with your supervisory authority (ICO in the UK).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Children</h2>
            <p>
              Silent Help is available from age <strong>13</strong>. Users aged 13–17 are placed in
              a safer-by-default mode in line with the ICO Age-Appropriate Design Code: local-only
              AI (no third-party vendor), minimised telemetry, privacy-first defaults, and no
              nudges that exploit engagement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Not a medical device</h2>
            <p>
              Silent Help is a wellness companion. It is <strong>not a medical device</strong> under
              the UK Medical Devices Regulations 2002 or the EU MDR 2017/745. It does not diagnose,
              treat, cure, or monitor any condition. In an emergency call 999 (UK) / 112 (EU) / your
              local emergency number.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[color:var(--color-fg)]">Contact</h2>
            <p>
              Data controller: Silent Help. Data-protection queries:{' '}
              <a className="underline" href="mailto:privacy@silenthelp.app">privacy@silenthelp.app</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
