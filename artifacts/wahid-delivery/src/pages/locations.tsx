import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { MapPin, Clock, Users } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DelivererLocation {
  id: string;
  name: string;
  area: string;
  lastSeen: string;
  status: "active" | "idle" | "offline";
  ordersToday: number;
  lat: number;
  lng: number;
}

const locations: DelivererLocation[] = [
  { id: "L1", name: "علي حسين",   area: "العشار",         lastSeen: "منذ 2 دقيقة",   status: "active",  ordersToday: 7, lat: 30.5085, lng: 47.7804 },
  { id: "L2", name: "محمد ياسر",  area: "التميمية",       lastSeen: "منذ 5 دقائق",   status: "active",  ordersToday: 5, lat: 30.5210, lng: 47.8020 },
  { id: "L3", name: "سامر علاء",  area: "المعقل",         lastSeen: "منذ 8 دقائق",   status: "idle",    ordersToday: 3, lat: 30.5350, lng: 47.8150 },
  { id: "L4", name: "حسن مهدي",  area: "الأصمعي",        lastSeen: "منذ 15 دقيقة",  status: "idle",    ordersToday: 4, lat: 30.4960, lng: 47.7650 },
  { id: "L5", name: "كريم أحمد",  area: "الجزائر",        lastSeen: "منذ ساعة",       status: "offline", ordersToday: 9, lat: 30.5140, lng: 47.7550 },
  { id: "L6", name: "عمر طارق",   area: "خندق الجيش",     lastSeen: "منذ 3 ساعات",   status: "offline", ordersToday: 0, lat: 30.4880, lng: 47.7920 },
];

const statusCfg = {
  active:  { label: "يوصّل الآن",    color: "#16a34a", dot: "bg-emerald-500", markerColor: "#16a34a" },
  idle:    { label: "في انتظار طلب", color: "#f97316", dot: "bg-orange-400",  markerColor: "#f97316" },
  offline: { label: "غير متصل",      color: "#9ca3af", dot: "bg-gray-400",    markerColor: "#9ca3af" },
};

function makeIcon(color: string, selected: boolean) {
  const size = selected ? 40 : 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3" opacity="${selected ? 1 : 0.9}"/>
    <text x="20" y="26" font-size="18" text-anchor="middle" fill="white">🛵</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

export default function LocationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "idle" | "offline">("all");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  if (!user) { setLocation("/"); return null; }

  const filtered = filter === "all" ? locations : locations.filter(l => l.status === filter);
  const activeCount = locations.filter(l => l.status === "active").length;
  const idleCount   = locations.filter(l => l.status === "idle").length;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [30.5085, 47.7804],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    locations.forEach((loc) => {
      const cfg = statusCfg[loc.status];
      const marker = L.marker([loc.lat, loc.lng], {
        icon: makeIcon(cfg.markerColor, false),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:'Cairo',sans-serif;direction:rtl;text-align:right;min-width:140px">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px">${loc.name}</p>
          <p style="color:#6b7280;font-size:12px;margin:0 0 2px">📍 ${loc.area}</p>
          <p style="font-size:12px;margin:0;color:${cfg.color};font-weight:600">${cfg.label}</p>
          <p style="font-size:11px;color:#9ca3af;margin:4px 0 0">طلبات اليوم: ${loc.ordersToday}</p>
        </div>
      `);

      marker.on("click", () => setSelected(loc.id));
      markersRef.current[loc.id] = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    locations.forEach((loc) => {
      const marker = markersRef.current[loc.id];
      if (!marker) return;
      const cfg = statusCfg[loc.status];
      const isSelected = loc.id === selected;
      marker.setIcon(makeIcon(cfg.markerColor, isSelected));
      if (isSelected) {
        mapInstanceRef.current!.flyTo([loc.lat, loc.lng], 14, { animate: true, duration: 0.8 });
        marker.openPopup();
      }
    });
  }, [selected]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const visible = filter === "all" ? locations : locations.filter(l => l.status === filter);
    const ids = new Set(visible.map(l => l.id));
    locations.forEach((loc) => {
      const marker = markersRef.current[loc.id];
      if (!marker) return;
      if (ids.has(loc.id)) {
        marker.addTo(mapInstanceRef.current!);
      } else {
        marker.removeFrom(mapInstanceRef.current!);
      }
    });
  }, [filter]);

  return (
    <Layout title="مواقع الدلفرية">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "يوصّلون الآن", count: activeCount, color: "#16a34a", bg: "hsl(142 76% 95%)" },
          { label: "في انتظار",    count: idleCount,   color: "#f97316", bg: "hsl(33 100% 95%)"  },
          { label: "طلبات اليوم",  count: locations.reduce((s, l) => s + l.ordersToday, 0), color: "hsl(217 91% 55%)", bg: "hsl(217 91% 95%)" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-3 border border-card-border text-center" style={{ boxShadow: "var(--shadow-xs)" }}>
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Real Map */}
      <div className="rounded-2xl overflow-hidden border border-card-border mb-4" style={{ height: 260, boxShadow: "var(--shadow-md)" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {(["all", "active", "idle", "offline"] as const).map(f => (
          <button key={f} data-testid={`filter-location-${f}`} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f ? "bg-primary text-white" : "bg-card text-muted-foreground border border-border"
            }`}>
            {f === "all" ? "الكل" : statusCfg[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(l => {
          const cfg = statusCfg[l.status];
          const isSelected = selected === l.id;
          return (
            <button key={l.id} data-testid={`card-location-${l.id}`}
              onClick={() => setSelected(isSelected ? null : l.id)}
              className="w-full bg-card rounded-2xl p-4 border text-right transition"
              style={{
                borderColor: isSelected ? "hsl(33 100% 50%)" : "hsl(var(--card-border))",
                boxShadow: isSelected ? "0 0 0 2px hsl(33 100% 50% / 0.2), var(--shadow-sm)" : "var(--shadow-sm)",
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: isSelected ? cfg.color : "hsl(var(--muted))" }}>
                  🛵
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.color + "18" }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
                      {cfg.label}
                    </span>
                    <p className="font-bold text-foreground text-sm">{l.name}</p>
                  </div>
                  <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
                    {l.area}<MapPin className="w-3 h-3" />
                  </p>
                  <div className="flex items-center justify-end gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />{l.lastSeen}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "hsl(217 91% 55%)" }}>
                      {l.ordersToday} طلب اليوم
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
