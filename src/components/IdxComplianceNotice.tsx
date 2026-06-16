'use client';

import { idxConfig, formatIdxUpdatedAt } from '@/lib/idx';

export default function IdxComplianceNotice() {
  return (
    <section className="border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 lg:px-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <p>
          IDX-ready for licensed broker display. MLS listings require broker participant approval, vendor
          credentials, listing broker attribution, and MLS-required disclaimers before going public.
        </p>
        <p className="shrink-0 font-medium text-gray-700">
          {idxConfig.mlsName} · Updated {formatIdxUpdatedAt(idxConfig.lastSyncedAt)}
        </p>
      </div>
    </section>
  );
}
