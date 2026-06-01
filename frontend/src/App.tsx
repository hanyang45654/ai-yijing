import { useState } from "react";
import { DailySignPage } from "./pages/DailySignPage";
import { FiveElementPage } from "./pages/FiveElementPage";
import { HomePage } from "./pages/HomePage";

type PageKey = "home" | "daily-sign" | "five-elements";

export function App() {
  const [activePage, setActivePage] = useState<PageKey>("home");

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
    </main>
  );
}
