'use client';

import { idxConfig, formatIdxUpdatedAt } from '@/lib/idx';

// Only render when a real MLS name is configured — avoids "pending MLS" noise for visitors.
const isConfigured =
  idxConfig.mlsName &&
  idxConfig.mlsName !== 'MLS data source pending' &&
  !idxConfig.mlsName.toLowerCase().includes('pending');

export default function IdxComplianceNotice() {
  if (!isConfigured) return null;

  return (
    <section className="border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 lg:px-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <p>
          Listing data provided courtesy of {idxConfig.mlsName}. Information is deemed reliable but
          not guaranteed. All properties subject to prior sale, change, or withdrawal.
        </p>
        <p className="shrink-0 font-medium text-gray-700">
          {idxConfig.participantBrokerage} · Updated {formatIdxUpdatedAt(idxConfig.lastSyncedAt)}
        </p>
      </div>
    </section>
  );
}
