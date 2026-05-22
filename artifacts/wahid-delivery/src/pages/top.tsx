import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { Star, MapPin, Clock } from "lucide-react";

const topRestaurants = [
  { id: "T1", name: "مطعم البرجر الملكي", cuisine: "وجبات سريعة", rating: 4.9, reviews: 312, time: "25 دقيقة", area: "العشار" },
  { id: "T2", name: "شاورما الشام",        cuisine: "مشاوي",       rating: 4.8, reviews: 287, time: "20 دقيقة", area: "التميمية" },
  { id: "T3", name: "بيتزا ستار",          cuisine: "بيتزا",       rating: 4.7, reviews: 245, time: "30 دقيقة", area: "المعقل" },
  { id: "T4", name: "حلويات النخيل",       cuisine: "حلويات",      rating: 4.7, reviews: 198, time: "15 دقيقة", area: "الأصمعي" },
  { id: "T5", name: "مطعم الأندلس",        cuisine: "مطبخ عراقي",  rating: 4.6, reviews: 176, time: "35 دقيقة", area: "الجزائر" },
];

const medals = ["🥇", "🥈", "🥉"];

export default function TopPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  if (!user) { setLocation("/"); return null; }

  return (
    <Layout title="أفضل المطاعم">
      <div className="space-y-3">
        {topRestaurants.map((r, i) => (
          <div key={r.id} data-testid={`card-top-${r.id}`}
            className="bg-card rounded-2xl p-4 border border-card-border flex items-center gap-4"
            style={{ boxShadow: "var(--shadow-sm)" }}>
            <span className="text-3xl w-10 text-center flex-shrink-0">
              {medals[i] ?? `#${i + 1}`}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.cuisine}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />{r.rating}
                  <span className="font-normal text-muted-foreground">({r.reviews})</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />{r.time}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{r.area}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
