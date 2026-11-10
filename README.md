# BidWars: Autonomous Reverse-Auction Broker on BNB Chain

[![BNB Chain](https://img.shields.io/badge/BNB%20Chain-BSC%20Testnet%20(97)-F0B90B?style=flat-square&logo=binance)](https://www.bnbchain.org/)
[![BNB Agent Studio](https://img.shields.io/badge/BNB%20Agent%20Studio-v0.0.16-F0B90B?style=flat-square)](https://github.com/bnb-chain)
[![ERC-8183](https://img.shields.io/badge/Standard-ERC--8183%20Escrow-blue?style=flat-square)](https://eips.ethereum.org/)
[![ERC-8004](https://img.shields.io/badge/Standard-ERC--8004%20Identity-indigo?style=flat-square)](https://eips.ethereum.org/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel%20Live-black?style=flat-square&logo=vercel)](https://bidwars-louislefos-projects.vercel.app)

**Tags:** `#BNBChain` `#BNBAgentStudio` `#BSC` `#ERC8183` `#ERC8004` `#A2A` `#DeVinciBlockchain`

BidWars is an autonomous multi-agent reverse-auction broker built for the **BNB Chain** ecosystem. Rather than relying on a single monolithic AI agent for complex onchain tasks, BidWars dynamically orchestrates three specialized internal sub-agents in real-time competition (cost, latency, depth), selecting the Pareto-optimal agent via multi-criteria arbitration, securing execution through **ERC-8183** escrow, and deducting a 5% broker fee.

Developed during the **BNB Builder Sessions Paris** by DeVinci Blockchain (DVB).

---

## 1. BNB Chain Ecosystem Integration

BidWars is engineered natively on top of the official BNB Chain agent infrastructure:

- **Built with BNB Agent Studio**: Scaffolded and managed via the `@bnbagent/studio-runtime` and `bag` CLI toolchain.
- **BSC Testnet Deployment (Chain ID 97)**:
  - Verified Agent Address: `0xe468bEf92b6A91fD2E691AEeC8Cd32643D77860e`
  - Funded via BNB Chain faucet grants (`0.1 tBNB` + `5 TEST_U`).
- **ERC-8183 Escrow Settlement**:
  - Implements the ERC-8183 job funding standard where buyer funds are locked prior to execution.
  - Automatically splits payments into agent net remuneration (95%) and protocol treasury reserve (5%).
- **ERC-8004 Onchain Identity & Agent Card**:
  - Exposes standard A2A agent card capabilities discoverable across the BNB Chain network.
- **BNB Chain Cloud Runtime (AWS Bedrock)**:
  - Live deployment hosted under the official BNB Chain managed platform.
  - Public Agent ID: `01M7395KRK0N3B2RQQW7PH0XEC`
  - Public A2A Endpoint: `https://bnbagent-api.bnbchain.world/v1/rt/01M7395KRK0N3B2RQQW7PH0XEC/.well-known/agent-card.json`

---

## 2. Core Architecture and Vision

In the decentralized agent economy, no single AI model optimizes all constraints simultaneously:
- High-reasoning models have high token costs and latency.
- Lightweight edge models lack technical audit depth.

BidWars solves this through an autonomous broker mechanism:
1. **Task Ingestion**: The broker receives an onchain task (transaction revert diagnosis, smart contract security audit, honeypot/tax scan).
2. **Reverse Auction**: Three specialized agents submit competitive bids specifying price, expected latency, and audit depth.
3. **Multi-Criteria Arbitration**: The broker evaluates bids using a composite value score:
   $$\text{Score} = w_{\text{cost}} \cdot \text{CostEff} + w_{\text{speed}} \cdot \text{SpeedEff} + w_{\text{qual}} \cdot \text{Quality}$$
4. **ERC-8183 Escrow Settlement**:
   - The winning bid amount is locked in escrow.
   - A 5% broker fee is deducted for the protocol treasury.
   - 95% is released to the winning agent upon deliverable verification.
5. **Verified Deliverable**: The diagnostic report is generated, verified, and delivered to the caller.

---

## 3. The Competing Sub-Agents

| Agent | Profile | List Price | Baseline Latency | Weapon (Arena) | Specialty |
|---|---|---|---|---|---|
| **Agent Alpha** | Budget Route | $0.02 TEST_U | 380 ms | Rapid Triple Shot | Low-cost transactions, simple reverts |
| **Agent Beta** | Deep Expert | $0.08 TEST_U | 1450 ms | Heavy Cannon Ball | In-depth contract audits, timelock analysis |
| **Agent Gamma** | Express Edge | $0.05 TEST_U | 160 ms | Piercing Laser Beam | Honeypot scan, flash liquidity checks |

---

## 4. Visual Interfaces

BidWars provides two retro 8-bit arcade interfaces designed for live presentations:

### Main Dashboard (`/dashboard` and `/`)
- **Metrics Comparator (HTML5 Canvas)**: Real-time animated comparison chart across Cost Efficiency, Speed, Quality, and Overall Score.
- **Escrow Flow & Fee Split (HTML5 Canvas)**: Visual 95% net payout vs 5% broker fee breakdown with cumulative treasury counter.
- **Express Pitch Bench**: One-click preset tests (`TX REVERT`, `DEEP AUDIT`, `HONEYPOT SCAN`, `3-WAY BENCHMARK`) with a toggle between instant 0.3s simulation mode and full 3-5s live LLM execution.
- **8-Bit Web Audio Synthesizer**: Procedural square/triangle wave chimes for arcade interaction without external audio assets.

### Paintball Tank Arena (`/arena`)
- Top-down 2D canvas battle arena with CRT scanlines and pixel-art rendering.
- 45-second timed pitch battle featuring tanks with large visible name tags.
- Three unique attack types (blue rapid triple burst, red heavy cannon, gold piercing beam).
- Automatic arbitration winner announcement matching the optimal broker selection.

---

## 5. Deployed Endpoints

### BNB Chain Managed Platform (BSC Testnet)
- **Agent ID**: `01M7395KRK0N3B2RQQW7PH0XEC`
- **Deployment ID**: `01M73BHHEC828P1Y2VJ4WVVT2E`
- **Agent Card (A2A Protocol)**:
  `https://bnbagent-api.bnbchain.world/v1/rt/01M7395KRK0N3B2RQQW7PH0XEC/.well-known/agent-card.json`
- **BSC Testnet Address**: `0xe468bEf92b6A91fD2E691AEeC8Cd32643D77860e`

### Vercel Web Application
- **Production URL**: [https://bidwars-louislefos-projects.vercel.app](https://bidwars-louislefos-projects.vercel.app)
- **Short Alias**: [https://bidwars-taupe.vercel.app](https://bidwars-taupe.vercel.app)
- **45s Arena Battle**: [https://bidwars-louislefos-projects.vercel.app/arena](https://bidwars-louislefos-projects.vercel.app/arena)
- **Arbitration API**: `https://bidwars-louislefos-projects.vercel.app/api/auction`

---

## 6. Repository Structure

```text
bidwars/
├── Dockerfile                  # Multi-stage production container image
├── Dockerfile.vercel           # Vercel container entrypoint
├── vercel.json                 # Vercel clean routing configuration
├── package.json                # Workspace root
├── pnpm-workspace.yaml         # pnpm monorepo workspace definition
├── public/                     # Static web assets
│   ├── index.html              # Main retro arcade dashboard
│   ├── dashboard/index.html    # Dashboard alias
│   └── arena/index.html        # 45s retro tank paintball arena
├── api/                        # Serverless API routes
│   └── auction.js              # Reverse auction arbitration endpoint
└── app/
    └── agent/                  # Core seller agent sub-project
        ├── package.json        # Agent dependencies (@bnbagent/studio-runtime, @bnbagent/sdk, express)
        ├── studio.toml         # BNB Agent Studio configuration (ERC-8183 rail)
        ├── tsconfig.json       # TypeScript configuration
        └── src/
            ├── unifiedMain.ts      # Unified entrypoint (AgentCore + Foundry + Dashboard)
            ├── auctionEngine.ts    # Reverse auction arbitration & scoring logic
            ├── dashboardRouter.ts  # Express router serving web UI & API
            ├── sellerCore.ts       # LLM task runner (Pieverse LLM inside)
            ├── executor.ts         # A2A skill dispatcher (negotiate, notify_funded)
            ├── signing.ts          # EIP-191 / EIP-712 quote signing
            ├── tools.ts            # Read-only BNB Chain tools
            └── agentCard.ts        # ERC-8004 agent card declaration
```

---

## 7. Local Setup and Development

### Prerequisites
- Node.js >= 22
- pnpm >= 10.24.0

### Installation
```bash
git clone https://github.com/louislefo/bidwars.git
cd bidwars
pnpm install
```

### Running Locally
```bash
# Run the complete agent and retro dashboard
pnpm run dev
```

Open your browser at:
- Dashboard: `http://localhost:9000/dashboard`
- Arena: `http://localhost:9000/arena`

### Building TypeScript
```bash
pnpm run build
```

---

## 8. Protocol Standards

- **ERC-8183**: Autonomous escrow standard for agent work contracts with budget bounds and dispute arbitration.
- **ERC-8004**: Onchain identity and verifiable agent card registry.
- **A2A (Agent-to-Agent)**: JSON-RPC over HTTP message protocol for cross-agent negotiation and task dispatch.

---

## 9. Hackathon Acknowledgments

Built by DeVinci Blockchain (DVB) for the **BNB Builder Sessions Paris 2026**.
Special thanks to the BNB Chain core developer team and BNB Agent Studio maintainers.

- Twitter / X: `@BNBCHAIN`
- Telegram: `BNB Chain Developers`
- Portal: [https://www.bnbchain.org](https://www.bnbchain.org)
- License: MIT License
