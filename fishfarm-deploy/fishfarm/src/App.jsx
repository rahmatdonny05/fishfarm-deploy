import { useState } from "react";
import { useStore } from "./store";
import Dashboard from "./components/Dashboard";
import Kolam from "./components/Kolam";
import Investasi from "./components/Investasi";
import Cashflow from "./components/Cashflow";
import Panen from "./components/Panen";
import Laporan from "./components/Laporan";
import Progress from "./components/Progress";

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "kolam", label: "🏊 Kolam & Tebar" },
  { id: "investasi", label: "💰 Investasi" },
  { id: "cashflow", label: "💳 Cashflow" },
  { id: "panen", label: "🐟 Panen" },
  { id: "laporan", label: "📋 Laporan" },
  { id: "progress", label: "📈 Progress" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { downloadExcel } = useStore();

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <Dashboard />;
      case "kolam":      return <Kolam />;
      case "investasi":  return <Investasi />;
      case "cashflow":   return <Cashflow />;
      case "panen":      return <Panen />;
      case "laporan":    return <Laporan />;
      case "progress":   return <Progress />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div>
          <h1 className="app-title">Budidaya Ikan — Manajemen Keuangan</h1>
          <p className="app-subtitle">Investasi · Cashflow · HPP · Panen · Laporan Siklus</p>
        </div>
        <button className="btn btn-excel" onClick={downloadExcel}>
          ⬇ Export Excel
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>{renderTab()}</div>
    </div>
  );
}
