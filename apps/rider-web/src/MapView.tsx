import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Keyless OpenStreetMap raster map. The live driver-tracking overlay lands in
 * the tracking feature story; this is the map surface it will draw onto.
 */
export function MapView() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }
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
      center: [-122.4194, 37.7749],
      zoom: 12,
    });
    return () => map.remove();
  }, []);

  return <div ref={container} style={{ height: "50vh", width: "100%" }} />;
}
