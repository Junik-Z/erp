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

/**
 * @description 计算板材排列
 */
export function customizedCalculateApi(data) {
  return request({
    url: "/customized-board/calculate",
    method: "post",
    data,
  });
}

/**
 * @description 获取我的生产工资
 */
export function getMySalaryApi(data) {
  return request({
    url: "/craft/mySalary",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的生产任务
 */
export function getMyWorkingListApi(data) {
  return request({
    url: "/craft/myWorking",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的待确认生产任务
 */
export function getWaitMyConfirmListApi(data) {
  return request({
    url: "/craft/waitMyConfirm",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的已结算生产任务
 */
export function getMySettledListApi(data) {
  return request({
    url: "/craft/mySettled",
    method: "get",
    data,
  });
}

/**
 * @description 获取待结算
 */
export function getWaitConfirmListApi(data) {
  return request({
    url: "/craft/waitConfirm",
    method: "get",
    data,
  });
}

/**
 * @description 获取已结算
 */
export function getSettledListApi(data) {
  return request({
    url: "/craft/settled",
    method: "get",
    data,
  });
}

/**
 * @description 获取生产中
 */
export function getWorkingListApi(data) {
  return request({
    url: "/craft/working",
    method: "get",
    data,
  });
}
