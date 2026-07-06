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

const DRIVER: [number, number] = [-122.4194, 37.7749];

export function MapView(): ReactElement {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: OSM_STYLE,
      center: DRIVER,
      zoom: 12,
    });
    new maplibregl.Marker({ color: "#e8590c" }).setLngLat(DRIVER).addTo(map);
    return () => map.remove();
  }, []);

  return (
    <div
      ref={container}
      style={{ height: 320, width: "100%", borderRadius: 8, overflow: "hidden" }}
    />
  );
}
