# 麦当劳富哥助手的 MCP 集成

## 实际服务与认证

Server：https://mcp.mcd.cn，Streamable HTTP。客户端请求头 Authorization: Bearer ${MCD_MCP_TOKEN}。示例配置仅为环境变量占位模板，运行时由用户自己的本地连接器提供实际凭据。

本次真实握手协商 protocolVersion=2024-11-05，tools/list 返回35个工具。业务采用当次工具schema，不依赖固定全部工具数量。

## 实际调用流程

1. query-nearby-stores：beType=1、searchType=2、city=深圳、keyword=金丰城，取得目标店1421053。
2. query-meals：storeCode=1421053、orderType=1、beType=1；当前返回119个菜单映射项。到店自取不传beCode。
3. 按当次菜单挑选高价餐品，不把有购买会员卡前提的展示价当作普通实付。
4. query-meal-detail：获取需要的套餐round/choice和默认份量，显式构造选配；不改变用户未请求的特制项。
5. calculate-price：传入同一门店上下文及items/roundList。没有传withOrder，没有创建订单。
6. 本地scripts/meal-math.ts：校验整数分与总价，按商品金额降序排序。试算数据是证据，不作为日常固定报价。

## 工具与业务价值

|工具|价值|当前验证|
|---|---|---|
|query-nearby-stores|锁定用户指定门店|真实调用成功|
|query-meals|确认当前可售编码与展示价条件|真实调用成功|
|query-meal-detail|正确处理套餐组成、规格及加价替换|真实调用成功|
|query-store-coupons|仅用户明确要求用券时使用|不属于本技能本次验证路径|
|calculate-price|获得当前真实账单，避免静态价误导|真实调用成功|

## 真实试算节选

地点：深圳金丰城店；到店自取；2026-10-09北京时间。金额为元，包含接口返回的最终price；本次price=productPrice，其他费用字段未单独返回，不把该情况推广到外送。

|方案|试算实付/元|查询时间|
|---|---:|---|
|培根安格斯厚牛堡+中薯条+冰燕麦奶中杯|69.00|2026-10-09 16:08:55|
|培根安格斯厚牛堡+中薯条+浓缩咖啡|63.00|2026-10-09 16:08:56|
|培根安格斯厚牛堡+中薯条+冰奶铁中杯（三件套换饮品）|56.50|2026-10-09 16:08:56|

三个候选均为一份培根安格斯主食、一份中薯条、一份饮品；饮品内容不同。69.00元只是本轮三个已验证候选中商品金额最高，不是整份门店菜单的全局最贵。

脱敏数据见 [接口验证摘要](docs/接口验证摘要.json)。未公开token、账户券码、个人地址、traceId或支付链接。

## 状态与限制

上述是Codex环境中的真实MCP验证，不是WorkBuddy开发记录。WorkBuddy导入与实际技能对话未验证；外送、得来速、预约、实际用券、特制和写操作未验证。后续在WorkBuddy完成真实测试后补充workbuddy.md，不能伪造。

官方：[MCP工具与接入](https://github.com/M-China/mcd-mcp-server)、[比赛要求](https://github.com/M-China/mcd-developer-innovation-challenge/blob/main/activityGuidelines.md)。
