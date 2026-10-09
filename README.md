# 麦当劳富哥助手

**只选贵的这件事，也得把账算明白。**

一个独立的 WorkBuddy Skill 项目，调用麦当劳官方 MCP 查询真实门店菜单和价格，按用户的口味、人数、份量与预算推荐套餐。

![技能头像](assets/头像.png)

[下载 WorkBuddy 技能包](packages/麦当劳富哥助手-WorkBuddy-v0.1.0.zip) · [下载头像](assets/头像.png) · [MCP 接入说明](MCP_INTEGRATION.md)

## 面向用户与使用示例

面向想玩高价点餐梗、体验餐品升级组合的用户。口吻一本正经地整活，在同一人数和份量结构内按餐品金额降序推荐。

> 深圳金丰城店，到店自取。一人三件套，预算100，怎么贵怎么来。

具体边界示例见 [使用示例](references/examples.md)。请求只有单品时直接查，不强制输出复杂套餐。结果提供真实费用、搭配理由和可调整项。

## 安装到 WorkBuddy

1. 在 https://open.mcd.cn/mcp 申请自己的 MCP token。
2. 在 WorkBuddy“专家·技能·连接器 → 连接器 → 自定义连接器 → 配置 MCP”中，接入 https://mcp.mcd.cn，类型 streamablehttp，Authorization 使用本地凭据。
3. [mcp-config.example.json](mcp-config.example.json) 只包含环境变量占位符。若客户端不支持展开 `${MCD_MCP_TOKEN}`，在客户端的本地凭据配置中填写，不要将含真实 token 的文件提交到仓库，也不要原样发送占位符。
4. 在“技能 → 添加技能 → 上传技能”导入上方下载的 `麦当劳富哥助手-WorkBuddy-v0.1.0.zip`。ZIP 顶层为 SKILL.md；也可按下文自行打包。
5. 开启连接器和技能，新建对话使用上述示例。配套头像是独立512×512 PNG，平台需要时手动上传。

## 工作方式

约束与口味 → 定位门店 → 菜单/套餐详情 → 构造有界候选 → 官方价格试算 → 确定性金额排序 → 解释推荐。

“只选贵的不选对的”是人设口头禅。候选按餐品金额比较，真实预算与忌口仍然有效；不通过无限堆餐、多人套餐冒充一人份或额外费用来抬高金额。

本版只做查询、比较和试算。不会自动领券、消耗积分、买卡、创建订单或付款。当前展示价格可能含买卡条件，以实际试算为准。

## 开发与本地校验

源码完全独立，不依赖另一个助手的仓库或网络服务。TypeScript 计算脚本无需 npm install；需要 Node.js 22.18+ / 24+ 直接执行能力。

```sh
node --test tests/meal-math.test.ts
node scripts/meal-math.ts tests/排序示例.json
python3 scripts/package.py
```

package.py 默认输出 dist/ 下的技能包与源码包，不含 .git、dist、凭据或临时数据。ZIP 采用明确文件清单，后续添加资源需要同步清单。

- [技能定义](SKILL.md)：触发与执行流程。
- [MCP 集成](MCP_INTEGRATION.md)：实际工具、调用顺序与业务价值。
- [本地计算](references/calculation.md)：金额单位与候选排序输入。
- [验证记录](docs/验证记录.md)：真实联调和未验证范围。
- [WorkBuddy 验收](docs/WorkBuddy验收.md)：真实客户端测试与对话导出。
- [参赛清单](docs/参赛清单.md)：独立仓库的报名要求。

## 状态与限制

版本0.1.0，供导入联调。官方 MCP 的调用结果不等同于 WorkBuddy 客户端验收通过，详见验证记录。推荐只覆盖本次已核验候选，不保证全菜单数学最优。价格、供应和优惠以当前官方结果为准。

个人参赛作品，非麦当劳官方产品。富哥模式以点餐风格为幽默对象，不按消费能力评价人，不贬低群体或品牌，不宣扬浪费。

项目仓库：[jiahim/mcd-premium-buddy](https://github.com/jiahim/mcd-premium-buddy)。该项目独立准备参赛，尚未提交报名。参加 WorkBuddy 专项奖励时，必须真实在 WorkBuddy 开发/调试，导出脱敏实际对话为根目录 workbuddy.md；当前不创建占位或伪造记录。

参考：[比赛规则](https://github.com/M-China/mcd-developer-innovation-challenge/blob/main/activityGuidelines.md)、[官方 MCP](https://github.com/M-China/mcd-mcp-server)、[WorkBuddy Skill 规范](https://open.workbuddy.cn/docs/skill)。
