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
 * @description 获取客户列表
 */
export function getCustomerUserListApi(data) {
  return request({
    url: "/customer/user-list",
    method: "get",
    data,
  });
}

/**
 * @description 获取临时客户列表
 */
export function getTempCustomerListApi(data) {
  return request({
    url: "/customer/temp",
    method: "get",
    data,
  });
}

/**
 * @description 转换客户
 */
export function convertTempCustomerApi(data) {
  return request({
    url: "/customer/convert",
    method: "post",
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
 * @description 刷新客户金额
 */
export function refreshCustomerApi(data) {
  return request({
    url: "/customer/refresh",
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
 * @description 获取销售待付款订单
 */
export function getSaleWaitPaymentListApi(data) {
  return request({
    url: "/sale/waitPayment",
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
  }, true);
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
 * @description 重新下单
 */
export function reOrderSaleApi(data) {
  return request({
    url: "/sale/reOrder",
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
 * @description 获取退货销售待付款订单
 */
export function getSaleReturnWaitPaymentApi(data) {
  return request({
    url: "/sale/return/waitPayment",
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
 * @description 更新退货销售订单
 */
export function reOrderSaleReturnApi(data) {
  return request({
    url: "/sale/return/reOrder",
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
    url: "/sale/return/confirm",
    method: "post",
    data,
  });
}

/**
 * @description 打印单据
 */
export function printSaleApi(data) {
  return request({
    url: "/sale/print",
    method: "post",
    data,
  });
}

/**
 * @description 打印退货单据
 */
export function returnPrintSaleApi(data) {
  return request({
    url: "/sale/return/print",
    method: "post",
    data,
  });
}


/**
 * @description 获取绑定用户信息
 */
export function getBindInfoApi(data) {
  return request({
    url: "/customer/getBindInfo",
    method: "get",
    data,
  });
}

/**
 * @description 获取本人的销售单
 */
export function getSaleMyListApi(data) {
  return request({
    url: "/sale/my",
    method: "get",
    data,
  });
}

/**
 * @description 获取其它费用列表
 */
export function getOtherCostListApi(data) {
  return request({
    url: "/sale/otherCostList",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的销售统计
 */
export function getMyStatisticsApi(data) {
  return request({
    url: "/sale/myStatistics",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的销售订单
 */
export function getMySaleListApi(data) {
  return request({
    url: "/sale/my",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的销售退货订单
 */
export function getMyReturnSaleListApi(data) {
  return request({
    url: "/sale/return/my",
    method: "get",
    data,
  });
}

/**
 * @description 获取销售分享出去的ID
 */
export function getSaleShareIdApi(data) {
  return request({
    url: "/sale/share",
    method: "get",
    data,
  });
}

/**
 * @description 校验销售分享出去的ID
 */
export function getSaleCheckShareIdApi(data) {
  return request({
    url: "/sale/shareCheck",
    method: "get",
    data,
  });
}

/**
 * @description 获取最近的销售价格
 */
export function getRecentPriceApi(data) {
  return request({
    url: "/sale/recentPrice",
    method: "get",
    data,
  });
}


// —————————————— 付款相关 ——————————————————
/**
 * @description 获取已经付款的列表
 */
export function getSalePaidOrderApi(data) {
  return request({
    url: "/sale/paid-order",
    method: "get",
    data,
  });
}

/**
 * @description 添加已经付款
 */
export function addedSalePaidOrderApi(data) {
  return request({
    url: "/sale/add-paid-order",
    method: "post",
    data,
  });
}


/**
 * @description 修改已经付款
 */
export function editSalePaidOrderApi(data) {
  return request({
    url: "/sale/edit-paid-order",
    method: "post",
    data,
  });
}

// ———————————————————— 退货付款 ————————————————————

/**
 * @description 获取已经付款的列表
 */
export function getSaleReturnedOrderApi(data) {
  return request({
    url: "/sale/return/returned-order",
    method: "get",
    data,
  });
}

/**
 * @description 添加已经付款
 */
export function addedSaleReturnedOrderApi(data) {
  return request({
    url: "/sale/return/add-returned-order",
    method: "post",
    data,
  });
}

/**
 * @description 修改已经付款
 */
export function editSaleReturnedOrderApi(data) {
  return request({
    url: "/sale/return/edit-returned-order",
    method: "post",
    data,
  });
}


// ———————————————————— 快捷出入库 ————————————————————
/**
 * @description 快捷出库
 */
export function quickOutApi(data) {
  return request({
    url: "/sale/quick-out",
    method: "post",
    data,
  });
}

/**
 * @description 快捷入库
 */
export function quickInApi(data) {
  return request({
    url: "/sale/return/quick-in",
    method: "post",
    data,
  });
}
