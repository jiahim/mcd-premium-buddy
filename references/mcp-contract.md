# MCP 契约快照与调用顺序

核验日期：2026-10-09。来源：官方 https://mcp.mcd.cn 的实际 tools/list。运行时重新检查工具定义。没有列出的字段不代表不存在；不要自行发明餐品、券、门店编码。

|工具|关键输入|用途|
|---|---|---|
|query-nearby-stores|beType、searchType；按位置查询时 city、keyword|到店门店|
|delivery-query-addresses|依当前 schema；仅用户授权外送场景|已存配送地址|
|delivery-query-stores|依当前 schema，由地址结果取得所需参数|外送门店与业务编码|
|query-meals|storeCode、orderType、beType；按场景 beCode|当次菜单及餐品 code|
|query-meal-detail|上述上下文 + code|套餐轮次与特制|
|query-store-coupons|storeCode、orderType、beType；按场景 beCode|当前用户门店可用券|
|calculate-price|门店上下文 + 非空 items|最终价格核验|

到店自取 beType=1 → orderType=1，不传 beCode；得来速 beType=5 → orderType=1，必须保留门店返回 beCode；麦乐送 beType=2 → orderType=2，必须保留配送门店返回 beCode。本版不覆盖 beType=6 企业团餐；query-promotions 当前仅适用于该团餐业务，不能误用于个人到店优惠。
预约时间由用户从门店返回选项中选择；reservationDate 格式 yyyy-MM-dd HH:mm，沿用所有后续调用。无预约不传。不要省略影响预约选择的可选日期/时段；本版通常使用即时取餐。

## 核心请求形状

以下是结构说明，不是可直接发送的真实编码。每个值都要来自当次菜单/门店/券结果。

```json
{
  "storeCode": "<门店返回编码>", "orderType": 1, "beType": 1,
  "items": [{
    "productCode": "<菜单餐品code>", "quantity": 1,
    "roundList": [{"round": "<详情round.id转为字符串>", "comboItemList": [
      {"code": "<选中choice.code>", "quantity": 1}
    ]}]
  }]
}
```

单品无选配时省略 roundList。有券时在对应 item 填 couponId、couponCode，来自当前用户门店可用券；不把券码展示或记录到公开产物。套餐各 round 的 minQuantity/maxQuantity 和 choice.maxQuantity 都要检查。特制 values 的 key 取 selectedKey；有 unselectedKey 的未选项也需按定义传入，不自行拼接 key。

## 响应处理

优先 structuredContent；否则读取 text 内明确的 API JSON 区域。检查 MCP isError、业务 success/code/message。文本说明不是 JSON 本体。拿不到结构化结果就停止，不从介绍文案猜测结果。
价格字段以本次 schema 为准。已核实 price/productPrice/deliveryPrice/packingPrice/tablewarePrice 为分。如分项总和与 price 不一致，先解释额外优惠或字段含义；在核对前不要交给排序脚本。

## 官方资料

- MCP 接入与工具：https://github.com/M-China/mcd-mcp-server

## 详情数量边界

实测部分 choice.maxQuantity=-1，而所属 round 的 minQuantity/maxQuantity=1。不能将 -1 作为负数限购直接否决候选，也不能据此无限加量；按 round 有界选择一项，最终用官方试算核验。部分 isDefault 标记可能重复，优先核对 quantity 与整轮数量限制，并显式构造实际选中的 roundList，不把所有 isDefault=1 全部相加。
