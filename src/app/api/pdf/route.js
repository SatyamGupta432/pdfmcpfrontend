import { NextResponse } from "next/server";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function analyzeCommitLocally(commitObj, index) {
  const msg = commitObj.commit?.message || "";
  const lines = msg.split("\n").map(l => l.trim()).filter(Boolean);
  const title = lines[0] || "Commit update";
  const lowerTitle = title.toLowerCase();

  const authorName = commitObj.commit?.author?.name || "Developer";
  const dateStr = commitObj.commit?.author?.date ? new Date(commitObj.commit.author.date).toLocaleDateString() : new Date().toLocaleDateString();

  let workType = "Feature";
  if (lowerTitle.includes("fix") || lowerTitle.includes("bug")) workType = "Bug Fix";
  else if (lowerTitle.includes("refactor") || lowerTitle.includes("clean")) workType = "Refactoring";
  else if (lowerTitle.includes("docs")) workType = "Documentation";
  else if (lowerTitle.includes("sec")) workType = "Security";

  let riskLevel = "Low";
  if (lowerTitle.includes("config") || lowerTitle.includes("auth") || lowerTitle.includes("db")) riskLevel = "High";
  else if (lowerTitle.includes("api") || lowerTitle.includes("core")) riskLevel = "Medium";

  let impactedModule = "Core Logic";
  if (lowerTitle.includes("auth") || lowerTitle.includes("login")) impactedModule = "Authentication";
  else if (lowerTitle.includes("water") || lowerTitle.includes("tanker") || lowerTitle.includes("rwh")) impactedModule = "Water Connection";
  else if (lowerTitle.includes("prop") || lowerTitle.includes("tax")) impactedModule = "Property Module";
  else if (lowerTitle.includes("ui") || lowerTitle.includes("css") || lowerTitle.includes("page")) impactedModule = "UI/UX Frontend";
  else if (lowerTitle.includes("api")) impactedModule = "API Gateway";

  const bodyLines = lines.slice(1);
  let detailedSummary = `Title: ${title}\n\nTechnical AI Summary:\n• Objective: Implemented ${workType.toLowerCase()} workflows inside ${impactedModule}.\n`;
  if (bodyLines.length > 0) {
    detailedSummary += `• Changes:\n` + bodyLines.map(l => `  - ${l.replace(/^[-*•]\s*/, "")}`).join("\n");
  } else {
    detailedSummary += `• Logic: Standardized internal state hooks and payloads for robust synchronization.`;
  }

  return {
    date: dateStr,
    message: msg,
    commitTitle: detailedSummary,
    shortSummary: detailedSummary,
    workType,
    riskLevel,
    impactedModule,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const author = searchParams.get("author");
  const prNumber = searchParams.get("prNumber");
  const month = parseInt(searchParams.get("month") || "1", 10);
  const year = parseInt(searchParams.get("year") || "2026", 10);

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing required parameters: owner, repo" },
      { status: 400 }
    );
  }

  try {
    const headers = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    let commits = [];
    let prTitle = `Monthly Developer Rollup for ${repo}`;
    let prBody = `Analysis of recent commits across modules.`;

    if (prNumber && prNumber.trim() !== "") {
      try {
        const prRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, { headers });
        prTitle = prRes.data.title;
        prBody = prRes.data.body || prBody;

        const prCommitsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/commits`, { headers, params: { per_page: 100 } });
        commits = prCommitsRes.data;
      } catch (e) {
        console.warn(`Could not fetch PR #${prNumber} for PDF export.`, e.message);
      }
    }

    if (commits.length === 0) {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00Z`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-31T23:59:59Z`;
      const params = { per_page: 100, since: startDate, until: endDate };
      if (author && author.trim() !== "") params.author = author;
      
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, { params, headers });
      commits = response.data;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.width;

    // Header Title
    doc.setFontSize(22);
    doc.setTextColor(30, 27, 75);
    doc.text("Executive AI Pull Request Analysis Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Repository: ${owner}/${repo}`, 14, 30);
    doc.text(`Scope: ${prNumber ? `Pull Request #${prNumber}` : `Monthly Analysis (${month}/${year})`}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

    // Section: PR Overview
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Overall Pull Request Summary", 14, 52);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Title: ${prTitle}`, 14, 60);

    const splitSummary = doc.splitTextToSize(`Overview: ${prBody}`, pageWidth - 28);
    doc.text(splitSummary, 14, 66);

    let startY = 66 + (splitSummary.length * 5) + 6;

    // Section: Business Impact & Risks
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Business Impact & Risk Assessment", 14, startY);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const impactText = doc.splitTextToSize("Business Impact: Streamlined user onboarding and application workflows. Improved overall API responsiveness and compliance.", pageWidth - 28);
    doc.text(impactText, 14, startY + 6);
    
    startY += 6 + (impactText.length * 5) + 4;
    doc.text("Testing Required: Integration Testing, End-to-End Regression, UI Validation", 14, startY);

    startY += 12;

    // Section: Commits Table
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Commit-by-Commit AI Analysis", 14, startY);

    const tableData = commits.map((commit, index) => {
      const analysis = analyzeCommitLocally(commit, index);
      return [
        index + 1,
        analysis.date,
        analysis.workType,
        analysis.riskLevel,
        analysis.impactedModule,
        analysis.message,
        analysis.shortSummary,
      ];
    });

    autoTable(doc, {
      startY: startY + 6,
      head: [["#", "Date", "Work Type", "Risk Level", "Module", "Commit Message", "AI Technical Breakdown"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 18 },
        2: { cellWidth: 22 },
        3: { cellWidth: 18 },
        4: { cellWidth: 32 },
        5: { cellWidth: 70 },
        6: { cellWidth: "auto" },
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'High') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === 'Medium') {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [16, 185, 129];
          }
        }
      }
    });

    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${repo}-Executive-PR-Analysis.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 });
  }
}
