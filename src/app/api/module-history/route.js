import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const author = searchParams.get("author");
  const token = searchParams.get("token") || process.env.GITHUB_TOKEN;

  if (!owner || !repo || !author) {
    return NextResponse.json({ error: "Missing required parameters: owner, repo, author" }, { status: 400 });
  }

  const headers = { Accept: "application/vnd.github+json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 1. Determine the actual repository to search against.
    // If the selected repo is a fork, PRs are likely opened against the upstream (parent) repo.
    let searchRepo = `${owner}/${repo}`;
    try {
      const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (repoRes.data && repoRes.data.fork && repoRes.data.parent) {
        searchRepo = repoRes.data.parent.full_name;
      }
    } catch (repoErr) {
      console.error("Could not fetch repo info to check for fork. Defaulting to provided repo.", repoErr.message);
    }

    // 2. Fetch all PRs authored by the developer in the target repository
    let query = `is:pr author:${author} repo:${searchRepo}`;
    if (startDate && endDate) {
      query += ` created:${startDate}..${endDate}`;
    }

    const searchRes = await axios.get(`https://api.github.com/search/issues`, {
      params: { q: query, per_page: 100 },
      headers
    });

    const items = searchRes.data.items || [];

    const modules = {};

    // Helper to register a PR to a module/sub-module
    const addPrToModule = (mainModule, subModule, prData) => {
      if (!modules[mainModule]) {
        modules[mainModule] = { count: 0, prMap: new Map(), subModules: {} };
      }

      // If there's a submodule, register it there
      if (subModule) {
        if (!modules[mainModule].subModules[subModule]) {
          modules[mainModule].subModules[subModule] = { count: 0, prMap: new Map() };
        }
        if (!modules[mainModule].subModules[subModule].prMap.has(prData.number)) {
          modules[mainModule].subModules[subModule].prMap.set(prData.number, prData);
          modules[mainModule].subModules[subModule].count++;
        }
      }

      // Register it to the main module
      if (!modules[mainModule].prMap.has(prData.number)) {
        modules[mainModule].prMap.set(prData.number, prData);
        modules[mainModule].count++;
      }
    };

    // Sort items by most recent
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Limit to 30 most recent PRs for deep file analysis to avoid rate limiting
    // For older ones, we'll try to infer from title/labels if needed, but for now we only process the first 30 files deeply.
    const maxDeepAnalysis = 30;
    const prsToAnalyze = items.slice(0, maxDeepAnalysis);

    // We can do this in parallel, but map with Promise.all to fetch files
    await Promise.all(prsToAnalyze.map(async (pr) => {
      try {
        const prData = {
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          date: new Date(pr.created_at).toLocaleDateString(),
          state: pr.state
        };

        const repoUrlMatch = pr.repository_url.match(/repos\/(.+)$/);
        const dynamicRepo = repoUrlMatch ? repoUrlMatch[1] : `${owner}/${repo}`;

        const filesRes = await axios.get(`https://api.github.com/repos/${dynamicRepo}/pulls/${pr.number}/files`, {
          params: { per_page: 100 },
          headers
        });

        const files = filesRes.data || [];

        let matchedAnyModule = false;

        files.forEach(f => {
          const path = f.filename;

          // UPYOG-djb typical structure: frontend/micro-ui/web/micro-ui-internals/packages/{mainModule}/{subModule}/...
          const pkgMatch = path.match(/packages\/([^/]+)(?:\/([^/]+))?/);
          if (pkgMatch) {
            const mainModule = pkgMatch[1];
            // If main module is "modules", there should be a submodule
            const subModule = (mainModule === "modules" && pkgMatch[2]) ? pkgMatch[2] : null;
            addPrToModule(mainModule, subModule, prData);
            matchedAnyModule = true;
          } else {
            // Fallback for root level or backend files
            const rootMatch = path.match(/^([^/]+)/);
            if (rootMatch) {
              addPrToModule(rootMatch[1], null, prData);
              matchedAnyModule = true;
            }
          }
        });

        // If no files matched our pattern, put it in "Other"
        if (!matchedAnyModule) {
          addPrToModule("Other", null, prData);
        }

      } catch (fileErr) {
        console.error(`Error fetching files for PR #${pr.number}:`, fileErr.message);
        // Fallback: put in unknown
        addPrToModule("Unknown", null, {
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          date: new Date(pr.created_at).toLocaleDateString(),
          state: pr.state
        });
      }
    }));

    // Convert Maps to arrays for JSON response
    const result = {
      totalPrsFound: items.length,
      analyzedPrs: prsToAnalyze.length,
      modules: {}
    };

    for (const [mainName, mainData] of Object.entries(modules)) {
      const subMods = {};
      for (const [subName, subData] of Object.entries(mainData.subModules)) {
        subMods[subName] = {
          count: subData.count,
          prs: Array.from(subData.prMap.values()).sort((a, b) => b.number - a.number)
        };
      }

      result.modules[mainName] = {
        count: mainData.count,
        prs: Array.from(mainData.prMap.values()).sort((a, b) => b.number - a.number),
        subModules: subMods
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Module History Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch module history." }, { status: 500 });
  }
}
