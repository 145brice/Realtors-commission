'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { SearchFilters } from '@/types';

const specialtyOptions = [
  'Residential',
  'Luxury',
  'Commercial',
  'Investment',
  'First-Time Sellers',
  'Condos',
  'Relocation',
  'Probate',
  'Trust Sales',
  'Historic Homes',
];
const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Korean', 'Hindi', 'Gujarati'];

export default function Filters() {
  const { filters, setFilters, resetFilters, isMapView, setIsMapView } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <span className="text-sm font-medium text-gray-700">Commission:</span>
            <input
              type="number"
              min="0"
              max="3"
              step="0.1"
              value={filters.commission_min}
              onChange={(event) => setFilters({ commission_min: parseFloat(event.target.value) || 0 })}
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">-</span>
            <input
              type="number"
              min="0"
              max="3"
              step="0.1"
              value={filters.commission_max}
              onChange={(event) => setFilters({ commission_max: parseFloat(event.target.value) || 3 })}
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-700">%</span>
          </div>

          <select
            value={filters.min_rating}
            onChange={(event) => setFilters({ min_rating: parseFloat(event.target.value) })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="0">All Ratings</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>

          <select
            value={filters.min_experience}
            onChange={(event) => setFilters({ min_experience: parseInt(event.target.value) })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="0">Any Experience</option>
            <option value="2">2+ Years</option>
            <option value="5">5+ Years</option>
            <option value="10">10+ Years</option>
          </select>

          <select
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(event) => {
              const [sort_by, sort_order] = event.target.value.split('-') as [
                SearchFilters['sort_by'],
                SearchFilters['sort_order'],
              ];
              setFilters({ sort_by, sort_order });
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="commission-asc">Commission: Low to High</option>
            <option value="commission-desc">Commission: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="experience-desc">Experience: Most to Least</option>
            <option value="sales-desc">Sales: Most to Least</option>
            <option value="days_on_market-asc">Days on Market: Low to High</option>
          </select>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={filters.verified_only}
              onChange={(event) => setFilters({ verified_only: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            Verified
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={filters.accepts_referrals_only}
              onChange={(event) => setFilters({ accepts_referrals_only: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            Referrals
          </label>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            More Filters
          </button>

          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>

          <button
            onClick={() => setIsMapView(!isMapView)}
            className="ml-auto flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {isMapView ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => {
                        const current = filters.specialties;
                        const updated = current.includes(specialty)
                          ? current.filter((item) => item !== specialty)
                          : [...current, specialty];
                        setFilters({ specialties: updated });
                      }}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        filters.specialties.includes(specialty)
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => (
                    <button
                      key={language}
                      onClick={() => {
                        const current = filters.languages;
                        const updated = current.includes(language)
                          ? current.filter((item) => item !== language)
                          : [...current, language];
                        setFilters({ languages: updated });
                      }}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        filters.languages.includes(language)
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
