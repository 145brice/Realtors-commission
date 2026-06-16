# Commission Scout

A Next.js app for comparing real estate agents by commission, production, rating, specialty, language, service area, and ZIP code. Agent identities and contact details are blurred until a visitor starts an account.

## Features

- Zillow-style split view with agent results beside an interactive map.
- Account gate for agent names, photos, phone numbers, emails, brokerage, and profile access.
- Search across ZIP codes, cities, neighborhoods, specialties, languages, brokerages, agent names, license numbers, phone, and email.
- Filters for commission range, rating, experience, verified agents, referrals, specialties, languages, and sort order.
- Appwrite client wired for Account auth and agent collection reads, with demo data fallback before Appwrite is created.
- OpenStreetMap and Leaflet by default, with no paid map API key required.
- Railway deploy config through `railway.json`.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Appwrite
- Leaflet and OpenStreetMap

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

Add your Appwrite values:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_appwrite_database_id
NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID=agents
NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=reviews
NEXT_PUBLIC_APPWRITE_RECENT_SALES_COLLECTION_ID=recent_sales
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Appwrite

Create the database and collections described in `database/appwrite-schema.md`.

Until Appwrite has documents in the `agents` collection, the app uses local demo data from `src/lib/mockData.ts`.

## Railway

The repository includes `railway.json`:

- Build command: `npm run build`
- Start command: `npm run start`
- Builder: Nixpacks

After linking a Railway project, add the same Appwrite environment variables in Railway.

## Mapping Cost Strategy

The current implementation uses Leaflet with OpenStreetMap tiles, which avoids a paid map API key. To reduce cost and clutter as data grows, the map caps rendered markers at 250 per view. For a production-scale national agent database, add server-side bounds queries and clustering before showing thousands of pins.

## Important Files

- `src/components/HomePage.tsx`: main search layout
- `src/components/AgentCard.tsx`: locked agent cards
- `src/components/AuthPrompt.tsx`: Appwrite email account/sign-in modal
- `src/components/MapView.tsx`: Leaflet map
- `src/lib/appwrite.ts`: Appwrite client and agent loading
- `src/lib/search.ts`: search normalization, matching, filtering, sorting
- `database/appwrite-schema.md`: Appwrite collection setup
