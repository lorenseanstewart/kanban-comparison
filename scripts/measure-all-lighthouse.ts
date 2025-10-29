#!/usr/bin/env tsx

/**
 * Measure all frameworks and compile Lighthouse scores
 */

import { execSync } from "child_process";

const frameworks = [
  "Next.js",
  "Next.js + Compiler",
  "Nuxt",
  "Analog",
  "SolidStart",
  "SvelteKit",
  "Qwik",
  "Astro",
  "TanStack Start",
  "TanStack Start + Solid",
  "Marko",
  "Datastar",
];

interface MeasurementResult {
  framework: string;
  page: "home" | "board";
  jsTransferred: number;
  performanceScore: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
  si: number;
}

async function main() {
  const NUM_RUNS = 5;
  const allResults: Record<string, MeasurementResult[]> = {};

  for (const framework of frameworks) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 Measuring ${framework} (${NUM_RUNS} runs)`);
    console.log(`${"=".repeat(60)}\n`);
    allResults[framework] = [];

    for (let run = 1; run <= NUM_RUNS; run++) {
      console.log(`\n🔄 Run ${run}/${NUM_RUNS}...`);

      try {
        const output = execSync(
          `tsx scripts/measure-single.ts "${framework}"`,
          {
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024,
            stdio: ["pipe", "pipe", "inherit"], // Show stderr in real-time
          },
        );

        const results = JSON.parse(output);

        for (const result of results) {
          allResults[framework].push({
            framework: result.framework,
            page: result.page,
            jsTransferred: result.jsTransferred,
            performanceScore: result.performanceScore,
            fcp: result.fcp,
            lcp: result.lcp,
            tbt: result.tbt,
            cls: result.cls,
            si: result.si,
          });
        }
      } catch (error) {
        console.error(`❌ Failed run ${run}:`, error);
      }
    }

    // Show intermediate results for this framework
    const homeResults = allResults[framework].filter((r) => r.page === "home");
    const boardResults = allResults[framework].filter((r) =>
      r.page === "board"
    );

    if (homeResults.length > 0) {
      const avgHomeScore = Math.round(
        homeResults.reduce((sum, r) => sum + r.performanceScore, 0) /
          homeResults.length,
      );
      const avgHomeJS = Math.round(
        homeResults.reduce((sum, r) => sum + r.jsTransferred, 0) /
          homeResults.length,
      );
      console.log(
        `\n✅ ${framework} Home Average: ${
          (avgHomeJS / 1024).toFixed(1)
        } kB | Score: ${avgHomeScore}`,
      );
    }

    if (boardResults.length > 0) {
      const avgBoardScore = Math.round(
        boardResults.reduce((sum, r) => sum + r.performanceScore, 0) /
          boardResults.length,
      );
      const avgBoardJS = Math.round(
        boardResults.reduce((sum, r) => sum + r.jsTransferred, 0) /
          boardResults.length,
      );
      console.log(
        `✅ ${framework} Board Average: ${
          (avgBoardJS / 1024).toFixed(1)
        } kB | Score: ${avgBoardScore}\n`,
      );
    }
  }

  // Calculate averages
  const averages: MeasurementResult[] = [];

  for (const framework of frameworks) {
    const frameworkResults = allResults[framework];
    if (frameworkResults.length === 0) continue;

    const homeResults = frameworkResults.filter((r) => r.page === "home");
    const boardResults = frameworkResults.filter((r) => r.page === "board");

    if (homeResults.length > 0) {
      averages.push({
        framework,
        page: "home",
        jsTransferred: Math.round(
          homeResults.reduce((sum, r) => sum + r.jsTransferred, 0) /
            homeResults.length,
        ),
        performanceScore: Math.round(
          homeResults.reduce((sum, r) => sum + r.performanceScore, 0) /
            homeResults.length,
        ),
        fcp: Math.round(
          homeResults.reduce((sum, r) => sum + r.fcp, 0) / homeResults.length,
        ),
        lcp: Math.round(
          homeResults.reduce((sum, r) => sum + r.lcp, 0) / homeResults.length,
        ),
        tbt: Math.round(
          homeResults.reduce((sum, r) => sum + r.tbt, 0) / homeResults.length,
        ),
        cls: Math.round(
          homeResults.reduce((sum, r) => sum + r.cls, 0) * 1000 /
            homeResults.length,
        ) / 1000,
        si: Math.round(
          homeResults.reduce((sum, r) => sum + r.si, 0) / homeResults.length,
        ),
      });
    }

    if (boardResults.length > 0) {
      averages.push({
        framework,
        page: "board",
        jsTransferred: Math.round(
          boardResults.reduce((sum, r) => sum + r.jsTransferred, 0) /
            boardResults.length,
        ),
        performanceScore: Math.round(
          boardResults.reduce((sum, r) => sum + r.performanceScore, 0) /
            boardResults.length,
        ),
        fcp: Math.round(
          boardResults.reduce((sum, r) => sum + r.fcp, 0) / boardResults.length,
        ),
        lcp: Math.round(
          boardResults.reduce((sum, r) => sum + r.lcp, 0) / boardResults.length,
        ),
        tbt: Math.round(
          boardResults.reduce((sum, r) => sum + r.tbt, 0) / boardResults.length,
        ),
        cls: Math.round(
          boardResults.reduce((sum, r) => sum + r.cls, 0) * 1000 /
            boardResults.length,
        ) / 1000,
        si: Math.round(
          boardResults.reduce((sum, r) => sum + r.si, 0) / boardResults.length,
        ),
      });
    }
  }

  // Group by page
  const homeResults = averages.filter((r) => r.page === "home")
    .sort((a, b) => a.performanceScore - b.performanceScore);
  const boardResults = averages.filter((r) => r.page === "board")
    .sort((a, b) => a.performanceScore - b.performanceScore);

  console.log("\n\n📈 LIGHTHOUSE PERFORMANCE SCORES\n");
  console.log("Homepage:");
  console.log(
    "Framework                | Score | FCP    | LCP    | TBT   | CLS   | SI",
  );
  console.log(
    "------------------------|-------|--------|--------|-------|-------|-------",
  );

  for (const r of homeResults.reverse()) {
    console.log(
      `${r.framework.padEnd(23)} | ${
        String(r.performanceScore).padStart(5)
      } | ${String(r.fcp).padStart(6)} | ${String(r.lcp).padStart(6)} | ${
        String(r.tbt).padStart(5)
      } | ${String(r.cls).padStart(5)} | ${String(r.si).padStart(5)}`,
    );
  }

  console.log("\nBoard Page:");
  console.log(
    "Framework                | Score | FCP    | LCP    | TBT   | CLS   | SI",
  );
  console.log(
    "------------------------|-------|--------|--------|-------|-------|-------",
  );

  for (const r of boardResults.reverse()) {
    console.log(
      `${r.framework.padEnd(23)} | ${
        String(r.performanceScore).padStart(5)
      } | ${String(r.fcp).padStart(6)} | ${String(r.lcp).padStart(6)} | ${
        String(r.tbt).padStart(5)
      } | ${String(r.cls).padStart(5)} | ${String(r.si).padStart(5)}`,
    );
  }

  // Output JSON
  console.log("\n\nJSON Output:");
  console.log(
    JSON.stringify({ home: homeResults, board: boardResults }, null, 2),
  );
}

main().catch(console.error);
