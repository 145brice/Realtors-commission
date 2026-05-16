'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from './SearchBar';
import Filters from './Filters';
import AgentList from './AgentList';
import { useAppStore } from '@/store/appStore';
import { Agent } from '@/types';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

// Mock data for initial development
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@realty.com',
    phone: '3105551234',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    commission_rate: 1.5,
    years_experience: 12,
    total_sales: 156,
    avg_days_on_market: 28,
    rating: 4.9,
    review_count: 89,
    bio: 'Top-rated agent specializing in luxury homes and first-time buyers.',
    specialties: ['Residential', 'Luxury', 'First-Time Buyers'],
    languages: ['English', 'Spanish'],
    license_number: 'CA-DRE-01234567',
    office_address: '123 Main St, Los Angeles, CA 90001',
    latitude: 34.0522,
    longitude: -118.2437,
    area_served: 'Los Angeles, CA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@realty.com',
    phone: '3105555678',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    commission_rate: 2.0,
    years_experience: 8,
    total_sales: 92,
    avg_days_on_market: 32,
    rating: 4.7,
    review_count: 56,
    bio: 'Expert in investment properties and commercial real estate.',
    specialties: ['Investment', 'Commercial', 'Condos'],
    languages: ['English', 'Mandarin'],
    license_number: 'CA-DRE-02345678',
    office_address: '456 Oak Ave, Los Angeles, CA 90002',
    latitude: 34.0622,
    longitude: -118.2537,
    area_served: 'Los Angeles, CA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function HomePage() {
  const { setAgents, setFilteredAgents, isMapView } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize with mock data
    setAgents(mockAgents);
    setFilteredAgents(mockAgents);
  }, [setAgents, setFilteredAgents]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-primary-600">AgentFinder</h1>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              Sign In
            </button>
          </div>
          <SearchBar />
        </div>
        <Filters />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agent List - Left Side */}
        <div className={`${isMapView ? 'w-1/2' : 'w-full'} overflow-y-auto custom-scrollbar`}>
          <AgentList />
        </div>

        {/* Map - Right Side */}
        {isMapView && (
          <div className="w-1/2 relative">
            <MapView />
          </div>
        )}
      </div>
    </div>
  );
}
