'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthPrompt from './AuthPrompt';
import { getCurrentUser } from '@/lib/appwrite';
import { useAppStore } from '@/store/appStore';
import { AgentClaim } from '@/types';

export default function AdminDashboard() {
  const { currentUser, setCurrentUser, setAuthPromptOpen, setAuthRoleIntent } = useAppStore();
  const [claims, setClaims] = useState<AgentClaim[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'working' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setAuthRoleIntent('admin');
        setAuthPromptOpen(true);
        setStatus('idle');
        return;
      }

      if (user.role !== 'admin') {
        setStatus('error');
        setMessage('Admin access is limited to approved admin emails.');
        return;
      }

      await loadClaims(user.email);
    }

    load();
  }, [setAuthPromptOpen, setAuthRoleIntent, setCurrentUser]);

  async function loadClaims(email: string) {
    setStatus('loading');
    const response = await fetch(`/api/agent-claims?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      setStatus('error');
      setMessage('Could not load agent claims.');
      return;
    }

    const data = await response.json();
    setClaims(data.claims || []);
    setStatus('idle');
  }

  async function updateClaim(claim: AgentClaim, nextStatus: 'approved' | 'rejected') {
    if (!currentUser) return;

    setStatus('working');
    const response = await fetch(`/api/agent-claims/${claim.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        admin_email: currentUser.email,
        admin_note:
          nextStatus === 'approved'
            ? 'Approved and published as verified.'
            : 'Rejected by admin review.',
      }),
    });

    if (!response.ok) {
      setStatus('error');
      setMessage(`Could not ${nextStatus} claim.`);
      return;
    }

    await loadClaims(currentUser.email);
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-4 py-4 lg:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-primary-600">
              Back to search
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-950">Admin verification</h1>
            <p className="text-sm text-gray-600">
              Review agent claims before profiles show as verified.
            </p>
          </div>
          <button
            onClick={() => {
              setAuthRoleIntent('admin');
              setAuthPromptOpen(true);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {currentUser ? currentUser.email : 'Admin sign in'}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        {message && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
        )}

        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Review queue</p>
          <h2 className="text-2xl font-semibold text-gray-950">
            {claims.filter((claim) => claim.status === 'pending').length} pending
          </h2>
        </div>

        <div className="space-y-4">
          {status === 'loading' && <p className="text-sm text-gray-600">Loading claims...</p>}
          {claims.map((claim) => (
            <article key={claim.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-950">{claim.name}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {claim.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {claim.brokerage} · {claim.license_number}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {claim.city}, {claim.state} · {claim.area_served}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {claim.phone} · {claim.email}
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {claim.commission_rate.toFixed(2)}%
                  </p>
                  <p className="text-xs font-medium text-green-700">listing fee</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-700">{claim.bio}</p>

              <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                <p>ZIPs: {claim.zip_codes.join(', ') || 'None listed'}</p>
                <p>Neighborhoods: {claim.neighborhoods.join(', ') || 'None listed'}</p>
                <p>Specialties: {claim.specialties.join(', ') || 'None listed'}</p>
                <p>Languages: {claim.languages.join(', ') || 'None listed'}</p>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  disabled={status === 'working' || claim.status === 'approved'}
                  onClick={() => updateClaim(claim, 'approved')}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  Approve and publish
                </button>
                <button
                  disabled={status === 'working' || claim.status === 'rejected'}
                  onClick={() => updateClaim(claim, 'rejected')}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}

          {status !== 'loading' && claims.length === 0 && (
            <p className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
              No agent claims yet.
            </p>
          )}
        </div>
      </section>

      <AuthPrompt />
    </main>
  );
}
