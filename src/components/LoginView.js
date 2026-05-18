import React, { useState } from "react";
import axios from "axios";
import { Lock, User, Key, ShieldCheck, ArrowRight, Loader2, FolderGit2, Sparkles } from "lucide-react";

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !token) {
      setError("Please provide both your GitHub username and personal access token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validate token against live GitHub API
      const res = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (res.status === 200) {
        const actualUser = res.data.login || username;

        // Fetch multi-repository list
        let repoList = [
          { owner: actualUser, repo: "UPYOG-djb" },
          { owner: actualUser, repo: "pdfmcp" },
          { owner: actualUser, repo: "pdfmcpfrontend" },
        ];

        try {
          const reposRes = await axios.get(
            `https://api.github.com/users/${actualUser}/repos?sort=updated&per_page=15`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
              },
            }
          );
          if (reposRes.data && reposRes.data.length > 0) {
            repoList = reposRes.data.map((r) => ({
              owner: r.owner.login,
              repo: r.name,
            }));
          }
        } catch (repoErr) {
          console.warn("Could not fetch repo list, using defaults.", repoErr.message);
        }

        localStorage.setItem("gh_token", token);
        localStorage.setItem("gh_user", actualUser);
        onLoginSuccess(token, actualUser, repoList);
      }
    } catch (err) {
      setError("Invalid GitHub Personal Access Token (ghp_...). Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)", zIndex: 99999, padding: "1.5rem", boxSizing: "border-box", overflow: "hidden" }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)", top: "-10%", left: "-10%", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)", bottom: "-15%", right: "-10%", filter: "blur(80px)" }} />

      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: "28px", padding: "3.5rem 2.5rem", backdropFilter: "blur(40px)", boxShadow: "0 0 80px -10px rgba(168, 85, 247, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.8)", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", padding: "0.35rem 0.85rem", borderRadius: "9999px", color: "#d946ef", fontSize: "0.8rem", fontWeight: "700", marginBottom: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <Sparkles size={14} />
            <span>Enterprise AI Vault</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "72px", height: "72px", margin: "0 auto 1.25rem auto", borderRadius: "22px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))", border: "1px solid rgba(168, 85, 247, 0.5)", boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}>
            <FolderGit2 size={38} color="#c084fc" />
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "white", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
            GitPulse Enterprise AI
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
            Secure Personal Access Token Authentication
          </p>
        </div>

        {error && (
          <div style={{ padding: "1rem", borderRadius: "14px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Lock size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "0.5rem" }}>
              GitHub Username
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={18} color="#818cf8" style={{ position: "absolute", left: "1.1rem" }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. SatyamGupta432"
                style={{ width: "100%", padding: "0.9rem 1rem 0.9rem 2.85rem", background: "rgba(10, 15, 30, 0.7)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "16px", color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Personal Access Token (Password)</span>
              <span style={{ fontSize: "0.75rem", color: "#c084fc", fontWeight: "700" }}>ghp_...</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Key size={18} color="#818cf8" style={{ position: "absolute", left: "1.1rem" }} />
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                style={{ width: "100%", padding: "0.9rem 1rem 0.9rem 2.85rem", background: "rgba(10, 15, 30, 0.7)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "16px", color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              Requires repo and user read scopes for live multi-repository access.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "1.1rem", background: "linear-gradient(135deg, var(--primary), #a855f7)", color: "white", border: "none", borderRadius: "16px", fontWeight: "700", fontSize: "1.05rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: "0 10px 30px -5px rgba(168, 85, 247, 0.5)", marginTop: "0.5rem" }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Authenticating Token...</span>
              </>
            ) : (
              <>
                <span>Secure Access</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem" }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Tokens are verified client-side and never stored on server</span>
        </div>
      </div>
    </div>
  );
}
