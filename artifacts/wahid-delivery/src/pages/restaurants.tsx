import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { UtensilsCrossed, MapPin, Phone, Clock, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  cuisine: string;
  openTime: string;
  closeTime: string;
  active: boolean;
}

const initialRestaurants: Restaurant[] = [
  { id: "R1", name: "مطعم البرجر الملكي", address: "الكرادة، شارع 14", phone: "07711111111", cuisine: "وجبات سريعة", openTime: "09:00", closeTime: "23:00", active: true },
  { id: "R2", name: "بيتزا ستار", address: "المنصور، شارع الأمير", phone: "07722222222", cuisine: "بيتزا", openTime: "10:00", closeTime: "01:00", active: true },
  { id: "R3", name: "شاورما الشام", address: "الزيونة، حي الجامعة", phone: "07733333333", cuisine: "مشاوي", openTime: "08:00", closeTime: "22:00", active: true },
  { id: "R4", name: "مطعم السمك", address: "الجادرية، قرب الجسر", phone: "07744444444", cuisine: "مأكولات بحرية", openTime: "11:00", closeTime: "22:00", active: false },
  { id: "R5", name: "مطعم الكبسة", address: "الدورة، شارع الصناعة", phone: "07755555555", cuisine: "أكلات عربية", openTime: "12:00", closeTime: "23:00", active: true },
  { id: "R6", name: "حلويات النخيل", address: "الأعظمية، قرب الجامع", phone: "07766666666", cuisine: "حلويات", openTime: "09:00", closeTime: "00:00", active: true },
  { id: "R7", name: "مطعم الأندلس", address: "الكاظمية، الشارع الرئيسي", phone: "07777777777", cuisine: "مطبخ عراقي", openTime: "07:00", closeTime: "21:00", active: false },
  { id: "R8", name: "مطعم الزيتون", address: "غازي، بالقرب من الفندق", phone: "07788888888", cuisine: "مطبخ لبناني", openTime: "10:00", closeTime: "23:00", active: true },
];

const cuisineColors: Record<string, { color: string; bg: string }> = {
  "وجبات سريعة": { color: "hsl(33 100% 45%)", bg: "hsl(33 100% 95%)" },
  "بيتزا": { color: "hsl(0 72% 50%)", bg: "hsl(0 72% 95%)" },
  "مشاوي": { color: "hsl(142 76% 36%)", bg: "hsl(142 76% 95%)" },
  "مأكولات بحرية": { color: "hsl(217 91% 55%)", bg: "hsl(217 91% 95%)" },
  "أكلات عربية": { color: "hsl(280 65% 55%)", bg: "hsl(280 65% 96%)" },
  "حلويات": { color: "hsl(340 75% 55%)", bg: "hsl(340 75% 95%)" },
  "مطبخ عراقي": { color: "hsl(25 90% 45%)", bg: "hsl(25 90% 95%)" },
  "مطبخ لبناني": { color: "hsl(165 70% 35%)", bg: "hsl(165 70% 95%)" },
};

export default function RestaurantsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCuisine, setNewCuisine] = useState("");

  if (!user) { setLocation("/"); return null; }

  const handleAdd = () => {
    if (!newName.trim() || !newAddress.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم والعنوان", variant: "destructive" });
      return;
    }
    const nr: Restaurant = {
      id: `R${Date.now()}`, name: newName.trim(), address: newAddress.trim(),
      phone: newPhone.trim(), cuisine: newCuisine.trim() || "متنوع",
      openTime: "09:00", closeTime: "22:00", active: true,
    };
    setRestaurants(prev => [nr, ...prev]);
    setNewName(""); setNewAddress(""); setNewPhone(""); setNewCuisine(""); setShowForm(false);
    toast({ title: "تم الإضافة", description: `تم إضافة ${nr.name} بنجاح` });
  };

  return (
    <Layout title="المطاعم">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{restaurants.length} مطعم مسجّل</p>
        <button
          data-testid="button-add-restaurant"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "hsl(33 100% 50%)" }}
        >
          <Plus className="w-4 h-4" />
          إضافة مطعم
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-4 border border-card-border mb-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">إضافة مطعم جديد</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3">
            <input data-testid="input-restaurant-name" type="text" placeholder="اسم المطعم" value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <input data-testid="input-restaurant-address" type="text" placeholder="العنوان" value={newAddress} onChange={e => setNewAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <input data-testid="input-restaurant-phone" type="tel" placeholder="رقم الهاتف (اختياري)" value={newPhone} onChange={e => setNewPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <input data-testid="input-restaurant-cuisine" type="text" placeholder="نوع المطبخ (اختياري)" value={newCuisine} onChange={e => setNewCuisine(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <button data-testid="button-save-restaurant" onClick={handleAdd}
              className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: "hsl(33 100% 50%)" }}>
              حفظ
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {restaurants.map(r => {
          const cc = cuisineColors[r.cuisine] ?? { color: "hsl(33 100% 45%)", bg: "hsl(33 100% 95%)" };
          return (
            <div key={r.id} data-testid={`card-restaurant-${r.id}`}
              className="bg-card rounded-2xl p-4 border border-card-border" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cc.bg }}>
                  <UtensilsCrossed className="w-5 h-5" style={{ color: cc.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-foreground text-sm leading-tight">{r.name}</p>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${r.active ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"}`}>
                      {r.active ? "مفتوح" : "مغلق"}
                    </span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1" style={{ color: cc.color, background: cc.bg }}>{r.cuisine}</span>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{r.address}
                    </p>
                    {r.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 flex-shrink-0" />{r.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 flex-shrink-0" />{r.openTime} - {r.closeTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
