import { Account, Client, Databases, ID, Models, Query } from 'appwrite';
import { Agent, RecentSale, Review } from '@/types';

type AgentDocument = Models.Document &
  Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'service_radius_miles'> &
  Partial<Pick<Agent, 'service_radius_miles'>>;

type ReviewDocument = Models.Document & Omit<Review, 'id'>;
type RecentSaleDocument = Models.Document & Omit<RecentSale, 'id'>;

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

export const appwriteConfig = {
  endpoint,
  projectId,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  agentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || 'agents',
  reviewsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || 'reviews',
  recentSalesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_RECENT_SALES_COLLECTION_ID || 'recent_sales',
};

export const appwriteClient = new Client();

if (endpoint && projectId) {
  appwriteClient.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);

export function isAppwriteConfigured() {
  return Boolean(appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.databaseId);
}

export async function createEmailSession(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

export async function createEmailAccount(email: string, password: string, name: string) {
  return account.create(ID.unique(), email, password, name);
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function listAgentsFromAppwrite() {
  if (!isAppwriteConfigured()) {
    return [];
  }

  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.agentsCollectionId,
    [Query.limit(100), Query.orderDesc('rating')]
  );

  return response.documents.map(mapAgentDocument) satisfies Agent[];
}

export async function getAgentFromAppwrite(agentId: string) {
  if (!isAppwriteConfigured()) {
    return null;
  }

  try {
    const document = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.agentsCollectionId,
      agentId
    );
    return mapAgentDocument(document);
  } catch {
    return null;
  }
}

export async function listReviewsFromAppwrite(agentId: string) {
  if (!isAppwriteConfigured()) {
    return [];
  }

  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.reviewsCollectionId,
    [Query.equal('agent_id', agentId), Query.orderDesc('created_at')]
  );

  return response.documents.map((document) => {
    const review = document as unknown as ReviewDocument;

    return {
      id: review.$id,
      agent_id: review.agent_id,
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      comment: review.comment,
      property_type: review.property_type,
      transaction_type: review.transaction_type,
      created_at: review.created_at,
    };
  }) satisfies Review[];
}

export async function listRecentSalesFromAppwrite(agentId: string) {
  if (!isAppwriteConfigured()) {
    return [];
  }

  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.recentSalesCollectionId,
    [Query.equal('agent_id', agentId), Query.orderDesc('sold_date')]
  );

  return response.documents.map((document) => {
    const recentSale = document as unknown as RecentSaleDocument;

    return {
      id: recentSale.$id,
      agent_id: recentSale.agent_id,
      address: recentSale.address,
      city: recentSale.city,
      state: recentSale.state,
      zip_code: recentSale.zip_code,
      price: recentSale.price,
      property_type: recentSale.property_type,
      bedrooms: recentSale.bedrooms,
      bathrooms: recentSale.bathrooms,
      square_feet: recentSale.square_feet,
      sold_date: recentSale.sold_date,
      days_on_market: recentSale.days_on_market,
      image_url: recentSale.image_url,
    };
  }) satisfies RecentSale[];
}

function mapAgentDocument(document: Models.Document) {
  const agent = document as unknown as AgentDocument;

  return {
    id: agent.$id,
    name: agent.name,
    email: agent.email,
    phone: agent.phone,
    photo_url: agent.photo_url,
    brokerage: agent.brokerage,
    commission_rate: agent.commission_rate,
    years_experience: agent.years_experience,
    total_sales: agent.total_sales,
    avg_days_on_market: agent.avg_days_on_market,
    rating: agent.rating,
    review_count: agent.review_count,
    bio: agent.bio,
    specialties: agent.specialties || [],
    languages: agent.languages || [],
    license_number: agent.license_number,
    office_address: agent.office_address,
    latitude: agent.latitude,
    longitude: agent.longitude,
    area_served: agent.area_served,
    city: agent.city,
    state: agent.state,
    zip_codes: agent.zip_codes || [],
    neighborhoods: agent.neighborhoods || [],
    service_radius_miles: agent.service_radius_miles || 25,
    verified: agent.verified,
    accepts_referrals: Boolean(agent.accepts_referrals),
    created_at: agent.$createdAt,
    updated_at: agent.$updatedAt,
  } satisfies Agent;
}
