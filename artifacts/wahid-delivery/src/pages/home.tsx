import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { ShoppingBag, UtensilsCrossed, Map, Users } from "lucide-react";

const menuItems = [
  {
    label: "طلباتي",
    icon: ShoppingBag,
    href: "/orders",
    dark: true,
  },
  {
    label: "الدلفرية",
    icon: Users,
    href: "/deliverers",
    dark: true,
  },
  {
    label: "المطاعم",
    icon: UtensilsCrossed,
    href: "/restaurants",
    dark: true,
  },
  {
    label: "مواقع الدلفرية",
    icon: Map,
    href: "/locations",
    dark: false,
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
    <Layout title="واحد دلفري">
      <div className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.href}
            data-testid={`card-menu-${item.href.replace("/", "")}`}
            onClick={() => setLocation(item.href)}
            className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition active:scale-[0.98]"
            style={{
              background: item.dark ? "#1c1c1c" : "hsl(33 100% 50%)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <item.icon
              className="w-8 h-8 flex-shrink-0"
              style={{ color: "white" }}
            />
            <span
              className="text-xl font-bold"
              style={{ color: "white" }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </Layout>
  );
}
