import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import {
  ShoppingBag,
  UtensilsCrossed,
  Tag,
  Star,
  MapPin,
  Map,
  Dices,
  User,
  Bike,
} from "lucide-react";

const menuItems = [
  { label: "وضع الدلفري 🚀",  icon: Bike,            href: "/driver",      color: "#16a34a", highlight: true },
  { label: "طلباتي",          icon: ShoppingBag,     href: "/orders",     color: "#f97316" },
  { label: "المطاعم",         icon: UtensilsCrossed, href: "/restaurants", color: "#ef4444" },
  { label: "العروض",          icon: Tag,             href: "/offers",     color: "#a855f7" },
  { label: "أفضل المطاعم",   icon: Star,            href: "/top",        color: "#f59e0b" },
  { label: "تتبع الطلب",     icon: MapPin,          href: "/track",      color: "#3b82f6" },
  { label: "مواقع الدلفرية", icon: Map,             href: "/locations",  color: "#22c55e" },
  { label: "عجلة الحظ",      icon: Dices,           href: "/wheel",      color: "#14b8a6" },
  { label: "حسابي",          icon: User,            href: "/account",    color: "#1c1c1c" },
];

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <Layout title="واحد دلفري">
      <div className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.href}
            data-testid={`card-menu-${item.href.replace("/", "")}`}
            onClick={() => setLocation(item.href)}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-right transition active:scale-[0.98]"
            style={{
              background: item.color,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <item.icon className="w-9 h-9 flex-shrink-0 text-white" />
            <span className="text-[22px] font-bold text-white leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </Layout>
  );
}
