import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { CheckCircle, XCircle, ArrowRight, Wifi, WifiOff } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";

type Stage = "waiting" | "notification" | "restaurant" | "customer" | "done";

interface Order {
  id: string;
  restaurantName: string;
  price: number;
  distance: number;
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
}

// ── Demo fallback positions (Basra) ──────────────────────────────────────────
const DEMO_DRIVER:     [number, number] = [30.5085, 47.7804];
const DEMO_RESTAURANT: [number, number] = [30.5100, 47.7820];
const DEMO_CUSTOMER:   [number, number] = [30.5150, 47.7900];

// ── Map component ────────────────────────────────────────────────────────────
function FullMap({ center, zoom, markers, route }: {
  center: [number, number];
  zoom: number;
  markers: { pos: [number, number]; emoji: string; label: string; color: string }[];
  route?: [number, number][];
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const key    = center.join(",") + zoom + markers.length;

  useEffect(() => {
    if (!ref.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    const map = L.map(ref.current, { center, zoom, zoomControl: true, attributionControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    markers.forEach(m => {
      L.marker(m.pos, {
        icon: L.divIcon({
          html: `<div style="background:${m.color};border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3)">${m.emoji}</div>`,
          className: "", iconSize: [36, 36], iconAnchor: [18, 18],
        }),
      }).addTo(map).bindPopup(`<div style="font-family:Cairo,sans-serif;direction:rtl;font-weight:700;font-size:13px">${m.label}</div>`);
    });
    if (route && route.length >= 2) {
      L.polyline(route, { color: "#f97316", weight: 4, dashArray: "8 6", opacity: 0.9 }).addTo(map);
    }
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [key]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

// ── Bell sound ───────────────────────────────────────────────────────────────
function playBell() {
  try {
    const ctx  = new AudioContext();
    const ring = (t: number) => {
      [1400, 2800, 4200].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        gain.gain.setValueAtTime(i === 0 ? 0.9 : 0.3 / i, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        osc.start(t); osc.stop(t + 1.1);
      });
    };
    const t = ctx.currentTime;
    ring(t); ring(t + 1.3); ring(t + 2.6);
  } catch (_) { /* autoplay blocked */ }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DriverPage() {
  const { user }      = useAuth();
  const [, setLoc]    = useLocation();
  const [stage, setStage]         = useState<Stage>("waiting");
  const [waitSec, setWaitSec]     = useState(3);
  const [acceptSec, setAcceptSec] = useState(10);
  const [order, setOrder]         = useState<Order | null>(null);

  // Derived map positions — real order or demo fallback
  const restaurantPos: [number, number] = order
    ? [order.restaurantLat, order.restaurantLng]
    : DEMO_RESTAURANT;
  const customerPos: [number, number] = order
    ? [order.customerLat, order.customerLng]
    : DEMO_CUSTOMER;

  // ── reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStage("waiting");
    setWaitSec(3);
    setAcceptSec(10);
    setOrder(null);
  }, []);

  // ── Bell + vibration on notification ────────────────────────────────────
  useEffect(() => {
    if (stage !== "notification") return;
    playBell();
    if (navigator.vibrate) navigator.vibrate([200, 100, 400, 100, 200]);
  }, [stage]);

  // ── Firebase: listen for new orders ─────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured || !db || stage !== "waiting") return;
    const q = query(collection(db, "orders"), where("status", "==", "new"));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const docSnap = snap.docs[0];
      const data    = docSnap.data();
      setOrder({
        id:             docSnap.id,
        restaurantName: data.restaurantName ?? "المطعم",
        price:          data.price          ?? 0,
        distance:       data.distance       ?? 0,
        restaurantLat:  data.restaurantLat  ?? DEMO_RESTAURANT[0],
        restaurantLng:  data.restaurantLng  ?? DEMO_RESTAURANT[1],
        customerLat:    data.customerLat    ?? DEMO_CUSTOMER[0],
        customerLng:    data.customerLng    ?? DEMO_CUSTOMER[1],
      });
      setStage("notification");
      setAcceptSec(10);
    });
    return unsub;
  }, [stage]);

  // ── Demo mode: countdown to fake order ──────────────────────────────────
  useEffect(() => {
    if (isFirebaseConfigured || stage !== "waiting") return;
    if (waitSec <= 0) { setStage("notification"); setAcceptSec(10); return; }
    const t = setTimeout(() => setWaitSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, waitSec]);

  // ── Accept countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "notification") return;
    if (acceptSec <= 0) { reset(); return; }
    const t = setTimeout(() => setAcceptSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, acceptSec, reset]);

  // ── Firestore status updates ─────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (status: string) => {
    if (!order || !db) return;
    await updateDoc(doc(db, "orders", order.id), {
      status,
      driverId:  user?.name ?? "unknown",
      updatedAt: serverTimestamp(),
    });
  }, [order, user]);

  const handleAccept = useCallback(async () => {
    await updateOrderStatus("accepting");
    setStage("restaurant");
  }, [updateOrderStatus]);

  const handlePickedUp = useCallback(async () => {
    await updateOrderStatus("delivering");
    setStage("customer");
  }, [updateOrderStatus]);

  const handleDelivered = useCallback(async () => {
    await updateOrderStatus("done");
    setStage("done");
  }, [updateOrderStatus]);

  const handleReject = useCallback(async () => {
    await updateOrderStatus("rejected");
    reset();
  }, [updateOrderStatus, reset]);

  if (!user) { setLoc("/"); return null; }

  // ── Map props ─────────────────────────────────────────────────────────────
  const mapProps = (() => {
    if (stage === "restaurant") return {
      center: restaurantPos, zoom: 15,
      markers: [
        { pos: DEMO_DRIVER,    emoji: "🛵", label: user.name,                   color: "#16a34a" },
        { pos: restaurantPos,  emoji: "🍽️", label: order?.restaurantName ?? "المطعم", color: "#f97316" },
      ],
      route: [DEMO_DRIVER, restaurantPos] as [number, number][],
    };
    if (stage === "customer" || stage === "done") return {
      center: customerPos, zoom: 15,
      markers: [
        { pos: restaurantPos, emoji: "🍽️", label: order?.restaurantName ?? "المطعم", color: "#f97316" },
        { pos: customerPos,   emoji: "🏠",  label: "الزبون",                          color: "#3b82f6" },
      ],
      route: [restaurantPos, customerPos] as [number, number][],
    };
    return { center: DEMO_DRIVER, zoom: 14, markers: [{ pos: DEMO_DRIVER, emoji: "🛵", label: user.name, color: "#16a34a" }] };
  })();

  const headerColor  = { waiting: "#16a34a", notification: "#16a34a", restaurant: "#f97316", customer: "#3b82f6", done: "#16a34a" }[stage];
  const headerTitle  = { waiting: "موقع الدلفري", notification: "موقع الدلفري", restaurant: "موقع المطعم", customer: "موقع الزبون", done: "تم التوصيل" }[stage];

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
        style={{ background: headerColor }}>
        <button onClick={() => setLoc("/home")} className="opacity-80 hover:opacity-100">
          <ArrowRight className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">{headerTitle}</h1>
        {/* Firebase status badge */}
        <div title={isFirebaseConfigured ? "متصل بـ Firebase" : "وضع تجريبي"}>
          {isFirebaseConfigured
            ? <Wifi className="w-5 h-5 opacity-80" />
            : <WifiOff className="w-5 h-5 opacity-60" />}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <FullMap {...mapProps} />

        {/* Demo waiting pill */}
        {stage === "waiting" && !isFirebaseConfigured && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
            bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold text-gray-700"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            ⏳ طلب جديد خلال {waitSec} ثوانٍ...
          </div>
        )}

        {/* Firebase waiting pill */}
        {stage === "waiting" && isFirebaseConfigured && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
            bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold text-gray-700"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            🟢 في انتظار طلب جديد...
          </div>
        )}

        {/* New order card */}
        {stage === "notification" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6"
            style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-3xl p-7 text-center"
              style={{ width: 320, maxWidth: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>

              <div className="flex justify-center mb-4">
                <span style={{ fontSize: 75, lineHeight: 1 }}>🛵</span>
              </div>

              <p className="font-extrabold text-gray-900 mb-3" style={{ fontSize: 28 }}>طلب جديد 🚀</p>

              <div className="inline-block px-4 py-2 rounded-2xl mb-4" style={{ background: "#f97316" }}>
                <span className="text-white font-bold" style={{ fontSize: 18 }}>
                  {order?.restaurantName ?? "مطعم البحري"}
                </span>
              </div>

              <div className="flex justify-around mb-5">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-green-500 text-2xl">💰</span>
                  <span className="font-bold" style={{ fontSize: 16 }}>
                    {order ? `${order.price.toLocaleString()} د.ع` : "12,000 د.ع"}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-red-500 text-2xl">📍</span>
                  <span className="font-bold" style={{ fontSize: 16 }}>
                    {order ? `${order.distance} KM` : "2.4 KM"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl px-4 py-3 mb-6" style={{ background: "#ef4444" }}>
                <span className="text-white font-bold" style={{ fontSize: 18 }}>
                  الطلب ينتهي خلال {acceptSec} ثوانٍ
                </span>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={handleAccept}
                  className="flex items-center gap-2 text-white font-bold rounded-xl active:scale-95 transition-transform"
                  style={{ background: "#16a34a", padding: "15px 25px", fontSize: 18 }}>
                  <CheckCircle className="w-5 h-5" /> قبول
                </button>
                <button onClick={handleReject}
                  className="flex items-center gap-2 text-white font-bold rounded-xl active:scale-95 transition-transform"
                  style={{ background: "#ef4444", padding: "15px 25px", fontSize: 18 }}>
                  <XCircle className="w-5 h-5" /> رفض
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Done overlay */}
        {stage === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-2xl p-8 text-center mx-6 shadow-2xl">
              <p className="text-5xl mb-3">🎉</p>
              <p className="text-2xl font-extrabold text-green-600">تم التوصيل!</p>
              <p className="text-gray-500 mt-2 mb-5">تم توصيل الطلب بنجاح</p>
              <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-white bg-green-500 text-lg">
                طلب جديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      {(stage === "restaurant" || stage === "customer") && (
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100"
          style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.08)" }}>
          {stage === "restaurant" && (
            <>
              <p className="text-center text-sm text-gray-500 mb-3">
                🛵 ← اذهب إلى ← 🍽️ {order?.restaurantName ?? "المطعم"}
              </p>
              <button onClick={handlePickedUp}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-xl active:scale-[0.98] transition-transform"
                style={{ background: "#f97316", boxShadow: "0 4px 18px rgba(249,115,22,0.4)" }}>
                🍽️ استلمت الطلب
              </button>
            </>
          )}
          {stage === "customer" && (
            <>
              <p className="text-center text-sm text-gray-500 mb-3">🍽️ ← اذهب إلى ← 🏠 موقع الزبون</p>
              <button onClick={handleDelivered}
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
