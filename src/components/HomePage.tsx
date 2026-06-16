'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SearchBar from './SearchBar';
import Filters from './Filters';
import AgentList from './AgentList';
import AuthPrompt from './AuthPrompt';
import IdxComplianceNotice from './IdxComplianceNotice';
import { useAppStore } from '@/store/appStore';
import { getCurrentUser, signOutCurrentUser } from '@/lib/appwrite';
import { mockAgents } from '@/lib/mockData';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function HomePage() {
  const {
    setAgents,
    isMapView,
    setCurrentUser,
    setAuthenticated,
    setAuthPromptOpen,
    setAuthRoleIntent,
    currentUser,
    isAuthenticated,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [dataSource, setDataSource] = useState<'appwrite' | 'demo'>('demo');

  useEffect(() => {
    setMounted(true);

    async function loadAgents() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          if (data.agents?.length > 0) {
            setAgents(data.agents);
            setDataSource('appwrite');
            return;
          }
        }

        if (!response.ok) {
          setDataSource('demo');
        } else {
          setDataSource('appwrite');
        }
      } catch {
        setDataSource('demo');
      }

      setAgents(mockAgents);
    }

    loadAgents();
  }, [setAgents, setAuthenticated, setCurrentUser]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="px-4 py-3 lg:px-6">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-950">Commission Scout</h1>
              <p className="text-sm text-gray-600">
                Compare local agents by commission, track record, language, specialty, ZIP code, and service area.
              </p>
              <p className="mt-1 inline-flex rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                Free for a limited time while we launch.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Agent dashboard
              </Link>
              {currentUser?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={async () => {
                  if (isAuthenticated) {
                    await signOutCurrentUser();
                    setAuthenticated(false);
                    setCurrentUser(null);
                    return;
                  }

                  setAuthRoleIntent('public');
                  setAuthPromptOpen(true);
                }}
                className="w-full rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
              >
                {isAuthenticated ? `Sign out ${currentUser?.role || 'public'}` : 'Start free account'}
              </button>
            </div>
          </div>
          <SearchBar />
          {dataSource === 'demo' && (
            <p className="mt-2 text-xs text-gray-500">
              Demo data is showing until your Appwrite database has agents.
            </p>
          )}
        </div>
        <Filters />
        <IdxComplianceNotice />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className={`${isMapView ? 'lg:w-[54%] xl:w-1/2' : 'w-full'} overflow-y-auto custom-scrollbar`}>
          <AgentList />
        </div>

        {isMapView && (
          <div className="relative hidden min-h-0 flex-1 lg:block">
            <MapView />
          </div>
        )}
      </div>

      <AuthPrompt />
    </div>
  );
}
