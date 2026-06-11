import React from "react";
import { Award, Trophy, Star, ShieldCheck, Zap, User } from "lucide-react";

export default function LeaderboardView() {
  const leaders = [
    { rank: 1, name: "SatyamGupta432", role: "Engineering Lead", commits: 48, loc: "+4,850", risk: "Low (3.2%)", score: "99.4%", avatarBg: "linear-gradient(135deg, #f59e0b, #d97706)", modules: "Auth, Water Connection" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2>Developer Activity Leaderboard</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Organization ranking based on commit volume, AI quality ratings, and PR risk distribution.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "0.5rem 1rem", borderRadius: "100px", color: "#fcd34d", fontWeight: "700", fontSize: "0.85rem" }}>
          <Trophy size={16} /> 1st Place Bonus Active
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem 2rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "1rem 1.5rem" }}>Rank</th>
              <th style={{ padding: "1rem 1.5rem" }}>Developer</th>
              <th style={{ padding: "1rem 1.5rem" }}>Commits</th>
              <th style={{ padding: "1rem 1.5rem" }}>LoC Impact</th>
              <th style={{ padding: "1rem 1.5rem" }}>Risk Ratio</th>
              <th style={{ padding: "1rem 1.5rem" }}>Modules Impacted</th>
              <th style={{ padding: "1rem 1.5rem" }}>AI Score</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((dev) => (
              <tr key={dev.rank} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "all 0.2s" }} className="hover-row">
                <td style={{ padding: "1.25rem 1.5rem", fontWeight: "800", fontSize: "1.1rem", color: dev.rank === 1 ? "#f59e0b" : dev.rank === 2 ? "#94a3b8" : dev.rank === 3 ? "#b45309" : "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {dev.rank <= 3 && <Award size={18} />} #{dev.rank}
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: dev.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "1.1rem", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }}>
                      {dev.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "white", fontSize: "1.05rem" }}>{dev.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{dev.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", fontWeight: "700", color: "#60a5fa" }}>{dev.commits} Commits</td>
                <td style={{ padding: "1.25rem 1.5rem", fontFamily: "monospace", color: "#34d399", fontWeight: "600" }}>{dev.loc}</td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <span className={`badge ${dev.risk.includes("High") ? "badge-risk-high" : dev.risk.includes("Medium") ? "badge-risk-medium" : "badge-risk-low"}`}>{dev.risk}</span>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
                  {dev.modules}
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#34d399", fontWeight: "800", fontSize: "1.1rem" }}>
                    <Star size={16} fill="#34d399" /> {dev.score}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
