import request from "@/request";

/**
 * @description 库存统计
 */
export function getCountApi(data) {
  return request({
    url: "/stock/count",
    method: "get",
    data,
  });
}

/**
 * @description 入库列表
 */
export function getInboundListApi(data) {
  return request({
    url: "/stock/inbound/list",
    method: "get",
    data,
  });
}

/**
 * @description 入库详情
 */
export function getInboundDetailApi(data) {
  return request({
    url: "/stock/inbound/detail",
    method: "get",
    data,
  });
}

/**
 * @description 出库详情
 */
export function getOutboundDetailApi(data) {
  return request({
    url: "/stock/outbound/detail",
    method: "get",
    data,
  });
}

/**
 * @description 入库历史列表
 */
export function getInboundHistoryListApi(data) {
  return request({
    url: "/stock/inbound/history",
    method: "get",
    data,
  });
}

/**
 * @description 确认入库
 */
export function confirmInboundApi(data) {
  return request({
    url: "/stock/inbound/confirm",
    method: "post",
    data,
  });
}

/**
 * @description 取消入库
 */
export function cancelInboundApi(data) {
  return request({
    url: "/stock/inbound/cancel",
    method: "post",
    data,
  });
}


/**
 * @description 出库列表
 */
export function getOutboundListApi(data) {
  return request({
    url: "/stock/outbound/list",
    method: "get",
    data,
  });
}

/**
 * @description 出库历史列表
 */
export function getOutboundHistoryListApi(data) {
  return request({
    url: "/stock/outbound/history",
    method: "get",
    data,
  });
}

/**
 * @description 确认出库
 */
export function confirmOutboundApi(data) {
  return request({
    url: "/stock/outbound/confirm",
    method: "post",
    data,
  });
}

/**
 * @description 取消出库
 */
export function cancelOutboundApi(data) {
  return request({
    url: "/stock/outbound/cancel",
    method: "post",
    data,
  });
}

/** ———————————————— 核对 —————————————————— */
/**
 * @description 获取核对列表
 */
export function getCheckListApi(data) {
  return request({
    url: "/stock/check",
    method: "get",
    data,
  });
}

/**
 * @description 获取入库核对列表
 */
export function getInboundDetailListApi(data) {
  return request({
    url: "/stock/inboundDetail",
    method: "get",
    data,
  });
}

/**
 * @description 获取出库核对列表
 */
export function getOutboundDetailListApi(data) {
  return request({
    url: "/stock/outboundDetail",
    method: "get",
    data,
  });
}

/**
 * @description 刷新产品库存
 */
export function refreshStockApi(data) {
  return request({
    url: "/stock/refresh",
    method: "post",
    data,
  });
}


/**
 * @description 获取出库核对列表
 */
export function getWarningListApi(data) {
  return request({
    url: "/stock/warningList",
    method: "get",
    data,
  });
}
