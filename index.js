/**
 * @glider/bounty-trust — legitimacy scoring for crypto bounty listings.
 *
 * Produces a verdict (RELIABLE | UNVERIFIED | REJECT) plus a numeric score
 * and the list of signals that fired. Rules are transparent and testable.
 */

const HARDWARE_GATE = /\b(macbook|mac\s?m\d|apple\s?silicon|in.?person|onsite|on-site|physical|ship\s+(the|your)|usa only|us only|canada only|uk only)\b/i;
const POINTS_ONLY = /\b(swag|merch|points?|xp|leaderboard|credential|certificate|airdrop)\b/i;
const SCAM_RING = /\b(pay\s+before|send\s+(usdc|eth|btc|crypto)|upfront\s+(fee|payment)|registration\s+fee|join\s+our\s+telegram|dm\s+(me|us)\s+(to|for)|wallet\s+connect\s+to\s+claim|winner\s+selected)\b/i;
const FAKE_TASK = /\b(click\s+(this|here)|complete\s+a\s+(quick\s+)?survey|sign\s+up\s+and\s+earn|install\s+this\s+app)\b/i;
const CRYPTO_CURRENCIES = /\b(usdc|usdt|dai|eth|btc|sol|matic)\b/i;

const RELIABLE_SOURCES = new Set(['github']);

export function scoreListing(b, { repoAgeDays, hasPayerHistory, openIssue } = {}) {
  const signals = [];
  let score = 50;
  const text = `${b.title || ''} ${b.body || b.description || ''}`;

  // Reward must be stated in real crypto / a concrete amount.
  const reward = Number(b.reward_amount || 0);
  if (reward > 0) { score += 15; signals.push('+stated_reward'); }
  else { score -= 25; signals.push('-no_reward'); }

  if (CRYPTO_CURRENCIES.test(text) || CRYPTO_CURRENCIES.test(b.currency || '')) {
    score += 8; signals.push('+crypto_payout');
  } else if (reward > 0) {
    score -= 5; signals.push('-currency_unclear');
  }

  if (HARDWARE_GATE.test(text)) { score -= 30; signals.push('-hardware_or_geo_gate'); }
  if (POINTS_ONLY.test(text)) { score -= 20; signals.push('-points_or_swag'); }
  if (SCAM_RING.test(text)) { score -= 60; signals.push('-scam_ring_markers'); }
  if (FAKE_TASK.test(text)) { score -= 25; signals.push('-microtask_bait'); }

  // Structural trust signals (only help if provided).
  if (openIssue === true) { score += 10; signals.push('+issue_exists'); }
  if (openIssue === false) { score -= 40; signals.push('-issue_missing'); }
  if (typeof repoAgeDays === 'number') {
    if (repoAgeDays >= 180) { score += 8; signals.push('+repo_mature'); }
    else if (repoAgeDays < 14) { score -= 15; signals.push('-repo_brand_new'); }
  }
  if (hasPayerHistory === true) { score += 12; signals.push('+payer_history'); }
  if (hasPayerHistory === false) { score -= 10; signals.push('-no_payer_history'); }

  if (RELIABLE_SOURCES.has(b.source)) score += 3;

  score = Math.max(0, Math.min(100, score));
  let verdict;
  if (score >= 65) verdict = 'RELIABLE';
  else if (score >= 35) verdict = 'UNVERIFIED';
  else verdict = 'REJECT';

  return { verdict, score, signals };
}

export function classifyFeed(items, contextById = {}) {
  return items.map(b => ({ ...b, ...scoreListing(b, contextById[b.id] || {}) }));
}
export default { scoreListing, classifyFeed };
