'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent } from 'react';
import { Agent } from '@/types';
import { formatCommission, getInitials } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

interface AgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AgentCard({ agent, isSelected = false, onClick }: AgentCardProps) {
  const { isAuthenticated, setAuthPromptOpen } = useAppStore();
  const locked = !isAuthenticated;
  const displayName = locked ? 'Verified local agent' : agent.name;

  function handleLockedAction(event: MouseEvent) {
    if (!locked) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setAuthPromptOpen(true);
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border-2 bg-white p-4 transition-all hover:shadow-lg ${
        isSelected ? 'border-primary-600 shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-shrink-0">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-200">
            {agent.photo_url ? (
              <Image
                src={agent.photo_url}
                alt={displayName}
                fill
                className={`object-cover ${locked ? 'blur-md scale-110 grayscale' : ''}`}
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-xl font-semibold text-primary-600">
                {getInitials(agent.name)}
              </div>
            )}
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/30 text-xs font-semibold text-gray-900">
                Locked
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <Link href={`/agent/${agent.id}`} onClick={handleLockedAction}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                  {displayName}
                </h3>
              </Link>
              <p className={`text-sm text-gray-600 ${locked ? 'blur-sm select-none' : ''}`}>
                {agent.brokerage}
              </p>
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

            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-1">
              <span className="text-lg font-bold text-green-700">
                {formatCommission(agent.commission_rate)}
              </span>
              <span className="text-xs text-green-600 block">listing fee</span>
            </div>
          </div>

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

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.bio}</p>

          <div className="mb-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
            <span>Serves {agent.area_served}</span>
            <span>{agent.zip_codes.slice(0, 4).join(', ')}</span>
            <span>{agent.verified ? 'Verified profile' : 'Verification pending'}</span>
            <span>{agent.service_radius_miles} mile radius</span>
          </div>

          <div className={`mb-3 text-sm text-gray-700 ${locked ? 'blur-sm select-none' : ''}`}>
            {agent.phone} · {agent.email}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleLockedAction}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              {locked ? 'Start free account' : 'Contact Agent'}
            </button>
            <Link
              href={`/agent/${agent.id}`}
              onClick={handleLockedAction}
              className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
