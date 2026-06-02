import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DailySignPage } from "./pages/DailySignPage";
import { FiveElementPage } from "./pages/FiveElementPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

type PageKey = "home" | "daily-sign" | "five-elements";

function AppShell() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState<PageKey>("home");

  if (!user) {
    return <LoginPage />;
  }

  return (
    <main className="page-shell">
      {activePage === "home" && (
        <HomePage onNavigate={setActivePage} />
      )}

      {activePage === "daily-sign" && (
        <DailySignPage onBack={() => setActivePage("home")} />
      )}

      {activePage === "five-elements" && (
        <FiveElementPage onBack={() => setActivePage("home")} />
      )}

      <button className="logout-fab" onClick={logout} title="退出登录">
        退出
      </button>
    </main>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
