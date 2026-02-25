import Link from "next/link";

export const metadata = {
  title: "Terms of Use | EduRater",
  description: "Terms and conditions for using EduRater.",
};

const lastUpdated = "February 25, 2026";

export default function TermsPage() {
  return (
    <main className="display-headings min-h-[calc(100vh-5rem)] px-6 py-12 text-brand-brown dark:text-brand-cream">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Terms of Use</h1>
          <p className="text-sm opacity-80">Last updated: {lastUpdated}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Acceptance</h2>
          <p>
            By using EduRater, you agree to these Terms and our {" "}
            <Link className="underline" href="/privacy">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Intended Use</h2>
          <p>
            EduRater is a community research tool for education providers. It is
            not official inspection advice, legal advice, or professional
            safeguarding guidance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Accounts and Responsibility</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>You are responsible for activity on your account.</li>
            <li>
              You must provide accurate information when requesting staff
              verification.
            </li>
            <li>
              Do not share your credentials or attempt unauthorised access.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. User Content Rules</h2>
          <p>When posting reviews or reports, you must not include:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Defamatory, abusive, hateful, or unlawful content.</li>
            <li>Personal data not necessary for your review.</li>
            <li>Impersonation, spam, or deliberate misinformation.</li>
            <li>Content that infringes third-party rights.</li>
          </ul>
          <p>
            We may moderate, remove, or restrict content/accounts where needed
            for safety, compliance, or platform integrity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Licence for User Submissions</h2>
          <p>
            You keep ownership of your submissions, but grant EduRater a
            non-exclusive, worldwide, royalty-free licence to host, store,
            reproduce, and display submitted content for operating and improving
            the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Non-Commercial Project Use</h2>
          <p>
            This repository and software are provided under a non-commercial
            licence in <code>LICENSE.txt</code>. Commercial use, monetisation,
            resale, paid hosting, paid support, or commercial derivative
            offerings are not permitted without prior written permission from
            the copyright holders.
          </p>
          <p>
            To request commercial licensing permission, contact {" "}
            <a className="underline" href="mailto:edurate@proton.me">
              edurate@proton.me
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Availability and Changes</h2>
          <p>
            We may change, suspend, or discontinue features at any time. We may
            also update these Terms; the updated date will be shown on this
            page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Disclaimer and Liability</h2>
          <p>
            The service is provided on an as-is and as-available basis. To the extent
            allowed by law, we disclaim warranties and are not liable for
            indirect or consequential loss arising from use of the platform.
          </p>
          <p>
            Users should not rely solely on EduRater for educational,
            safeguarding, legal, or professional decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p>
            For legal or policy questions, contact {" "}
            <a className="underline" href="mailto:edurate@proton.me">
              edurate@proton.me
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
