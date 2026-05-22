import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { Clock, CheckCircle, Truck, XCircle } from "lucide-react";

type OrderStatus = "pending" | "delivering" | "done" | "cancelled";

interface Order {
  id: string;
  restaurant: string;
  customer: string;
  address: string;
  items: string;
  total: number;
  status: OrderStatus;
  time: string;
}

const initialOrders: Order[] = [
  { id: "ORD-001", restaurant: "مطعم البرجر الملكي", customer: "أحمد حسن", address: "الكرادة، شارع 14", items: "برجر دبل + بطاطا", total: 12500, status: "delivering", time: "10:30 ص" },
  { id: "ORD-002", restaurant: "بيتزا ستار", customer: "سارة علي", address: "المنصور، شارع الأمير", items: "بيتزا وسط + مشروب", total: 15000, status: "pending", time: "10:45 ص" },
  { id: "ORD-003", restaurant: "شاورما الشام", customer: "كريم محمد", address: "الزيونة، حي الجامعة", items: "شاورما دجاج × 2", total: 9000, status: "done", time: "09:15 ص" },
  { id: "ORD-004", restaurant: "مطعم السمك", customer: "نور الدين", address: "الجادرية، قرب الجسر", items: "سمك مشوي + أرز", total: 22000, status: "done", time: "08:50 ص" },
  { id: "ORD-005", restaurant: "مطعم الكبسة", customer: "هدى خالد", address: "الدورة، شارع الصناعة", items: "كبسة لحم كبيرة", total: 18000, status: "cancelled", time: "09:50 ص" },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; Icon: typeof Clock }> = {
  pending:   { label: "قيد الانتظار", color: "hsl(33 100% 45%)",  bg: "hsl(33 100% 95%)",  Icon: Clock },
  delivering:{ label: "جاري التوصيل", color: "hsl(217 91% 55%)", bg: "hsl(217 91% 95%)", Icon: Truck },
  done:      { label: "تم التوصيل",  color: "hsl(142 76% 36%)",  bg: "hsl(142 76% 95%)",  Icon: CheckCircle },
  cancelled: { label: "ملغي",         color: "hsl(0 72% 50%)",   bg: "hsl(0 72% 95%)",   Icon: XCircle },
};

const filters: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "delivering", label: "جاري التوصيل" },
  { key: "pending", label: "قيد الانتظار" },
  { key: "done", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  if (!user) { setLocation("/"); return null; }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const advance = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next: Record<OrderStatus, OrderStatus | null> = { pending: "delivering", delivering: "done", done: null, cancelled: null };
      const ns = next[o.status];
      return ns ? { ...o, status: ns } : o;
    }));
  };

  return (
    <Layout title="طلباتي">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {filters.map(f => (
          <button
            key={f.key}
            data-testid={`filter-${f.key}`}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد طلبات</p>
          </div>
        )}
        {filtered.map(order => {
          const cfg = statusConfig[order.status];
          const StatusIcon = cfg.Icon;
          return (
            <div
              key={order.id}
              data-testid={`card-order-${order.id}`}
              className="bg-card rounded-2xl p-4 border border-card-border"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">{order.id} · {order.time}</span>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ color: cfg.color, background: cfg.bg }}
                  data-testid={`status-order-${order.id}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>

              <p className="font-bold text-foreground text-base">{order.restaurant}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{order.items}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{order.customer}</span> · {order.address}
              </p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="font-extrabold text-primary text-base">
                  {order.total.toLocaleString()} د.ع
                </span>
                {(order.status === "pending" || order.status === "delivering") && (
                  <button
                    data-testid={`button-advance-${order.id}`}
                    onClick={() => advance(order.id)}
                    className="px-4 py-1.5 rounded-xl text-sm font-bold text-white transition active:scale-95"
                    style={{ background: "hsl(33 100% 50%)" }}
                  >
                    {order.status === "pending" ? "ابدأ التوصيل" : "تم التوصيل"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
