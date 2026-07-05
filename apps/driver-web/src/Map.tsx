import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { LngLat } from "@ridenow/shared-types";

interface MapProps {
  center: LngLat;
}

/** Keyless OpenStreetMap raster map via MapLibre GL. */
export function Map({ center }: MapProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: {
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
      },
      center: [center.lng, center.lat],
      zoom: 12,
    });
    new maplibregl.Marker().setLngLat([center.lng, center.lat]).addTo(map);
    return () => map.remove();
  }, [center.lng, center.lat]);

  return <div ref={container} style={{ height: "320px", width: "100%", borderRadius: "8px" }} />;
}
