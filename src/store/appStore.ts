import { create } from 'zustand';
import { Agent, SearchFilters, MapBounds, SearchLocation } from '@/types';
import { filterAgents } from '@/lib/search';

interface AppState {
  agents: Agent[];
  filteredAgents: Agent[];
  selectedAgent: Agent | null;
  searchLocation: SearchLocation | null;
  searchQuery: string;
  filters: SearchFilters;
  mapBounds: MapBounds | null;
  isMapView: boolean;
  isAuthenticated: boolean;
  authPromptOpen: boolean;
  
  setAgents: (agents: Agent[]) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setSearchLocation: (location: SearchLocation | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
  setIsMapView: (isMapView: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAuthPromptOpen: (authPromptOpen: boolean) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  commission_min: 0,
  commission_max: 3,
  min_rating: 0,
  min_experience: 0,
  specialties: [],
  languages: [],
  verified_only: false,
  accepts_referrals_only: false,
  sort_by: 'commission',
  sort_order: 'asc',
};

export const useAppStore = create<AppState>((set) => ({
  agents: [],
  filteredAgents: [],
  selectedAgent: null,
  searchLocation: null,
  searchQuery: '',
  filters: defaultFilters,
  mapBounds: null,
  isMapView: true,
  isAuthenticated: false,
  authPromptOpen: false,
  
  setAgents: (agents) => set((state) => ({
    agents,
    filteredAgents: filterAgents(agents, state.filters, state.searchQuery),
  })),
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setSearchLocation: (searchLocation) => set({ searchLocation }),
  setSearchQuery: (searchQuery) => set((state) => ({
    searchQuery,
    filteredAgents: filterAgents(state.agents, state.filters, searchQuery),
  })),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    filteredAgents: filterAgents(state.agents, { ...state.filters, ...newFilters }, state.searchQuery),
  })),
  setMapBounds: (mapBounds) => set({ mapBounds }),
  setIsMapView: (isMapView) => set({ isMapView }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated, authPromptOpen: false }),
  setAuthPromptOpen: (authPromptOpen) => set({ authPromptOpen }),
  resetFilters: () => set((state) => ({
    filters: defaultFilters,
    filteredAgents: filterAgents(state.agents, defaultFilters, state.searchQuery),
  })),
}));
