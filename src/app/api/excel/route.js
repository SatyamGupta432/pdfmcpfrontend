import { NextResponse } from "next/server";
import axios from "axios";
import ExcelJS from "exceljs";

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

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Monthly Report");

    sheet.columns = [
      { header: "Commit SHA", key: "sha", width: 25 },
      { header: "Author", key: "author", width: 20 },
      { header: "Message", key: "message", width: 60 },
      { header: "Date", key: "date", width: 30 },
      { header: "URL", key: "url", width: 50 },
    ];

    commits.forEach((commit) => {
      const message = commit.commit?.message || "";
      const commitAuthor = commit.commit?.author?.name || "Unknown";
      const date = commit.commit?.author?.date || "";
      const sha = commit.sha;
      const url = commit.html_url;

      sheet.addRow({
        sha,
        author: commitAuthor,
        message,
        date,
        url,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${repo}-${author}-${month}-${year}.xlsx"`,
      },
    });
  } catch (error) {
    console.error(
      "Error generating excel:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.status === 404
        ? `Repository '${owner}/${repo}' or commits not found.`
        : "Failed to fetch commits from GitHub or generate Excel report.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
