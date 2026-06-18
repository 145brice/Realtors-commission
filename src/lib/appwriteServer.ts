import { Agent, AgentClaim, RecentSale, Review } from '@/types';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const claimsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_AGENT_CLAIMS_COLLECTION_ID || 'agent_claims';
const agentsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || 'agents';

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
};

export function isAdminEmail(email: string) {
  return adminEmails.includes(email.toLowerCase());
}

/** Verify an Appwrite JWT (from Authorization: Bearer header) and return the user, or null. */
export async function verifyJWT(jwt: string): Promise<{ id: string; email: string } | null> {
  if (!jwt) return null;
  try {
    const res = await fetch(`${endpoint}/account`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-JWT': jwt,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { id: user.$id, email: String(user.email || '') };
  } catch {
    return null;
  }
}

/** Extract Bearer token from Authorization header and verify it is an admin. */
export async function verifyAdminRequest(
  request: Request
): Promise<{ id: string; email: string } | null> {
  const auth = request.headers.get('authorization') || '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const user = await verifyJWT(jwt);
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/** Extract Bearer token and verify the user is logged in (any role). */
export async function verifyUserRequest(
  request: Request
): Promise<{ id: string; email: string } | null> {
  const auth = request.headers.get('authorization') || '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return verifyJWT(jwt);
}

export function assertServerConfigured() {
  if (!endpoint || !projectId || !apiKey || !databaseId) {
    throw new Error('Appwrite server environment is not configured.');
  }
}

export async function listAgentClaims() {
  assertServerConfigured();
  const response = await appwriteRequest<{ documents: Record<string, unknown>[] }>(
    'GET',
    `/databases/${databaseId}/collections/${claimsCollectionId}/documents?queries[]=${encodeURIComponent(
      JSON.stringify({ method: 'orderDesc', attribute: '$createdAt' })
    )}`
  );

  return response.documents.map(mapAgentClaim);
}

export async function listPublicAgents() {
  assertServerConfigured();
  const response = await appwriteRequest<{ documents: Record<string, unknown>[] }>(
    'GET',
    `/databases/${databaseId}/collections/${agentsCollectionId}/documents`
  );

  return response.documents.map(mapAgentDocument);
}

export async function getPublicAgentBundle(agentId: string) {
  assertServerConfigured();
  const [agent, reviews, recentSales] = await Promise.all([
    appwriteRequest<Record<string, unknown>>(
      'GET',
      `/databases/${databaseId}/collections/${agentsCollectionId}/documents/${agentId}`
    ).then(mapAgentDocument),
    listPublicReviews(agentId),
    listPublicRecentSales(agentId),
  ]);

  return { agent, reviews, recentSales };
}

export async function upsertAgentClaim(claim: Partial<AgentClaim>) {
  assertServerConfigured();
  const data = normalizeClaimData(claim);

  const response = await appwriteWriteWithConflictFallback(data);

  return mapAgentClaim(response);
}

export async function approveAgentClaim(claimId: string, adminNote = '') {
  assertServerConfigured();
  const claim = await appwriteRequest<Record<string, unknown>>(
    'GET',
    `/databases/${databaseId}/collections/${claimsCollectionId}/documents/${claimId}`
  );
  const mappedClaim = mapAgentClaim(claim);
  const agentData = claimToAgentData(mappedClaim);

  await appwriteRequest(
    'POST',
    `/databases/${databaseId}/collections/${agentsCollectionId}/documents`,
    {
      documentId: mappedClaim.agent_id || mappedClaim.license_number.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      data: agentData,
      permissions: ['read("any")'],
    }
  );

  const updatedClaim = await appwriteRequest<Record<string, unknown>>(
    'PATCH',
    `/databases/${databaseId}/collections/${claimsCollectionId}/documents/${claimId}`,
    {
      data: {
        status: 'approved',
        admin_note: adminNote,
      },
    }
  );

  return mapAgentClaim(updatedClaim);
}

export async function rejectAgentClaim(claimId: string, adminNote = '') {
  assertServerConfigured();
  const updatedClaim = await appwriteRequest<Record<string, unknown>>(
    'PATCH',
    `/databases/${databaseId}/collections/${claimsCollectionId}/documents/${claimId}`,
    {
      data: {
        status: 'rejected',
        admin_note: adminNote,
      },
    }
  );

  return mapAgentClaim(updatedClaim);
}

export async function createReview(
  agentId: string,
  data: {
    reviewer_name: string;
    rating: number;
    comment: string;
    property_type: string;
    transaction_type: 'buy' | 'sell';
  }
) {
  assertServerConfigured();
  const reviewsCollectionId =
    process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews';

  const document = await appwriteRequest<Record<string, unknown>>(
    'POST',
    `/databases/${databaseId}/collections/${reviewsCollectionId}/documents`,
    {
      documentId: 'unique()',
      data: {
        agent_id: agentId,
        reviewer_name: data.reviewer_name,
        rating: Math.min(5, Math.max(1, Math.round(data.rating))),
        comment: data.comment,
        property_type: data.property_type,
        transaction_type: data.transaction_type,
        created_at: new Date().toISOString(),
      },
      permissions: ['read("any")'],
    }
  );

  return {
    id: String(document.$id || ''),
    agent_id: agentId,
    reviewer_name: data.reviewer_name,
    rating: Number(document.rating || data.rating),
    comment: data.comment,
    property_type: data.property_type,
    transaction_type: data.transaction_type,
    created_at: String(document.$createdAt || new Date().toISOString()),
  } satisfies import('@/types').Review;
}

async function appwriteRequest<T>(method: string, path: string, body?: unknown) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${path} failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

async function appwriteWriteWithConflictFallback(data: ReturnType<typeof normalizeClaimData>) {
  const createResponse = await fetch(
    `${endpoint}/databases/${databaseId}/collections/${claimsCollectionId}/documents`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        documentId: data.user_id,
        data,
        permissions: [],
      }),
      cache: 'no-store',
    }
  );

  if (createResponse.ok) {
    return createResponse.json() as Promise<Record<string, unknown>>;
  }

  if (createResponse.status !== 409) {
    const text = await createResponse.text();
    throw new Error(`POST agent claim failed: ${createResponse.status} ${text}`);
  }

  return appwriteRequest<Record<string, unknown>>(
    'PATCH',
    `/databases/${databaseId}/collections/${claimsCollectionId}/documents/${data.user_id}`,
    { data }
  );
}

