'use client';

import { useAppStore } from '@/store/appStore';
import AgentCard from './AgentCard';

export default function AgentList() {
  const { filteredAgents, selectedAgent, setSelectedAgent, searchQuery, resetFilters, setSearchQuery } = useAppStore();

  if (filteredAgents.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium">No agents found</p>
          <p className="mt-1 text-sm text-gray-400">Try another ZIP, city, language, specialty, or fewer filters.</p>
          <button
            onClick={() => {
              resetFilters();
              setSearchQuery('');
            }}
            className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Agent marketplace</p>
            <h2 className="text-2xl font-semibold text-gray-950">
              {filteredAgents.length} match{filteredAgents.length !== 1 ? 'es' : ''}
            </h2>
          </div>
          <p className="max-w-xl text-sm text-gray-600">
            {searchQuery
              ? `Showing matches for "${searchQuery}" across names, ZIP codes, cities, neighborhoods, specialties, languages, brokerages, and license fields.`
              : 'Search any market signal, then compare rate, production, rating, service area, and speed.'}
          </p>
        </div>
      </div>
      {filteredAgents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isSelected={selectedAgent?.id === agent.id}
          onClick={() => setSelectedAgent(agent)}
        />
      ))}
    </div>
  );
}
