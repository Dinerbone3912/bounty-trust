import { test } from 'node:test';
import assert from 'node:assert';
import { scoreListing, classifyFeed } from './index.js';

test('legit crypto bounty scores RELIABLE', () => {
  const r = scoreListing({ title:'Fix bug in parser', body:'$500 USDC bounty', reward_amount:'500', currency:'USDC', source:'github' },
    { openIssue: true, repoAgeDays: 400, hasPayerHistory: true });
  assert.strictEqual(r.verdict, 'RELIABLE');
  assert.ok(r.score >= 65);
});
test('scam ring is REJECT', () => {
  const r = scoreListing({ title:'Earn big', body:'Send USDC upfront fee to join our telegram', reward_amount:'1000', source:'twitter' }, {});
  assert.strictEqual(r.verdict, 'REJECT');
  assert.ok(r.signals.includes('-scam_ring_markers'));
});
test('points-only degrades', () => {
  const r = scoreListing({ title:'Contribute for swag and points', body:'leaderboard rewards', reward_amount:'0', source:'discord' }, {});
  assert.strictEqual(r.verdict, 'REJECT');
});
test('hardware gate rejected', () => {
  const r = scoreListing({ title:'Test on MacBook M3 in-person', body:'USDC 300', reward_amount:'300', currency:'USDC', source:'github' }, { openIssue:true });
  assert.ok(r.score < 65);
  assert.ok(r.signals.includes('-hardware_or_geo_gate'));
});
test('openIssue=false heavily penalized', () => {
  const r = scoreListing({ title:'Standalone deliverable', body:'$250 USDC', reward_amount:'250', currency:'USDC', source:'github' }, { openIssue:false });
  assert.notStrictEqual(r.verdict, 'RELIABLE');
});
test('classifyFeed maps context', () => {
  const out = classifyFeed([{ id:'1', title:'Fix', body:'$100 USDC', reward_amount:'100', currency:'USDC', source:'github' }], { '1': { openIssue:true, repoAgeDays:500, hasPayerHistory:true } });
  assert.strictEqual(out[0].verdict, 'RELIABLE');
});
test('score bounded 0..100', () => {
  const r = scoreListing({ title:'Send USDC upfront fee sign up and earn click here', body:'', reward_amount:'0', source:'x' }, { openIssue:false });
  assert.ok(r.score >= 0 && r.score <= 100);
});
