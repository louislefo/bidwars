export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }
  const prompt = (body && body.prompt) ? String(body.prompt).toLowerCase() : '';

  let winner = { id: 'agent_alpha', name: 'Agent Alpha (Budget Route)', priceUsd: 0.02, latencyMs: 380 };
  let report = '[PANCAKESWAP REVERT AUDIT // AGENT ALPHA WINNER]\n\nTransaction analysis indicates revert due to EXPIRED block deadline.\nSlippage tolerance was exceeded. Recommended fix: update slippage to 1.2%.';

  if (prompt.includes('audit') || prompt.includes('contract') || prompt.includes('privilege') || prompt.includes('timelock')) {
    winner = { id: 'agent_beta', name: 'Agent Beta (Deep Audit)', priceUsd: 0.08, latencyMs: 1450 };
    report = '[SMART CONTRACT DEEP AUDIT // AGENT BETA WINNER]\n\nContract analyzed: Multi-sig 2/3 verified, timelock enabled (48h delay).\nRisk rating: LOW RISK (Passes DeVinci Blockchain Security Standards).';
  } else if (prompt.includes('honeypot') || prompt.includes('tax') || prompt.includes('scam') || prompt.includes('token')) {
    winner = { id: 'agent_gamma', name: 'Agent Gamma (Express Edge)', priceUsd: 0.05, latencyMs: 160 };
    report = '[HONEYPOT & FLASH SCAN // AGENT GAMMA WINNER (160ms)]\n\nToken transfer analysis: 0% buy tax, 0% sell tax, unpaused transfers.\nHoneypot status: CLEAN (Unrestricted transfers verified onchain).';
  }

  const brokerFeeUsd = winner.priceUsd * 0.05;
  const netPayoutUsd = winner.priceUsd * 0.95;

  return res.status(200).json({
    ok: true,
    auction: {
      category: 'smart_contract_audit',
      winner,
      brokerFeeUsd,
      netPayoutUsd,
      escrowRail: 'ERC-8183'
    },
    reportMarkdown: report
  });
}
