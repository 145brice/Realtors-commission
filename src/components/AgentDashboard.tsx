'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import AuthPrompt from './AuthPrompt';
import { getCurrentUser } from '@/lib/appwrite';
import { useAppStore } from '@/store/appStore';
import { AgentClaim } from '@/types';

const emptyClaim: Partial<AgentClaim> = {
  name: '',
  email: '',
  phone: '',
  photo_url: '',
  brokerage: '',
  commission_rate: 2.5,
  bio: '',
  specialties: ['Residential'],
  languages: ['English'],
  license_number: '',
  office_address: '',
  area_served: '',
  city: '',
  state: '',
  zip_codes: [],
  neighborhoods: [],
};

export default function AgentDashboard() {
  const { currentUser, setCurrentUser, setAuthPromptOpen, setAuthRoleIntent } = useAppStore();
  const [claim, setClaim] = useState<Partial<AgentClaim>>(emptyClaim);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (!user) {
        setAuthRoleIntent('agent');
        setAuthPromptOpen(true);
        return;
      }

      setClaim((current) => ({
        ...current,
        user_id: user.id,
        user_email: user.email,
        name: user.name || current.name,
        email: user.email || current.email,
      }));
    }

    loadUser();
  }, [setAuthPromptOpen, setAuthRoleIntent, setCurrentUser]);

  async function submitClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      setAuthRoleIntent('agent');
      setAuthPromptOpen(true);
      return;
    }

    setStatus('saving');
    setMessage('');

    const response = await fetch('/api/agent-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...claim,
        user_id: currentUser.id,
        user_email: currentUser.email,
        status: 'pending',
        zip_codes: parseList(claim.zip_codes),
        neighborhoods: parseList(claim.neighborhoods),
        specialties: parseList(claim.specialties),
        languages: parseList(claim.languages),
      }),
    });

    if (!response.ok) {
      setStatus('error');
      setMessage('Could not submit your profile. Check required fields and try again.');
      return;
    }

    setStatus('saved');
    setMessage('Profile submitted for admin approval.');
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-4 py-4 lg:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-primary-600">
              Back to search
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-950">Agent profile claim</h1>
            <p className="text-sm text-gray-600">
              Submit your profile, commission, service areas, and contact details for verification.
            </p>
          </div>
          <button
            onClick={() => {
              setAuthRoleIntent('agent');
              setAuthPromptOpen(true);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {currentUser ? currentUser.email : 'Agent sign in'}
          </button>
        </div>
      </header>

      <form onSubmit={submitClaim} className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-950">Profile details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={claim.name} onChange={(value) => setClaim({ ...claim, name: value })} />
            <Field label="Email" value={claim.email} onChange={(value) => setClaim({ ...claim, email: value })} />
            <Field label="Phone" value={claim.phone} onChange={(value) => setClaim({ ...claim, phone: value })} />
            <Field label="Brokerage" value={claim.brokerage} onChange={(value) => setClaim({ ...claim, brokerage: value })} />
            <Field label="License number" value={claim.license_number} onChange={(value) => setClaim({ ...claim, license_number: value })} />
            <Field label="Photo URL" value={claim.photo_url} onChange={(value) => setClaim({ ...claim, photo_url: value })} />
            <Field label="Listing commission %" type="number" value={claim.commission_rate} onChange={(value) => setClaim({ ...claim, commission_rate: Number(value) })} />
            <Field label="Office address" value={claim.office_address} onChange={(value) => setClaim({ ...claim, office_address: value })} />
            <Field label="City" value={claim.city} onChange={(value) => setClaim({ ...claim, city: value })} />
            <Field label="State" value={claim.state} onChange={(value) => setClaim({ ...claim, state: value })} />
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-gray-700">Bio</span>
            <textarea
              value={claim.bio || ''}
              onChange={(event) => setClaim({ ...claim, bio: event.target.value })}
              rows={5}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-950">Service area</h2>
          <div className="mt-4 space-y-4">
            <Field label="Area served" value={claim.area_served} onChange={(value) => setClaim({ ...claim, area_served: value })} />
            <Field label="ZIP codes" value={formatList(claim.zip_codes)} onChange={(value) => setClaim({ ...claim, zip_codes: parseList(value) })} />
            <Field label="Neighborhoods" value={formatList(claim.neighborhoods)} onChange={(value) => setClaim({ ...claim, neighborhoods: parseList(value) })} />
            <Field label="Specialties" value={formatList(claim.specialties)} onChange={(value) => setClaim({ ...claim, specialties: parseList(value) })} />
            <Field label="Languages" value={formatList(claim.languages)} onChange={(value) => setClaim({ ...claim, languages: parseList(value) })} />
          </div>

          {message && (
            <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'saving'}
            className="mt-5 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {status === 'saving' ? 'Submitting...' : 'Submit for approval'}
          </button>
        </section>
      </form>

      <AuthPrompt />
    </main>
  );
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string;
  value?: string | number | string[];
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={Array.isArray(value) ? value.join(', ') : value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </label>
  );
}

function parseList(value?: string | string[]) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatList(value?: string | string[]) {
  return Array.isArray(value) ? value.join(', ') : value || '';
}
