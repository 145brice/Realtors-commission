'use client';

import Image from 'next/image';
import { IdxListing } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface IdxListingCardProps {
  listing: IdxListing;
}

export default function IdxListingCard({ listing }: IdxListingCardProps) {
  const primaryPhoto = listing.media_urls[0];

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="relative aspect-[4/3] bg-gray-100">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={listing.unparsed_address}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            MLS photo pending
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xl font-bold text-gray-950">{formatCurrency(listing.list_price)}</p>
          <p className="text-sm font-medium text-gray-800">{listing.unparsed_address}</p>
          <p className="text-sm text-gray-600">
            {listing.city}, {listing.state_or_province} {listing.postal_code}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          {listing.bedrooms_total !== undefined && <span>{listing.bedrooms_total} bd</span>}
          {listing.bathrooms_total_integer !== undefined && (
            <span>{listing.bathrooms_total_integer} ba</span>
          )}
          {listing.living_area !== undefined && (
            <span>{listing.living_area.toLocaleString()} sqft</span>
          )}
          <span>{listing.standard_status}</span>
        </div>

        {listing.public_remarks && (
          <p className="line-clamp-3 text-sm leading-6 text-gray-600">{listing.public_remarks}</p>
        )}

        <div className="border-t border-gray-100 pt-3 text-xs leading-5 text-gray-500">
          <p>
            Listing by {listing.attribution.listingBrokerName}
            {listing.attribution.listingAgentName
              ? ` · ${listing.attribution.listingAgentName}`
              : ''}
          </p>
          <p>
            {listing.attribution.mlsName} · MLS #{listing.attribution.listingId} · Updated{' '}
            {new Date(listing.attribution.lastUpdatedAt).toLocaleString()}
          </p>
          {listing.attribution.disclaimer && <p>{listing.attribution.disclaimer}</p>}
        </div>
      </div>
    </article>
  );
}
