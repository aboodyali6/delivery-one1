import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import { Bike } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (user) {
    setLocation("/home");
    return null;
  }

  const handleLogin = () => {
    if (!name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسمك", variant: "destructive" });
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم هاتف صحيح", variant: "destructive" });
      return;
    }
    login(name.trim(), phone.trim());
    setLocation("/home");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, hsl(33 100% 96%) 0%, hsl(30 20% 96%) 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "hsl(33 100% 50%)", boxShadow: "var(--shadow-lg)" }}
          >
            <Bike className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">واحد دلفري</h1>
          <p className="text-muted-foreground text-sm mt-1">منصة إدارة التوصيل</p>
        </div>

        {/* Card */}
        <div
          className="bg-card rounded-2xl p-6 border border-card-border"
          style={{ boxShadow: "var(--shadow-xl)" }}
        >
          <h2 className="text-xl font-bold text-foreground mb-5">تسجيل دخول الدلفري</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                الاسم
              </label>
              <input
                data-testid="input-name"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                رقم الهاتف
              </label>
              <input
                data-testid="input-phone"
                type="tel"
                placeholder="07xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              data-testid="button-login"
              onClick={handleLogin}
              className="w-full py-3.5 rounded-xl font-bold text-white text-lg transition active:scale-[0.98]"
              style={{ background: "hsl(33 100% 50%)", boxShadow: "var(--shadow-md)" }}
            >
              دخول
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          نظام إدارة طلبات التوصيل
        </p>
      </div>
    </div>
  );
}
