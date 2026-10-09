# 本地价格排序助手

scripts/meal-math.ts 是无网络、无外部依赖的 TypeScript 脚本，不读取凭据，仅读取显式指定的 JSON。需要 Node.js 22.18+ / 24+ 的直接执行能力。路径相对技能目录：

```sh
node scripts/meal-math.ts <本地价格排序输入.json>
```

无法运行时用宿主可信计算器按相同规则核对，并说明没有执行脚本；不自动安装依赖。临时数据保存在宿主允许的本地工作区，不写入公开仓库。

## 价格排序输入

```json
{
  "options": {"mode": "budget", "budgetCents": 3000, "maxItems": 3},
  "quotes": [{"id": "A", "totalCents": 2500, "foodCents": 2500, "extraCents": 0, "itemCount": 3, "meetsHardConstraints": true}]
}
```

这是合成格式示例，不是真实价格。mode=budget 按实付升序；mode=premium 按商品金额降序，同价时额外费用少者优先。预算不限时省略 budgetCents，仍须有份量上限 maxItems。
totalCents 来源于成功试算 price，foodCents 来源于 productPrice，extraCents 为已核对的其余费用总和，三者必须对账。不再减 discount。itemCount 按拆解后实际食用单份计数，不能把多人套餐算成一份。进入排序之前，AI 必须验证每个候选符合相同人数/餐品槽位、偏好、预算之外的硬约束，才可设置 meetsHardConstraints:true。脚本不能替代该语义核验。
所有金额使用整数分，展示元时最后除以 100。无可行方案返回 []，应询问最小约束调整；不得返回“自动超预算”的结果。
