'use client';

interface CommissionDisclaimerProps {
  /** "compact" shows a single-line note; "full" shows the complete disclaimer. */
  variant?: 'compact' | 'full';
  className?: string;
}

export default function CommissionDisclaimer({
  variant = 'full',
  className = '',
}: CommissionDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <p className={`text-xs leading-5 text-gray-500 ${className}`}>
        Rates are advertised by each agent and are negotiable. The agent is responsible for
        honoring their published rate in a written agreement. Commission Scout is a directory, not a
        party to any agreement.
      </p>
    );
  }

  return (
    <section
      className={`rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-5 text-gray-600 ${className}`}
    >
      <h3 className="mb-1 text-sm font-semibold text-gray-800">Commission &amp; rate disclaimer</h3>
      <p className="mb-2">
        Commission rates shown on Commission Scout are advertised and self-reported by each agent.
        Real estate commissions are fully negotiable and are not set by law, by any MLS, or by
        Commission Scout. Commission Scout is a directory and is not a party to any listing
        agreement, buyer broker agreement (BBA), or compensation arrangement.
      </p>
      <p>
        Under current rules (including the 2024 NAR settlement), buyers enter a written buyer broker
        agreement specifying their agent&apos;s compensation before touring a home. The agent — not
        Commission Scout — is solely responsible for advertising accurate rates and for honoring the
        rates they publish here in their written agreements with clients. Confirm all fees and terms
        directly with the agent in writing before engaging their services.
      </p>
    </section>
  );
}
