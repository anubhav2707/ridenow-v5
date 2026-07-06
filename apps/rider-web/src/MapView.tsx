import { useEffect, useRef, type ReactElement } from "react";
import maplibregl from "maplibre-gl";

// Keyless OpenStreetMap raster tiles — no API key, matches the PRD geo constraint.
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const PICKUP: [number, number] = [-122.4194, 37.7749];
const DROPOFF: [number, number] = [-122.4094, 37.7849];

export function MapView(): ReactElement {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: OSM_STYLE,
      center: PICKUP,
      zoom: 12,
    });
    new maplibregl.Marker({ color: "#1c7ed6" }).setLngLat(PICKUP).addTo(map);
    new maplibregl.Marker({ color: "#2b8a3e" }).setLngLat(DROPOFF).addTo(map);
    return () => map.remove();
  }, []);

  return (
    <div
      ref={container}
      style={{ height: 320, width: "100%", borderRadius: 8, overflow: "hidden" }}
    />
  );
}