function normalizeClaimData(claim: Partial<AgentClaim>) {
  return {
    user_id: claim.user_id || '',
    user_email: claim.user_email || '',
    agent_id: claim.agent_id || '',
    status: claim.status || 'pending',
    name: claim.name || '',
    email: claim.email || claim.user_email || '',
    phone: claim.phone || '',
    photo_url: claim.photo_url || '',
    brokerage: claim.brokerage || '',
    commission_rate: Number(claim.commission_rate || 2.5),
    bio: claim.bio || '',
    specialties: claim.specialties || [],
    languages: claim.languages || ['English'],
    license_number: claim.license_number || '',
    office_address: claim.office_address || '',
    area_served: claim.area_served || '',
    city: claim.city || '',
    state: claim.state || '',
    zip_codes: claim.zip_codes || [],
    neighborhoods: claim.neighborhoods || [],
    idx_feed_url: claim.idx_feed_url || '',
    idx_provider: claim.idx_provider || '',
    mls_name: claim.mls_name || '',
    mls_participant_id: claim.mls_participant_id || '',
    mls_office_id: claim.mls_office_id || '',
    admin_note: claim.admin_note || '',
  };
}

function claimToAgentData(claim: AgentClaim) {
  return {
    name: claim.name,
    email: claim.email,
    phone: claim.phone,
    photo_url: claim.photo_url,
    brokerage: claim.brokerage,
    commission_rate: claim.commission_rate,
    years_experience: 0,
    total_sales: 0,
    avg_days_on_market: 0,
    rating: 0,
    review_count: 0,
    bio: claim.bio,
    specialties: claim.specialties,
    languages: claim.languages,
    license_number: claim.license_number,
    office_address: claim.office_address,
    latitude: 34.0522,
    longitude: -118.2437,
    area_served: claim.area_served,
    city: claim.city,
    state: claim.state,
    zip_codes: claim.zip_codes,
    neighborhoods: claim.neighborhoods,
    idx_feed_url: claim.idx_feed_url || '',
    idx_provider: claim.idx_provider || '',
    mls_name: claim.mls_name || '',
    mls_participant_id: claim.mls_participant_id || '',
    mls_office_id: claim.mls_office_id || '',
    verified: true,
    accepts_referrals: true,
  };
}

