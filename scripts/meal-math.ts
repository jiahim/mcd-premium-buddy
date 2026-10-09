import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
type Quote = { id: string; totalCents: number; foodCents: number; extraCents: number; itemCount: number; meetsHardConstraints: boolean };
function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export function rankQuotes(quotes: Quote[], options: { mode: 'budget' | 'premium'; budgetCents?: number; maxItems: number }): Quote[] {
  requireThat(options.mode === 'budget' || options.mode === 'premium', '排序模式无效');
  requireThat(Number.isSafeInteger(options.maxItems) && options.maxItems > 0, '必须提供有效份量上限');
  requireThat(options.budgetCents === undefined || (Number.isSafeInteger(options.budgetCents) && options.budgetCents >= 0), '预算必须是非负整数分');
  requireThat(Array.isArray(quotes), '候选方案必须是数组');
  const ids = new Set<string>();
  for (const q of quotes) {
    requireThat(typeof q.id === 'string' && q.id.trim() && !ids.has(q.id), '方案标识无效或重复');
    ids.add(q.id);
    for (const key of ['totalCents', 'foodCents', 'extraCents'] as const) requireThat(Number.isSafeInteger(q[key]) && q[key] >= 0, '金额必须是非负整数分');
    requireThat(q.foodCents + q.extraCents === q.totalCents, '总价与分项不符，先核对试算响应');
    requireThat(Number.isSafeInteger(q.itemCount) && q.itemCount > 0, '餐品份量无效');
    requireThat(typeof q.meetsHardConstraints === 'boolean', '必须核验硬约束');
  }
  return quotes.filter(q => q.meetsHardConstraints && q.itemCount <= options.maxItems && (options.budgetCents === undefined || q.totalCents <= options.budgetCents))
    .sort((a, b) => options.mode === 'budget' ? a.totalCents - b.totalCents || a.id.localeCompare(b.id) : b.foodCents - a.foodCents || a.totalCents - b.totalCents || a.id.localeCompare(b.id));
}


// Explicit local input only; no tokens, network, account writes, or order creation.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [file] = process.argv.slice(2);
    requireThat(file && process.argv.length === 3, '用法：node scripts/meal-math.ts 本地排序输入.json');
    const input = JSON.parse(readFileSync(file, 'utf8'));
    process.stdout.write(JSON.stringify(rankQuotes(input.quotes, input.options), null, 2) + '\n');
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : '计算失败') + '\n');
    process.exitCode = 1;
  }
}
