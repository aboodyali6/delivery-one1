import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";
import { CheckCircle, Clock, Package, Bike, Home } from "lucide-react";

const steps = [
  { id: 1, label: "تم استلام الطلب",      icon: Package,      done: true },
  { id: 2, label: "يتم تحضير طلبك",       icon: Clock,        done: true },
  { id: 3, label: "الدلفري في الطريق إليك", icon: Bike,        done: false, active: true },
  { id: 4, label: "تم التوصيل",           icon: Home,         done: false },
];

export default function TrackPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [seconds, setSeconds] = useState(847);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  if (!user) { setLocation("/"); return null; }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <Layout title="تتبع الطلب">
      {/* ETA */}
      <div className="bg-blue-500 rounded-2xl p-6 text-white text-center mb-6"
        style={{ boxShadow: "var(--shadow-lg)" }}>
        <p className="text-sm opacity-80 mb-1">الوقت المتبقي للتوصيل</p>
        <p className="text-5xl font-extrabold tracking-tight">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </p>
        <p className="text-sm opacity-80 mt-2">الدلفري: علي حسين 🛵</p>
      </div>

      {/* Steps */}
      <div className="bg-card rounded-2xl p-5 border border-card-border mb-4"
        style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="font-bold text-foreground mb-4">حالة الطلب</h3>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? "bg-green-500" : step.active ? "bg-blue-500" : "bg-muted"
                }`}>
                  {step.done
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <step.icon className={`w-5 h-5 ${step.active ? "text-white" : "text-muted-foreground"}`} />
                  }
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-6 mt-1 ${step.done ? "bg-green-400" : "bg-border"}`} />
                )}
              </div>
              <p className={`font-medium text-sm ${
                step.done ? "text-green-600" : step.active ? "text-blue-600 font-bold" : "text-muted-foreground"
              }`}>
                {step.label}
                {step.active && <span className="mr-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">الآن</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order info */}
      <div className="bg-card rounded-2xl p-4 border border-card-border"
        style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">رقم الطلب</span>
          <span className="font-bold">ORD-001</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-muted-foreground">المطعم</span>
          <span className="font-bold">مطعم البرجر الملكي</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-muted-foreground">المبلغ</span>
          <span className="font-bold text-primary">12,500 د.ع</span>
        </div>
      </div>
    </Layout>
  );
}