function mapAgentClaim(document: Record<string, unknown>) {
  return {
    id: String(document.$id || ''),
    user_id: String(document.user_id || ''),
    user_email: String(document.user_email || ''),
    agent_id: String(document.agent_id || ''),
    status: (document.status || 'pending') as AgentClaim['status'],
    name: String(document.name || ''),
    email: String(document.email || ''),
    phone: String(document.phone || ''),
    photo_url: String(document.photo_url || ''),
    brokerage: String(document.brokerage || ''),
    commission_rate: Number(document.commission_rate || 0),
    bio: String(document.bio || ''),
    specialties: Array.isArray(document.specialties) ? document.specialties.map(String) : [],
    languages: Array.isArray(document.languages) ? document.languages.map(String) : [],
    license_number: String(document.license_number || ''),
    office_address: String(document.office_address || ''),
    area_served: String(document.area_served || ''),
    city: String(document.city || ''),
    state: String(document.state || ''),
    zip_codes: Array.isArray(document.zip_codes) ? document.zip_codes.map(String) : [],
    neighborhoods: Array.isArray(document.neighborhoods) ? document.neighborhoods.map(String) : [],
    idx_feed_url: String(document.idx_feed_url || ''),
    idx_provider: String(document.idx_provider || ''),
    mls_name: String(document.mls_name || ''),
    mls_participant_id: String(document.mls_participant_id || ''),
    mls_office_id: String(document.mls_office_id || ''),
    admin_note: String(document.admin_note || ''),
    created_at: String(document.$createdAt || ''),
    updated_at: String(document.$updatedAt || ''),
  } satisfies AgentClaim;
}

async function listPublicReviews(agentId: string) {
  const query = encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'agent_id', values: [agentId] }));
  const response = await appwriteRequest<{ documents: Record<string, unknown>[] }>(
    'GET',
    `/databases/${databaseId}/collections/${process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews'}/documents?queries[]=${query}`
  );

  return response.documents.map((document) => ({
    id: String(document.$id || ''),
    agent_id: String(document.agent_id || ''),
    reviewer_name: String(document.reviewer_name || ''),
    rating: Number(document.rating || 0),
    comment: String(document.comment || ''),
    property_type: String(document.property_type || ''),
    transaction_type: (document.transaction_type || 'buy') as Review['transaction_type'],
    created_at: String(document.created_at || document.$createdAt || ''),
  })) satisfies Review[];
}

async function listPublicRecentSales(agentId: string) {
  const query = encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'agent_id', values: [agentId] }));
  const response = await appwriteRequest<{ documents: Record<string, unknown>[] }>(
    'GET',
    `/databases/${databaseId}/collections/${process.env.NEXT_PUBLIC_APPWRITE_RECENT_SALES_COLLECTION_ID || 'recent_sales'}/documents?queries[]=${query}`
  );

  return response.documents.map((document) => ({
    id: String(document.$id || ''),
    agent_id: String(document.agent_id || ''),
    address: String(document.address || ''),
    city: String(document.city || ''),
    state: String(document.state || ''),
    zip_code: String(document.zip_code || ''),
    price: Number(document.price || 0),
    property_type: String(document.property_type || ''),
    bedrooms: Number(document.bedrooms || 0),
    bathrooms: Number(document.bathrooms || 0),
    square_feet: Number(document.square_feet || 0),
    sold_date: String(document.sold_date || ''),
    days_on_market: Number(document.days_on_market || 0),
    image_url: String(document.image_url || ''),
  })) satisfies RecentSale[];
}

function mapAgentDocument(document: Record<string, unknown>) {
  return {
    id: String(document.$id || ''),
    name: String(document.name || ''),
    email: String(document.email || ''),
    phone: String(document.phone || ''),
    photo_url: String(document.photo_url || ''),
    brokerage: String(document.brokerage || ''),
    commission_rate: Number(document.commission_rate || 0),
    years_experience: Number(document.years_experience || 0),
    total_sales: Number(document.total_sales || 0),
    avg_days_on_market: Number(document.avg_days_on_market || 0),
    rating: Number(document.rating || 0),
    review_count: Number(document.review_count || 0),
    bio: String(document.bio || ''),
    specialties: Array.isArray(document.specialties) ? document.specialties.map(String) : [],
    languages: Array.isArray(document.languages) ? document.languages.map(String) : [],
    license_number: String(document.license_number || ''),
    office_address: String(document.office_address || ''),
    latitude: Number(document.latitude || 34.0522),
    longitude: Number(document.longitude || -118.2437),
    area_served: String(document.area_served || ''),
    city: String(document.city || ''),
    state: String(document.state || ''),
    zip_codes: Array.isArray(document.zip_codes) ? document.zip_codes.map(String) : [],
    neighborhoods: Array.isArray(document.neighborhoods) ? document.neighborhoods.map(String) : [],
    idx_feed_url: String(document.idx_feed_url || ''),
    idx_provider: String(document.idx_provider || ''),
    mls_name: String(document.mls_name || ''),
    mls_participant_id: String(document.mls_participant_id || ''),
    mls_office_id: String(document.mls_office_id || ''),
    service_radius_miles: Number(document.service_radius_miles || 25),
    verified: Boolean(document.verified),
    accepts_referrals: Boolean(document.accepts_referrals),
    created_at: String(document.$createdAt || ''),
    updated_at: String(document.$updatedAt || ''),
  } satisfies Agent;
}
