import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { ShoppingBag, Users, UtensilsCrossed, MapPin } from "lucide-react";

const menuItems = [
  {
    label: "طلباتي",
    icon: ShoppingBag,
    href: "/orders",
    color: "hsl(33 100% 50%)",
    bg: "hsl(33 100% 96%)",
    count: 3,
    sub: "طلب نشط",
  },
  {
    label: "الدلفرية",
    icon: Users,
    href: "/deliverers",
    color: "hsl(217 91% 60%)",
    bg: "hsl(217 91% 96%)",
    count: 12,
    sub: "مسجّل",
  },
  {
    label: "المطاعم",
    icon: UtensilsCrossed,
    href: "/restaurants",
    color: "hsl(142 76% 36%)",
    bg: "hsl(142 76% 96%)",
    count: 8,
    sub: "مطعم",
  },
  {
    label: "مواقع الدلفرية",
    icon: MapPin,
    href: "/locations",
    color: "hsl(340 75% 55%)",
    bg: "hsl(340 75% 96%)",
    count: 5,
    sub: "دلفري نشط",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <Layout title={`أهلاً، ${user.name}`}>
      <p className="text-muted-foreground text-sm -mt-4 mb-6">
        مرحباً بك في لوحة التحكم
      </p>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.href}
            data-testid={`card-menu-${item.href.replace("/", "")}`}
            onClick={() => setLocation(item.href)}
            className="bg-card rounded-2xl p-5 text-right border border-card-border transition active:scale-[0.97] hover:shadow-md"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: item.bg }}
            >
              <item.icon className="w-6 h-6" style={{ color: item.color }} />
            </div>
            <p className="font-bold text-foreground text-base">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold" style={{ color: item.color }}>{item.count}</span>{" "}
              {item.sub}
            </p>
          </button>
        ))}
      </div>

      {/* Quick status */}
      <div
        className="mt-6 bg-card rounded-2xl p-4 border border-card-border"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="font-bold text-foreground mb-3 text-sm">الحالة اليوم</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-extrabold text-primary">7</p>
            <p className="text-xs text-muted-foreground mt-0.5">طلبات مكتملة</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: "hsl(33 100% 50%)" }}>3</p>
            <p className="text-xs text-muted-foreground mt-0.5">قيد التوصيل</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold" style={{ color: "hsl(142 76% 36%)" }}>85%</p>
            <p className="text-xs text-muted-foreground mt-0.5">معدل الإنجاز</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
