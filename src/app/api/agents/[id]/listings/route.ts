import { NextRequest, NextResponse } from 'next/server';
import { getPublicAgentBundle } from '@/lib/appwriteServer';
import { IdxListing } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { agent } = await getPublicAgentBundle(id);

    if (!agent.idx_feed_url) {
      return NextResponse.json({ listings: [], connected: false });
    }

    const feedRes = await fetch(agent.idx_feed_url, {
      headers: {
        Accept: 'application/json',
        ...(agent.mls_participant_id
          ? { 'X-Participant-ID': agent.mls_participant_id }
          : {}),
      },
      cache: 'no-store',
    });

    if (!feedRes.ok) {
      return NextResponse.json(
        { error: `IDX feed returned ${feedRes.status}` },
        { status: 502 }
      );
    }

    const raw = await feedRes.json();

    // Normalise RESO Web API envelope: value[] or just an array
    const records: Record<string, unknown>[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.value)
      ? raw.value
      : [];

    const listings: IdxListing[] = records.map((r) => ({
      id: String(r.ListingKey || r.ListingId || r.id || ''),
      listing_key: String(r.ListingKey || ''),
      listing_id: String(r.ListingId || r.ListingKey || ''),
      standard_status: (r.StandardStatus as IdxListing['standard_status']) || 'Active',
      property_type: String(r.PropertyType || r.PropertySubType || 'Residential'),
      property_sub_type: r.PropertySubType ? String(r.PropertySubType) : undefined,
      list_price: Number(r.ListPrice || 0),
      bedrooms_total: r.BedroomsTotal !== undefined ? Number(r.BedroomsTotal) : undefined,
      bathrooms_total_integer:
        r.BathroomsTotalInteger !== undefined ? Number(r.BathroomsTotalInteger) : undefined,
      living_area: r.LivingArea !== undefined ? Number(r.LivingArea) : undefined,
      lot_size_square_feet:
        r.LotSizeSquareFeet !== undefined ? Number(r.LotSizeSquareFeet) : undefined,
      unparsed_address: String(r.UnparsedAddress || r.StreetNumber + ' ' + r.StreetName || ''),
      city: String(r.City || ''),
      state_or_province: String(r.StateOrProvince || ''),
      postal_code: String(r.PostalCode || ''),
      latitude: r.Latitude !== undefined ? Number(r.Latitude) : undefined,
      longitude: r.Longitude !== undefined ? Number(r.Longitude) : undefined,
      public_remarks: r.PublicRemarks ? String(r.PublicRemarks) : undefined,
      media_urls: Array.isArray(r.Media)
        ? (r.Media as Record<string, unknown>[])
            .map((m) => String(m.MediaURL || ''))
            .filter(Boolean)
        : [],
      attribution: {
        mlsName: agent.mls_name || 'MLS',
        listingBrokerName: String(r.ListOfficeName || agent.brokerage || ''),
        listingAgentName: r.ListAgentFullName ? String(r.ListAgentFullName) : undefined,
        listingAgentPhone: r.ListAgentDirectPhone ? String(r.ListAgentDirectPhone) : undefined,
        sourceSystemName: String(r.SourceSystemName || ''),
        listingKey: String(r.ListingKey || ''),
        listingId: String(r.ListingId || r.ListingKey || ''),
        lastUpdatedAt: String(r.ModificationTimestamp || new Date().toISOString()),
        copyrightNotice: r.CopyrightNotice ? String(r.CopyrightNotice) : undefined,
        disclaimer: r.Disclaimer ? String(r.Disclaimer) : undefined,
      },
    }));

    return NextResponse.json({ listings, connected: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
