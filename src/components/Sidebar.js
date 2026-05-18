import React from "react";
import { FolderGit2, ShieldCheck, Code2, ExternalLink, UserCheck, LogOut } from "lucide-react";

export default function Sidebar({ form, setForm, userRepos, onLogout, currentUser }) {
  const defaultRepos = [
    { owner: "SatyamGupta432", repo: "UPYOG-djb" },
    { owner: "SatyamGupta432", repo: "pdfmcp" },
    { owner: "SatyamGupta432", repo: "pdfmcpfrontend" },
  ];

  const listToUse = userRepos && userRepos.length > 0 ? userRepos : defaultRepos;

  return (
    <aside style={{ width: "280px", background: "rgba(10, 15, 30, 0.5)", borderRight: "1px solid var(--glass-border)", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "1rem" }}>
          Target Environment
        </div>
        <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "1rem", borderRadius: "14px", border: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <FolderGit2 size={20} color="var(--primary)" />
            <span style={{ fontWeight: "700", color: "white", fontSize: "0.95rem", wordBreak: "break-all" }}>{form.repo}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span>Owner:</span> <span style={{ color: "#cbd5e1" }}>{form.owner}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
            <span>Dev:</span> <span style={{ color: "#818cf8", fontWeight: "600" }}>{form.author}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "0.5rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Your Repositories</span>
          <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", padding: "0.1rem 0.5rem", borderRadius: "10px", fontWeight: "600" }}>
            {listToUse.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {listToUse.map((item, idx) => {
            const isSelected = form.repo === item.repo && form.owner === item.owner;
            return (
              <button
                key={idx}
                onClick={() => setForm((prev) => ({ ...prev, owner: item.owner, repo: item.repo }))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(15, 23, 42, 0.4)",
                  border: "1px solid",
                  borderColor: isSelected ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  color: isSelected ? "white" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                  <Code2 size={16} color={isSelected ? "var(--primary)" : "#64748b"} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: isSelected ? "700" : "500", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {item.repo}
                  </span>
                </div>
                <ExternalLink size={12} color="#64748b" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {currentUser && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15, 23, 42, 0.6)", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.8rem", color: "white" }}>
                {currentUser.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "120px" }}>
                {currentUser}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Enterprise Guardrails Active</span>
          </div>
          <p style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: "1.4" }}>
            Multi-repo analysis synchronized directly with your authenticated GitHub profile.
          </p>
        </div>
      </div>
    </aside>
  );
}
