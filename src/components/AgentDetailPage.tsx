'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mockAgents, mockRecentSales, mockReviews } from '@/lib/mockData';
import { formatCommission, formatCurrency, formatPhoneNumber, getInitials } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import AuthPrompt from './AuthPrompt';
import {
  getAgentFromAppwrite,
  getCurrentUser,
  listRecentSalesFromAppwrite,
  listReviewsFromAppwrite,
} from '@/lib/appwrite';
import { Agent, RecentSale, Review } from '@/types';

interface AgentDetailPageProps {
  agentId: string;
}

export default function AgentDetailPage({ agentId }: AgentDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'sales'>('overview');
  const { isAuthenticated, setAuthPromptOpen, setAuthenticated } = useAppStore();
  const fallbackAgent = useMemo(
    () => mockAgents.find((candidate) => candidate.id === agentId) || mockAgents[0],
    [agentId]
  );
  const [agent, setAgent] = useState<Agent>(fallbackAgent);
  const [reviews, setReviews] = useState<Review[]>(mockReviews.filter((review) => review.agent_id === fallbackAgent.id));
  const [recentSales, setRecentSales] = useState<RecentSale[]>(
    mockRecentSales.filter((sale) => sale.agent_id === fallbackAgent.id)
  );
  const locked = !isAuthenticated;

  useEffect(() => {
    async function loadProfile() {
      const user = await getCurrentUser();
      setAuthenticated(Boolean(user));

      const appwriteAgent = await getAgentFromAppwrite(agentId);
      if (!appwriteAgent) {
        return;
      }

      setAgent(appwriteAgent);

      const [appwriteReviews, appwriteRecentSales] = await Promise.all([
        listReviewsFromAppwrite(appwriteAgent.id),
        listRecentSalesFromAppwrite(appwriteAgent.id),
      ]);

      setReviews(appwriteReviews.length > 0 ? appwriteReviews : []);
      setRecentSales(appwriteRecentSales.length > 0 ? appwriteRecentSales : []);
    }

    loadProfile();
  }, [agentId, setAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Search
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-gray-200">
                {agent.photo_url ? (
                  <Image
                    src={agent.photo_url}
                    alt={locked ? 'Verified local agent' : agent.name}
                    fill
                    className={`object-cover ${locked ? 'scale-110 blur-md grayscale' : ''}`}
                    sizes="128px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-100 text-3xl font-semibold text-primary-600">
                    {getInitials(agent.name)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {locked ? 'Verified local agent' : agent.name}
                  </h1>
                  <p className={`text-gray-600 ${locked ? 'blur-sm select-none' : ''}`}>
                    {agent.brokerage} · {agent.license_number}
                  </p>
                  <div className="mt-3 grid gap-1 text-sm text-gray-600">
                    <span>{agent.area_served}</span>
                    <span>{agent.neighborhoods.join(', ')}</span>
                    <span>{agent.zip_codes.join(', ')}</span>
                    <span className={locked ? 'blur-sm select-none' : ''}>
                      {formatPhoneNumber(agent.phone)} · {agent.email}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-green-200 bg-green-50 px-6 py-4 text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {formatCommission(agent.commission_rate)}
                  </div>
                  <div className="text-sm text-green-600">listing fee</div>
                  <div className="mt-1 text-xs text-gray-500">Compare against 2.5-3.0%</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Rating" value={`${agent.rating} (${agent.review_count})`} />
                <Stat label="Experience" value={`${agent.years_experience} years`} />
                <Stat label="Sales" value={agent.total_sales.toString()} />
                <Stat label="Avg. DOM" value={`${agent.avg_days_on_market} days`} />
              </div>

              <button
                onClick={() => setAuthPromptOpen(true)}
                className="mt-5 w-full rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-700 md:w-auto"
              >
                {locked ? 'Start free account to unlock contact' : 'Contact Agent'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                ['overview', 'Overview'],
                ['reviews', `Reviews (${agent.review_count})`],
                ['sales', 'Recent Sales'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`border-b-2 px-6 py-4 font-medium ${
                    activeTab === id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <section>
                  <h2 className="mb-3 text-xl font-semibold">About</h2>
                  <p className="leading-relaxed text-gray-700">{agent.bio}</p>
                </section>
                <TagSection title="Specialties" tags={agent.specialties} />
                <TagSection title="Languages" tags={agent.languages} />
                <section className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">Estimated listing commission</span>
                    <span className="text-xl font-bold text-green-700">
                      {formatCommission(agent.commission_rate)}
                    </span>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.reviewer_name}</h3>
                        <p className="text-sm text-gray-600">
                          {review.property_type} · {review.transaction_type} ·{' '}
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-yellow-600">{review.rating}/5</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="relative h-48">
                      <Image
                        src={sale.image_url}
                        alt={sale.address}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(sale.price)}
                      </div>
                      <p className="font-medium text-gray-700">{sale.address}</p>
                      <p className="text-sm text-gray-600">
                        {sale.city}, {sale.state} {sale.zip_code}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        {sale.bedrooms} bd · {sale.bathrooms} ba · {sale.square_feet.toLocaleString()} sqft
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthPrompt />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function TagSection({ title, tags }: { title: string; tags: string[] }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
