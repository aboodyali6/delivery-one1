import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { Users, Phone, Star, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Deliverer {
  id: string;
  name: string;
  phone: string;
  area: string;
  rating: number;
  orders: number;
  active: boolean;
}

const initialDeliverers: Deliverer[] = [
  { id: "D1", name: "علي حسين", phone: "07712345678", area: "الكرادة", rating: 4.8, orders: 124, active: true },
  { id: "D2", name: "محمد ياسر", phone: "07801234567", area: "المنصور", rating: 4.5, orders: 89, active: true },
  { id: "D3", name: "كريم أحمد", phone: "07709876543", area: "الزيونة", rating: 4.9, orders: 212, active: false },
  { id: "D4", name: "سامر علاء", phone: "07501112233", area: "الجادرية", rating: 4.2, orders: 67, active: true },
  { id: "D5", name: "عمر طارق", phone: "07811223344", area: "الدورة", rating: 4.7, orders: 155, active: false },
  { id: "D6", name: "حسن مهدي", phone: "07712223334", area: "الأعظمية", rating: 4.6, orders: 98, active: true },
];

export default function DeliverersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deliverers, setDeliverers] = useState<Deliverer[]>(initialDeliverers);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newArea, setNewArea] = useState("");

  if (!user) { setLocation("/"); return null; }

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim() || !newArea.trim()) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    const nd: Deliverer = {
      id: `D${Date.now()}`, name: newName.trim(), phone: newPhone.trim(),
      area: newArea.trim(), rating: 0, orders: 0, active: true,
    };
    setDeliverers(prev => [nd, ...prev]);
    setNewName(""); setNewPhone(""); setNewArea(""); setShowForm(false);
    toast({ title: "تم الإضافة", description: `تم تسجيل ${nd.name} بنجاح` });
  };

  const toggleActive = (id: string) => {
    setDeliverers(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  return (
    <Layout title="الدلفرية المسجّلون">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{deliverers.length} دلفري مسجّل</p>
        <button
          data-testid="button-add-deliverer"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "hsl(33 100% 50%)" }}
        >
          <Plus className="w-4 h-4" />
          إضافة دلفري
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-4 border border-card-border mb-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">تسجيل دلفري جديد</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3">
            <input data-testid="input-new-name" type="text" placeholder="الاسم الكامل" value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <input data-testid="input-new-phone" type="tel" placeholder="رقم الهاتف" value={newPhone} onChange={e => setNewPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <input data-testid="input-new-area" type="text" placeholder="المنطقة" value={newArea} onChange={e => setNewArea(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <button data-testid="button-save-deliverer" onClick={handleAdd}
              className="w-full py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: "hsl(33 100% 50%)" }}>
              حفظ
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {deliverers.map(d => (
          <div key={d.id} data-testid={`card-deliverer-${d.id}`}
            className="bg-card rounded-2xl p-4 border border-card-border" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: d.active ? "hsl(33 100% 95%)" : "hsl(0 0% 94%)" }}>
                <Users className="w-5 h-5" style={{ color: d.active ? "hsl(33 100% 45%)" : "hsl(0 0% 55%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground text-sm">{d.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.active ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"}`}>
                    {d.active ? "نشط" : "غير نشط"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.area}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />{d.phone}
                  </span>
                  {d.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: "hsl(33 100% 45%)" }}>
                      <Star className="w-3 h-3 fill-current" />{d.rating}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{d.orders} طلب</span>
                </div>
              </div>
              <button
                data-testid={`button-toggle-${d.id}`}
                onClick={() => toggleActive(d.id)}
                className="flex-shrink-0 w-10 h-6 rounded-full transition-colors relative"
                style={{ background: d.active ? "hsl(142 76% 36%)" : "hsl(0 0% 80%)" }}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${d.active ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
