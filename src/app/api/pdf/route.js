import { NextResponse } from "next/server";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const author = searchParams.get("author");
  const month = parseInt(searchParams.get("month") || "1", 10);
  const year = parseInt(searchParams.get("year") || "2026", 10);

  if (!owner || !repo || !author) {
    return NextResponse.json(
      { error: "Missing required parameters: owner, repo, author" },
      { status: 400 }
    );
  }

  try {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00Z`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31T23:59:59Z`;

    const headers = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        params: {
          since: startDate,
          until: endDate,
          author: author,
          per_page: 100,
        },
        headers,
      }
    );

    const commits = response.data;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(`${repo} Developer Monthly Report`, 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Developer: ${author}`, 14, 32);
    doc.text(`Month: ${month}/${year}`, 14, 40);
    doc.text(`Total Commits: ${commits.length}`, 14, 48);

    const tableData = commits.map((commit, index) => [
      index + 1,
      commit.sha.substring(0, 7),
      commit.commit?.author?.name || "Unknown",
      commit.commit?.author?.date
        ? new Date(commit.commit.author.date).toLocaleDateString()
        : "",
      commit.commit?.message || "",
    ]);

    autoTable(doc, {
      startY: 56,
      head: [["#", "SHA", "Author", "Date", "Message"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [99, 102, 241] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: "auto" },
      },
    });

    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${repo}-${author}-${month}-${year}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      "Error generating PDF:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.status === 404
        ? `Repository '${owner}/${repo}' or commits not found.`
        : "Failed to fetch commits from GitHub or generate PDF report.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
