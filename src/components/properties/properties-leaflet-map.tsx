"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import type { Property } from "@/types/database";
import { getBoundsForProperties, getPropertyCoordinates } from "@/lib/map-utils";
import {
  escapeMarkerHtml,
  formatMarkerPrice,
} from "@/lib/map/marker-price";
import type { Locale } from "@/i18n/config";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const MAP_FLY_DURATION = 0.28;

/** Fallback center used when the map initializes or coordinates are unavailable */
export const MAP_FALLBACK_CENTER: [number, number] = [30.4278, -9.5981];

interface PropertiesLeafletMapProps {
  properties: Property[];
  selectedPropertyId: string | null;
  pulsePropertyId: string | null;
  recenterToken: number;
  onSelectProperty: (property: Property) => void;
  locale: Locale;
}

function createPriceMarkerIcon(
  property: Property,
  locale: Locale,
  isActive: boolean,
  isPulsing: boolean
): L.DivIcon {
  const label = formatMarkerPrice(property.price, property.status, locale);
  const classes = [
    "finaura-price-marker",
    isActive ? "is-active" : "",
    isPulsing ? "is-pulse" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: "finaura-price-marker-wrapper",
    html: `<div class="finaura-price-marker-anchor"><button type="button" class="${classes}" aria-label="${escapeMarkerHtml(property.title)}">${escapeMarkerHtml(label)}</button></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createClusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: "finaura-cluster-marker-wrapper",
    html: `<div class="finaura-cluster-marker"><span>${count}</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    const frame = window.requestAnimationFrame(invalidate);
    const timeout = window.setTimeout(invalidate, 280);

    const container = map.getContainer();
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function MapFitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (hasFitRef.current || properties.length === 0) return;

    const bounds = getBoundsForProperties(properties);
    if (!bounds) return;

    const minLng = bounds[0][0];
    const minLat = bounds[0][1];
    const maxLng = bounds[1][0];
    const maxLat = bounds[1][1];

    if (minLng === maxLng && minLat === maxLat) {
      map.setView([minLat, minLng], 13);
    } else {
      const leafletBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
      map.fitBounds(leafletBounds, { padding: [72, 72], maxZoom: 13, animate: false });
    }

    hasFitRef.current = true;
    window.setTimeout(() => map.invalidateSize(), 280);
  }, [map, properties]);

  return null;
}

function MapFlyTo({
  position,
  zoom,
  propertyId,
  recenterToken,
}: {
  position: [number, number];
  zoom: number;
  propertyId: string | null;
  recenterToken: number;
}) {
  const map = useMap();
  const [lat, lng] = position;

  useEffect(() => {
    if (!propertyId || recenterToken === 0) return;

    map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: MAP_FLY_DURATION,
      easeLinearity: 0.25,
    });
    window.setTimeout(() => map.invalidateSize(), 300);
  }, [map, propertyId, zoom, lat, lng, recenterToken]);

  return null;
}

function PropertyMarker({
  property,
  isSelected,
  isPulsing,
  locale,
  onSelect,
}: {
  property: Property;
  isSelected: boolean;
  isPulsing: boolean;
  locale: Locale;
  onSelect: (property: Property) => void;
}) {
  const { lat, lng } = getPropertyCoordinates(property);
  const position: [number, number] = [lat, lng];
  const icon = useMemo(
    () => createPriceMarkerIcon(property, locale, isSelected, isPulsing),
    [property, locale, isSelected, isPulsing]
  );

  return (
    <Marker
      position={position}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: (event) => {
          L.DomEvent.stopPropagation(event.originalEvent);
          onSelect(property);
        },
      }}
    />
  );
}

function AgadirTestMarker() {
  return (
    <Marker
      position={MAP_FALLBACK_CENTER}
      icon={L.divIcon({
        className: "finaura-price-marker-wrapper",
        html: `<div class="finaura-price-marker-anchor"><button type="button" class="finaura-price-marker is-active" aria-label="Agadir test marker">850K DH</button></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })}
    />
  );
}

export function PropertiesLeafletMap({
  properties,
  selectedPropertyId,
  pulsePropertyId,
  recenterToken,
  onSelectProperty,
  locale,
}: PropertiesLeafletMapProps) {
  const selectedProperty = useMemo(
    () => properties.find((item) => item.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId]
  );

  const flyToPosition = useMemo((): [number, number] => {
    if (!selectedProperty) return MAP_FALLBACK_CENTER;
    const { lat, lng } = getPropertyCoordinates(selectedProperty);
    return [lat, lng];
  }, [selectedProperty]);

  const hasPlottableProperties = properties.length > 0;

  return (
    <div className="finaura-leaflet-map relative h-full w-full min-h-[420px]">
      <MapContainer
        center={MAP_FALLBACK_CENTER}
        zoom={6}
        className="z-0 h-full w-full rounded-[20px]"
        style={{ height: "100%", width: "100%", minHeight: 420 }}
        zoomControl
        scrollWheelZoom
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        <MapResizeFix />

        {hasPlottableProperties ? (
          <>
            <MapFitBounds properties={properties} />
            <MarkerClusterGroup
              chunkedLoading
              animate
              animateAddingMarkers
              showCoverageOnHover={false}
              maxClusterRadius={50}
              spiderfyOnMaxZoom
              zoomToBoundsOnClick
              disableClusteringAtZoom={16}
              iconCreateFunction={createClusterIcon}
            >
              {properties.map((property) => (
                <PropertyMarker
                  key={property.id}
                  property={property}
                  isSelected={property.id === selectedPropertyId}
                  isPulsing={property.id === pulsePropertyId}
                  locale={locale}
                  onSelect={onSelectProperty}
                />
              ))}
            </MarkerClusterGroup>
            <MapFlyTo
              position={flyToPosition}
              zoom={14}
              propertyId={selectedPropertyId}
              recenterToken={recenterToken}
            />
          </>
        ) : (
          <AgadirTestMarker />
        )}
      </MapContainer>
    </div>
  );
}
