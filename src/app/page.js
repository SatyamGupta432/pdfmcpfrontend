"use client";

import { useState, useEffect } from "react";
import { FileSpreadsheet, FileText, GitBranch, Calendar, User, BookOpen, ChevronRight } from "lucide-react";

export default function Home() {

  const [form, setForm] = useState({
    owner: "SatyamGupta432",
    repo: "UPYOG-djb",
    author: "SatyamGupta432",
    month: 1,
    year: 2024,
  });

  useEffect(() => {
    const now = new Date();
    setForm(prev => ({
      ...prev,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }));
  }, []);

  const [loading, setLoading] = useState({ pdf: false, excel: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = async (type) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const queryParams = new URLSearchParams(form).toString();
      const url = `/api/${type}?${queryParams}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to download ${type.toUpperCase()}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const ext = type === "excel" ? "xlsx" : "pdf";
      link.download = `${form.repo}-${form.author}-${form.month}-${form.year}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(error.message || `Failed to download ${type.toUpperCase()}. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const setPastMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    setForm((prev) => ({
      ...prev,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }));
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="glass-card">
      <header style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ padding: "0.5rem", background: "var(--primary)", borderRadius: "10px" }}>
            <GitBranch size={24} color="white" />
          </div>
          <h1>Report Center</h1>
        </div>
        <p className="subtitle">Generate and download GitHub activity reports</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-group">
          <label><User size={14} style={{ marginRight: "4px" }} /> Repository Owner</label>
          <input
            type="text"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. SatyamGupta432"
          />
        </div>

        <div className="input-group">
          <label><BookOpen size={14} style={{ marginRight: "4px" }} /> Repository Name</label>
          <input
            type="text"
            name="repo"
            value={form.repo}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. UPYOG-djb"
          />
        </div>

        <div className="input-group">
          <label><User size={14} style={{ marginRight: "4px" }} /> Author Username</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. SatyamGupta432"
          />
        </div>

        <div className="grid-cols-2">
          <div className="input-group">
            <label><Calendar size={14} style={{ marginRight: "4px" }} /> Month</label>
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="input-field"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label><Calendar size={14} style={{ marginRight: "4px" }} /> Year</label>
            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              className="input-field"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="button" 
          onClick={setPastMonth}
          style={{ 
            background: "none", 
            border: "none", 
            color: "var(--primary)", 
            fontSize: "0.75rem", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            marginBottom: "1rem"
          }}
        >
          Quick select past month <ChevronRight size={12} />
        </button>

        <div className="btn-container">
          <button
            type="button"
            className="btn btn-excel"
            onClick={() => handleDownload("excel")}
            disabled={loading.excel}
          >
            {loading.excel ? "Generating..." : <><FileSpreadsheet size={18} /> Excel</>}
          </button>
          <button
            type="button"
            className="btn btn-pdf"
            onClick={() => handleDownload("pdf")}
            disabled={loading.pdf}
          >
            {loading.pdf ? "Generating..." : <><FileText size={18} /> PDF</>}
          </button>
        </div>
      </form>

      <footer style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.75rem", color: "#64748b" }}>
        Powered by PDFMCP Backend
      </footer>
    </div>
  );
}
