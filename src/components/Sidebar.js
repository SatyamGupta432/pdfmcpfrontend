import React, { useState } from "react";
import { FolderGit2, ShieldCheck, Code2, ExternalLink, LogOut, AlertTriangle, X } from "lucide-react";

export default function Sidebar({ form, setForm, userRepos, onLogout, currentUser, userImage }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
              {userImage ? (
                <img src={userImage} alt={currentUser} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.8rem", color: "white" }}>
                  {currentUser.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "130px" }}>
                {currentUser}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
              title="Sign Out"
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

      {showLogoutDialog && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)", zIndex: 999999 }}>
          <div style={{ width: "100%", maxWidth: "400px", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "24px", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.15)", position: "relative" }}>
            <button
              onClick={() => setShowLogoutDialog(false)}
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", margin: "0 auto 1.25rem auto", borderRadius: "16px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ textAlign: "center", color: "white", fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              Confirm Logout
            </h3>
            
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: "1.5" }}>
              Are you sure you want to remove <strong style={{ color: "#e2e8f0" }}>{currentUser}</strong> from your stored accounts?
            </p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowLogoutDialog(false)}
                style={{ flex: 1, padding: "0.85rem", background: "rgba(30, 41, 59, 0.8)", color: "white", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={(e) => e.target.style.background = "rgba(51, 65, 85, 0.8)"}
                onMouseOut={(e) => e.target.style.background = "rgba(30, 41, 59, 0.8)"}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutDialog(false);
                  if (onLogout) onLogout();
                }}
                style={{ flex: 1, padding: "0.85rem", background: "#ef4444", color: "white", border: "none", borderRadius: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)" }}
                onMouseOver={(e) => e.target.style.background = "#dc2626"}
                onMouseOut={(e) => e.target.style.background = "#ef4444"}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
