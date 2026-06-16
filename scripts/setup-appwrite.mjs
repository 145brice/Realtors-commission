import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envPath = path.join(root, '.env.local');

loadEnv(envPath);

const endpoint = requiredEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT');
const projectId = requiredEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
const apiKey = requiredEnv('APPWRITE_API_KEY');
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'commission_scout';
const agentsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || 'agents';
const reviewsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews';
const recentSalesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_RECENT_SALES_COLLECTION_ID || 'recent_sales';

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
};

const agents = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@realty.com',
    phone: '3105551234',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    brokerage: 'ClearPath Realty',
    commission_rate: 1.5,
    years_experience: 12,
    total_sales: 156,
    avg_days_on_market: 28,
    rating: 4.9,
    review_count: 89,
    bio: 'Listing-focused agent specializing in luxury homes, relocation, and first-time sellers.',
    specialties: ['Residential', 'Luxury', 'First-Time Sellers', 'Relocation'],
    languages: ['English', 'Spanish'],
    license_number: 'CA-DRE-01234567',
    office_address: '123 Main St, Los Angeles, CA 90001',
    latitude: 34.0522,
    longitude: -118.2437,
    area_served: 'Los Angeles County',
    city: 'Los Angeles',
    state: 'CA',
    zip_codes: ['90001', '90012', '90015', '90026', '90046'],
    neighborhoods: ['Downtown Los Angeles', 'Echo Park', 'Silver Lake', 'Hollywood Hills'],
    service_radius_miles: 18,
    verified: true,
    accepts_referrals: true,
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@realty.com',
    phone: '3105555678',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    brokerage: 'Harbor & Hill',
    commission_rate: 2,
    years_experience: 8,
    total_sales: 92,
    avg_days_on_market: 32,
    rating: 4.7,
    review_count: 56,
    bio: 'Investor-friendly agent with a strong record in condos, multifamily, and commercial deals.',
    specialties: ['Investment', 'Commercial', 'Condos', 'Multifamily'],
    languages: ['English', 'Mandarin'],
    license_number: 'CA-DRE-02345678',
    office_address: '456 Oak Ave, Los Angeles, CA 90002',
    latitude: 34.0622,
    longitude: -118.2537,
    area_served: 'Central Los Angeles',
    city: 'Los Angeles',
    state: 'CA',
    zip_codes: ['90002', '90007', '90011', '90037'],
    neighborhoods: ['South Park', 'University Park', 'Exposition Park'],
    service_radius_miles: 15,
    verified: true,
    accepts_referrals: false,
  },
];

await ensureDatabase();
await ensureCollection(agentsCollectionId, 'Agents');
await ensureCollection(reviewsCollectionId, 'Reviews');
await ensureCollection(recentSalesCollectionId, 'Recent Sales');
await ensureAgentAttributes();
await ensureReviewAttributes();
await ensureRecentSaleAttributes();
await ensureAgentIndexes();
await seedAgents();
await seedReviews();
await seedRecentSales();
writeEnv();

console.log('Appwrite setup complete.');
console.log(`Database: ${databaseId}`);
console.log(`Agents collection: ${agentsCollectionId}`);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    process.env[key] ||= value;
  }
}

function requiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

