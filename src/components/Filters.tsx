'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { SearchFilters } from '@/types';

const specialtyOptions = ['Residential', 'Luxury', 'Commercial', 'Investment', 'First-Time Buyers', 'Condos', 'New Construction'];
const languageOptions = ['English', 'Spanish', 'Mandarin', 'French', 'Korean', 'Russian', 'Japanese'];

export default function Filters() {
  const { filters, setFilters, resetFilters, isMapView, setIsMapView } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-gray-50 border-t border-gray-200">
      <div className="px-4 py-3">
        {/* Top Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Commission Range */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Commission:</span>
            <input
              type="number"
              min="0"
              max="3"
              step="0.1"
              value={filters.commission_min}
              onChange={(e) => setFilters({ commission_min: parseFloat(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-sm text-gray-500">-</span>
            <input
              type="number"
              min="0"
              max="3"
              step="0.1"
              value={filters.commission_max}
              onChange={(e) => setFilters({ commission_max: parseFloat(e.target.value) || 3 })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">%</span>
          </div>

          {/* Rating Filter */}
          <select
            value={filters.min_rating}
            onChange={(e) => setFilters({ min_rating: parseFloat(e.target.value) })}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
          >
            <option value="0">All Ratings</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>

          {/* Experience Filter */}
          <select
            value={filters.min_experience}
            onChange={(e) => setFilters({ min_experience: parseInt(e.target.value) })}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
          >
            <option value="0">Any Experience</option>
            <option value="2">2+ Years</option>
            <option value="5">5+ Years</option>
            <option value="10">10+ Years</option>
          </select>

          {/* Sort By */}
          <select
            value={`${filters.sort_by}-${filters.sort_order}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split('-') as [SearchFilters['sort_by'], SearchFilters['sort_order']];
              setFilters({ sort_by, sort_order });
            }}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
          >
            <option value="commission-asc">Commission: Low to High</option>
            <option value="commission-desc">Commission: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="experience-desc">Experience: Most to Least</option>
            <option value="sales-desc">Sales: Most to Least</option>
          </select>

          {/* More Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50"
          >
            More Filters
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>

          {/* Map Toggle */}
          <button
            onClick={() => setIsMapView(!isMapView)}
            className="ml-auto px-3 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {isMapView ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => {
                        const current = filters.specialties;
                        const updated = current.includes(specialty)
                          ? current.filter((s) => s !== specialty)
                          : [...current, specialty];
                        setFilters({ specialties: updated });
                      }}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        filters.specialties.includes(specialty)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => (
                    <button
                      key={language}
                      onClick={() => {
                        const current = filters.languages;
                        const updated = current.includes(language)
                          ? current.filter((l) => l !== language)
                          : [...current, language];
                        setFilters({ languages: updated });
                      }}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        filters.languages.includes(language)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
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
