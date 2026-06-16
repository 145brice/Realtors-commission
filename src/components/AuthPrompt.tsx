'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { createEmailAccount, createEmailSession } from '@/lib/appwrite';
import { AccountRole } from '@/types';

export default function AuthPrompt() {
  const {
    authPromptOpen,
    authRoleIntent,
    setAuthPromptOpen,
    setAuthRoleIntent,
    setCurrentUser,
  } = useAppStore();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [role, setRole] = useState<AccountRole>(authRoleIntent);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    setRole(authRoleIntent);
  }, [authRoleIntent]);

  if (!authPromptOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');

    try {
      let user;
      if (mode === 'signup') {
        user = await createEmailAccount(email, password, name || email, role);
      } else {
        await createEmailSession(email, password);
        const { getCurrentUser } = await import('@/lib/appwrite');
        user = await getCurrentUser();
      }

      setCurrentUser(user || null);
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gray-950/55 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
              Free for a limited time
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-950">
              Unlock agent details
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start as a buyer/seller, or create an agent account to claim and manage your profile.
            </p>
          </div>
          <button
            aria-label="Close sign in"
            onClick={() => setAuthPromptOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            X
          </button>
        </div>

        {mode === 'signup' && (
          <div className="mb-4 grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => {
                setRole('public');
                setAuthRoleIntent('public');
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                role === 'public' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'
              }`}
            >
              Buyer/Seller
            </button>
            <button
              onClick={() => {
                setRole('agent');
                setAuthRoleIntent('agent');
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                role === 'agent' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'
              }`}
            >
              Agent
            </button>
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setMode('signup')}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === 'signup' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'
            }`}
          >
            Start account
          </button>
          <button
            onClick={() => setMode('signin')}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              mode === 'signin' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'
            }`}
          >
            Sign in
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          {status === 'error' && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Those credentials did not work, or this account already has an active session.
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          {mode === 'signup' && (
            <p className="text-center text-xs text-gray-500">
              Free launch access is available for a limited time.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
