import test from 'node:test';
import assert from 'node:assert/strict';
import { rankQuotes } from '../scripts/meal-math.ts';
const quotes = [
  { id: 'a', totalCents: 2590, foodCents: 2490, extraCents: 100, itemCount: 3, meetsHardConstraints: true },
  { id: 'b', totalCents: 3190, foodCents: 3190, extraCents: 0, itemCount: 3, meetsHardConstraints: true },
  { id: 'c', totalCents: 9000, foodCents: 1900, extraCents: 7100, itemCount: 3, meetsHardConstraints: true },
  { id: 'd', totalCents: 99900, foodCents: 99900, extraCents: 0, itemCount: 90, meetsHardConstraints: true },
  { id: 'e', totalCents: 100, foodCents: 100, extraCents: 0, itemCount: 3, meetsHardConstraints: false }
];
test('省钱按真实实付分排序并执行预算约束', () => {
  assert.deepEqual(rankQuotes(quotes, { mode: 'budget', maxItems: 3, budgetCents: 3000 }).map(q => q.id), ['a']);
});
test('富哥按餐品金额降序，不用配送费与重复堆量抬价', () => {
  assert.deepEqual(rankQuotes(quotes, { mode: 'premium', maxItems: 3 }).map(q => q.id), ['b', 'a', 'c']);
});
test('预算不满足就返回空，不偷偷超预算', () => {
  assert.deepEqual(rankQuotes(quotes, { mode: 'budget', maxItems: 3, budgetCents: 1000 }), []);
});
test('拒绝小数分、总价分项不符、无效排序模式和份量上限', () => {
  assert.throws(() => rankQuotes([{ ...quotes[0], totalCents: 25.9 }], { mode: 'budget', maxItems: 3 }));
  assert.throws(() => rankQuotes([{ ...quotes[0], extraCents: 0 }], { mode: 'budget', maxItems: 3 }));
  assert.throws(() => rankQuotes(quotes, { mode: 'unknown' as any, maxItems: 3 }));
  assert.throws(() => rankQuotes(quotes, { mode: 'budget', maxItems: 0 }));
});

test('不修改原候选数组，同价结果稳定', () => {
  const before = JSON.stringify(quotes);
  rankQuotes(quotes, { mode: 'premium', maxItems: 3 });
  assert.equal(JSON.stringify(quotes), before);
  const a={...quotes[0], id:'a'};
  const b={...quotes[0], id:'b'};
  assert.deepEqual(rankQuotes([b,a],{mode:'budget',maxItems:3}).map(q=>q.id),['a','b']);
});
test('拒绝重复标识、未验证约束以及小数餐品数量', () => {
  assert.throws(()=>rankQuotes([quotes[0],quotes[0]],{mode:'budget',maxItems:3}));
  assert.throws(()=>rankQuotes([{...quotes[0],meetsHardConstraints:undefined as any}],{mode:'budget',maxItems:3}));
  assert.throws(()=>rankQuotes([{...quotes[0],itemCount:1.5}],{mode:'budget',maxItems:3}));
});
test('刚好达到预算仍可选，最低超出一分就排除', () => {
  assert.equal(rankQuotes([quotes[0]],{mode:'budget',budgetCents:2590,maxItems:3}).length,1);
  assert.equal(rankQuotes([quotes[0]],{mode:'budget',budgetCents:2589,maxItems:3}).length,0);
});
test('富哥同餐品金额优先额外费用低的方案', () => {
  const expensiveFees={...quotes[0],id:'fees',extraCents:200,totalCents:2690};
  assert.deepEqual(rankQuotes([expensiveFees,quotes[0]],{mode:'premium',maxItems:3}).map(q=>q.id),['a','fees']);
});
