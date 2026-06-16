'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from './SearchBar';
import Filters from './Filters';
import AgentList from './AgentList';
import AuthPrompt from './AuthPrompt';
import { useAppStore } from '@/store/appStore';
import { getCurrentUser, listAgentsFromAppwrite } from '@/lib/appwrite';
import { mockAgents } from '@/lib/mockData';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function HomePage() {
  const { setAgents, isMapView, setAuthenticated, setAuthPromptOpen, isAuthenticated } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [dataSource, setDataSource] = useState<'appwrite' | 'demo'>('demo');

  useEffect(() => {
    setMounted(true);

    async function loadAgents() {
      const user = await getCurrentUser();
      setAuthenticated(Boolean(user));

      try {
        const appwriteAgents = await listAgentsFromAppwrite();
        if (appwriteAgents.length > 0) {
          setAgents(appwriteAgents);
          setDataSource('appwrite');
          return;
        }
      } catch {
        setDataSource('demo');
      }

      setAgents(mockAgents);
    }

    loadAgents();
  }, [setAgents, setAuthenticated]);

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
            <button
              onClick={() => (isAuthenticated ? setAuthenticated(false) : setAuthPromptOpen(true))}
              className="w-full rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 lg:w-auto"
            >
              {isAuthenticated ? 'Preview locked view' : 'Start free account'}
            </button>
          </div>
          <SearchBar />
          {dataSource === 'demo' && (
            <p className="mt-2 text-xs text-gray-500">
              Demo data is showing until your Appwrite database has agents.
            </p>
          )}
        </div>
        <Filters />
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