async function request(method, resourcePath, body) {
  const response = await fetch(`${endpoint}${resourcePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 409) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${resourcePath} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function ensureDatabase() {
  if (await resourceExists(`/databases/${databaseId}`)) {
    return;
  }

  await request('POST', '/databases', {
    databaseId,
    name: 'Commission Scout',
    enabled: true,
  });
}

async function resourceExists(resourcePath) {
  const response = await fetch(`${endpoint}${resourcePath}`, {
    method: 'GET',
    headers,
  });

  if (response.ok) {
    return true;
  }

  if (response.status === 404) {
    return false;
  }

  const text = await response.text();
  throw new Error(`GET ${resourcePath} failed: ${response.status} ${text}`);
}

async function ensureCollection(collectionId, name) {
  await request('POST', `/databases/${databaseId}/collections`, {
    collectionId,
    name,
    permissions: ['read("any")'],
    documentSecurity: false,
    enabled: true,
  });
}

async function ensureAgentAttributes() {
  const attributes = [
    ['string', 'name', { size: 120, required: true }],
    ['email', 'email', { required: true }],
    ['string', 'phone', { size: 40, required: true }],
    ['url', 'photo_url', { required: false }],
    ['string', 'brokerage', { size: 120, required: true }],
    ['float', 'commission_rate', { required: true }],
    ['integer', 'years_experience', { required: true }],
    ['integer', 'total_sales', { required: true }],
    ['integer', 'avg_days_on_market', { required: true }],
    ['float', 'rating', { required: true }],
    ['integer', 'review_count', { required: true }],
    ['string', 'bio', { size: 1000, required: true }],
    ['string', 'specialties', { size: 80, required: false, array: true }],
    ['string', 'languages', { size: 80, required: false, array: true }],
    ['string', 'license_number', { size: 80, required: true }],
    ['string', 'office_address', { size: 240, required: true }],
    ['float', 'latitude', { required: true }],
    ['float', 'longitude', { required: true }],
    ['string', 'area_served', { size: 160, required: true }],
    ['string', 'city', { size: 100, required: true }],
    ['string', 'state', { size: 40, required: true }],
    ['string', 'zip_codes', { size: 12, required: false, array: true }],
    ['string', 'neighborhoods', { size: 120, required: false, array: true }],
    ['boolean', 'verified', { required: false }],
    ['boolean', 'accepts_referrals', { required: false }],
  ];

  for (const [type, key, options] of attributes) {
    await createAttribute(agentsCollectionId, type, key, options);
  }

  await waitForAttributes(agentsCollectionId, attributes.map(([, key]) => key));
}

async function ensureReviewAttributes() {
  const attributes = [
    ['string', 'agent_id', { size: 80, required: true }],
    ['string', 'reviewer_name', { size: 120, required: true }],
    ['integer', 'rating', { required: true }],
    ['string', 'comment', { size: 1200, required: true }],
    ['string', 'property_type', { size: 120, required: true }],
    ['string', 'transaction_type', { size: 20, required: true }],
    ['datetime', 'created_at', { required: true }],
  ];

  for (const [type, key, options] of attributes) {
    await createAttribute(reviewsCollectionId, type, key, options);
  }

  await waitForAttributes(reviewsCollectionId, attributes.map(([, key]) => key));
}

async function ensureRecentSaleAttributes() {
  const attributes = [
    ['string', 'agent_id', { size: 80, required: true }],
    ['string', 'address', { size: 240, required: true }],
    ['string', 'city', { size: 100, required: true }],
    ['string', 'state', { size: 40, required: true }],
    ['string', 'zip_code', { size: 12, required: true }],
    ['integer', 'price', { required: true }],
    ['string', 'property_type', { size: 120, required: true }],
    ['integer', 'bedrooms', { required: true }],
    ['integer', 'bathrooms', { required: true }],
    ['integer', 'square_feet', { required: true }],
    ['datetime', 'sold_date', { required: true }],
    ['integer', 'days_on_market', { required: true }],
    ['url', 'image_url', { required: false }],
  ];

  for (const [type, key, options] of attributes) {
    await createAttribute(recentSalesCollectionId, type, key, options);
  }

  await waitForAttributes(recentSalesCollectionId, attributes.map(([, key]) => key));
}

async function createAttribute(collectionId, type, key, options) {
  const basePath = `/databases/${databaseId}/collections/${collectionId}/attributes`;

  if (type === 'string') {
    return request('POST', `${basePath}/string`, { key, ...options });
  }

  if (type === 'email') {
    return request('POST', `${basePath}/email`, { key, ...options });
  }

  if (type === 'url') {
    return request('POST', `${basePath}/url`, { key, ...options });
  }

  if (type === 'float') {
    return request('POST', `${basePath}/float`, { key, ...options });
  }

  if (type === 'integer') {
    return request('POST', `${basePath}/integer`, { key, ...options });
  }

  if (type === 'boolean') {
    return request('POST', `${basePath}/boolean`, { key, ...options });
  }

  if (type === 'datetime') {
    return request('POST', `${basePath}/datetime`, { key, ...options });
  }

  throw new Error(`Unsupported attribute type: ${type}`);
}

async function waitForAttributes(collectionId, keys) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await request(
      'GET',
      `/databases/${databaseId}/collections/${collectionId}/attributes`
    );
    const available = new Set(
      response.attributes
        .filter((attribute) => ['available', 'stuck'].includes(attribute.status))
        .map((attribute) => attribute.key)
    );

    if (keys.every((key) => available.has(key))) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Timed out waiting for Appwrite attributes to become available.');
}

async function ensureAgentIndexes() {
  const indexes = [
    ['rating_desc', 'key', ['rating'], ['DESC']],
    ['commission_asc', 'key', ['commission_rate'], ['ASC']],
    ['city_state', 'key', ['city', 'state'], ['ASC', 'ASC']],
    ['license_number', 'unique', ['license_number'], ['ASC']],
  ];

  for (const [key, type, attributes, orders] of indexes) {
    await request('POST', `/databases/${databaseId}/collections/${agentsCollectionId}/indexes`, {
      key,
      type,
      attributes,
      orders,
    });
  }
}

async function seedAgents() {
  for (const agent of agents) {
    const { service_radius_miles, ...appwriteAgent } = agent;

    await request('POST', `/databases/${databaseId}/collections/${agentsCollectionId}/documents`, {
      documentId: toDocumentId(agent.license_number),
      data: appwriteAgent,
      permissions: ['read("any")'],
    });
  }
}

async function seedReviews() {
  const firstAgentId = toDocumentId(agents[0].license_number);
  const reviews = [
    {
      documentId: 'review-clear-pricing',
      data: {
        agent_id: firstAgentId,
        reviewer_name: 'John Smith',
        rating: 5,
        comment: 'Clear pricing, sharp listing prep, and a faster sale than we expected.',
        property_type: 'Single Family Home',
        transaction_type: 'sell',
        created_at: '2025-11-15T00:00:00.000+00:00',
      },
    },
    {
      documentId: 'review-transparent-commission',
      data: {
        agent_id: firstAgentId,
        reviewer_name: 'Maria Garcia',
        rating: 5,
        comment: 'Professional, direct, and very transparent about the commission math.',
        property_type: 'Condo',
        transaction_type: 'buy',
        created_at: '2025-10-28T00:00:00.000+00:00',
      },
    },
  ];

  for (const review of reviews) {
    await request('POST', `/databases/${databaseId}/collections/${reviewsCollectionId}/documents`, {
      documentId: review.documentId,
      data: review.data,
      permissions: ['read("any")'],
    });
  }
}

async function seedRecentSales() {
  const firstAgentId = toDocumentId(agents[0].license_number);
  const recentSales = [
    {
      documentId: 'sale-ocean-ave',
      data: {
        agent_id: firstAgentId,
        address: '456 Ocean Ave',
        city: 'Santa Monica',
        state: 'CA',
        zip_code: '90401',
        price: 2850000,
        property_type: 'Single Family Home',
        bedrooms: 4,
        bathrooms: 3,
        square_feet: 2800,
        sold_date: '2025-11-20T00:00:00.000+00:00',
        days_on_market: 22,
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      },
    },
    {
      documentId: 'sale-beverly-dr',
      data: {
        agent_id: firstAgentId,
        address: '789 Beverly Dr',
        city: 'Beverly Hills',
        state: 'CA',
        zip_code: '90210',
        price: 4500000,
        property_type: 'Luxury Home',
        bedrooms: 5,
        bathrooms: 5,
        square_feet: 4200,
        sold_date: '2025-10-15T00:00:00.000+00:00',
        days_on_market: 31,
        image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
      },
    },
  ];

  for (const sale of recentSales) {
    await request(
      'POST',
      `/databases/${databaseId}/collections/${recentSalesCollectionId}/documents`,
      {
        documentId: sale.documentId,
        data: sale.data,
        permissions: ['read("any")'],
      }
    );
  }
}

function toDocumentId(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function writeEnv() {
  const values = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: databaseId,
    NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID: agentsCollectionId,
    NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID: reviewsCollectionId,
    NEXT_PUBLIC_APPWRITE_RECENT_SALES_COLLECTION_ID: recentSalesCollectionId,
    APPWRITE_API_KEY: apiKey,
  };

  const contents = `${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;

  fs.writeFileSync(envPath, contents);
}
