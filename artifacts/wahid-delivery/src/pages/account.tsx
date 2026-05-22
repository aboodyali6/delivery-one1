import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { User, Phone, ShoppingBag, Star, LogOut, ChevronLeft } from "lucide-react";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  if (!user) { setLocation("/"); return null; }

  const stats = [
    { label: "إجمالي الطلبات", value: "47" },
    { label: "طلبات مكتملة",   value: "44" },
    { label: "تقييمي",         value: "4.8 ⭐" },
  ];

  const menuRows = [
    { label: "طلباتي السابقة", icon: ShoppingBag, href: "/orders" },
    { label: "تقييماتي",       icon: Star,        href: "/orders" },
  ];

  const handleLogout = () => { logout(); setLocation("/"); };

  return (
    <Layout title="حسابي">
      {/* Profile card */}
      <div className="bg-card rounded-2xl p-5 border border-card-border mb-5 text-center"
        style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>
        <p className="text-xl font-extrabold text-foreground" data-testid="text-account-name">{user.name}</p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
          <Phone className="w-3.5 h-3.5" />{user.phone}
        </p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          دلفري نشط ✓
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl p-3 border border-card-border text-center"
            style={{ boxShadow: "var(--shadow-xs)" }}>
            <p className="text-lg font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu rows */}
      <div className="bg-card rounded-2xl border border-card-border overflow-hidden mb-4"
        style={{ boxShadow: "var(--shadow-sm)" }}>
        {menuRows.map((row, i) => (
          <button key={row.label} onClick={() => setLocation(row.href)}
            className={`w-full flex items-center gap-3 px-4 py-4 text-right hover:bg-muted transition ${i > 0 ? "border-t border-border" : ""}`}>
            <row.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 font-medium text-foreground">{row.label}</span>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        data-testid="button-account-logout"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-destructive border-2 border-destructive/30 transition hover:bg-destructive/5"
      >
        <LogOut className="w-5 h-5" />
        تسجيل الخروج
      </button>
    </Layout>
  );
}
