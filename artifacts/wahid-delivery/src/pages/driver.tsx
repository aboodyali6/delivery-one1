import { useState, useEffect, useRef, useCallback } from "react";
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
  center, zoom, markers, route,
}: {
  center: [number, number];
  zoom: number;
  markers: { pos: [number, number]; emoji: string; label: string; color: string }[];
  route?: [number, number][];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const key = center.join(",") + zoom + markers.length;

  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

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
  }, [key]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

export default function DriverPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("waiting");
  const [waitSec, setWaitSec]     = useState(3);
  const [acceptSec, setAcceptSec] = useState(10);

  const reset = useCallback(() => {
    setStage("waiting");
    setWaitSec(3);
    setAcceptSec(10);
  }, []);

  useEffect(() => {
    if (stage !== "waiting") return;
    if (waitSec <= 0) {
      setStage("notification");
      setAcceptSec(10);
      return;
    }
    const t = setTimeout(() => setWaitSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, waitSec]);

  useEffect(() => {
    if (stage !== "notification") return;
    if (acceptSec <= 0) { reset(); return; }
    const t = setTimeout(() => setAcceptSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, acceptSec, reset]);

  if (!user) { setLocation("/"); return null; }

  const headerColor = {
    waiting:      "#16a34a",
    notification: "#16a34a",
    restaurant:   "#f97316",
    customer:     "#3b82f6",
    done:         "#16a34a",
  }[stage];

  const headerTitle = {
    waiting:      "موقع الدلفري",
    notification: "موقع الدلفري",
    restaurant:   "موقع المطعم",
    customer:     "موقع الزبون",
    done:         "تم التوصيل",
  }[stage];

  const mapProps = (() => {
    if (stage === "restaurant") return {
      center: RESTAURANT_POS, zoom: 15,
      markers: [
        { pos: DRIVER_POS,     emoji: "🛵", label: user.name,        color: "#16a34a" },
        { pos: RESTAURANT_POS, emoji: "🍽️", label: "مطعم البحري",   color: "#f97316" },
      ],
      route: [DRIVER_POS, RESTAURANT_POS] as [number, number][],
    };
    if (stage === "customer" || stage === "done") return {
      center: CUSTOMER_POS, zoom: 15,
      markers: [
        { pos: RESTAURANT_POS, emoji: "🍽️", label: "مطعم البحري",  color: "#f97316" },
        { pos: CUSTOMER_POS,   emoji: "🏠",  label: "الزبون",        color: "#3b82f6" },
      ],
      route: [RESTAURANT_POS, CUSTOMER_POS] as [number, number][],
    };
    return {
      center: DRIVER_POS, zoom: 14,
      markers: [{ pos: DRIVER_POS, emoji: "🛵", label: user.name, color: "#16a34a" }],
    };
  })();

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
        style={{ background: headerColor }}>
        <button onClick={() => setLocation("/home")} className="opacity-80 hover:opacity-100">
          <ArrowRight className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">{headerTitle}</h1>
        <div className="w-6" />
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <FullMap {...mapProps} />

        {/* Waiting pill */}
        {stage === "waiting" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
            bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold text-gray-700"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            ⏳ طلب جديد خلال {waitSec} ثوانٍ...
          </div>
        )}

        {/* ── New order card ── */}
        {stage === "notification" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6">
            <div className="bg-white rounded-3xl p-7 text-center"
              style={{ width: 320, maxWidth: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>

              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🛵</span>
              </div>

              <p className="text-3xl font-extrabold text-gray-900 mb-2">طلب جديد 🚀</p>
              <p className="text-xl text-gray-700 mb-2">مطعم البحري</p>
              <p className="text-lg font-bold text-red-500 mb-4">
                مدة القبول {acceptSec} ثوانٍ
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-red-400 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(acceptSec / 10) * 100}%` }} />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button data-testid="button-reject-order" onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                    font-bold bg-red-500 text-white text-lg active:scale-95 transition-transform"
                  style={{ boxShadow: "0 4px 14px rgba(239,68,68,0.4)" }}>
                  <XCircle className="w-5 h-5" /> رفض
                </button>
                <button data-testid="button-accept-order" onClick={() => setStage("restaurant")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                    font-bold bg-green-500 text-white text-lg active:scale-95 transition-transform"
                  style={{ boxShadow: "0 4px 14px rgba(22,163,74,0.4)" }}>
                  <CheckCircle className="w-5 h-5" /> قبول
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Done overlay */}
        {stage === "done" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 text-center mx-6 shadow-2xl">
              <p className="text-5xl mb-3">🎉</p>
              <p className="text-2xl font-extrabold text-green-600">تم التوصيل!</p>
              <p className="text-gray-500 mt-2 mb-5">تم توصيل الطلب بنجاح</p>
              <button onClick={reset}
                className="w-full py-3 rounded-xl font-bold text-white bg-green-500 text-lg">
                طلب جديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action ── */}
      {(stage === "restaurant" || stage === "customer") && (
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100"
          style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.08)" }}>
          {stage === "restaurant" && (
            <>
              <p className="text-center text-sm text-gray-500 mb-3">🛵 ← اذهب إلى ← 🍽️ مطعم البحري</p>
              <button data-testid="button-picked-up" onClick={() => setStage("customer")}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-xl active:scale-[0.98] transition-transform"
                style={{ background: "#f97316", boxShadow: "0 4px 18px rgba(249,115,22,0.4)" }}>
                🍽️ استلمت الطلب
              </button>
            </>
          )}
          {stage === "customer" && (
            <>
              <p className="text-center text-sm text-gray-500 mb-3">🍽️ ← اذهب إلى ← 🏠 موقع الزبون</p>
              <button data-testid="button-delivered" onClick={() => setStage("done")}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-xl active:scale-[0.98] transition-transform"
                style={{ background: "#3b82f6", boxShadow: "0 4px 18px rgba(59,130,246,0.4)" }}>
                🏠 وصّلت الطلب
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
