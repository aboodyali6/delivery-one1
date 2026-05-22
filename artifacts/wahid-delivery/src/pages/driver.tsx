import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Stage = "waiting" | "notification" | "restaurant" | "customer" | "done";

const DRIVER_POS:     [number, number] = [30.5085, 47.7804];
const RESTAURANT_POS: [number, number] = [30.5100, 47.7820];
const CUSTOMER_POS:   [number, number] = [30.5150, 47.7900];

function FullMap({
  center,
  zoom,
  markers,
  route,
}: {
  center: [number, number];
  zoom: number;
  markers: { pos: [number, number]; emoji: string; label: string; color: string }[];
  route?: [number, number][];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(ref.current, { center, zoom, zoomControl: true, attributionControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

    markers.forEach(m => {
      const icon = L.divIcon({
        html: `<div style="background:${m.color};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3)">${m.emoji}</div>`,
        className: "", iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20],
      });
      L.marker(m.pos, { icon }).addTo(map)
        .bindPopup(`<div style="font-family:Cairo,sans-serif;direction:rtl;font-weight:700;font-size:13px">${m.label}</div>`);
    });

    if (route && route.length >= 2) {
      L.polyline(route, { color: "#f97316", weight: 4, dashArray: "8 6", opacity: 0.9 }).addTo(map);
    }

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [center[0], center[1], zoom, markers.length]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

export default function DriverPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("waiting");
  const [countdown, setCountdown] = useState(5);

  if (!user) { setLocation("/"); return null; }

  useEffect(() => {
    if (stage !== "waiting") return;
    if (countdown <= 0) { setStage("notification"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  const reset = () => { setStage("waiting"); setCountdown(5); };

  const stageConfig = {
    waiting:      { title: "موقع الدلفري",  headerColor: "#16a34a" },
    notification: { title: "موقع الدلفري",  headerColor: "#16a34a" },
    restaurant:   { title: "موقع المطعم",   headerColor: "#f97316" },
    customer:     { title: "موقع الزبون",   headerColor: "#3b82f6" },
    done:         { title: "تم التوصيل",    headerColor: "#16a34a" },
  };

  const cfg = stageConfig[stage];

  const mapProps = (() => {
    if (stage === "waiting" || stage === "notification") {
      return {
        center: DRIVER_POS, zoom: 14,
        markers: [{ pos: DRIVER_POS, emoji: "🛵", label: user.name, color: "#16a34a" }],
      };
    }
    if (stage === "restaurant") {
      return {
        center: RESTAURANT_POS, zoom: 15,
        markers: [
          { pos: DRIVER_POS,     emoji: "🛵", label: "أنت",          color: "#16a34a" },
          { pos: RESTAURANT_POS, emoji: "🍽️", label: "مطعم البحري",  color: "#f97316" },
        ],
        route: [DRIVER_POS, RESTAURANT_POS] as [number, number][],
      };
    }
    if (stage === "customer" || stage === "done") {
      return {
        center: CUSTOMER_POS, zoom: 15,
        markers: [
          { pos: RESTAURANT_POS, emoji: "🍽️", label: "مطعم البحري", color: "#f97316" },
          { pos: CUSTOMER_POS,   emoji: "🏠",  label: "الزبون",       color: "#3b82f6" },
        ],
        route: [RESTAURANT_POS, CUSTOMER_POS] as [number, number][],
      };
    }
    return { center: DRIVER_POS as [number, number], zoom: 14, markers: [] };
  })();

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
        style={{ background: cfg.headerColor }}
      >
        <button onClick={() => setLocation("/home")} className="opacity-80 hover:opacity-100">
          <ArrowRight className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">{cfg.title}</h1>
        <div className="w-6" />
      </div>

      {/* Map layer */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <FullMap {...mapProps} />

        {/* ── WAITING countdown ── */}
        {stage === "waiting" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50
            bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-lg
            text-sm font-bold text-gray-700">
            ⏳ طلب جديد خلال {countdown} ثوانٍ...
          </div>
        )}

        {/* ── NEW ORDER notification ── */}
        {stage === "notification" && (
          <div className="absolute top-5 left-4 right-4 z-50 animate-bounce-once">
            <div className="bg-green-500 rounded-2xl p-5 shadow-2xl text-white text-center"
              style={{ boxShadow: "0 8px 32px rgba(22,163,74,0.4)" }}>
              <p className="text-2xl font-extrabold mb-1">طلب جديد 🚀</p>
              <p className="text-lg mb-1">مطعم البحري</p>
              <p className="text-sm opacity-80 mb-4">
                المسافة: 1.2 كم · التوصيل: 8500 د.ع
              </p>
              <div className="flex gap-3">
                <button
                  data-testid="button-reject-order"
                  onClick={() => setStage("waiting") /* keep map, just hide */ || reset()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    font-bold bg-red-500 text-white text-base transition active:scale-95"
                >
                  <XCircle className="w-5 h-5" /> رفض
                </button>
                <button
                  data-testid="button-accept-order"
                  onClick={() => setStage("restaurant")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    font-bold bg-white text-green-600 text-base transition active:scale-95"
                >
                  <CheckCircle className="w-5 h-5" /> قبول
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE overlay ── */}
        {stage === "done" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 text-center mx-6 shadow-2xl">
              <p className="text-5xl mb-3">🎉</p>
              <p className="text-2xl font-extrabold text-green-600">تم التوصيل!</p>
              <p className="text-muted-foreground mt-2 mb-5">تم توصيل الطلب بنجاح</p>
              <button onClick={reset}
                className="w-full py-3 rounded-xl font-bold text-white bg-green-500">
                طلب جديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action button ── */}
      {(stage === "restaurant" || stage === "customer") && (
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100"
          style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.08)" }}>
          {stage === "restaurant" && (
            <div className="space-y-2">
              <div className="flex gap-3 text-sm text-gray-500 justify-center">
                <span>🛵 → 🍽️ مطعم البحري</span>
              </div>
              <button
                data-testid="button-picked-up"
                onClick={() => setStage("customer")}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-lg transition active:scale-[0.98]"
                style={{ background: "#f97316", boxShadow: "0 4px 16px rgba(249,115,22,0.4)" }}
              >
                🍽️ استلمت الطلب
              </button>
            </div>
          )}
          {stage === "customer" && (
            <div className="space-y-2">
              <div className="flex gap-3 text-sm text-gray-500 justify-center">
                <span>🍽️ → 🏠 موقع الزبون</span>
              </div>
              <button
                data-testid="button-delivered"
                onClick={() => setStage("done")}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-lg transition active:scale-[0.98]"
                style={{ background: "#3b82f6", boxShadow: "0 4px 16px rgba(59,130,246,0.4)" }}
              >
                🏠 وصّلت الطلب
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
