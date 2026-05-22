import { createContext, useContext, useState } from "react";

interface DeliveryUser {
  name: string;
  phone: string;
}

interface AuthContextType {
  user: DeliveryUser | null;
  login: (name: string, phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DeliveryUser | null>(() => {
    const saved = localStorage.getItem("wahid_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (name: string, phone: string) => {
    const u = { name, phone };
    setUser(u);
    localStorage.setItem("wahid_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wahid_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
