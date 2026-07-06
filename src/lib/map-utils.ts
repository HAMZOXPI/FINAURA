import { DEFAULT_MAP_LAT, DEFAULT_MAP_LNG } from "@/lib/constants";
import type { Property } from "@/types/database";

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Agadir: { lat: 30.4278, lng: -9.5981 },
  Casablanca: { lat: 33.5731, lng: -7.5898 },
  Rabat: { lat: 34.0209, lng: -6.8416 },
  Marrakech: { lat: 31.6295, lng: -7.9811 },
  Tanger: { lat: 35.7595, lng: -5.834 },
  Fès: { lat: 34.0181, lng: -5.0078 },
  Meknès: { lat: 33.8935, lng: -5.5473 },
  Oujda: { lat: 34.6814, lng: -1.9086 },
  Tétouan: { lat: 35.5785, lng: -5.3684 },
  "Laâyoune": { lat: 27.1253, lng: -13.1865 },
  Dakhla: { lat: 23.6847, lng: -15.958 },
};

function hashOffset(id: string): { lat: number; lng: number } {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index) * (index + 1)) % 997;
  }
  const angle = (hash / 997) * Math.PI * 2;
  const radius = 0.008 + (hash % 100) / 10000;
  return {
    lat: Math.sin(angle) * radius,
    lng: Math.cos(angle) * radius,
  };
}

export function getPropertyCoordinates(property: Property): { lat: number; lng: number } {
  if (property.latitude != null && property.longitude != null) {
    return { lat: property.latitude, lng: property.longitude };
  }

  const normalizedCity = property.city.trim();
  const cityCoords =
    CITY_COORDINATES[normalizedCity] ??
    Object.entries(CITY_COORDINATES).find(
      ([name]) => name.toLowerCase() === normalizedCity.toLowerCase()
    )?.[1] ?? {
      lat: DEFAULT_MAP_LAT,
      lng: DEFAULT_MAP_LNG,
    };

  const offset = hashOffset(property.id);
  return {
    lat: cityCoords.lat + offset.lat,
    lng: cityCoords.lng + offset.lng,
  };
}

export function getBoundsForProperties(
  properties: Property[]
): [[number, number], [number, number]] | null {
  if (properties.length === 0) return null;

  const coords = properties.map(getPropertyCoordinates);
  const lats = coords.map((item) => item.lat);
  const lngs = coords.map((item) => item.lng);

  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
