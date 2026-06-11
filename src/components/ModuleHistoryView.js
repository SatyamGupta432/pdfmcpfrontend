import React, { useState, useEffect } from "react";
import { FolderGit2, GitPullRequest, Activity, ChevronDown, ChevronUp, AlertTriangle, Search, Clock, Box } from "lucide-react";

export default function ModuleHistoryView({ form, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedMain, setExpandedMain] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [filterType, setFilterType] = useState("all"); // 'all', 'month', 'date'
  const [filterMonth, setFilterMonth] = useState(form.month || new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(form.year || new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchHistory();
  }, [form.owner, form.repo, form.author]);

  async function fetchHistory() {
    if (!form.owner || !form.repo || !form.author) return;
    
    setLoading(true);
    setError("");
    try {
      let queryStartDate = "";
      let queryEndDate = "";

      if (filterType === "month") {
        const paddedMonth = String(filterMonth).padStart(2, "0");
        queryStartDate = `${filterYear}-${paddedMonth}-01`;
        // Handle end of month simply (just use 31, API handles it well enough)
        queryEndDate = `${filterYear}-${paddedMonth}-31`;
      } else if (filterType === "date" && startDate && endDate) {
        queryStartDate = startDate;
        queryEndDate = endDate;
      }

      const paramsData = {
        owner: form.owner,
        repo: form.repo,
        author: form.author,
        token: token || ""
      };
      
      if (queryStartDate && queryEndDate) {
        paramsData.startDate = queryStartDate;
        paramsData.endDate = queryEndDate;
      }

      const params = new URLSearchParams(paramsData);
      const res = await fetch(`/api/module-history?${params}`);
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch module history");
      }
      
      setData(json);
      if (json.modules && Object.keys(json.modules).length > 0) {
         setExpandedMain("modules"); // Default expand "modules" if it exists, else the first one
         if (!json.modules["modules"]) {
           setExpandedMain(Object.keys(json.modules)[0]);
         }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPRList = (prs) => {
    if (!prs || prs.length === 0) return <div style={{ color: "#64748b", fontSize: "0.85rem", padding: "0.5rem 0" }}>No PRs matched in recent history.</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {prs.map((pr) => (
          <a
            key={pr.number}
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.75rem",
              background: "rgba(15, 23, 42, 0.4)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.05)",
              textDecoration: "none",
              transition: "all 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
            onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
          >
            <GitPullRequest size={16} color={pr.state === "open" ? "#34d399" : "#a855f7"} style={{ marginTop: "2px", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: "0.9rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {pr.title}
              </div>
              <div style={{ display: "flex", gap: "1rem", color: "#64748b", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                <span>#{pr.number}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {pr.date}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      <div className="glass-card" style={{ padding: "2.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ padding: "0.5rem", background: "rgba(99, 102, 241, 0.15)", borderRadius: "10px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                <Box size={22} color="var(--primary)" />
              </div>
              <h2 style={{ margin: 0 }}>Module Contribution History</h2>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Track PRs by specific main modules and sub-modules for {form.author}.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem", background: "rgba(15, 23, 42, 0.4)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="input-group" style={{ marginBottom: 0, minWidth: "160px" }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Time Period</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field" style={{ background: "rgba(0,0,0,0.3)" }}>
              <option value="all">All Time History</option>
              <option value="month">Specific Month</option>
              <option value="date">Custom Date Range</option>
            </select>
          </div>

          {filterType === "month" && (
            <>
              <div className="input-group" style={{ marginBottom: 0, minWidth: "120px" }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Month</label>
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="input-field" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0, minWidth: "100px" }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Year</label>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input-field" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {filterType === "date" && (
            <>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" style={{ colorScheme: "dark", background: "rgba(0,0,0,0.3)" }} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" style={{ colorScheme: "dark", background: "rgba(0,0,0,0.3)" }} />
              </div>
            </>
          )}

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: "0.75rem 1.5rem", height: "42px", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {loading ? <Activity size={18} className="pulse" /> : <Search size={18} />}
              {loading ? "Scanning..." : "Apply Filters & Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
          <Activity size={32} className="pulse" color="var(--primary)" style={{ margin: "0 auto 1rem auto" }} />
          <h3>Fetching Commit History & Modifying Files...</h3>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>This may take a moment to scan the GitHub API.</p>
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
             <div style={{ background: "rgba(15,23,42,0.6)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", flex: 1 }}>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.25rem" }}>Total PRs Found</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "white" }}>{data.totalPrsFound}</div>
             </div>
             <div style={{ background: "rgba(15,23,42,0.6)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", flex: 1 }}>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.25rem" }}>Files Deep Analyzed</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#34d399" }}>Top {data.analyzedPrs} PRs</div>
             </div>
          </div>

          {Object.keys(data.modules || {}).length === 0 ? (
             <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
               No module modifications found in recent PRs.
             </div>
          ) : (
            Object.entries(data.modules).sort((a,b) => b[1].count - a[1].count).map(([mainName, mainData]) => {
              const isMainOpen = expandedMain === mainName;
              return (
                <div key={mainName} className="glass-card" style={{ padding: "0", overflow: "hidden", border: isMainOpen ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                  
                  <div 
                    onClick={() => setExpandedMain(isMainOpen ? null : mainName)}
                    style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isMainOpen ? "rgba(99,102,241,0.08)" : "transparent" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <FolderGit2 size={20} color={isMainOpen ? "var(--primary)" : "#64748b"} />
                      <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "white" }}>{mainName}</span>
                      <span className="badge badge-module" style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                        {mainData.count} PRs
                      </span>
                    </div>
                    {isMainOpen ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </div>

                  {isMainOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem", background: "rgba(10, 15, 30, 0.3)" }}>
                      
                      {/* Submodules List */}
                      {Object.keys(mainData.subModules || {}).length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {Object.entries(mainData.subModules).sort((a,b) => b[1].count - a[1].count).map(([subName, subData]) => {
                             const isSubOpen = expandedSub === subName;
                             return (
                               <div key={subName} style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden", background: "rgba(15, 23, 42, 0.6)" }}>
                                 <div 
                                   onClick={() => setExpandedSub(isSubOpen ? null : subName)}
                                   style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                                 >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                      <Box size={16} color="#a855f7" />
                                      <span style={{ fontWeight: "600", color: "#e2e8f0" }}>{subName}</span>
                                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>{subData.count} PRs</span>
                                    </div>
                                    {isSubOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                 </div>
                                 {isSubOpen && (
                                   <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                                     {renderPRList(subData.prs)}
                                   </div>
                                 )}
                               </div>
                             );
                          })}
                        </div>
                      ) : (
                        <div>
                           <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600", marginBottom: "0.5rem" }}>Recent PRs in {mainName}</div>
                           {renderPRList(mainData.prs)}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
