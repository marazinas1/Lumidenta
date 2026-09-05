import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/** Vilnius centre — used only until the real address is geocoded. */
const FALLBACK: [number, number] = [25.2797, 54.6872];

const CACHE_PREFIX = "lumidenta_geo_";

async function geocode(address: string): Promise<[number, number] | null> {
  const key = CACHE_PREFIX + address.toLowerCase().trim();
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached) as [number, number];
  } catch {
    /* ignore storage issues */
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = rows[0];
    if (!first) return null;
    const point: [number, number] = [Number(first.lon), Number(first.lat)];
    try {
      localStorage.setItem(key, JSON.stringify(point));
    } catch {
      /* ignore storage issues */
    }
    return point;
  } catch {
    return null;
  }
}

/**
 * Muted CARTO Positron basemap (no API key). The marker follows the practice
 * address stored in site settings, so moving the practice moves the pin.
 */
export default function ContactMap({ address }: { address: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    let map: maplibregl.Map | null = null;
    let cancelled = false;

    (async () => {
      const point = address ? await geocode(address) : null;
      if (cancelled || !ref.current) return;
      if (!point) setFailed(true);
      const center = point ?? FALLBACK;

      map = new maplibregl.Map({
        container: ref.current,
        style: {
          version: 8,
          sources: {
            carto: {
              type: "raster",
              tiles: [
                "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
                "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
                "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              ],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            },
          },
          layers: [{ id: "carto", type: "raster", source: "carto" }],
        },
        center,
        zoom: point ? 16 : 12,
        attributionControl: { compact: true },
        scrollZoom: false,
        cooperativeGestures: true,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

      if (point) {
        const el = document.createElement("div");
        el.className = "map-pin";
        el.setAttribute("aria-label", address);
        new maplibregl.Marker({ element: el }).setLngLat(point).addTo(map);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [address]);

  return (
    <div
      ref={ref}
      className="contact-map"
      role="img"
      aria-label={failed ? "Žemėlapis" : `Žemėlapis: ${address}`}
    />
  );
}
