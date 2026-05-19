import React, { useState } from "react";
import { 
  Sparkles, Code2, AlertTriangle, CheckCircle2, ShieldAlert, Zap, 
  GitPullRequest, RefreshCw, ChevronDown, ChevronUp, FileCode, 
  ArrowRight, User, Terminal, ExternalLink, Activity, FileSpreadsheet, FileText
} from "lucide-react";

export default function PRReviewView({ token }) {
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [expandedFile, setExpandedFile] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState({ pdf: false, excel: false });

  const handleDownload = async (type) => {
    if (!data || !data.prMetadata) return;
    setDownloadLoading(prev => ({ ...prev, [type]: true }));
    try {
      const [owner, repo] = data.prMetadata.repoName.split("/");
      const queryParams = new URLSearchParams({
        owner,
        repo,
        prNumber: data.prMetadata.pullNumber,
        token: token || ""
      }).toString();
      
      const url = `/api/${type}?${queryParams}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ${type.toUpperCase()}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const ext = type === "excel" ? "xlsx" : "pdf";
      link.download = `${repo}-PR${data.prMetadata.pullNumber}-Review.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(`Error downloading PR ${type}:`, err);
      alert(err.message || `Failed to download ${type.toUpperCase()}.`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const presetPr = "https://github.com/Delhi-Jal-Board/djb-UPYOG/pull/512";

  const handleInspect = async (urlToUse = prUrl) => {
    if (!urlToUse) {
      setError("Please provide a valid GitHub Pull Request URL.");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);

    try {
      const params = new URLSearchParams({ 
        prUrl: urlToUse,
        token: token || "" 
      }).toString();
      
      const res = await fetch(`/api/analyze-pr?${params}`);
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze Pull Request.");
      }
      
      setData(json);
      // Expand the first file by default if files exist
      if (json.fileReviews && json.fileReviews.length > 0) {
        setExpandedFile(json.fileReviews[0].filename);
      }
    } catch (err) {
      console.error("PR Inspector Error:", err);
      setError(err.message || "Failed to fetch or review the pull request.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code diff lines
  const renderDiffLines = (diffText) => {
    if (!diffText || diffText === "No diff content available.") {
      return <div style={{ color: "#64748b", padding: "1rem", fontFamily: "monospace" }}>No diff patch details found.</div>;
    }

    const lines = diffText.split("\n");
    return (
      <div style={{ 
        fontFamily: "var(--font-geist-mono), monospace", 
        fontSize: "0.85rem", 
        lineHeight: "1.6", 
        background: "rgba(5, 8, 16, 0.95)", 
        padding: "1.25rem", 
        borderRadius: "12px", 
        border: "1px solid rgba(255, 255, 255, 0.05)",
        overflowX: "auto",
        maxHeight: "450px"
      }}>
        {lines.map((line, idx) => {
          let lineStyle = { 
            display: "block", 
            padding: "0.1rem 0.5rem", 
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all"
          };
          
          if (line.startsWith("+") && !line.startsWith("+++")) {
            lineStyle.background = "rgba(16, 185, 129, 0.15)";
            lineStyle.color = "#34d399";
            lineStyle.borderLeft = "3px solid #10b981";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            lineStyle.background = "rgba(239, 68, 68, 0.12)";
            lineStyle.color = "#f87171";
            lineStyle.borderLeft = "3px solid #ef4444";
          } else if (line.startsWith("@@")) {
            lineStyle.color = "#818cf8";
            lineStyle.background = "rgba(129, 140, 248, 0.08)";
            lineStyle.fontWeight = "600";
          } else {
            lineStyle.color = "#cbd5e1";
          }

          return (
            <span key={idx} style={lineStyle}>
              {line}
            </span>
          );
        })}
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981"; // Success
    if (score >= 70) return "#f59e0b"; // Warning
    return "#ef4444"; // Danger
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      
      {/* Control Panel / PR URL input */}
      <div className="glass-card" style={{ padding: "2.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ padding: "0.5rem", background: "rgba(99, 102, 241, 0.15)", borderRadius: "10px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
            <GitPullRequest size={22} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ marginBottom: "0.1rem" }}>Pull Request AI Inspector</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Parse any GitHub PR, extract changed files, compile code reviews, and verify system suitability instantly.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <div style={{ flex: 1, minWidth: "300px", position: "relative", display: "flex", alignItems: "center" }}>
            <Terminal size={18} color="#6366f1" style={{ position: "absolute", left: "1.2rem" }} />
            <input
              type="text"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="e.g. https://github.com/Delhi-Jal-Board/djb-UPYOG/pull/512"
              className="input-field"
              style={{ paddingLeft: "3rem", fontSize: "0.95rem" }}
              onKeyDown={(e) => e.key === "Enter" && handleInspect()}
            />
          </div>
          <button
            onClick={() => handleInspect()}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "0.85rem 2rem", flexShrink: 0 }}
          >
            {loading ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Inspecting PR..." : "Inspect Pull Request"}
          </button>
        </div>

        {/* Suggestion Presets */}
        {/* <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Preset Target:</span>
          <button
            onClick={() => {
              setPrUrl(presetPr);
              handleInspect(presetPr);
            }}
            className="btn"
            style={{
              padding: "0.35rem 0.85rem",
              fontSize: "0.75rem",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#a5b4fc",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            🔍 Delhi Jal Board PR #512 <ArrowRight size={12} />
          </button>
        </div> */}

        {error && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "14px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Cyber Scanning Loader */}
      {loading && (
        <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyValue: "center", gap: "1.5rem" }}>
          <div style={{ position: "relative", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "4px solid rgba(99, 102, 241, 0.1)", borderTopColor: "var(--primary)", animation: "spin 1.5s linear infinite" }}></div>
            <div style={{ position: "absolute", width: "70%", height: "70%", borderRadius: "50%", border: "3px solid rgba(168, 85, 247, 0.1)", borderBottomColor: "#c084fc", animation: "spin 1s linear infinite reverse" }}></div>
            <Activity size={28} className="pulse" color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ color: "white", fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.5rem" }}>AI Deep-Scan in Progress</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
              Parsing repository diff arrays, conducting security threat modeling, and evaluating design pattern suitability.
            </p>
          </div>
          <div style={{ background: "rgba(10, 15, 30, 0.5)", padding: "0.6rem 1.5rem", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.8rem", color: "#a5b4fc", fontFamily: "monospace" }}>
            GET /repos/Delhi-Jal-Board/djb-UPYOG/pulls/512 ... [OK]
          </div>
        </div>
      )}

      {/* PR Detailed Analysis Content */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* PR Metadata Summary Header Card */}
          <div className="glass-card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "6px", height: "100%", background: "linear-gradient(to bottom, #6366f1, #a855f7)" }}></div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", color: "#cbd5e1", padding: "0.2rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", fontWeight: "600" }}>
                    📂 {data.prMetadata.repoName}
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(168, 85, 247, 0.15)", color: "#e879f9", padding: "0.2rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(168, 85, 247, 0.3)", fontWeight: "700" }}>
                    PR #{data.prMetadata.pullNumber}
                  </span>
                  <span className="badge" style={{ 
                    background: data.prMetadata.state === "open" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", 
                    color: data.prMetadata.state === "open" ? "#34d399" : "#fca5a5",
                    border: data.prMetadata.state === "open" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "6px"
                  }}>
                    {data.prMetadata.state.toUpperCase()}
                  </span>
                </div>
                <h1 style={{ fontSize: "1.75rem", color: "white", marginBottom: "0.75rem" }}>{data.prMetadata.title}</h1>
                
                {/* Author Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {data.prMetadata.authorAvatar ? (
                    <img 
                      src={data.prMetadata.authorAvatar} 
                      alt={data.prMetadata.author} 
                      style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" }} 
                    />
                  ) : (
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white", fontWeight: "700" }}>
                      {data.prMetadata.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: "0.9rem", color: "#cbd5e1", fontWeight: "600" }}>@{data.prMetadata.author}</span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>wants to merge into</span>
                  <span style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#a5b4fc", background: "rgba(99,102,241,0.12)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                    {data.prMetadata.baseBranch}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>from</span>
                  <span style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#c084fc", background: "rgba(168,85,247,0.12)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                    {data.prMetadata.headBranch}
                  </span>
                </div>
              </div>

              {/* Additions / Deletions Stats */}
              <div style={{ display: "flex", gap: "0.75rem", background: "rgba(10, 15, 30, 0.4)", padding: "0.75rem 1.25rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#34d399", fontWeight: "800", fontSize: "1.2rem" }}>+{data.prMetadata.additions}</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Additions</div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", alignSelf: "stretch" }}></div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#f87171", fontWeight: "800", fontSize: "1.2rem" }}>-{data.prMetadata.deletions}</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Deletions</div>
                </div>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", alignSelf: "stretch" }}></div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#60a5fa", fontWeight: "800", fontSize: "1.2rem" }}>{data.prMetadata.changedFilesCount}</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Files</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Description</div>
              <div style={{ 
                fontSize: "0.95rem", 
                lineHeight: "1.6", 
                color: "#cbd5e1", 
                background: "rgba(10, 15, 30, 0.4)", 
                padding: "1rem 1.25rem", 
                borderRadius: "12px", 
                maxHeight: "120px", 
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.03)"
              }}>
                {data.prMetadata.description}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8", display: "inline-flex", alignItems: "center", fontWeight: "600", alignSelf: "center" }}>
                📥 Download Audit Reports:
              </span>
              <button 
                onClick={() => handleDownload("excel")} 
                disabled={downloadLoading.excel} 
                className="btn btn-excel" 
                style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", borderRadius: "10px" }}
              >
                {downloadLoading.excel ? <RefreshCw className="spin" size={14} /> : <FileSpreadsheet size={14} />}
                {downloadLoading.excel ? "Generating Excel..." : "Excel Report"}
              </button>
              <button 
                onClick={() => handleDownload("pdf")} 
                disabled={downloadLoading.pdf} 
                className="btn btn-pdf" 
                style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", borderRadius: "10px" }}
              >
                {downloadLoading.pdf ? <RefreshCw className="spin" size={14} /> : <FileText size={14} />}
                {downloadLoading.pdf ? "Generating PDF..." : "Executive PDF"}
              </button>
            </div>
          </div>

          {/* AI Suitability Assessment Dashboard */}
          <div className="grid-cols-3">
            
            {/* Score Ring Widget */}
            <div className="stat-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
              <span className="stat-label">AI Suitability Score</span>
              <div style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "50%", 
                border: `8px solid rgba(255,255,255,0.06)`,
                borderTopColor: getScoreColor(data.suitabilityAnalysis.overallScore),
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                margin: "1.5rem 0",
                boxShadow: `0 0 20px rgba(99, 102, 241, 0.1)`
              }}>
                <span style={{ fontSize: "2rem", fontWeight: "900", color: "white" }}>{data.suitabilityAnalysis.overallScore}%</span>
              </div>
              <span className="badge" style={{ 
                background: getScoreColor(data.suitabilityAnalysis.overallScore) + "25",
                color: getScoreColor(data.suitabilityAnalysis.overallScore),
                border: `1px solid ${getScoreColor(data.suitabilityAnalysis.overallScore)}45`,
                padding: "0.4rem 1rem",
                borderRadius: "100px",
                fontWeight: "800"
              }}>
                {data.suitabilityAnalysis.suitabilityRating}
              </span>
            </div>

            {/* Suitability Audit Reasoning Card */}
            <div className="glass-card" style={{ gridColumn: "span 2", padding: "2rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", marginBottom: "1rem" }}>
                <CheckCircle2 size={20} color="#10b981" /> Suitability & Architectural Reasoning
              </h3>
              <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cbd5e1", marginBottom: "1.25rem" }}>
                {data.suitabilityAnalysis.reasoning}
              </p>

              <div className="grid-cols-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#fb7185", fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                    <ShieldAlert size={16} /> Security Assessment
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.5" }}>{data.suitabilityAnalysis.securityAssessment}</p>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#60a5fa", fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                    <Zap size={16} /> Performance Impact
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.5" }}>{data.suitabilityAnalysis.performanceImpact}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Changed Files Explorer Accordion */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Code2 size={20} color="var(--primary)" />
              <span>File-by-File AI Suitability Audits ({data.fileReviews.length})</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.fileReviews.map((review, idx) => {
                const isOpen = expandedFile === review.filename;
                const fileColor = review.status === "added" ? "#34d399" : review.status === "deleted" ? "#f87171" : "#60a5fa";
                
                return (
                  <div 
                    key={review.filename} 
                    className="commit-card" 
                    style={{ 
                      padding: "1.25rem",
                      borderColor: isOpen ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.08)",
                      background: isOpen ? "rgba(18, 27, 44, 0.85)" : "rgba(15, 23, 42, 0.4)"
                    }}
                  >
                    
                    {/* Header Row */}
                    <div 
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                      onClick={() => setExpandedFile(isOpen ? null : review.filename)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#cbd5e1" }}>
                          <FileCode size={18} color="var(--primary)" />
                          <span style={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: "700" }}>{review.filename}</span>
                        </div>
                        
                        <span className="badge" style={{ 
                          fontSize: "0.65rem", 
                          background: review.status === "added" ? "rgba(16, 185, 129, 0.15)" : review.status === "deleted" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
                          color: fileColor,
                          border: `1px solid ${fileColor}45`
                        }}>
                          {review.status.toUpperCase()}
                        </span>
                        
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", gap: "6px" }}>
                          <span style={{ color: "#34d399" }}>+{review.additions}</span>
                          <span style={{ color: "#f87171" }}>-{review.deletions}</span>
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ 
                          fontSize: "0.8rem", 
                          fontWeight: "800", 
                          color: "white", 
                          background: getScoreColor(review.codeRating * 10) + "25",
                          border: `1px solid ${getScoreColor(review.codeRating * 10)}35`,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "6px"
                        }}>
                          {review.codeRating}/10 Suitability
                        </span>
                        <button style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Review Block */}
                    {isOpen && (
                      <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.25s ease-out" }}>
                        
                        <div className="grid-cols-2">
                          <div style={{ background: "rgba(10, 15, 30, 0.4)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>What Changed</div>
                            <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.6" }}>{review.whatChanged}</p>
                          </div>
                          <div style={{ background: "rgba(10, 15, 30, 0.4)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--primary)", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Suitability Audit</div>
                            <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.6" }}>{review.suitabilityDetails}</p>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "14px", padding: "1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fcd34d", fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <Sparkles size={16} /> Code Review & Suggestions
                          </div>
                          <p style={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.6" }}>{review.recommendations}</p>
                        </div>

                        {/* Code Diffs Visualizer */}
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Line-by-Line Code Diffs</div>
                          {renderDiffLines(review.originalDiff)}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      )}

    </div>
  );
}
