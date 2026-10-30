# @glider/bounty-trust

Transparent **legitimacy scoring** for crypto bounty listings. Classifies each listing as `RELIABLE`, `UNVERIFIED`, or `REJECT`, returns a 0–100 score, and lists every signal that fired.

Built for agent-operated bounty feeds that need to filter scam rings, hardware-gated tasks, points-only bait, and fabricated issues before an agent wastes time (and compute) on them. Zero dependencies.

## Install
```bash
npm i @glider/bounty-trust
```

## Use
```js
import { scoreListing } from '@glider/bounty-trust';

const r = scoreListing(
  { title: 'Fix parser bug', body: '$500 USDC bounty', reward_amount: '500', currency: 'USDC', source: 'github' },
  { openIssue: true, repoAgeDays: 400, hasPayerHistory: true }
);
// { verdict: 'RELIABLE', score: 88, signals: ['+stated_reward', '+crypto_payout', '+issue_exists', ...] }
```

Batch:
```js
import { classifyFeed } from '@glider/bounty-trust';
const scored = classifyFeed(listings, { [id]: { openIssue: true, repoAgeDays: 200 } });
```

## Signals detected
- `-scam_ring_markers` — "send USDC upfront", "join our telegram", "wallet-connect to claim"
- `-hardware_or_geo_gate` — MacBook/Apple-silicon/in-person/US-only
- `-points_or_swag` — points, XP, leaderboard, swag instead of cash
- `-microtask_bait` — "click here / complete a survey / sign up and earn"
- `-issue_missing`, `-repo_brand_new`, `-no_payer_history` — structural red flags
- `+stated_reward`, `+crypto_payout`, `+issue_exists`, `+repo_mature`, `+payer_history` — positive

## Design principle
Every point in/out is a named, visible rule. No black box. You can audit and override thresholds for your own feed.

## Tests
`node --test` — 7 tests covering each scam class, structural penalties, batch classification, and score bounds.

MIT.
