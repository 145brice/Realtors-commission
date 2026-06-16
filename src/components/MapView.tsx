'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '@/store/appStore';
import { Agent } from '@/types';
import { formatCommission } from '@/lib/utils';

type LeafletIconDefault = L.Icon.Default & {
  _getIconUrl?: string;
};

delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const {
    filteredAgents,
    selectedAgent,
    setSelectedAgent,
    searchLocation,
    isAuthenticated,
    setAuthPromptOpen,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current || mapInstanceRef.current) return;

    const defaultLat = searchLocation?.latitude || 34.0522;
    const defaultLng = searchLocation?.longitude || -118.2437;
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mounted, searchLocation?.latitude, searchLocation?.longitude]);

  useEffect(() => {
    function openPrompt() {
      setAuthPromptOpen(true);
    }

    window.addEventListener('open-auth-prompt', openPrompt);
    return () => window.removeEventListener('open-auth-prompt', openPrompt);
  }, [setAuthPromptOpen]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mounted) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const visibleAgents = filteredAgents.slice(0, 250);

    visibleAgents.forEach((agent: Agent) => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="flex items-center justify-center w-11 h-11 bg-gray-950 text-white rounded-full border-2 border-white shadow-lg text-xs font-bold cursor-pointer hover:scale-110 transition-transform ${
            selectedAgent?.id === agent.id ? 'ring-4 ring-primary-300 scale-110' : ''
          }">
            ${formatCommission(agent.commission_rate)}
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker([agent.latitude, agent.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .on('click', () => setSelectedAgent(agent));

      const agentName = isAuthenticated ? agent.name : 'Verified local agent';
      const contactButton = isAuthenticated
        ? `<button onclick="window.location.href='/agent/${agent.id}'" class="w-full px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">View Profile</button>`
        : `<button onclick="window.dispatchEvent(new Event('open-auth-prompt'))" class="w-full px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">Start account</button>`;

      marker.bindPopup(`
        <div class="p-2 min-w-[210px]">
          <h3 class="font-semibold text-base mb-1">${agentName}</h3>
          <div class="text-sm text-gray-600 mb-2">
            <div class="font-semibold text-green-700">${formatCommission(agent.commission_rate)} listing fee</div>
            <div>${agent.years_experience} years exp · ${agent.rating} stars</div>
            <div>${agent.city}, ${agent.state} · ${agent.zip_codes.slice(0, 3).join(', ')}</div>
          </div>
          ${contactButton}
        </div>
      `);

      markersRef.current.push(marker);
    });

    if (visibleAgents.length > 0) {
      const bounds = L.latLngBounds(visibleAgents.map((agent) => [agent.latitude, agent.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [filteredAgents, isAuthenticated, mounted, selectedAgent, setSelectedAgent]);

  useEffect(() => {
    if (selectedAgent && mapInstanceRef.current && mounted) {
      mapInstanceRef.current.setView([selectedAgent.latitude, selectedAgent.longitude], 14, {
        animate: true,
      });
    }
  }, [selectedAgent, mounted]);

  useEffect(() => {
    if (searchLocation && mapInstanceRef.current && mounted) {
      mapInstanceRef.current.setView([searchLocation.latitude, searchLocation.longitude], 12, {
        animate: true,
      });
    }
  }, [searchLocation, mounted]);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      <div className="absolute right-4 top-4 z-[1000] max-w-xs rounded-lg bg-white p-3 shadow-lg">
        <div className="text-xs font-semibold text-gray-700">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          OpenStreetMap tiles, no paid key. Markers are capped at 250 per view.
        </div>
      </div>
    </div>
  );
}
