import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { MapPin, Navigation, Clock, Users } from "lucide-react";

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
  { id: "L1", name: "علي حسين", area: "الكرادة - شارع 14", lastSeen: "منذ 2 دقيقة", status: "active", ordersToday: 7, lat: 33.31, lng: 44.39 },
  { id: "L2", name: "محمد ياسر", area: "المنصور - شارع الأمير", lastSeen: "منذ 5 دقائق", status: "active", ordersToday: 5, lat: 33.33, lng: 44.35 },
  { id: "L3", name: "سامر علاء", area: "الجادرية - قرب الجسر", lastSeen: "منذ 8 دقائق", status: "idle", ordersToday: 3, lat: 33.28, lng: 44.37 },
  { id: "L4", name: "حسن مهدي", area: "الأعظمية - الشارع الرئيسي", lastSeen: "منذ 15 دقيقة", status: "idle", ordersToday: 4, lat: 33.36, lng: 44.38 },
  { id: "L5", name: "كريم أحمد", area: "الزيونة", lastSeen: "منذ ساعة", status: "offline", ordersToday: 9, lat: 33.30, lng: 44.42 },
  { id: "L6", name: "عمر طارق", area: "الدورة", lastSeen: "منذ 3 ساعات", status: "offline", ordersToday: 0, lat: 33.24, lng: 44.40 },
];

const statusCfg = {
  active:  { label: "يوصّل الآن", color: "hsl(142 76% 36%)", bg: "hsl(142 76% 95%)", dot: "bg-emerald-500" },
  idle:    { label: "في انتظار طلب", color: "hsl(33 100% 45%)", bg: "hsl(33 100% 95%)", dot: "bg-orange-400" },
  offline: { label: "غير متصل", color: "hsl(0 0% 50%)", bg: "hsl(0 0% 94%)", dot: "bg-gray-400" },
};

export default function LocationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "idle" | "offline">("all");

  if (!user) { setLocation("/"); return null; }

  const filtered = filter === "all" ? locations : locations.filter(l => l.status === filter);
  const activeCount = locations.filter(l => l.status === "active").length;
  const idleCount = locations.filter(l => l.status === "idle").length;

  return (
    <Layout title="مواقع الدلفرية">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "يوصّلون الآن", count: activeCount, color: "hsl(142 76% 36%)", bg: "hsl(142 76% 95%)" },
          { label: "في انتظار", count: idleCount, color: "hsl(33 100% 45%)", bg: "hsl(33 100% 95%)" },
          { label: "إجمالي اليوم", count: locations.reduce((s, l) => s + l.ordersToday, 0), color: "hsl(217 91% 55%)", bg: "hsl(217 91% 95%)" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-3 border border-card-border text-center" style={{ boxShadow: "var(--shadow-xs)" }}>
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div
        className="bg-card rounded-2xl border border-card-border mb-4 overflow-hidden relative"
        style={{ height: 160, boxShadow: "var(--shadow-sm)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(217 91% 97%) 0%, hsl(142 76% 97%) 100%)" }}>
          <div className="text-center">
            <Navigation className="w-8 h-8 mx-auto mb-2 text-primary opacity-60" />
            <p className="text-sm text-muted-foreground">خريطة مواقع الدلفرية</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount + idleCount} دلفري نشط على الخريطة
            </p>
          </div>
        </div>
        {/* Simulated map dots */}
        {locations.filter(l => l.status !== "offline").map((l, i) => {
          const cfg = statusCfg[l.status];
          const left = 20 + i * 14;
          const top = 30 + (i % 3) * 25;
          return (
            <div key={l.id} className="absolute" style={{ left: `${left}%`, top: `${top}%` }}>
              <div className={`w-3 h-3 rounded-full border-2 border-white shadow ${cfg.dot} ${l.id === selected ? "w-4 h-4" : ""} transition-all`} />
            </div>
          );
        })}
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
                boxShadow: isSelected ? "0 0 0 2px hsl(33 100% 50% / 0.2)" : "var(--shadow-sm)"
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                  <Users className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
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
