import express from "express";
import type { RunWork } from "./sellerCore.js";
import {
  detectTaskCategory,
  runReverseAuction,
} from "./auctionEngine.js";

export function createDashboardRouter(runWork: RunWork): express.Router {
  const router = express.Router();

  router.use(express.text({ type: "*/*" }));

  router.post("/api/auction", async (req, res) => {
    try {
      let prompt = "Explain transaction 0x5c2b2a6b245e2a6d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e";
      const raw = req.body;

      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.prompt === "string") prompt = parsed.prompt;
          else if (parsed && typeof parsed.text === "string") prompt = parsed.text;
          else if (raw.trim().length > 0 && !raw.trim().startsWith("{")) prompt = raw;
        } catch {
          if (raw.trim().length > 0) prompt = raw;
        }
      } else if (raw && typeof raw === "object" && typeof raw.prompt === "string") {
        prompt = raw.prompt;
      }

      const detected = detectTaskCategory(prompt);
      const auction = runReverseAuction(detected.category, detected.target);
      const reportMarkdown = await runWork(prompt, { sessionId: `web-${Date.now()}` });

      res.json({
        ok: true,
        auction,
        reportMarkdown,
      });
    } catch (err) {
      console.error("[dashboard] Error:", err);
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get("/arena", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(arenaHtml);
  });

  router.get(["/dashboard", "/"], (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(dashboardHtml);
  });

  return router;
}

