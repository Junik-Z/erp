import request from "@/request";

/**
 * @description 获取物流统计
 */
export function getCountApi(data) {
  return request({
    url: "/logistics/count",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的配送单
 */
export function getDeliveryMyListApi(data) {
  return request({
    url: "/delivery/myList",
    method: "get",
    data,
  });
}

/**
 * @description 获取配送单详情
 */
export function getDeliveryInfoApi(data) {
  return request({
    url: "/delivery/detail",
    method: "get",
    data,
  });
}

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

/**
 * @description 指定物流商
 */
export function putBindApi(data) {
  return request({
    url: "/delivery/bind",
    method: "post",
    data,
  });
}

/**
 * @description 获取物流商列表
 */
export function getLogisticsListApi(data) {
  return request({
    url: "/logistics/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取物流商详情
 */
export function getLogisticsInfoApi(data) {
  return request({
    url: "/logistics/detail",
    method: "get",
    data,
  });
}

/**
 * @description 获取绑定的物流商
 */
export function getLogisticsBindInfoApi(data) {
  return request({
    url: "/logistics/getBindInfo",
    method: "get",
    data,
  });
}

/**
 * @description 添加物流商
 */
export function addedLogisticsApi(data) {
  return request({
    url: "/logistics/add",
    method: "post",
    data,
  });
}

/**
 * @description 绑定物流商
 */
export function bindLogisticsApi(data) {
  return request({
    url: "/logistics/bind",
    method: "post",
    data,
  });
}

/**
 * @description 删除物流商
 */
export function removeLogisticsApi(data) {
  return request({
    url: "/logistics/delete",
    method: "post",
    data,
  });
}

/**
 * @description 修改物流商
 */
export function editLogisticsApi(data) {
  return request({
    url: "/logistics/edit",
    method: "post",
    data,
  });
}

/**
 * @description 刷新物流商金额
 */
export function refreshLogisticsApi(data) {
  return request({
    url: "/logistics/refresh",
    method: "post",
    data,
  });
}

/**
 * @description 解绑物流商
 */
export function unbindLogisticsApi(data) {
  return request({
    url: "/logistics/unbind",
    method: "post",
    data,
  });
}

/**
 * @description 核对物流商费用列表
 */
export function checkListApi(data) {
  return request({
    url: "/delivery/checkList",
    method: "get",
    data,
  });
}
