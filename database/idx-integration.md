# IDX / MLS Integration Notes

This app is IDX-ready, not MLS-live. IDX access requires approval from the broker participant's MLS and credentials from the MLS/vendor before real listing data can be displayed.

## Current IDX-Ready Work

- `IdxListing` types model RESO-style listing fields.
- `IdxAttribution` requires MLS name, listing broker, listing IDs, and last-updated metadata.
- `IdxComplianceNotice` displays broker/MLS readiness and refresh timing.
- `IdxListingCard` includes listing broker attribution and per-listing update timestamp.
- Environment variables are ready for IDX provider, MLS name, broker participant, refresh interval, and compliance contact.

## Common IDX Requirements

Rules vary by MLS, but production displays commonly need:

- Broker participant or subscriber control of the display.
- MLS/vendor approval before public display.
- Listing broker attribution near each listing.
- MLS name, copyright notice, and required disclaimer text.
- Last-updated timestamp and refresh timing, often at least every 12 hours.
- Seller/broker opt-out handling.
- MLS monitoring access to the public display.
- Data use limited to the approved IDX display purpose.

## Provider Options

Common technical paths:

- MLS Grid API
- CoreLogic/Trestle
- Direct RESO Web API from a regional MLS
- Legacy RETS if the MLS still requires it
- A managed IDX vendor if the MLS does not allow direct feed use

## Required Before Launching Listings

Add these values to `.env.local` and Railway:

```env
NEXT_PUBLIC_IDX_PROVIDER=reso-web-api
NEXT_PUBLIC_IDX_MLS_NAME=Your MLS Name
NEXT_PUBLIC_IDX_PARTICIPANT_BROKERAGE=Your Brokerage Name
NEXT_PUBLIC_IDX_PARTICIPANT_LICENSE=
NEXT_PUBLIC_IDX_DATA_SOURCE_NAME=RESO Web API / IDX feed
NEXT_PUBLIC_IDX_REFRESH_INTERVAL_HOURS=12
NEXT_PUBLIC_IDX_LAST_SYNCED_AT=
NEXT_PUBLIC_IDX_COMPLIANCE_EMAIL=
```

Never expose private MLS API credentials as `NEXT_PUBLIC_*`. Real feed credentials should live only in server-side environment variables and be used by a backend sync job.

## Next Build Step

Create a server-side listing ingestion job after the MLS/vendor credentials exist:

- Fetch active IDX-approved listings from the provider.
- Normalize provider fields into `IdxListing`.
- Store raw source IDs and attribution fields.
- Refresh at the MLS-required interval.
- Remove or hide listings that are withdrawn, expired, sold if not permitted, or opted out.
