import { IdxProviderConfig } from '@/types';

export const idxConfig: IdxProviderConfig = {
  provider: (process.env.NEXT_PUBLIC_IDX_PROVIDER as IdxProviderConfig['provider']) || 'reso-web-api',
  mlsName: process.env.NEXT_PUBLIC_IDX_MLS_NAME || 'MLS data source pending',
  participantBrokerage:
    process.env.NEXT_PUBLIC_IDX_PARTICIPANT_BROKERAGE || 'Broker participant approval pending',
  participantBrokerageLicense: process.env.NEXT_PUBLIC_IDX_PARTICIPANT_LICENSE,
  dataSourceName: process.env.NEXT_PUBLIC_IDX_DATA_SOURCE_NAME || 'RESO Web API / IDX feed',
  lastSyncedAt: process.env.NEXT_PUBLIC_IDX_LAST_SYNCED_AT,
  refreshIntervalHours: Number(process.env.NEXT_PUBLIC_IDX_REFRESH_INTERVAL_HOURS || 12),
  complianceContactEmail: process.env.NEXT_PUBLIC_IDX_COMPLIANCE_EMAIL,
};

export function formatIdxUpdatedAt(value?: string) {
  if (!value) {
    return 'pending MLS feed connection';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getIdxComplianceSummary() {
  return [
    `IDX provider: ${idxConfig.dataSourceName}`,
    `MLS: ${idxConfig.mlsName}`,
    `Broker participant: ${idxConfig.participantBrokerage}`,
    `Refresh target: every ${idxConfig.refreshIntervalHours} hours`,
    `Last IDX sync: ${formatIdxUpdatedAt(idxConfig.lastSyncedAt)}`,
  ];
}
