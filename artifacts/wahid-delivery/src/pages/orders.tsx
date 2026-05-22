import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { CheckCircle, XCircle, Truck, Clock, UtensilsCrossed, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface OrderModel {
  id: string;
  restaurantName: string;
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
  accepted: boolean;
  customer: string;
  items: string;
  total: number;
  status: "new" | "delivering" | "done" | "cancelled";
  time: string;
}

const initialOrders: OrderModel[] = [
  {
    id: "ORD-001",
    restaurantName: "مطعم البرجر الملكي",
    restaurantLat: 30.5085, restaurantLng: 47.7804,
    customerLat: 30.5200, customerLng: 47.7950,
    accepted: false,
    customer: "أحمد حسن", items: "برجر دبل + بطاطا", total: 12500,
    status: "new", time: "10:30 ص",
  },
  {
    id: "ORD-002",
    restaurantName: "بيتزا ستار",
    restaurantLat: 30.5140, restaurantLng: 47.7700,
    customerLat: 30.5020, customerLng: 47.7620,
    accepted: false,
    customer: "سارة علي", items: "بيتزا وسط + مشروب", total: 15000,
    status: "new", time: "10:45 ص",
  },
  {
    id: "ORD-003",
    restaurantName: "شاورما الشام",
    restaurantLat: 30.5060, restaurantLng: 47.7880,
    customerLat: 30.4980, customerLng: 47.8010,
    accepted: true,
    customer: "كريم محمد", items: "شاورما دجاج × 2", total: 9000,
    status: "delivering", time: "09:15 ص",
  },
  {
    id: "ORD-004",
    restaurantName: "مطعم السمك",
    restaurantLat: 30.5300, restaurantLng: 47.7750,
    customerLat: 30.5380, customerLng: 47.7900,
    accepted: true,
    customer: "نور الدين", items: "سمك مشوي + أرز", total: 22000,
    status: "done", time: "08:50 ص",
  },
];

const statusCfg = {
  new:        { label: "طلب جديد",       color: "#3b82f6", bg: "#eff6ff", Icon: Clock },
  delivering: { label: "جاري التوصيل",   color: "#f97316", bg: "#fff7ed", Icon: Truck },
  done:       { label: "تم التوصيل",     color: "#16a34a", bg: "#f0fdf4", Icon: CheckCircle },
  cancelled:  { label: "ملغي",           color: "#ef4444", bg: "#fef2f2", Icon: XCircle },
};

const filters = [
  { key: "all",        label: "الكل" },
  { key: "new",        label: "جديد" },
  { key: "delivering", label: "جاري التوصيل" },
  { key: "done",       label: "مكتمل" },
] as const;

function OrderMap({ order }: { order: OrderModel }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const midLat = (order.restaurantLat + order.customerLat) / 2;
    const midLng = (order.restaurantLng + order.customerLng) / 2;

    const map = L.map(mapRef.current, {
      center: [midLat, midLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

    const restaurantIcon = L.divIcon({
      html: `<div style="background:#ef4444;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🍽️</div>`,
      className: "", iconSize: [28, 28], iconAnchor: [14, 14],
    });
    const customerIcon = L.divIcon({
      html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏠</div>`,
      className: "", iconSize: [28, 28], iconAnchor: [14, 14],
    });

    const rMarker = L.marker([order.restaurantLat, order.restaurantLng], { icon: restaurantIcon }).addTo(map);
    const cMarker = L.marker([order.customerLat, order.customerLng], { icon: customerIcon }).addTo(map);

    rMarker.bindPopup(`<div style="font-family:Cairo,sans-serif;direction:rtl;font-size:12px;font-weight:700">${order.restaurantName}</div>`);
    cMarker.bindPopup(`<div style="font-family:Cairo,sans-serif;direction:rtl;font-size:12px;font-weight:700">${order.customer}</div>`);

    L.polyline(
      [[order.restaurantLat, order.restaurantLng], [order.customerLat, order.customerLng]],
      { color: "#f97316", weight: 3, dashArray: "6 6", opacity: 0.8 }
    ).addTo(map);

    const bounds = L.latLngBounds(
      [order.restaurantLat, order.restaurantLng],
      [order.customerLat, order.customerLng]
    );
    map.fitBounds(bounds, { padding: [20, 20] });

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: 160, borderRadius: "0.75rem", overflow: "hidden" }} />;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<OrderModel[]>(initialOrders);
  const [filter, setFilter] = useState<"all" | "new" | "delivering" | "done">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!user) { setLocation("/"); return null; }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const newCount = orders.filter(o => o.status === "new").length;

  const acceptOrder = (id: string) => {
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, accepted: true, status: "delivering" } : o
    ));
  };

  const rejectOrder = (id: string) => {
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, accepted: false, status: "cancelled" } : o
    ));
  };

  const completeOrder = (id: string) => {
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: "done" } : o
    ));
  };

  return (
    <Layout title="طلباتي">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {filters.map(f => (
          <button key={f.key} data-testid={`filter-${f.key}`} onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
              filter === f.key ? "bg-primary text-white" : "bg-card text-muted-foreground border border-border"
            }`}>
            {f.label}
            {f.key === "new" && newCount > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === "new" ? "bg-white/30" : "bg-blue-500 text-white"}`}>
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد طلبات</p>
          </div>
        )}

        {filtered.map(order => {
          const cfg = statusCfg[order.status];
          const StatusIcon = cfg.Icon;
          const isExpanded = expanded === order.id;

          return (
            <div key={order.id} data-testid={`card-order-${order.id}`}
              className="bg-card rounded-2xl border border-card-border overflow-hidden"
              style={{
                boxShadow: order.status === "new" ? "0 0 0 2px #3b82f6, var(--shadow-md)" : "var(--shadow-sm)",
              }}>

              {/* New order badge */}
              {order.status === "new" && (
                <div className="bg-blue-500 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                  ⚡ طلب جديد — انتظر ردّك
                </div>
              )}

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ color: cfg.color, background: cfg.bg }}>
                    <StatusIcon className="w-3 h-3" />{cfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{order.id} · {order.time}</span>
                </div>

                {/* Restaurant & Customer */}
                <div className="space-y-1.5 mb-3">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <UtensilsCrossed className="w-4 h-4 text-red-500 flex-shrink-0" />
                    {order.restaurantName}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {order.customer} · {order.items}
                  </p>
                </div>

                {/* Toggle map */}
                <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="text-xs font-medium text-primary mb-3">
                  {isExpanded ? "▲ إخفاء الخريطة" : "▼ عرض الخريطة والمسار"}
                </button>

                {/* Map */}
                {isExpanded && (
                  <div className="mb-3">
                    <OrderMap order={order} />
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="text-base">🍽️</span> المطعم ({order.restaurantLat.toFixed(4)}, {order.restaurantLng.toFixed(4)})</span>
                      <span className="flex items-center gap-1"><span className="text-base">🏠</span> الزبون ({order.customerLat.toFixed(4)}, {order.customerLng.toFixed(4)})</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-extrabold text-primary">{order.total.toLocaleString()} د.ع</span>

                  <div className="flex gap-2">
                    {order.status === "new" && (
                      <>
                        <button data-testid={`button-reject-${order.id}`} onClick={() => rejectOrder(order.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-red-500 transition active:scale-95">
                          <XCircle className="w-4 h-4" /> رفض
                        </button>
                        <button data-testid={`button-accept-${order.id}`} onClick={() => acceptOrder(order.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-green-500 transition active:scale-95">
                          <CheckCircle className="w-4 h-4" /> قبول
                        </button>
                      </>
                    )}
                    {order.status === "delivering" && (
                      <button data-testid={`button-complete-${order.id}`} onClick={() => completeOrder(order.id)}
                        className="px-4 py-1.5 rounded-xl text-sm font-bold text-white transition active:scale-95"
                        style={{ background: "#f97316" }}>
                        تم التوصيل ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
