"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import AnalyticsView from "@/components/AnalyticsView";
import LeaderboardView from "@/components/LeaderboardView";
import LoginView from "@/components/LoginView";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [userRepos, setUserRepos] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({
    owner: "SatyamGupta432",
    repo: "UPYOG-djb",
    author: "SatyamGupta432",
    month: 5,
    year: 2026,
  });

  const [loading, setLoading] = useState({ analyze: false, pdf: false, excel: false });
  const [data, setData] = useState(null);

  useEffect(() => {
    const now = new Date();
    setForm((prev) => ({
      ...prev,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }));

    const savedToken = localStorage.getItem("gh_token");
    const savedUser = localStorage.getItem("gh_user");
    if (savedToken && savedUser) {
      setUserToken(savedToken);
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
      setForm((prev) => ({ ...prev, owner: savedUser, author: savedUser }));
    }
  }, []);

  const handleLoginSuccess = (token, username, repoList) => {
    setUserToken(token);
    setCurrentUser(username);
    setUserRepos(repoList);
    setIsLoggedIn(true);
    if (repoList && repoList.length > 0) {
      setForm((prev) => ({
        ...prev,
        owner: repoList[0].owner,
        repo: repoList[0].repo,
        author: username,
      }));
    } else {
      setForm((prev) => ({ ...prev, owner: username, author: username }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gh_token");
    localStorage.removeItem("gh_user");
    setUserToken("");
    setCurrentUser("");
    setUserRepos([]);
    setIsLoggedIn(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleAnalyze = async () => {
    setLoading((prev) => ({ ...prev, analyze: true }));
    try {
      const params = new URLSearchParams({ ...form, token: userToken }).toString();
      const res = await fetch(`/api/analyze?${params}`);
      if (!res.ok) {
        throw new Error("Failed to analyze repository data.");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Failed to analyze repository. Please check your network connection or credentials.");
    } finally {
      setLoading((prev) => ({ ...prev, analyze: false }));
    }
  };

  const handleDownload = async (type) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const queryParams = new URLSearchParams({ ...form, token: userToken }).toString();
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

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%" }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} owner={form.owner} />
      <div style={{ display: "flex", flex: 1, width: "100%", position: "relative" }}>
        <div style={{ display: "flex", width: "100%", minHeight: "100%" }}>
          <div className="sidebar-container" style={{ flexShrink: 0 }}>
            <Sidebar
              form={form}
              setForm={setForm}
              userRepos={userRepos}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          </div>
          <main className="main-container" style={{ flex: 1, padding: "2.5rem 2rem", width: "100%", overflowX: "hidden" }}>
            {activeTab === "dashboard" && (
              <DashboardView
                form={form}
                handleChange={handleChange}
                setPastMonth={setPastMonth}
                loading={loading}
                handleDownload={handleDownload}
                data={data}
                onAnalyze={handleAnalyze}
              />
            )}
            {activeTab === "analytics" && <AnalyticsView data={data} />}
            {activeTab === "leaderboard" && <LeaderboardView owner={form.owner} repo={form.repo} />}
          </main>
        </div>
      </div>
    </div>
  );
}
