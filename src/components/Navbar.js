import React from "react";
import { GitBranch, Sparkles, BarChart2, Award, Terminal, CheckCircle2 } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, owner }) {
  const tabs = [
    { id: "dashboard", label: "AI PR Analyzer", icon: Sparkles },
    { id: "analytics", label: "Velocity Analytics", icon: BarChart2 },
    { id: "leaderboard", label: "Leaderboard", icon: Award },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div style={{ padding: "0.5rem", background: "linear-gradient(135deg, var(--primary), #a855f7)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(168, 85, 247, 0.4)" }}>
          <GitBranch size={22} color="white" />
        </div>
        <span>GitPulse AI</span>
        {/* <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "rgba(168, 85, 247, 0.2)", color: "#e879f9", borderRadius: "100px", border: "1px solid rgba(168, 85, 247, 0.4)", fontWeight: "600", marginLeft: "0.5rem" }}>
          v2.4 Pro
        </span> */}
      </div>

      <div className="nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(16, 185, 129, 0.15)", padding: "0.4rem 0.85rem", borderRadius: "100px", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "0.8rem", color: "#34d399", fontWeight: "600" }}>
          <CheckCircle2 size={14} />
          <span>GitHub API Live ({owner || "Connected"})</span>
        </div>
      </div>
    </nav>
  );
}
