import request from "@/request";

/**
 * @description 获取客户列表
 */
export function getCustomerListApi(data) {
  return request({
    url: "/customer/list",
    method: "get",
    data,
  });
}

/**
 * @description 新增客户
 */
export function addedCustomerApi(data) {
  return request({
    url: "/customer/add",
    method: "post",
    data,
  });
}

/**
 * @description 编辑客户
 */
export function editCustomerApi(data) {
  return request({
    url: "/customer/edit",
    method: "post",
    data,
  });
}

/**
 * @description 客户详情
 */
export function getCustomerInfoApi(data) {
  return request({
    url: "/customer/detail",
    method: "get",
    data,
  });
}

/**
 * @description 删除客户
 */
export function removeCustomerApi(data) {
  return request({
    url: "/customer/delete",
    method: "post",
    data,
  });
}

/**
 * @description 绑定客户
 */
export function bindCustomerApi(data) {
  return request({
    url: "/customer/bind",
    method: "post",
    data,
  });
}

/**
 * @description 解绑客户
 */
export function unbindCustomerApi(data) {
  return request({
    url: "/customer/unbind",
    method: "post",
    data,
  });
}

/**
 * @description 获取统计数据
 */
export function getStatisticsApi(data) {
  return request({
    url: "/sale/statistics",
    method: "get",
    data,
  });
}


/**
 * @description 获取销售订单
 */
export function getSaleListApi(data) {
  return request({
    url: "/sale/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取销售历史订单
 */
export function getSaleHistoryApi(data) {
  return request({
    url: "/sale/history",
    method: "get",
    data,
  });
}

/**
 * @description 获取销售订单详情
 */
export function getSaleDetailApi(data) {
  return request({
    url: "/sale/detail",
    method: "get",
    data,
  });
}

/**
 * @description 新增销售订单
 */
export function addedSaleApi(data) {
  return request({
    url: "/sale/add",
    method: "post",
    data,
  });
}

/**
 * @description 提交销售订单
 */
export function submitSaleApi(data) {
  return request({
    url: "/sale/submit",
    method: "post",
    data,
  });
}

/**
 * @description 删除销售订单
 */
export function removeSaleApi(data) {
  return request({
    url: "/sale/delete",
    method: "post",
    data,
  });
}

/**
 * @description 更新销售订单
 */
export function updateSaleApi(data) {
  return request({
    url: "/sale/update",
    method: "post",
    data,
  });
}

/**
 * @description 取消销售订单
 */
export function cancelSaleApi(data) {
  return request({
    url: "/sale/cancel",
    method: "post",
    data,
  });
}


/**
 * @description 获取退货销售订单
 */
export function getSaleReturnListApi(data) {
  return request({
    url: "/sale/return/list",
    method: "get",
    data,
  });
}
/**
 * @description 获取退货销售订单详情
 */
export function getSaleReturnDetailApi(data) {
  return request({
    url: "/sale/return/detail",
    method: "get",
    data,
  });
}

/**
 * @description 获取退货销售历史订单
 */
export function getSaleReturnHistoryApi(data) {
  return request({
    url: "/sale/return/history",
    method: "get",
    data,
  });
}

/**
 * @description 新增退货销售订单
 */
export function addedSaleReturnApi(data) {
  return request({
    url: "/sale/return/add",
    method: "post",
    data,
  });
}

/**
 * @description 更新退货销售订单
 */
export function updateSaleReturnApi(data) {
  return request({
    url: "/sale/return/update",
    method: "post",
    data,
  });
}

/**
 * @description 取消退货销售订单
 */
export function cancelSaleReturnApi(data) {
  return request({
    url: "/sale/return/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 删除退货销售订单
 */
export function removeSaleReturnApi(data) {
  return request({
    url: "/sale/return/delete",
    method: "post",
    data,
  });
}

/**
 * @description 确认退货销售订单
 */
export function confirmSaleReturnApi(data) {
  return request({
    url: "/purchase/confirm",
    method: "post",
    data,
  });
}
