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

// Fix for default marker icons in Leaflet
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
  const { filteredAgents, selectedAgent, setSelectedAgent, searchLocation } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapRef.current || mapInstanceRef.current) return;

    const defaultLat = searchLocation?.latitude || 34.0522;
    const defaultLng = searchLocation?.longitude || -118.2437;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mounted, searchLocation]);

  // Update markers when agents change
  useEffect(() => {
    if (!mapInstanceRef.current || !mounted) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredAgents.forEach((agent: Agent) => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full border-2 border-white shadow-lg text-xs font-bold cursor-pointer hover:scale-110 transition-transform ${
            selectedAgent?.id === agent.id ? 'ring-4 ring-primary-300 scale-110' : ''
          }">
            ${formatCommission(agent.commission_rate)}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([agent.latitude, agent.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .on('click', () => {
          setSelectedAgent(agent);
        });

      // Popup content
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-base mb-1">${agent.name}</h3>
          <div class="text-sm text-gray-600 mb-2">
            <div class="font-semibold text-green-700">${formatCommission(agent.commission_rate)} listing fee</div>
            <div>${agent.years_experience} years exp • ${agent.rating} ⭐</div>
          </div>
          <button 
            onclick="window.location.href='/agent/${agent.id}'"
            class="w-full px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
          >
            View Profile
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredAgents.length > 0) {
      const bounds = L.latLngBounds(
        filteredAgents.map((agent: Agent) => [agent.latitude, agent.longitude])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [filteredAgents, selectedAgent, setSelectedAgent, mounted]);

  // Pan to selected agent
  useEffect(() => {
    if (selectedAgent && mapInstanceRef.current && mounted) {
      mapInstanceRef.current.setView([selectedAgent.latitude, selectedAgent.longitude], 14, {
        animate: true,
      });
    }
  }, [selectedAgent, mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[1000]">
        <div className="text-xs text-gray-600">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
