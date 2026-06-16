import { Agent, SearchFilters, SearchLocation } from '@/types';

const zipPattern = /\b\d{5}(?:-\d{4})?\b/;

export function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAgentSearchText(agent: Agent) {
  return normalizeSearchValue(
    [
      agent.name,
      agent.brokerage,
      agent.email,
      agent.phone,
      agent.license_number,
      agent.office_address,
      agent.area_served,
      agent.city,
      agent.state,
      ...agent.zip_codes,
      ...agent.neighborhoods,
      ...agent.specialties,
      ...agent.languages,
    ].join(' ')
  );
}

export function detectSearchLocation(query: string, agents: Agent[]): SearchLocation | null {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return null;
  }

  const zip = normalizedQuery.match(zipPattern)?.[0]?.slice(0, 5);
  const exactZipAgent = zip ? agents.find((agent) => agent.zip_codes.includes(zip)) : undefined;

  if (exactZipAgent) {
    return {
      query,
      latitude: exactZipAgent.latitude,
      longitude: exactZipAgent.longitude,
      city: exactZipAgent.city,
      state: exactZipAgent.state,
      zip,
    };
  }

  const matchingAgent = agents.find((agent) => {
    const cityState = normalizeSearchValue(`${agent.city} ${agent.state}`);
    return cityState.includes(normalizedQuery) || getAgentSearchText(agent).includes(normalizedQuery);
  });

  if (!matchingAgent) {
    return { query, latitude: 34.0522, longitude: -118.2437 };
  }

  return {
    query,
    latitude: matchingAgent.latitude,
    longitude: matchingAgent.longitude,
    city: matchingAgent.city,
    state: matchingAgent.state,
  };
}

export function getSearchSuggestions(query: string, agents: Agent[]) {
  const normalizedQuery = normalizeSearchValue(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const values = agents.flatMap((agent) => [
    `${agent.city}, ${agent.state}`,
    agent.area_served,
    ...agent.zip_codes,
    ...agent.neighborhoods,
    ...agent.specialties,
    ...agent.languages,
    agent.brokerage,
    agent.name,
  ]);

  return Array.from(new Set(values))
    .filter((value) => normalizeSearchValue(value).includes(normalizedQuery))
    .slice(0, 8);
}

export function filterAgents(agents: Agent[], filters: SearchFilters, query = '') {
  const normalizedQuery = normalizeSearchValue(query);
  const zip = normalizedQuery.match(zipPattern)?.[0]?.slice(0, 5);

  const results = agents.filter((agent) => {
    const searchText = getAgentSearchText(agent);
    const matchesQuery =
      !normalizedQuery ||
      searchText.includes(normalizedQuery) ||
      Boolean(zip && agent.zip_codes.includes(zip));

    const matchesCommission =
      agent.commission_rate >= filters.commission_min &&
      agent.commission_rate <= filters.commission_max;

    const matchesRating = agent.rating >= filters.min_rating;
    const matchesExperience = agent.years_experience >= filters.min_experience;
    const matchesVerified = !filters.verified_only || agent.verified;
    const matchesReferrals = !filters.accepts_referrals_only || agent.accepts_referrals;
    const matchesSpecialties =
      filters.specialties.length === 0 ||
      filters.specialties.every((specialty) => agent.specialties.includes(specialty));
    const matchesLanguages =
      filters.languages.length === 0 ||
      filters.languages.every((language) => agent.languages.includes(language));

    return (
      matchesQuery &&
      matchesCommission &&
      matchesRating &&
      matchesExperience &&
      matchesVerified &&
      matchesReferrals &&
      matchesSpecialties &&
      matchesLanguages
    );
  });

  return sortAgents(results, filters);
}

function sortAgents(agents: Agent[], filters: SearchFilters) {
  return [...agents].sort((agentA, agentB) => {
    const direction = filters.sort_order === 'asc' ? 1 : -1;
    const valueA = getSortValue(agentA, filters.sort_by);
    const valueB = getSortValue(agentB, filters.sort_by);
    return (valueA - valueB) * direction;
  });
}

function getSortValue(agent: Agent, sortBy: SearchFilters['sort_by']) {
  switch (sortBy) {
    case 'rating':
      return agent.rating;
    case 'experience':
      return agent.years_experience;
    case 'sales':
      return agent.total_sales;
    case 'days_on_market':
      return agent.avg_days_on_market;
    case 'commission':
    default:
      return agent.commission_rate;
  }
}
