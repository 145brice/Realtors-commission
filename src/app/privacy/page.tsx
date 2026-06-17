import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Commission Scout',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
        ← Back to Commission Scout
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-950">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>

      <section className="mt-8 space-y-4 text-sm leading-6">
        <h2 className="text-lg font-semibold text-gray-900">1. Information we collect</h2>
        <p>
          When agents create or claim a profile, we collect the information they provide (name,
          email, phone, brokerage, license number, service area, and similar details). Visitors who
          browse the directory are not required to create an account.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">2. How we use it</h2>
        <p>
          We use submitted information to display agent profiles, operate the directory, respond to
          inquiries, and improve the service. We do not sell personal information.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">3. Third-party services</h2>
        <p>
          This site uses Appwrite for data storage and OpenStreetMap for maps. Those providers
          process data according to their own policies.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">4. Your choices</h2>
        <p>
          Agents may request correction or removal of their profile at any time by emailing us.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">5. Contact</h2>
        <p>
          Privacy questions? Email{' '}
          <a className="text-blue-600 hover:underline" href="mailto:145brice@gmail.com">
            145brice@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
