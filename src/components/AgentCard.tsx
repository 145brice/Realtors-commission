'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Agent } from '@/types';
import { formatCommission, getInitials } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AgentCard({ agent, isSelected = false, onClick }: AgentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-primary-600 shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex gap-4">
        {/* Agent Photo */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
            {agent.photo_url ? (
              <Image
                src={agent.photo_url}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-semibold">
                {getInitials(agent.name)}
              </div>
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <Link href={`/agent/${agent.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                  {agent.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(agent.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">
                    {agent.rating} ({agent.review_count})
                  </span>
                </div>
              </div>
            </div>

            {/* Commission Badge */}
            <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-200">
              <span className="text-lg font-bold text-green-700">
                {formatCommission(agent.commission_rate)}
              </span>
              <span className="text-xs text-green-600 block">listing fee</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <div className="text-xs text-gray-500">Experience</div>
              <div className="text-sm font-semibold text-gray-900">
                {agent.years_experience} years
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Sales</div>
              <div className="text-sm font-semibold text-gray-900">
                {agent.total_sales}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Avg. DOM</div>
              <div className="text-sm font-semibold text-gray-900">
                {agent.avg_days_on_market} days
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {agent.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.bio}</p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              Contact Agent
            </button>
            <Link
              href={`/agent/${agent.id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
