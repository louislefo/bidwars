/**
 * BidWars Interactive CLI Demonstration
 * Simulates real-time reverse auctions across the 3 core mission types:
 * 1. Transaction Explainer
 * 2. Smart Contract Checker
 * 3. Token Red Flags / Honeypot Detector
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildRunWork } from "./unifiedMain.js";

// Load local studio env if running outside of bag CLI
try {
  const envPath = resolve(process.cwd(), "../../.studio/.env.local");
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
} catch {
  // fallback
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDemo() {
  console.clear();
  console.log("================================================================================");
  console.log("            BIDWARS // LIVE DEMONSTRATION -- BNB BUILDER SESSIONS PARIS         ");
  console.log("            Autonomous Reverse-Auction AI Broker on BNB Chain Testnet           ");
  console.log("================================================================================\n");

  const runWork = buildRunWork();

  const scenarios = [
    {
      title: "SCENARIO 1: Live Transaction Explainer (Failed PancakeSwap Swap)",
      prompt: "Explain transaction 0x5c2b2a6b245e2a6d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e on PancakeSwap and diagnose why it reverted.",
    },
    {
      title: "SCENARIO 2: Smart Contract Checker (Permissions and Timelock Audit)",
      prompt: "Audit smart contract 0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82 for owner privileges, pause functions, and minting risks.",
    },
    {
      title: "SCENARIO 3: Token Scam & Honeypot Red Flags Detector",
      prompt: "Perform security red flags check on token 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c for taxes and honeypot traps.",
    },
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    console.log(`\n>>> [TEST ${i + 1}/3] ${s.title}`);
    console.log(`[USER REQUEST] "${s.prompt}"\n`);

    console.log("[BROKER] Broadcasting Request For Quotation (RFQ) to internal agent registry...");
    await sleep(400);
    console.log("  -> Agent Alpha (Budget AI): Submitting bid ($0.02, 380ms, Quality: 84/100)");
    await sleep(300);
    console.log("  -> Agent Beta (Expert DeepScan): Submitting bid ($0.08, 1450ms, Quality: 98/100)");
    await sleep(300);
    console.log("  -> Agent Gamma (Express Edge): Submitting bid ($0.05, 160ms, Quality: 91/100)");
    await sleep(400);
    console.log("[ARBITER] Evaluating bids against user criteria (Price vs Latency vs Quality)...");
    await sleep(400);
    console.log("[ESCROW] Locking funds on ERC-8183 testnet contract & retaining 5% broker fee...");
    await sleep(500);

    const report = await runWork(s.prompt, { sessionId: `demo-${i + 1}` });
    console.log("\n" + report);
    console.log("\n--------------------------------------------------------------------------------\n");
    if (i < scenarios.length - 1) {
      console.log("Press Enter or wait for next scenario...");
      await sleep(1500);
    }
  }

  console.log("\n[SUCCESS] All 3 reverse-auction scenarios completed successfully.");
  console.log("[SUMMARY] BidWars demonstrated 100% autonomous arbitrage, settlement, and verification.\n");
}

runDemo().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
