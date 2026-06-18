'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mockAgents, mockRecentSales, mockReviews } from '@/lib/mockData';
import { formatCommission, formatCurrency, formatPhoneNumber, getInitials } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import AuthPrompt from './AuthPrompt';
import { getCurrentUser } from '@/lib/appwrite';
import { account } from '@/lib/appwrite';
import { Agent, IdxListing, RecentSale, Review } from '@/types';
import IdxListingCard from './IdxListingCard';
import CommissionDisclaimer from './CommissionDisclaimer';

interface AgentDetailPageProps {
  agentId: string;
}

export default function AgentDetailPage({ agentId }: AgentDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'sales' | 'listings'>('overview');
  const [listings, setListings] = useState<IdxListing[]>([]);
  const [listingsConnected, setListingsConnected] = useState<boolean | null>(null);
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

      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (!data.agent) {
        return;
      }

      setAgent(data.agent);
      setReviews(data.reviews || []);
      setRecentSales(data.recentSales || []);

      const listingsRes = await fetch(`/api/agents/${agentId}/listings`);
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.listings || []);
        setListingsConnected(listingsData.connected ?? false);
      }
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
                ['listings', listings.length > 0 ? `Active Listings (${listings.length})` : 'Active Listings'],
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
                <CommissionDisclaimer variant="full" />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <ReviewForm
                  agentId={agentId}
                  isAuthenticated={isAuthenticated}
                  onSubmitted={(review) => setReviews((prev) => [review, ...prev])}
                  onSignInRequired={() => setAuthPromptOpen(true)}
                />
                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-sm text-gray-500">No reviews yet — be the first.</p>
                  )}
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
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                {listingsConnected && listings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                      <IdxListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : listingsConnected && listings.length === 0 ? (
                  <p className="py-12 text-center text-sm text-gray-500">
                    No active listings found in this agent&apos;s MLS feed right now.
                  </p>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
                    <p className="text-base font-medium text-gray-700">MLS feed not connected</p>
                    <p className="mt-2 text-sm text-gray-500">
                      This agent hasn&apos;t connected an IDX feed yet. Active listings will
                      appear here once they do.
                    </p>
                    <a
                      href="/dashboard"
                      className="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Are you this agent? Connect your feed →
                    </a>
                  </div>
                )}
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

function ReviewForm({
  agentId,
  isAuthenticated,
  onSubmitted,
  onSignInRequired,
}: {
  agentId: string;
  isAuthenticated: boolean;
  onSubmitted: (review: Review) => void;
  onSignInRequired: () => void;
}) {
  const [form, setForm] = useState({
    reviewer_name: '',
    rating: 5,
    comment: '',
    property_type: 'Residential',
    transaction_type: 'buy' as 'buy' | 'sell',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      onSignInRequired();
      return;
    }
    setStatus('saving');
    setError('');
    try {
      const jwt = await account.createJWT();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt.jwt}`,
        },
        body: JSON.stringify({ ...form, agent_id: agentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Could not submit review.');
        setStatus('error');
        return;
      }
      const data = await res.json();
      onSubmitted(data.review);
      setStatus('done');
      setForm({ reviewer_name: '', rating: 5, comment: '', property_type: 'Residential', transaction_type: 'buy' });
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Review submitted — thank you!
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Leave a review</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Your name</span>
          <input
            required
            value={form.reviewer_name}
            onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Rating (1–5)</span>
          <input
            required
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Transaction type</span>
          <select
            value={form.transaction_type}
            onChange={(e) => setForm({ ...form, transaction_type: e.target.value as 'buy' | 'sell' })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="buy">Buyer</option>
            <option value="sell">Seller</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Property type</span>
          <input
            value={form.property_type}
            onChange={(e) => setForm({ ...form, property_type: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Review</span>
        <textarea
          required
          rows={4}
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isAuthenticated
          ? status === 'saving' ? 'Submitting...' : 'Submit review'
          : 'Sign in to leave a review'}
      </button>
    </form>
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
