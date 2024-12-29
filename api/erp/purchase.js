import request from "@/request";

/**
 * @description 获取供应商列表
 */
export function getSupplierListApi(data) {
  return request({
    url: "/supplier/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取供应商统计
 */
export function getCountSupplierApi(data) {
  return request({
    url: "/supplier/count",
    method: "get",
    data,
  });
}

/**
 * @description 获取供应商详情
 */
export function getDetailSupplierApi(data) {
  return request({
    url: "/supplier/detail",
    method: "get",
    data,
  });
}

/**
 * @description 添加供应商
 */
export function addedSupplierApi(data) {
  return request({
    url: "/supplier/add",
    method: "post",
    data,
  });
}

/**
 * @description 编辑供应商
 */
export function editSupplierApi(data) {
  return request({
    url: "/supplier/edit",
    method: "post",
    data,
  });
}

/**
 * @description 删除供应商
 */
export function removeSupplierApi(data) {
  return request({
    url: "/supplier/delete",
    method: "post",
    data,
  });
}

/**
 * @description 解绑供应商
 */
export function unbindSupplierApi(data) {
  return request({
    url: "/supplier/unbind",
    method: "post",
    data,
  });
}

/**
 * @description 绑定供应商
 */
export function bindSupplierApi(data) {
  return request({
    url: "/supplier/bind",
    method: "post",
    data,
  });
}

/**
 * @description 刷新供应商金额
 */
export function refreshSupplierApi(data) {
  return request({
    url: "/supplier/refresh",
    method: "post",
    data,
  });
}

/**
 * @description 获取采购订单列表
 */
export function getPurchaseListApi(data) {
  return request({
    url: "/purchase/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取采购历史订单列表
 */
export function getPurchaseHistoryListApi(data) {
  return request({
    url: "/purchase/history",
    method: "get",
    data,
  });
}

/**
 * @description 获取采购订单详情
 */
export function getPurchaseDetailApi(data) {
  return request({
    url: "/purchase/detail",
    method: "get",
    data,
  });
}

/**
 * @description 新增采购订单
 */
export function addedPurchaseApi(data) {
  return request({
    url: "/purchase/add",
    method: "post",
    data,
  });
}

/**
 * @description 确认采购订单
 */
export function confirmPurchaseApi(data) {
  return request({
    url: "/purchase/confirm",
    method: "post",
    data,
  });
}

/**
 * @description 删除采购订单
 */
export function removePurchaseApi(data) {
  return request({
    url: "/purchase/delete",
    method: "post",
    data,
  });
}

/**
 * @description 修改采购订单
 */
export function updatePurchaseApi(data) {
  return request({
    url: "/purchase/update",
    method: "post",
    data,
  });
}

/**
 * @description 取消采购订单
 */
export function cancelPurchaseApi(data) {
  return request({
    url: "/purchase/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 获取退货采购订单列表
 */
export function getPurchaseReturnListApi(data) {
  return request({
    url: "/purchase/return/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取退货采购历史订单列表
 */
export function getPurchaseReturnHistoryListApi(data) {
  return request({
    url: "/purchase/return/history",
    method: "get",
    data,
  });
}

/**
 * @description 获取退货采购订单详情
 */
export function getPurchaseReturnDetailApi(data) {
  return request({
    url: "/purchase/return/detail",
    method: "get",
    data,
  });
}

/**
 * @description 新增退货采购订单
 */
export function addedPurchaseReturnApi(data) {
  return request({
    url: "/purchase/return/add",
    method: "post",
    data,
  });
}

/**
 * @description 打印采购订单
 */
export function printPurchaseApi(data) {
  return request({
    url: "/purchase/print",
    method: "post",
    data,
  });
}

/**
 * @description 打印采购订单
 */
export function printA4PurchaseApi(data) {
  return request({
    url: "/purchase/printA4",
    method: "post",
    data,
  });
}

/**
 * @description 打印采购退货订单
 */
export function returnPrintPurchaseApi(data) {
  return request({
    url: "/purchase/return/print",
    method: "post",
    data,
  });
}

/**
 * @description 修改退货采购订单
 */
export function updatePurchaseReturnApi(data) {
  return request({
    url: "/purchase/return/update",
    method: "post",
    data,
  });
}

/**
 * @description 取消退货采购订单
 */
export function cancelPurchaseReturnApi(data) {
  return request({
    url: "/purchase/return/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 确认退货采购订单
 */
export function confirmPurchaseReturnApi(data) {
  return request({
    url: "/purchase/return/confirm",
    method: "post",
    data,
  });
}

/**
 * @description 删除退货采购订单
 */
export function removePurchaseReturnApi(data) {
  return request({
    url: "/purchase/return/delete",
    method: "post",
    data,
  });
}

/**
 * @description 获取本人采购订单
 */
export function getPurchaseListFormMyApi(data) {
  return request({
    url: "/purchase/my",
    method: "get",
    data,
  });
}

/**
 * @description 获取供应商绑定信息
 */
export function getBindInfoApi(data) {
  return request({
    url: "/supplier/getBindInfo",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的采购统计
 */
export function getMyStatisticsPurchaseApi(data) {
  return request({
    url: "/purchase/myStatistics",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的采购列表
 */
export function getMyPurchaseListApi(data) {
  return request({
    url: "/purchase/my",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的采购退货列表
 */
export function getReturnMyPurchaseListApi(data) {
  return request({
    url: "/purchase/return/my",
    method: "get",
    data,
  });
}

/**
 * @description 分享出去的订单id
 */
export function getPurchaseShareIdApi(data) {
  return request({
    url: "/purchase/share",
    method: "get",
    data,
  });
}


/**
 * @description 校验分享出去的订单id
 */
export function getPurchaseCheckShareIdApi(data) {
  return request({
    url: "/purchase/shareCheck",
    method: "get",
    data,
  });
}
