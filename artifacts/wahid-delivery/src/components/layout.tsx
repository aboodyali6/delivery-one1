import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { LogOut, Home, ShoppingBag, Users, UtensilsCrossed, MapPin } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const navItems = [
    { href: "/home", icon: Home, label: "الرئيسية" },
    { href: "/orders", icon: ShoppingBag, label: "طلباتي" },
    { href: "/deliverers", icon: Users, label: "الدلفرية" },
    { href: "/restaurants", icon: UtensilsCrossed, label: "المطاعم" },
    { href: "/locations", icon: MapPin, label: "المواقع" },
  ];

  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">واحد دلفري</span>
          </div>
          <div className="text-sm font-medium text-foreground" data-testid="text-username">
            {user?.name}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6" data-testid="text-page-title">{title}</h1>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bg-card border-t border-border sticky bottom-0 z-50" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <button
                key={item.href}
                data-testid={`nav-${item.href.replace("/", "")}`}
                onClick={() => setLocation(item.href)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
