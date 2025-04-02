import request from "@/request";

/**
 * @description 获取应收款列表
 */
export function getReceivableListApi(data) {
  return request({
    url: "/finance/receivable/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取应收款统计
 */
export function getReceivableCountApi(data) {
  return request({
    url: "/finance/receivable/count",
    method: "get",
    data,
  });
}

/**
 * @description 获取应收款明细
 */
export function getReceivableDetailApi(data) {
  return request({
    url: "/finance/receivable/detail",
    method: "get",
    data,
  });
}

/**
 * @description 获取应收款历史列表
 */
export function getReceivableHistoryListApi(data) {
  return request({
    url: "/finance/receivable/history",
    method: "get",
    data,
  });
}

/**
 * @description 获取用户应收款列表
 */
export function getReceivableCheckApi(data) {
  return request({
    url: "/finance/receivable/check",
    method: "get",
    data,
  });
}

/**
 * @description 完成收款
 */
export function finishReceivableApi(data) {
  return request({
    url: "/finance/receivable/finish",
    method: "post",
    data,
  });
}

/**
 * @description 取消收款
 */
export function cancelReceivableApi(data) {
  return request({
    url: "/finance/receivable/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 获取应付款列表
 */
export function getPayableListApi(data) {
  return request({
    url: "/finance/payable/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取应付款统计
 */
export function getPayableCountApi(data) {
  return request({
    url: "/finance/payable/count",
    method: "get",
    data,
  });
}

/**
 * @description 获取应付款历史列表
 */
export function getPayableHistoryListApi(data) {
  return request({
    url: "/finance/payable/history",
    method: "get",
    data,
  });
}

/**
 * @description 获取可完成收款的订单
 */
export function getAchievableListApi(data) {
  return request({
    url: "/finance/receivable/achievable",
    method: "get",
    data,
  });
}

/**
 * @description 完成付款
 */
export function finishPayableApi(data) {
  return request({
    url: "/finance/payable/finish",
    method: "post",
    data,
  });
}

/**
 * @description 取消付款
 */
export function cancelPayableApi(data) {
  return request({
    url: "/finance/payable/cancel",
    method: "post",
    data,
  });
}

/**
 * @description 获取已收款单据列表
 */
export function getPaidOrderListApi(data) {
  return request({
    url: "/finance/paid-order",
    method: "get",
    data,
  });
}

/**
 * @description 获取用户应付款列表
 */
export function getPayableCheckApi(data) {
  return request({
    url: "/finance/payable/check",
    method: "get",
    data,
  });
}

/**
 * @description 获取可完成付款订单
 */
export function getPayableAchievableApi(data) {
  return request({
    url: "/finance/payable/achievable",
    method: "get",
    data,
  });
}

/**
 * @description 获取付款订单详情
 */
export function getPayableDetailApi(data) {
  return request({
    url: "/finance/payable/detail",
    method: "get",
    data,
  });
}

/**
 * @description 添加已收款单据
 */
export function addedPaidOrderApi(data) {
  return request({
    url: "/finance/add-paid-order",
    method: "post",
    data,
  });
}

/**
 * @description 修改已收款单据
 */
export function editPaidOrderApi(data) {
  return request({
    url: "/finance/edit-paid-order",
    method: "post",
    data,
  });
}

/**
 * @description 确认已收款单据
 */
export function confirmPaidOrderApi(data) {
  return request({
    url: "/finance/confirm-paid-order",
    method: "post",
    data,
  });
}

/**
 * @description 获取付款单据列表
 */
export function getReturnedOrderListApi(data) {
  return request({
    url: "/finance/returned-order",
    method: "get",
    data,
  });
}

/**
 * @description 添加已付款单据
 */
export function addedReturnedOrderApi(data) {
  return request({
    url: "/finance/add-returned-order",
    method: "post",
    data,
  });
}

/**
 * @description 修改已付款单据
 */
export function editReturnedOrderApi(data) {
  return request({
    url: "/finance/edit-returned-order",
    method: "post",
    data,
  });
}

/**
 * @description 确认已付款单据
 */
export function confirmReturnedOrderApi(data) {
  return request({
    url: "/finance/confirm-returned-order",
    method: "post",
    data,
  });
}

//** ———————————— 其它费用 —————————————— */

/**
 * @description 获取其它费用列表
 */
export function getCostListApi(data) {
  return request({
    url: "/cost/getCostList",
    method: "get",
    data,
  });
}

/**
 * @description 添加其它费用
 */
export function addedCostApi(data) {
  return request({
    url: "/cost/addCost",
    method: "post",
    data,
  });
}

/**
 * @description 其它费用统计
 */
export function statisticsCostApi(data) {
  return request({
    url: "/cost/statistics",
    method: "post",
    data,
  });
}

/**
 * @description 修改其它费用
 */
export function updateCostApi(data) {
  return request({
    url: "/cost/updateCost",
    method: "post",
    data,
  });
}

/**
 * @description 删除其它费用
 */
export function removeCostApi(data) {
  return request({
    url: "/cost/deleteCost",
    method: "post",
    data,
  });
}

/**
 * @description 获取其它费用分类列表
 */
export function getCategoryListApi(data) {
  return request({
    url: "/cost/getCategoryList",
    method: "post",
    data,
  });
}

/**
 * @description 添加其它费用分类
 */
export function addedCategoryApi(data) {
  return request({
    url: "/cost/addCategory",
    method: "post",
    data,
  });
}

/**
 * @description 添加其它费用分类
 */
export function removeCategoryApi(data) {
  return request({
    url: "/cost/deleteCategory",
    method: "post",
    data,
  });
}

/**
 * @description 修改其它费用分类
 */
export function updateCategoryApi(data) {
  return request({
    url: "/cost/updateCategory",
    method: "post",
    data,
  });
}

// ———————————————— 未结清用户 ——————————————

/**
 * @description 获取未结清客户列表
 */
export function getUnpaidCustomerApi(data) {
  return request({
    url: "/finance/unpaid/customer",
    method: "get",
    data,
  });
}

/**
 * @description 获取未结清供应商列表
 */
export function getUnpaidSupplierApi(data) {
  return request({
    url: "/finance/unpaid/supplier",
    method: "get",
    data,
  });
}


// ——————————————— 查询对账单 ————————————————
/**
 * @description 获取销售客户对账单
 */
export function getReceivableCheckBillApi(data) {
  return request({
    url: "/finance/receivable/checkBill",
    method: "get",
    data,
  });
}

/**
 * @description 获取采购供应商对账单
 */
export function getPayableCheckBillApi(data) {
  return request({
    url: "/finance/payable/checkBill",
    method: "get",
    data,
  });
}


// ——————————————— 财务报表 —————————————————
/**
 * @description 获取收支趋势
 */
export function getReportTrendApi(data) {
  return request({
    url: "/finance/report/trend",
    method: "post",
    data,
  });
}

/**
 * @description 获取最近交易
 */
export function getReportRecentApi(data) {
  return request({
    url: "/finance/report/recent",
    method: "get",
    data,
  });
}

/**
 * @description 获取资产统计
 */
export function getReportAssetsApi(data) {
  return request({
    url: "/finance/report/assets",
    method: "get",
    data,
  });
}

/**
 * @description 获取最近交易列表
 */
export function getReportRecentListApi(data) {
  return request({
    url: "/finance/report/recentList",
    method: "get",
    data,
  });
}

/**
 * @description 获取所有客户列表
 */
export function getCustomerListApi(data) {
  return request({
    url: "/finance/report/customer-list",
    method: "get",
    data,
  });
}

/**
 * @description 获取所有供应商列表
 */
export function getSupplierListApi(data) {
  return request({
    url: "/finance/report/supplier-list",
    method: "get",
    data,
  });
}

/**
 * @description 获取所有用户
 */
export function getReportsUserListApi(data) {
  return request({
    url: "/finance/report/user-list",
    method: "get",
    data,
  });
}

// —————————————— 删除单据 ————————————————————
/**
 * @description 删除已付款单据
 */
export function removeReturnedOrderApi(data) {
  return request({
    url: "/finance/delete-returned-order",
    method: "post",
    data,
  });
}

/**
 * @description 删除已收款单据
 */
export function removePaidOrderApi(data) {
  return request({
    url: "/finance/delete-paid-order",
    method: "post",
    data,
  });
}
