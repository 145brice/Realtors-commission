'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Agent, Review, RecentSale } from '@/types';
import { formatCommission, formatPhoneNumber, formatCurrency, getInitials } from '@/lib/utils';

interface AgentDetailPageProps {
  agentId: string;
}

// Mock data - replace with actual API calls
const mockAgent: Agent = {
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
  bio: 'Top-rated real estate agent with over 12 years of experience in the Los Angeles market. Specializing in luxury homes, investment properties, and helping first-time buyers navigate the complex real estate landscape. Known for transparent pricing and exceptional customer service.',
  specialties: ['Residential', 'Luxury', 'First-Time Buyers', 'Investment'],
  languages: ['English', 'Spanish'],
  license_number: 'CA-DRE-01234567',
  office_address: '123 Main St, Los Angeles, CA 90001',
  latitude: 34.0522,
  longitude: -118.2437,
  area_served: 'Los Angeles, CA',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockReviews: Review[] = [
  {
    id: '1',
    agent_id: '1',
    reviewer_name: 'John Smith',
    rating: 5,
    comment: 'Sarah helped us find our dream home! Her commission rate was the lowest we found, and her service was exceptional. Highly recommend!',
    property_type: 'Single Family Home',
    transaction_type: 'buy',
    created_at: '2024-11-15T00:00:00Z',
  },
  {
    id: '2',
    agent_id: '1',
    reviewer_name: 'Maria Garcia',
    rating: 5,
    comment: 'Outstanding agent! Sold our house in just 18 days. Very professional and transparent about all costs.',
    property_type: 'Condo',
    transaction_type: 'sell',
    created_at: '2024-10-28T00:00:00Z',
  },
];

const mockRecentSales: RecentSale[] = [
  {
    id: '1',
    agent_id: '1',
    address: '456 Ocean Ave',
    city: 'Santa Monica',
    state: 'CA',
    zip_code: '90401',
    price: 2850000,
    property_type: 'Single Family Home',
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2800,
    sold_date: '2024-11-20',
    days_on_market: 22,
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  },
  {
    id: '2',
    agent_id: '1',
    address: '789 Beverly Dr',
    city: 'Beverly Hills',
    state: 'CA',
    zip_code: '90210',
    price: 4500000,
    property_type: 'Luxury Home',
    bedrooms: 5,
    bathrooms: 5,
    square_feet: 4200,
    sold_date: '2024-10-15',
    days_on_market: 31,
    image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
  },
];

export default function AgentDetailPage({ agentId }: AgentDetailPageProps) {
  const [agent] = useState<Agent>({ ...mockAgent, id: agentId });
  const [reviews] = useState<Review[]>(mockReviews);
  const [recentSales] = useState<RecentSale[]>(mockRecentSales);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'sales'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Search
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Agent Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                {agent.photo_url ? (
                  <Image
                    src={agent.photo_url}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-3xl font-semibold">
                    {getInitials(agent.name)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(agent.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-lg font-semibold text-gray-700">
                        {agent.rating} ({agent.review_count} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <p>📍 {agent.area_served}</p>
                    <p>📞 {formatPhoneNumber(agent.phone)}</p>
                    <p>✉️ {agent.email}</p>
                    <p className="text-sm mt-1">License: {agent.license_number}</p>
                  </div>
                </div>

                {/* Commission Badge */}
                <div className="bg-green-50 px-6 py-4 rounded-lg border-2 border-green-200 text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {formatCommission(agent.commission_rate)}
                  </div>
                  <div className="text-sm text-green-600">listing fee</div>
                  <div className="text-xs text-gray-500 mt-1">Below market average</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{agent.years_experience}</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{agent.total_sales}</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{agent.avg_days_on_market}</div>
                  <div className="text-sm text-gray-600">Avg. Days on Market</div>
                </div>
              </div>

              {/* Contact Button */}
              <button className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                Contact Agent
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({agent.review_count})
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-4 font-medium border-b-2 ${
                  activeTab === 'sales'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent Sales
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.languages.map((language) => (
                      <span
                        key={language}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Commission Breakdown</h2>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Listing Commission:</span>
                      <span className="text-xl font-bold text-green-700">
                        {formatCommission(agent.commission_rate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Industry average: 2.5-3.0%. Save thousands with {agent.name}!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.reviewer_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{review.property_type}</span>
                          <span>•</span>
                          <span className="capitalize">{review.transaction_type}</span>
                          <span>•</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Sales Tab */}
            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
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
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {formatCurrency(sale.price)}
                      </div>
                      <div className="text-gray-700 mb-2">
                        <div className="font-medium">{sale.address}</div>
                        <div className="text-sm">{sale.city}, {sale.state} {sale.zip_code}</div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{sale.bedrooms} bd</span>
                        <span>{sale.bathrooms} ba</span>
                        <span>{sale.square_feet.toLocaleString()} sqft</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sold: {new Date(sale.sold_date).toLocaleDateString()}</span>
                        <span className="text-green-600 font-medium">{sale.days_on_market} days on market</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
