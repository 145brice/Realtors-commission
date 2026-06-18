import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Commission Scout',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
        ← Back to Commission Scout
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-950">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>

      <section className="mt-8 space-y-4 text-sm leading-6">
        <h2 className="text-lg font-semibold text-gray-900">1. About this service</h2>
        <p>
          Commission Scout helps people discover and compare real estate agents by commission
          rate, experience, service area, and other attributes. We are an information and
          referral directory. We are not a real estate brokerage and do not provide brokerage,
          legal, tax, or financial advice.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">2. No guarantee of accuracy</h2>
        <p>
          Agent information may be provided by the agents themselves or third-party sources.
          Commission rates and other details are subject to change and individual negotiation.
          Always confirm current terms directly with the agent before entering any agreement.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">3. No agency relationship</h2>
        <p>
          Using this site does not create an agency, brokerage, or fiduciary relationship between
          you and Commission Scout. Any relationship is solely between you and the agent you choose
          to contact.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">
          4. Commission rates, advertising &amp; buyer broker agreements
        </h2>
        <p>
          Commission rates displayed on Commission Scout are advertised and self-reported by each
          agent. Real estate commissions are fully negotiable and are not set by law, by any MLS, or
          by Commission Scout. Each agent is solely responsible for advertising accurate rates and
          for honoring the rates they publish here in their written agreements with clients.
        </p>
        <p>
          Commission Scout is a directory and is not a party to any listing agreement, buyer broker
          agreement (BBA), or compensation arrangement. Under current rules (including the 2024
          National Association of REALTORS&reg; settlement), buyers enter a written buyer broker
          agreement specifying their agent&apos;s compensation before touring a home. You are
          responsible for confirming all fees and terms directly with your agent, in writing, before
          engaging their services. Commission Scout disclaims liability for any discrepancy between a
          rate advertised here and the terms an agent ultimately offers.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">5. Listing data &amp; MLS/IDX</h2>
        <p>
          Where property listings are displayed, they are subject to the rules of the applicable
          Multiple Listing Service (MLS) and the broker participant agreement governing the IDX
          feed. Listing data is provided &quot;as is&quot; and may not reflect all available
          properties.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
        <p>
          Questions about these terms? Email{' '}
          <a className="text-blue-600 hover:underline" href="mailto:145brice@gmail.com">
            145brice@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
