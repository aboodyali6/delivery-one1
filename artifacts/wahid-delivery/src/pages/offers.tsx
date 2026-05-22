import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { Tag, Clock } from "lucide-react";

const offers = [
  { id: "O1", title: "خصم 20% على البرجر", restaurant: "مطعم البرجر الملكي", expires: "ينتهي اليوم", code: "BURGER20", color: "#f97316", discount: "20%" },
  { id: "O2", title: "بيتزا مجانية مع كل طلبين", restaurant: "بيتزا ستار", expires: "ينتهي بعد يومين", code: "PIZZA2X", color: "#a855f7", discount: "مجاناً" },
  { id: "O3", title: "وجبة عائلية بسعر خاص", restaurant: "شاورما الشام", expires: "ينتهي بعد 3 أيام", code: "FAMILY", color: "#ef4444", discount: "30%" },
  { id: "O4", title: "توصيل مجاني لأول طلب", restaurant: "جميع المطاعم", expires: "ينتهي بعد أسبوع", code: "FREE1ST", color: "#22c55e", discount: "مجاناً" },
  { id: "O5", title: "10% على طلبات الحلويات", restaurant: "حلويات النخيل", expires: "ينتهي بعد 4 أيام", code: "SWEET10", color: "#14b8a6", discount: "10%" },
];

export default function OffersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  if (!user) { setLocation("/"); return null; }

  return (
    <Layout title="العروض">
      <div className="space-y-4">
        {offers.map(o => (
          <div key={o.id} data-testid={`card-offer-${o.id}`}
            className="rounded-2xl overflow-hidden border border-card-border"
            style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="px-5 py-4 text-white" style={{ background: o.color }}>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold">{o.discount}</span>
                <Tag className="w-8 h-8 opacity-70" />
              </div>
              <p className="text-lg font-bold mt-1">{o.title}</p>
              <p className="text-sm opacity-80 mt-0.5">{o.restaurant}</p>
            </div>
            <div className="bg-card px-5 py-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />{o.expires}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">الكود:</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold border-2 border-dashed"
                  style={{ borderColor: o.color, color: o.color }}>
                  {o.code}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
