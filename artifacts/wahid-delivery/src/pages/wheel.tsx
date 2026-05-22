import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import Layout from "@/components/layout";

const prizes = [
  { label: "خصم 10%",    color: "#f97316" },
  { label: "توصيل مجاني", color: "#22c55e" },
  { label: "حاول مجدداً", color: "#6b7280" },
  { label: "خصم 20%",    color: "#a855f7" },
  { label: "وجبة مجانية", color: "#ef4444" },
  { label: "حاول مجدداً", color: "#6b7280" },
  { label: "خصم 5%",     color: "#f59e0b" },
  { label: "مشروب مجاني", color: "#14b8a6" },
];

export default function WheelPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const wheelRef = useRef<SVGSVGElement>(null);

  if (!user) { setLocation("/"); return null; }

  const spin = () => {
    if (spinning || spinsLeft === 0) return;
    setResult(null);
    setSpinning(true);
    const extra = 1440 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extra;
    setRotation(newRotation);

    setTimeout(() => {
      const slice = 360 / prizes.length;
      const normalized = ((newRotation % 360) + 360) % 360;
      const idx = Math.floor((360 - normalized) / slice) % prizes.length;
      setResult(prizes[idx].label);
      setSpinning(false);
      setSpinsLeft(s => s - 1);
    }, 3000);
  };

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - 10;
  const sliceAngle = (2 * Math.PI) / prizes.length;

  const slices = prizes.map((p, i) => {
    const startAngle = i * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const midAngle = startAngle + sliceAngle / 2;
    const tx = cx + (r * 0.65) * Math.cos(midAngle);
    const ty = cy + (r * 0.65) * Math.sin(midAngle);
    return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`, tx, ty, textAngle: (midAngle * 180) / Math.PI + 90, color: p.color, label: p.label };
  });

  return (
    <Layout title="عجلة الحظ">
      <div className="flex flex-col items-center">
        <p className="text-muted-foreground text-sm mb-4">
          لديك <span className="font-bold text-primary">{spinsLeft}</span> دورات متبقية اليوم
        </p>

        {/* Wheel */}
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-2xl">▼</div>

          <svg
            ref={wheelRef}
            width={size}
            height={size}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))",
            }}
          >
            {slices.map((s, i) => (
              <g key={i}>
                <path d={s.path} fill={s.color} stroke="white" strokeWidth="2" />
                <text
                  x={s.tx} y={s.ty}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="11" fontWeight="bold"
                  fontFamily="Cairo, sans-serif"
                  transform={`rotate(${s.textAngle}, ${s.tx}, ${s.ty})`}
                >
                  {s.label}
                </text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r="18" fill="white" stroke="#ddd" strokeWidth="2" />
          </svg>
        </div>

        {/* Spin button */}
        <button
          data-testid="button-spin"
          onClick={spin}
          disabled={spinning || spinsLeft === 0}
          className="mt-8 px-10 py-4 rounded-2xl text-xl font-extrabold text-white transition active:scale-95 disabled:opacity-50"
          style={{ background: spinning || spinsLeft === 0 ? "#9ca3af" : "#14b8a6", boxShadow: "var(--shadow-lg)" }}
        >
          {spinning ? "جاري الدوران..." : spinsLeft === 0 ? "انتهت دوراتك" : "🎰 ادر العجلة"}
        </button>

        {/* Result */}
        {result && !spinning && (
          <div className="mt-6 w-full bg-card rounded-2xl p-5 border-2 border-primary text-center"
            style={{ boxShadow: "var(--shadow-md)" }}>
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-muted-foreground text-sm">لقد ربحت</p>
            <p className="text-2xl font-extrabold text-primary mt-1">{result}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
