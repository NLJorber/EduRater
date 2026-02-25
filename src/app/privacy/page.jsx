import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | EduRater",
  description: "How EduRater uses and protects your personal data.",
};

const lastUpdated = "February 25, 2026";

export default function PrivacyPage() {
  return (
    <main className="display-headings min-h-[calc(100vh-5rem)] px-6 py-12 text-brand-brown dark:text-brand-cream">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm opacity-80">Last updated: {lastUpdated}</p>
          <p className="text-sm opacity-80">
            This page explains what personal data we collect, why we collect it,
            and your rights under UK GDPR and EU GDPR.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Who We Are</h2>
          <p>
            EduRater is run by the project maintainers. If you have privacy
            questions or want to make a data request, email {" "}
            <a className="underline" href="mailto:edurate@proton.me">
              edurate@proton.me
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. What Data We Collect</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Account details, such as your user ID and email address.</li>
            <li>
              Profile details, such as display name, avatar choice, account role,
              and linked school where relevant.
            </li>
            <li>
              Reviews you submit, including ratings, comments, and timestamps.
            </li>
            <li>Helpful votes and review reports you submit.</li>
            <li>
              Staff verification request details, such as full name, role, school
              email, and supporting evidence.
            </li>
            <li>Contact form information: name, email, and message.</li>
            <li>
              Search input data, for example school name, postcode, or location
              terms.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Why We Use Your Data</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide and secure user accounts.</li>
            <li>To publish and manage school reviews.</li>
            <li>To prevent abuse and moderate harmful content.</li>
            <li>To process staff verification requests.</li>
            <li>To respond to messages you send us.</li>
            <li>To improve search and core platform features.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. GDPR Legal Bases</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Contract</strong>: providing account and platform
              functionality.
            </li>
            <li>
              <strong>Legitimate interests</strong>: keeping the platform safe,
              reliable, and useful.
            </li>
            <li>
              <strong>Consent or pre-contract contact</strong>: handling contact
              form submissions.
            </li>
            <li>
              <strong>Legal obligation</strong>: where the law requires
              retention or disclosure.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Sharing and Service Providers</h2>
          <p>
            We use trusted service providers to host the app, run account
            features, deliver contact messages, and support location-based
            search. We share only the data needed for those tasks.
          </p>
          <p>
            Some data may be processed outside your country. Where required, we
            use appropriate contractual safeguards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Public Information</h2>
          <p>
            Reviews are public by design. Your chosen display name and avatar
            may appear with your review content.
          </p>
          <p>
            Please avoid including sensitive personal information in any public
            review text.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. How Long We Keep Data</h2>
          <p>
            We keep personal data only as long as needed for platform operation,
            moderation, and legal obligations, or until deletion is requested
            and applicable.
          </p>
          <p>
            Account-linked data may be removed when an account is deleted,
            subject to legal and safety retention needs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Your Rights</h2>
          <p>You can request, subject to legal limits:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Access to your personal data.</li>
            <li>Correction of inaccurate data.</li>
            <li>Deletion of your personal data.</li>
            <li>Restriction of processing.</li>
            <li>Objection to processing.</li>
            <li>Data portability where applicable.</li>
            <li>Withdrawal of consent where consent applies.</li>
          </ul>
          <p>
            To exercise these rights, email {" "}
            <a className="underline" href="mailto:edurate@proton.me">
              edurate@proton.me
            </a>
            . You can also complain to your local data protection authority,
            including the UK ICO.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Security</h2>
          <p>
            We use access controls and other technical and organisational
            measures to protect personal data. No online service can guarantee
            absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Updates to This Policy</h2>
          <p>
            We may update this policy as the service changes. We will update the
            date at the top of this page when changes are made.
          </p>
          <p>
            See also our {" "}
            <Link className="underline" href="/terms">
              Terms of Use
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
