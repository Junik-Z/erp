import request from "@/request";

/**
 * @description 获取配送订单列表
 */
export function getDeliveryListApi(data) {
  return request({
    url: "/delivery/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取配送历史订单列表
 */
export function getDeliveryHistoryListApi(data) {
  return request({
    url: "/delivery/history",
    method: "get",
    data,
  });
}

/**
 * @description 取消配送订单
 */
export function cancelDeliveryApi(data) {
  return request({
    url: "/delivery/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 完成配送订单
 */
export function confirmDeliveryApi(data) {
  return request({
    url: "/delivery/confirm",
    method: "post",
    data,
  });
}