const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BidWars // Retro Arcade Broker</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;700&display=swap');
    body { background-color: #030712; color: #FFFFFF; font-family: 'Press Start 2P', monospace; user-select: none; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .crt-line {
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.28) 50%);
      background-size: 100% 4px;
      pointer-events: none;
    }
    .retro-box {
      background-color: #0F172A;
      border: 3px solid #334155;
      box-shadow: 4px 4px 0px #000000;
    }
    .btn-press:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px #000000;
    }
    .pulse-glow {
      animation: neonPulse 1.8s infinite alternate;
    }
    @keyframes neonPulse {
      0% { box-shadow: 0 0 4px #F0B90B, 4px 4px 0px #000; }
      100% { box-shadow: 0 0 14px #F0B90B, 4px 4px 0px #000; }
    }
    .blink { animation: blinker 1s linear infinite; }
    @keyframes blinker { 50% { opacity: 0; } }
    canvas { image-rendering: pixelated; }
  </style>
</head>
<body class="min-h-screen p-3 md:p-6 flex flex-col items-center justify-between relative bg-black">
  <div class="crt-line fixed inset-0 z-40 pointer-events-none"></div>

  <div class="w-full max-w-5xl space-y-4 z-10">

    <!-- Top Retro Arcade Cabinet Header -->
    <header class="flex flex-col md:flex-row justify-between items-center pb-3 border-b-4 border-gray-800 gap-3">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        <div>
          <div class="text-[9px] text-amber-400">BNB CHAIN // ERC-8183 ESCROW // ERC-8004</div>
          <h1 class="text-lg md:text-xl text-white tracking-wider">
            BIDWARS <span class="text-amber-400">[5% BROKER]</span>
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-[9px] text-gray-400 mono hidden sm:block">
          CREDIT <span class="text-amber-400 font-bold">01</span> // INSERT COIN
        </div>
        <a href="/arena" class="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded retro-box btn-press pulse-glow transition">
          &gt;&gt; TANK ARENA (45S) &lt;&lt;
        </a>
      </div>
    </header>

    <!-- Interactive Launch & Test Bench -->
    <div class="retro-box p-3 rounded bg-slate-900 border-2 border-amber-400/80">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 mb-2 border-b border-gray-800 gap-2">
        <div class="text-[10px] text-amber-400 font-bold">
          [TESTS DE LANCEMENT EXPRESS] // PITCH BENCH
        </div>
        <div class="flex items-center gap-2 text-[9px] mono">
          <span class="text-gray-400">MODE:</span>
          <button id="modeToggleBtn" onclick="toggleDemoMode()" class="px-2.5 py-1 bg-amber-400 text-black font-bold rounded">
            DEMO FAST (0.3s)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button onclick="runTestPreset(1)" class="p-2.5 bg-gray-950 hover:bg-blue-950 border-2 border-blue-500/70 text-left rounded btn-press">
          <div class="text-[8px] text-blue-400">TEST 1</div>
          <div class="text-[10px] text-white font-bold">TX REVERT</div>
          <div class="text-[7px] text-gray-400 mt-1 mono">Alpha $0.02 (Budget)</div>
        </button>

        <button onclick="runTestPreset(2)" class="p-2.5 bg-gray-950 hover:bg-red-950 border-2 border-red-500/70 text-left rounded btn-press">
          <div class="text-[8px] text-red-400">TEST 2</div>
          <div class="text-[10px] text-white font-bold">DEEP AUDIT</div>
          <div class="text-[7px] text-gray-400 mt-1 mono">Beta $0.08 (Expert)</div>
        </button>

        <button onclick="runTestPreset(3)" class="p-2.5 bg-gray-950 hover:bg-amber-950 border-2 border-amber-500/70 text-left rounded btn-press">
          <div class="text-[8px] text-amber-400">TEST 3</div>
          <div class="text-[10px] text-white font-bold">HONEYPOT SCAN</div>
          <div class="text-[7px] text-gray-400 mt-1 mono">Gamma 160ms (Speed)</div>
        </button>

        <button onclick="runStressBenchmark()" class="p-2.5 bg-gray-950 hover:bg-purple-950 border-2 border-purple-500 text-left rounded btn-press pulse-glow">
          <div class="text-[8px] text-purple-400">BENCHMARK</div>
          <div class="text-[10px] text-white font-bold">3-WAY BATTLE</div>
          <div class="text-[7px] text-gray-400 mt-1 mono">Stress test cycle</div>
        </button>
      </div>
    </div>

    <!-- 3 Competing Tank Agents Arcade Roster -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-[9px]">
      <!-- Agent Alpha -->
      <div id="c_alpha" class="retro-box p-3 rounded border-blue-500/60 bg-slate-900/80 transition-all">
        <div class="flex items-center justify-between mb-2 pb-1 border-b border-gray-800">
          <div class="flex items-center gap-2">
            <span class="inline-block w-3 h-3 bg-blue-500 border border-white"></span>
            <span class="text-blue-400 font-bold">ALPHA (BUDGET)</span>
          </div>
          <span id="b_alpha" class="text-gray-500 font-bold text-[8px]">IDLE</span>
        </div>
        <div class="text-[9px] text-gray-300 mono flex justify-between">
          <span>PRICE: $0.02</span>
          <span>LAT: 380MS</span>
        </div>
        <div class="text-[8px] text-blue-300/80 mt-1 mono">WEAPON: RAPID TRIPLE SHOT</div>
      </div>

      <!-- Agent Beta -->
      <div id="c_beta" class="retro-box p-3 rounded border-red-500/60 bg-slate-900/80 transition-all">
        <div class="flex items-center justify-between mb-2 pb-1 border-b border-gray-800">
          <div class="flex items-center gap-2">
            <span class="inline-block w-3 h-3 bg-red-500 border border-white"></span>
            <span class="text-red-400 font-bold">BETA (EXPERT)</span>
          </div>
          <span id="b_beta" class="text-gray-500 font-bold text-[8px]">IDLE</span>
        </div>
        <div class="text-[9px] text-gray-300 mono flex justify-between">
          <span>PRICE: $0.08</span>
          <span>LAT: 1450MS</span>
        </div>
        <div class="text-[8px] text-red-300/80 mt-1 mono">WEAPON: HEAVY CANNON BALL</div>
      </div>

      <!-- Agent Gamma -->
      <div id="c_gamma" class="retro-box p-3 rounded border-amber-500/60 bg-slate-900/80 transition-all">
        <div class="flex items-center justify-between mb-2 pb-1 border-b border-gray-800">
          <div class="flex items-center gap-2">
            <span class="inline-block w-3 h-3 bg-amber-400 border border-black"></span>
            <span class="text-amber-400 font-bold">GAMMA (SPEED)</span>
          </div>
          <span id="b_gamma" class="text-gray-500 font-bold text-[8px]">IDLE</span>
        </div>
        <div class="text-[9px] text-gray-300 mono flex justify-between">
          <span>PRICE: $0.05</span>
          <span>LAT: 160MS</span>
        </div>
        <div class="text-[8px] text-amber-300/80 mt-1 mono">WEAPON: PIERCING LASER</div>
      </div>
    </div>

    <!-- VISUAL RETRO CHARTS COCKPIT -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Chart 1: Multi-Agent Comparative Metrics -->
      <div class="retro-box p-3 rounded bg-black/90 border-2 border-gray-700 flex flex-col justify-between">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-gray-800 text-[9px]">
          <span class="text-amber-400 font-bold">&gt; METRICS COMPARATOR &lt;</span>
          <span class="text-gray-400 mono text-[8px]">SCORE / EFFICIENCY</span>
        </div>
        <canvas id="metricsChart" width="450" height="170" class="w-full h-auto bg-slate-950 border border-gray-800 rounded"></canvas>
        <div class="flex justify-around text-[7px] mono text-gray-400 mt-2">
          <span class="text-blue-400">■ ALPHA</span>
          <span class="text-red-400">■ BETA</span>
          <span class="text-amber-400">■ GAMMA</span>
        </div>
      </div>

      <!-- Chart 2: Protocol Escrow & Fee Breakdown -->
      <div class="retro-box p-3 rounded bg-black/90 border-2 border-gray-700 flex flex-col justify-between">
        <div class="flex justify-between items-center pb-2 mb-2 border-b border-gray-800 text-[9px]">
          <span class="text-emerald-400 font-bold">&gt; ESCROW FLOW & 5% FEE &lt;</span>
          <span id="cumulativeFees" class="text-amber-400 mono text-[8px]">TREASURY: +$0.0125</span>
        </div>
        <canvas id="escrowChart" width="450" height="170" class="w-full h-auto bg-slate-950 border border-gray-800 rounded"></canvas>
        <div class="flex justify-around text-[7px] mono text-gray-400 mt-2">
          <span class="text-emerald-400">■ 95% AGENT NET</span>
          <span class="text-amber-400">■ 5% BIDWARS BROKER</span>
        </div>
      </div>
    </div>

    <!-- Custom Prompt Arcade Bar -->
    <div class="flex gap-2 retro-box p-2.5 rounded bg-gray-900 border-2 border-gray-700">
      <span class="text-amber-400 text-xs px-2 py-2 select-none">&gt;</span>
      <input id="promptInput" type="text" placeholder="Entrez un prompt, tx hash ou contrat..." 
             class="flex-1 bg-black text-[10px] mono px-3 py-2 text-white border border-gray-700 rounded focus:outline-none focus:border-amber-400" />
      <button id="runBtn" onclick="runAuction()" class="px-5 py-2 bg-amber-400 hover:bg-yellow-300 text-black text-[10px] font-bold rounded retro-box btn-press">
        START AUCTION
      </button>
    </div>

    <!-- Arcade Escrow Financial Stats -->
    <div class="retro-box p-3 rounded grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-[10px] mono bg-black/80 border-2 border-gray-700">
      <div>
        <div class="text-gray-500 text-[8px]">WINNING BID (ESCROW):</div>
        <div id="resPrice" class="text-white font-bold mt-1 text-sm">-</div>
      </div>
      <div>
        <div class="text-amber-400 text-[8px]">BIDWARS FEE (5%):</div>
        <div id="resFee" class="text-amber-400 font-bold mt-1 text-sm">-</div>
      </div>
      <div>
        <div class="text-emerald-400 text-[8px]">NET PAYOUT TO AGENT:</div>
        <div id="resNet" class="text-emerald-400 font-bold mt-1 text-sm">-</div>
      </div>
    </div>

    <!-- Deliverable Retro CRT Terminal -->
    <div class="retro-box p-3 rounded h-60 flex flex-col font-mono text-[11px] bg-slate-950 border-2 border-gray-800">
      <div class="text-amber-400 text-[9px] pb-2 border-b border-gray-800 mb-2 flex justify-between font-bold items-center">
        <span>&gt;&gt; ERC-8183 ESCROW RUNTIME TERMINAL &lt;&lt;</span>
        <span id="taskStatus" class="text-gray-500 blink">SYSTEM READY</span>
      </div>
      <div id="deliverable" class="flex-1 overflow-y-auto text-emerald-400 whitespace-pre-wrap pr-1 text-xs mono">
[BIDWARS REVERSE AUCTION BROKER]
Prêt. Sélectionnez un test rapide ci-dessus ou entrez une commande pour déclencher l'arbitrage automatique et animer les graphiques.
      </div>
    </div>

  </div>

  <footer class="w-full max-w-5xl text-[8px] text-gray-600 mono flex justify-between items-center py-2 z-10 border-t border-gray-900 mt-2">
    <span>BNB BUILDER SESSIONS PARIS // DEVINCIBLOCKCHAIN</span>
    <span>CONTRACT: 0xe468...7860e // TESTNET CHAIN_ID 97</span>
  </footer>

  <script>
    // 8-bit Audio Synthesizer
    let audioCtx = null;
    function playBeep(freq = 600, duration = 0.08, type = 'square') {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    function playWinChime() {
      playBeep(440, 0.08, 'square');
      setTimeout(() => playBeep(660, 0.08, 'square'), 90);
      setTimeout(() => playBeep(880, 0.2, 'triangle'), 180);
    }

    let isDemoMode = true;
    let totalFeesCollected = 0.0125;

    function toggleDemoMode() {
      isDemoMode = !isDemoMode;
      const btn = document.getElementById('modeToggleBtn');
      if (isDemoMode) {
        btn.innerText = 'DEMO FAST (0.3s)';
        btn.className = 'px-2.5 py-1 bg-amber-400 text-black font-bold rounded';
      } else {
        btn.innerText = 'LIVE AI (3-5s)';
        btn.className = 'px-2.5 py-1 bg-emerald-500 text-white font-bold rounded';
      }
      playBeep(750, 0.06);
    }

    // Canvas Charts Engine
    const metricsCanvas = document.getElementById('metricsChart');
    const mCtx = metricsCanvas.getContext('2d');
    const escrowCanvas = document.getElementById('escrowChart');
    const eCtx = escrowCanvas.getContext('2d');

    let currentMetrics = {
      alpha: { costEff: 95, speed: 75, quality: 78, score: 92 },
      beta:  { costEff: 55, speed: 45, quality: 98, score: 76 },
      gamma: { costEff: 75, speed: 98, quality: 80, score: 86 }
    };

    function drawMetricsChart() {
      const w = metricsCanvas.width;
      const h = metricsCanvas.height;
      mCtx.fillStyle = '#030712';
      mCtx.fillRect(0, 0, w, h);

      // Grid lines
      mCtx.strokeStyle = '#1E293B';
      mCtx.lineWidth = 1;
      for (let y = 30; y < h - 20; y += 30) {
        mCtx.beginPath();
        mCtx.moveTo(40, y);
        mCtx.lineTo(w - 20, y);
        mCtx.stroke();
      }

      const categories = ['COST EFF', 'SPEED', 'QUALITY', 'OVERALL'];
      const agents = [
        { key: 'alpha', col: '#3B82F6' },
        { key: 'beta',  col: '#EF4444' },
        { key: 'gamma', col: '#F59E0B' }
      ];

      const barWidth = 18;
      const groupWidth = 85;

      categories.forEach((cat, ci) => {
        const gx = 55 + ci * groupWidth;

        agents.forEach((ag, ai) => {
          const val = (ci === 0) ? currentMetrics[ag.key].costEff :
                      (ci === 1) ? currentMetrics[ag.key].speed :
                      (ci === 2) ? currentMetrics[ag.key].quality :
                                   currentMetrics[ag.key].score;

          const barH = (val / 100) * (h - 60);
          const bx = gx + ai * (barWidth + 2);
          const by = h - 25 - barH;

          mCtx.fillStyle = ag.col;
          mCtx.fillRect(bx, by, barWidth, barH);
        });

        mCtx.fillStyle = '#64748B';
        mCtx.font = '8px monospace';
        mCtx.fillText(cat, gx - 5, h - 8);
      });
    }

    let escrowRatio = { net: 0.95, fee: 0.05, amount: 0.02 };

    function drawEscrowChart() {
      const w = escrowCanvas.width;
      const h = escrowCanvas.height;
      eCtx.fillStyle = '#030712';
      eCtx.fillRect(0, 0, w, h);

      // Flow diagram
      const totalBarW = w - 80;
      const netW = totalBarW * escrowRatio.net;
      const feeW = totalBarW * escrowRatio.fee;
      const barY = 40;
      const barH = 34;

      // Net Agent Bar
      eCtx.fillStyle = '#10B981';
      eCtx.fillRect(40, barY, netW, barH);

      // Broker Fee Bar
      eCtx.fillStyle = '#F59E0B';
      eCtx.fillRect(40 + netW, barY, feeW, barH);

      // Labels on bar
      eCtx.fillStyle = '#000000';
      eCtx.font = 'bold 9px monospace';
      eCtx.fillText('95% NET PAYOUT', 50, barY + 21);
      eCtx.fillText('5%', 40 + netW + 2, barY + 21);

      // Escrow breakdown details
      eCtx.fillStyle = '#E2E8F0';
      eCtx.font = '10px monospace';
      const netVal = (escrowRatio.amount * 0.95).toFixed(4);
      const feeVal = (escrowRatio.amount * 0.05).toFixed(4);

      eCtx.fillText('ESCROW LOCKED : $' + escrowRatio.amount.toFixed(4) + ' TEST_U', 40, 110);
      eCtx.fillStyle = '#10B981';
      eCtx.fillText('AGENT RELEASE : $' + netVal + ' TEST_U', 40, 130);
      eCtx.fillStyle = '#F59E0B';
      eCtx.fillText('BIDWARS FEE   : +$' + feeVal + ' TEST_U (5% PROTOCOL ESCROW)', 40, 150);
    }

    drawMetricsChart();
    drawEscrowChart();

    const presets = {
      1: {
        prompt: "Explain transaction 0x5c2b2a6b245e2a6d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e on PancakeSwap and diagnose revert reason.",
        winnerKey: 'alpha',
        price: 0.02,
        metrics: {
          alpha: { costEff: 98, speed: 82, quality: 80, score: 94 },
          beta:  { costEff: 50, speed: 40, quality: 95, score: 72 },
          gamma: { costEff: 70, speed: 95, quality: 75, score: 84 }
        },
        report: "[PANCAKESWAP REVERT AUDIT // AGENT ALPHA WINNER]\\n\\nTransaction 0x5c2b2a... reverted with: EXPIRED (Router call block height exceeded deadline 20m).\\nSlippage tolerance 0.5% was exceeded due to sudden BNB pool volatility.\\nRecommended remediation: re-submit with 1.2% slippage or use private RPC endpoint."
      },
      2: {
        prompt: "Audit smart contract 0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82 for owner privileges, minting risks, and timelock.",
        winnerKey: 'beta',
        price: 0.08,
        metrics: {
          alpha: { costEff: 85, speed: 70, quality: 70, score: 75 },
          beta:  { costEff: 60, speed: 50, quality: 99, score: 96 },
          gamma: { costEff: 72, speed: 90, quality: 78, score: 81 }
        },
        report: "[SMART CONTRACT DEEP AUDIT // AGENT BETA WINNER]\\n\\nContract 0x0e09fa... verified on BSC Testnet.\\n- Ownership: Multi-sig required (2/3 signatures configured).\\n- Mint function: Hard-capped at 10,000,000 tokens.\\n- Timelock: 48h delay on liquidity withdrawal functions.\\nRisk Assessment: LOW RISK (Passes DeVinci Blockchain Security Standards)."
      },
      3: {
        prompt: "Perform security red flags check on token 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c for honeypot and sell tax.",
        winnerKey: 'gamma',
        price: 0.05,
        metrics: {
          alpha: { costEff: 88, speed: 75, quality: 75, score: 82 },
          beta:  { costEff: 55, speed: 45, quality: 92, score: 74 },
          gamma: { costEff: 80, speed: 99, quality: 88, score: 95 }
        },
        report: "[HONEYPOT & FLASH SCAN // AGENT GAMMA WINNER (160ms)]\\n\\nToken: 0xbb4cdb... (WBNB BSC Testnet)\\n- Buy Tax: 0.0%\\n- Sell Tax: 0.0%\\n- Honeypot status: CLEAN (Unrestricted transfers verified onchain).\\n- Blacklist functions: NONE detected.\\nArbitration latency: 158ms (Fastest route selected)."
      }
    };

    function runTestPreset(id) {
      const p = presets[id];
      document.getElementById('promptInput').value = p.prompt;

      if (isDemoMode) {
        applyInstantResult(p);
      } else {
        runAuction();
      }
    }

    function applyInstantResult(p) {
      playBeep(600, 0.05);
      const statusEl = document.getElementById('taskStatus');
      statusEl.innerText = 'SIMULATING ARBITRATION...';
      statusEl.className = 'text-amber-400 blink';

      setTimeout(() => {
        playWinChime();
        currentMetrics = p.metrics;
        drawMetricsChart();

        escrowRatio = { net: 0.95, fee: 0.05, amount: p.price };
        drawEscrowChart();

        const winKey = p.winnerKey;
        const fee = p.price * 0.05;
        const net = p.price * 0.95;
        totalFeesCollected += fee;
        document.getElementById('cumulativeFees').innerText = 'TREASURY: +$' + totalFeesCollected.toFixed(4);

        ['alpha', 'beta', 'gamma'].forEach(k => {
          const card = document.getElementById('c_' + k);
          const badge = document.getElementById('b_' + k);
          if (k === winKey) {
            card.style.borderColor = '#F0B90B';
            card.style.boxShadow = '0 0 12px #F0B90B, 4px 4px 0px #000';
            badge.innerText = 'WINNER';
            badge.style.color = '#F0B90B';
          } else {
            card.style.borderColor = '#334155';
            card.style.boxShadow = '4px 4px 0px #000';
            badge.innerText = 'OUTBID';
            badge.style.color = '#64748B';
          }
        });

        document.getElementById('resPrice').innerText = '$' + p.price.toFixed(2) + ' TEST_U';
        document.getElementById('resFee').innerText = '+$' + fee.toFixed(4) + ' TEST_U';
        document.getElementById('resNet').innerText = '$' + net.toFixed(4) + ' TEST_U';
        document.getElementById('deliverable').innerText = p.report;

        statusEl.innerText = 'SETTLED // ERC-8183';
        statusEl.className = 'text-emerald-400 font-bold';
      }, 300);
    }

    function runStressBenchmark() {
      playBeep(900, 0.08);
      let step = 1;
      const interval = setInterval(() => {
        runTestPreset(step);
        step++;
        if (step > 3) clearInterval(interval);
      }, 700);
    }

    async function runAuction() {
      const prompt = document.getElementById('promptInput').value.trim();
      if (!prompt) return;

      playBeep(520, 0.1);
      const btn = document.getElementById('runBtn');
      btn.disabled = true;
      btn.innerText = 'NEGOTIATING...';
      const statusEl = document.getElementById('taskStatus');
      statusEl.innerText = 'ARBITRATING...';
      statusEl.className = 'text-amber-400 blink';

      ['c_alpha', 'c_beta', 'c_gamma'].forEach(id => {
        document.getElementById(id).style.borderColor = '#334155';
        document.getElementById(id).style.boxShadow = '4px 4px 0px #000';
      });
      ['b_alpha', 'b_beta', 'b_gamma'].forEach(id => {
        const el = document.getElementById(id);
        el.innerText = 'BIDDING...';
        el.style.color = '#94A3B8';
      });

      try {
        const resp = await fetch('/api/auction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await resp.json();

        if (data.ok) {
          playWinChime();
          const a = data.auction;
          let winKey = 'alpha';
          if (a.winner.id === 'agent_beta') winKey = 'beta';
          else if (a.winner.id === 'agent_gamma') winKey = 'gamma';

          const winCard = document.getElementById('c_' + winKey);
          winCard.style.borderColor = '#F0B90B';
          winCard.style.boxShadow = '0 0 12px #F0B90B, 4px 4px 0px #000';

          const winBadge = document.getElementById('b_' + winKey);
          winBadge.innerText = 'WINNER';
          winBadge.style.color = '#F0B90B';

          ['alpha', 'beta', 'gamma'].forEach(k => {
            if (k !== winKey) {
              const el = document.getElementById('b_' + k);
              el.innerText = 'OUTBID';
              el.style.color = '#64748B';
            }
          });

          escrowRatio = { net: 0.95, fee: 0.05, amount: a.winner.priceUsd };
          drawEscrowChart();
          totalFeesCollected += a.brokerFeeUsd;
          document.getElementById('cumulativeFees').innerText = 'TREASURY: +$' + totalFeesCollected.toFixed(4);

          document.getElementById('resPrice').innerText = '$' + a.winner.priceUsd.toFixed(2) + ' TEST_U';
          document.getElementById('resFee').innerText = '+$' + a.brokerFeeUsd.toFixed(4) + ' TEST_U';
          document.getElementById('resNet').innerText = '$' + a.netPayoutUsd.toFixed(4) + ' TEST_U';
          document.getElementById('deliverable').innerText = data.reportMarkdown;

          statusEl.innerText = 'SETTLED // ERC-8183';
          statusEl.className = 'text-emerald-400 font-bold';
        }
      } catch (err) {
        document.getElementById('deliverable').innerText = 'Error: ' + err.message;
        statusEl.innerText = 'ERROR';
        statusEl.className = 'text-red-500';
      } finally {
        btn.disabled = false;
        btn.innerText = 'START AUCTION';
      }
    }
  </script>
</body>
</html>`;

const arenaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BidWars // Retro Paintball Arena (45s)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;700&display=swap');
    body { background-color: #030712; color: #FFFFFF; font-family: 'Press Start 2P', monospace; user-select: none; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    canvas { image-rendering: pixelated; border: 4px solid #1E293B; }
    .crt-line {
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
      background-size: 100% 4px;
      pointer-events: none;
    }
    .hud-box { background-color: #0F172A; border: 2px solid #334155; }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-between p-4 relative">
  <div class="crt-line fixed inset-0 z-40 pointer-events-none"></div>

  <!-- Header Arena -->
  <header class="w-full max-w-5xl flex flex-wrap justify-between items-center py-2 z-10 border-b-2 border-gray-800">
    <div class="flex items-center gap-3">
      <a href="/dashboard" class="text-[10px] text-gray-400 hover:text-amber-400">&lt; DASHBOARD</a>
      <span class="text-xs text-amber-400">BIDWARS ARENA</span>
    </div>

    <!-- Timer 45s -->
    <div class="flex items-center gap-2 bg-gray-900 border-2 border-amber-400 px-4 py-2 rounded">
      <span class="text-[10px] text-gray-300">TIMER:</span>
      <span id="timerDisplay" class="text-lg text-amber-400 font-bold">00:45</span>
    </div>

    <div class="flex gap-2">
      <button id="startBtn" onclick="startBattle()" class="px-4 py-2 bg-amber-400 hover:bg-yellow-300 text-black text-[11px] font-bold rounded shadow-lg">
        START BATTLE (45S)
      </button>
      <button onclick="toggleSpeed()" id="speedBtn" class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-[10px] rounded">
        1X
      </button>
      <button onclick="resetBattle()" class="px-3 py-2 bg-red-900/60 hover:bg-red-800 text-[10px] rounded text-red-300">
        RESET
      </button>
    </div>
  </header>

  <!-- Big Name HUD -->
  <div class="w-full max-w-5xl grid grid-cols-3 gap-3 my-2 z-10 text-[10px]">
    <!-- Alpha -->
    <div id="tankStatus_alpha" class="hud-box border-blue-500 p-2.5 rounded">
      <div class="text-blue-400 font-bold text-xs">AGENT ALPHA</div>
      <div class="text-[9px] text-gray-300 mt-1">ATTACK: RAPID TRIPLE SHOT</div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-[8px] text-gray-400">$0.02 | 380MS</span>
        <span id="hp_alpha" class="text-blue-400 font-bold text-sm">100%</span>
      </div>
    </div>

    <!-- Beta -->
    <div id="tankStatus_beta" class="hud-box border-red-500 p-2.5 rounded">
      <div class="text-red-400 font-bold text-xs">AGENT BETA</div>
      <div class="text-[9px] text-gray-300 mt-1">ATTACK: HEAVY CANNON BALL</div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-[8px] text-gray-400">$0.08 | 1450MS</span>
        <span id="hp_beta" class="text-red-400 font-bold text-sm">100%</span>
      </div>
    </div>

    <!-- Gamma -->
    <div id="tankStatus_gamma" class="hud-box border-amber-400 p-2.5 rounded">
      <div class="text-amber-400 font-bold text-xs">AGENT GAMMA</div>
      <div class="text-[9px] text-gray-300 mt-1">ATTACK: PIERCING LASER BEAM</div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-[8px] text-gray-400">$0.05 | 160MS</span>
        <span id="hp_gamma" class="text-amber-400 font-bold text-sm">100%</span>
      </div>
    </div>
  </div>

  <!-- Battlefield Canvas -->
  <div class="relative z-10 flex flex-col items-center">
    <canvas id="arenaCanvas" width="800" height="460" class="shadow-2xl rounded"></canvas>

    <!-- Overlay Victory Screen -->
    <div id="victoryOverlay" class="hidden absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center rounded border-4 border-amber-400 z-30">
      <div class="text-xs text-amber-400 mb-2">--- 45S REVERSE AUCTION CONCLUDED ---</div>
      <h2 id="winnerTitle" class="text-xl text-white mb-4">AGENT GAMMA VICTORIOUS</h2>
      <div class="space-y-2 text-xs text-gray-300 mono hud-box p-4 rounded max-w-md w-full">
        <div class="flex justify-between"><span>WINNING BID:</span><span id="wBid" class="text-white font-bold">$0.05 TEST_U</span></div>
        <div class="flex justify-between text-amber-400"><span>BIDWARS FEE (5%):</span><span id="wFee" class="font-bold">+$0.0025 TEST_U</span></div>
        <div class="flex justify-between text-emerald-400 border-t border-gray-700 pt-1"><span>NET PAYOUT:</span><span id="wNet" class="font-bold">$0.0475 TEST_U</span></div>
        <div class="text-gray-400 text-[10px] pt-2">SETTLED ON BSC TESTNET (ERC-8183)</div>
      </div>
      <button onclick="resetBattle()" class="mt-4 px-6 py-2.5 bg-amber-400 text-black text-xs font-bold rounded">
        START NEW COMBAT
      </button>
    </div>
  </div>

  <!-- Footer -->
  <footer class="w-full max-w-5xl flex justify-between items-center py-2 text-[9px] text-gray-500 z-10 mono border-t border-gray-800">
    <span>45S AMPHITHEATER PITCH MODE</span>
    <span>ERC-8183 REVERSE AUCTION ARENA</span>
  </footer>

  <script>
    const canvas = document.getElementById('arenaCanvas');
    const ctx = canvas.getContext('2d');

    let speedMultiplier = 1;
    let isRunning = false;
    let timeLeft = 45; // Calibrated to 45 seconds!
    let timerInterval = null;
    let particles = [];
    let splats = [];
    let bullets = [];

    // Synthesized Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, duration, type = 'square') {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e) {}
    }

    const bunkers = [
      { x: 130, y: 80, w: 50, h: 50, color: '#1E3A8A' },
      { x: 620, y: 80, w: 50, h: 50, color: '#991B1B' },
      { x: 130, y: 330, w: 50, h: 50, color: '#1E3A8A' },
      { x: 620, y: 330, w: 50, h: 50, color: '#991B1B' },
      { x: 360, y: 190, w: 80, h: 80, color: '#B45309' },
      { x: 260, y: 110, w: 30, h: 60, color: '#334155' },
      { x: 510, y: 290, w: 30, h: 60, color: '#334155' },
      { x: 260, y: 290, w: 30, h: 60, color: '#334155' },
      { x: 510, y: 110, w: 30, h: 60, color: '#334155' }
    ];

    let tanks = [];

    function initTanks() {
      tanks = [
        {
          id: 'alpha',
          name: 'AGENT ALPHA (BUDGET)',
          attackType: 'triple_burst',
          color: '#38BDF8',
          trackColor: '#0369A1',
          x: 90,
          y: 230,
          angle: 0,
          turretAngle: 0,
          hp: 220,
          maxHp: 220,
          speed: 1.4,
          cooldown: 0,
          rate: 38, // Fast triple shooter
          alive: true
        },
        {
          id: 'beta',
          name: 'AGENT BETA (EXPERT)',
          attackType: 'heavy_cannon',
          color: '#EF4444',
          trackColor: '#991B1B',
          x: 710,
          y: 110,
          angle: Math.PI,
          turretAngle: Math.PI,
          hp: 290, // Heavy armor
          maxHp: 290,
          speed: 0.95,
          cooldown: 0,
          rate: 65, // Slow heavy cannon
          alive: true
        },
        {
          id: 'gamma',
          name: 'AGENT GAMMA (EXPRESS)',
          attackType: 'laser_beam',
          color: '#F0B90B',
          trackColor: '#B45309',
          x: 710,
          y: 350,
          angle: Math.PI,
          turretAngle: Math.PI,
          hp: 260,
          maxHp: 260,
          speed: 1.5,
          cooldown: 0,
          rate: 48, // Fast laser bolt
          alive: true
        }
      ];
    }

    function toggleSpeed() {
      speedMultiplier = speedMultiplier === 1 ? 2 : (speedMultiplier === 2 ? 4 : 1);
      document.getElementById('speedBtn').innerText = speedMultiplier + 'X';
    }

    function startBattle() {
      if (isRunning) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      isRunning = true;
      document.getElementById('startBtn').innerText = 'COMBAT EN COURS...';
      document.getElementById('startBtn').classList.add('opacity-50');

      timerInterval = setInterval(() => {
        if (!isRunning) return;
        timeLeft -= 1;
        updateTimerDisplay();

        if (timeLeft <= 0) {
          endBattle();
        }
      }, 1000 / speedMultiplier);
    }

    function updateTimerDisplay() {
      const s = timeLeft.toString().padStart(2, '0');
      document.getElementById('timerDisplay').innerText = \`00:\${s}\`;
    }

    function resetBattle() {
      isRunning = false;
      clearInterval(timerInterval);
      timeLeft = 45;
      updateTimerDisplay();
      document.getElementById('startBtn').innerText = 'START BATTLE (45S)';
      document.getElementById('startBtn').classList.remove('opacity-50');
      document.getElementById('victoryOverlay').classList.add('hidden');

      bullets = [];
      particles = [];
      splats = [];
      initTanks();
      updateScoreboard();
    }

    function endBattle(winner = null) {
      isRunning = false;
      clearInterval(timerInterval);

      if (!winner) {
        const survivors = tanks.filter(t => t.alive);
        winner = survivors.sort((a,b) => b.hp - a.hp)[0] || tanks[2];
      }

      playBeep(440, 0.25);
      setTimeout(() => playBeep(880, 0.45), 200);

      document.getElementById('winnerTitle').innerText = \`\${winner.name} GAGNE LE CONTRAT\`;
      document.getElementById('winnerTitle').style.color = winner.color;

      let price = 0.05, fee = 0.0025, net = 0.0475;
      if (winner.id === 'alpha') { price = 0.02; fee = 0.0010; net = 0.0190; }
      else if (winner.id === 'beta') { price = 0.08; fee = 0.0040; net = 0.0760; }

      document.getElementById('wBid').innerText = \`$\${price.toFixed(2)} TEST_U\`;
      document.getElementById('wFee').innerText = \`+$\${fee.toFixed(4)} TEST_U\`;
      document.getElementById('wNet').innerText = \`$\${net.toFixed(4)} TEST_U\`;
      document.getElementById('victoryOverlay').classList.remove('hidden');
    }

    function updateScoreboard() {
      tanks.forEach(t => {
        const pct = Math.max(0, Math.round((t.hp / t.maxHp) * 100));
        const el = document.getElementById(\`hp_\${t.id}\`);
        if (el) {
          el.innerText = t.alive ? \`\${pct}%\` : 'DESTROYED';
          el.style.color = t.alive ? t.color : '#64748B';
        }
      });
    }

    function update() {
      if (!isRunning) return;

      const aliveTanks = tanks.filter(t => t.alive);
      if (aliveTanks.length <= 1) {
        endBattle(aliveTanks[0]);
        return;
      }

      // Damage boost ensures strict 45-second pacing
      const damageMultiplier = timeLeft < 20 ? 1.8 : (timeLeft < 10 ? 2.5 : 1.1);

      for (let s = 0; s < speedMultiplier; s++) {
        tanks.forEach(tank => {
          if (!tank.alive) return;

          const enemies = tanks.filter(e => e.alive && e.id !== tank.id);
          if (enemies.length === 0) return;

          let target = enemies[0];
          let minDist = 9999;
          enemies.forEach(e => {
            const d = Math.hypot(e.x - tank.x, e.y - tank.y);
            if (d < minDist) { minDist = d; target = e; }
          });

          tank.turretAngle = Math.atan2(target.y - tank.y, target.x - tank.x);

          tank.angle += (Math.random() - 0.5) * 0.2;
          const nx = tank.x + Math.cos(tank.angle) * tank.speed;
          const ny = tank.y + Math.sin(tank.angle) * tank.speed;

          if (nx > 40 && nx < 760) tank.x = nx;
          else tank.angle = Math.PI - tank.angle;

          if (ny > 40 && ny < 420) tank.y = ny;
          else tank.angle = -tank.angle;

          bunkers.forEach(b => {
            if (tank.x > b.x - 22 && tank.x < b.x + b.w + 22 &&
                tank.y > b.y - 22 && tank.y < b.y + b.h + 22) {
              tank.angle += Math.PI * 0.5;
            }
          });

          // Distinct Attack Types per Tank
          tank.cooldown++;
          if (tank.cooldown >= tank.rate) {
            tank.cooldown = 0;

            if (tank.attackType === 'triple_burst') {
              // Alpha: Triple rapid pellets
              [-0.15, 0, 0.15].forEach(offset => {
                bullets.push({
                  x: tank.x + Math.cos(tank.turretAngle + offset) * 22,
                  y: tank.y + Math.sin(tank.turretAngle + offset) * 22,
                  vx: Math.cos(tank.turretAngle + offset) * 5.2,
                  vy: Math.sin(tank.turretAngle + offset) * 5.2,
                  color: tank.color,
                  type: 'pellet',
                  size: 4,
                  dmg: 6.5 * damageMultiplier,
                  ownerId: tank.id
                });
              });
              playBeep(320, 0.05, 'square');
            } else if (tank.attackType === 'heavy_cannon') {
              // Beta: Massive slow cannonball
              bullets.push({
                x: tank.x + Math.cos(tank.turretAngle) * 24,
                y: tank.y + Math.sin(tank.turretAngle) * 24,
                vx: Math.cos(tank.turretAngle) * 3.6,
                vy: Math.sin(tank.turretAngle) * 3.6,
                color: tank.color,
                type: 'heavy',
                size: 9,
                dmg: 22.0 * damageMultiplier,
                ownerId: tank.id
              });
              playBeep(140, 0.15, 'sawtooth');
            } else {
              // Gamma: High velocity laser bolt
              bullets.push({
                x: tank.x + Math.cos(tank.turretAngle) * 24,
                y: tank.y + Math.sin(tank.turretAngle) * 24,
                vx: Math.cos(tank.turretAngle) * 6.5,
                vy: Math.sin(tank.turretAngle) * 6.5,
                color: tank.color,
                type: 'laser',
                size: 6,
                dmg: 14.0 * damageMultiplier,
                ownerId: tank.id
              });
              playBeep(480, 0.08, 'sine');
            }
          }
        });

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.x < 10 || b.x > 790 || b.y < 10 || b.y > 450) {
            splats.push({ x: b.x, y: b.y, color: b.color, r: b.size });
            bullets.splice(i, 1);
            continue;
          }

          let hitBunker = false;
          bunkers.forEach(bk => {
            if (b.x > bk.x && b.x < bk.x + bk.w && b.y > bk.y && b.y < bk.y + bk.h) {
              splats.push({ x: b.x, y: b.y, color: b.color, r: b.size + 2 });
              hitBunker = true;
            }
          });
          if (hitBunker) {
            bullets.splice(i, 1);
            continue;
          }

          tanks.forEach(t => {
            if (t.alive && t.id !== b.ownerId) {
              if (Math.hypot(t.x - b.x, t.y - b.y) < (18 + b.size/2)) {
                t.hp -= b.dmg;
                splats.push({ x: b.x, y: b.y, color: b.color, r: b.size + 4 });

                for (let k = 0; k < 8; k++) {
                  particles.push({
                    x: b.x, y: b.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: b.color,
                    life: 20
                  });
                }

                playBeep(110, 0.08, 'sawtooth');

                if (t.hp <= 0) {
                  t.alive = false;
                  t.hp = 0;
                  for (let k = 0; k < 35; k++) {
                    particles.push({
                      x: t.x, y: t.y,
                      vx: (Math.random() - 0.5) * 7,
                      vy: (Math.random() - 0.5) * 7,
                      color: t.color,
                      life: 45
                    });
                  }
                  playBeep(70, 0.4, 'sawtooth');
                }

                bullets.splice(i, 1);
                updateScoreboard();
              }
            }
          });
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          if (p.life <= 0) particles.splice(i, 1);
        }

        if (splats.length > 180) splats.shift();
      }
    }

    function draw() {
      ctx.fillStyle = '#0F1E13';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      splats.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(s.x - s.r/2, s.y - s.r/2, s.r, s.r);
      });
      ctx.globalAlpha = 1.0;

      bunkers.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(b.x + 3, b.y + 3, b.w - 6, 4);
      });

      // Bullets rendering per attack type
      bullets.forEach(b => {
        ctx.fillStyle = b.color;
        if (b.type === 'heavy') {
          ctx.fillRect(b.x - 5, b.y - 5, 10, 10);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
        } else if (b.type === 'laser') {
          ctx.fillRect(b.x - 6, b.y - 2, 12, 4);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(b.x - 3, b.y - 1, 6, 2);
        } else {
          ctx.fillRect(b.x - 2, b.y - 2, 5, 5);
        }
      });

      // Tanks rendering + LARGE READABLE NAMES
      tanks.forEach(tank => {
        if (!tank.alive) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(tank.x - 14, tank.y - 14, 28, 28);
          ctx.strokeStyle = '#0F172A';
          ctx.strokeRect(tank.x - 14, tank.y - 14, 28, 28);
          return;
        }

        ctx.save();
        ctx.translate(tank.x, tank.y);

        ctx.fillStyle = tank.trackColor;
        ctx.fillRect(-18, -16, 36, 7);
        ctx.fillRect(-18, 9, 36, 7);

        ctx.fillStyle = tank.color;
        ctx.fillRect(-14, -11, 28, 22);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, -11, 28, 22);

        ctx.rotate(tank.turretAngle);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, -3, 20, 6);
        ctx.fillStyle = tank.trackColor;
        ctx.fillRect(-7, -7, 14, 14);

        ctx.restore();

        // HP Bar
        const pct = Math.max(0, tank.hp / tank.maxHp);
        ctx.fillStyle = '#000000';
        ctx.fillRect(tank.x - 24, tank.y - 28, 48, 6);
        ctx.fillStyle = pct > 0.4 ? tank.color : '#EF4444';
        ctx.fillRect(tank.x - 23, tank.y - 27, 46 * pct, 4);

        // BIGGER READABLE NAME BADGE FOR AMPHI
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(tank.x - 36, tank.y - 44, 72, 13);
        ctx.strokeStyle = tank.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(tank.x - 36, tank.y - 44, 72, 13);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(tank.id.toUpperCase(), tank.x, tank.y - 34);
      });

      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
      });

      requestAnimationFrame(() => {
        update();
        draw();
      });
    }

    initTanks();
    draw();
  </script>
</body>
</html>`;
