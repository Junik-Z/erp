import request from "@/request";

/**
 * @description 获取生产订单列表
 */
export function getProduceListApi(data) {
  return request({
    url: "/produce/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取生产历史订单列表
 */
export function getProduceHistoryListApi(data) {
  return request({
    url: "/produce/history",
    method: "get",
    data,
  });
}

/**
 * @description 获取生产统计
 */
export function getProduceStatisticsApi(data) {
  return request({
    url: "/produce/statistics",
    method: "get",
    data,
  });
}
/**
 * @description 获取生产工单详情
 */
export function getProduceDetailApi(data) {
  return request({
    url: "/produce/detail",
    method: "get",
    data,
  });
}

/**
 * @description 添加生产订单
 */
export function addedProduceApi(data) {
  return request({
    url: "/produce/add",
    method: "post",
    data,
  });
}

/**
 * @description 取消生产订单
 */
export function cancelProduceApi(data) {
  return request({
    url: "/produce/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 完成生产订单
 */
export function finishProduceApi(data) {
  return request({
    url: "/produce/finish",
    method: "post",
    data,
  });
}

/**
 * @description 修改生产订单
 */
export function updateProduceApi(data) {
  return request({
    url: "/produce/update",
    method: "post",
    data,
  });
}

/**
 * @description 删除生产订单
 */
export function removeProduceApi(data) {
  return request({
    url: "/produce/delete",
    method: "post",
    data,
  });
}

/**
 * @description 申请生产物料
 */
export function applyMaterialProduceApi(data) {
  return request({
    url: "/produce/applyMaterial",
    method: "post",
    data,
  });
}
