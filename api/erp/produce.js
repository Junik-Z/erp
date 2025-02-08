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
 * @description 获取生产中列表
 */
export function getProduceInListApi(data) {
  return request({
    url: "/produce/pending",
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
 * @description 获取我的本月金额统计
 */
export function getMyMonthListApi(data) {
  return request({
    url: "/craft/myMonth",
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

/**
 * @description 申请结算当前工艺
 */
export function applySettleApi(data) {
  return request({
    url: "/craft/applySettle",
    method: "post",
    data,
  });
}

/**
 * @description 取消结算工艺
 */
export function cancelSettleApi(data) {
  return request({
    url: "/craft/cancelSettle",
    method: "post",
    data,
  });
}

/**
 * @description 确认结算工艺
 */
export function confirmSettleApi(data) {
  return request({
    url: "/craft/confirmSettle",
    method: "post",
    data,
  });
}

/**
 * @description 更新生产流程
 */
export function craftUpdateApi(data) {
  return request({
    url: "/craft/update",
    method: "post",
    data,
  });
}

/**
 * @description 暂停/恢复生产
 */
export function pauseProduceApi(data) {
  return request({
    url: "/produce/pause",
    method: "post",
    data,
  });
}


/**
 * @description 获取快捷生产列表
 */
export function getQuickListApi(data) {
  return request({
    url: "/quick/produce/list",
    method: "get",
    data,
  });
}

/**
 * @description 删除快捷生产
 */
export function removeQuickApi(data) {
  return request({
    url: "/quick/produce/delete",
    method: "post",
    data,
  });
}

/**
 * @description 添加快捷生产
 */
export function addedQuickApi(data) {
  return request({
    url: "/quick/produce/add",
    method: "post",
    data,
  });
}

/**
 * @description 删除快捷生产
 */
export function detailQuickApi(data) {
  return request({
    url: "/quick/produce/detail",
    method: "get",
    data,
  });
}


/**
 * @description 获取快捷工艺列表
 */
export function getCraftListApi(data) {
  return request({
    url: "/quick/craft/list",
    method: "get",
    data,
  });
}

/**
 * @description 删除快捷工艺
 */
export function removeCraftApi(data) {
  return request({
    url: "/quick/craft/delete",
    method: "post",
    data,
  });
}

/**
 * @description 添加快捷工艺
 */
export function addedCraftApi(data) {
  return request({
    url: "/quick/craft/add",
    method: "post",
    data,
  });
}

/**
 * @description 删除快捷工艺
 */
export function detailCraftApi(data) {
  return request({
    url: "/quick/craft/detail",
    method: "get",
    data,
  });
}

//** ———————————————————— 销售工单相关 —————————————————————————— */

/**
 * @description 获取生产工单详情
 */
export function getOrderCodeDetailApi(data) {
  return request({
    url: "/sale/produce/produceConvertSaleOrder",
    method: "get",
    data,
  });
}

/**
 * @description 获取生产工单详情
 */
export function getProduceOrderCodeDetailApi(data) {
  return request({
    url: "/produce/detail/orderCode",
    method: "get",
    data,
  });
}

/**
 * @description 获取生产工单销售详情
 */
export function getProduceOrderDetailApi(data) {
  return request({
    url: "/sale/produce/detail",
    method: "get",
    data,
  });
}

/**
 * @description 新增销售工单
 */
export function addedSaleProduceApi(data) {
  return request({
    url: "/sale/produce/add",
    method: "post",
    data,
  });
}

/**
 * @description 编辑销售工单
 */
export function updateSaleProduceApi(data) {
  return request({
    url: "/sale/produce/update",
    method: "post",
    data,
  });
}

// ———————————————————— 修改生产中的工单 —————————————————————— */

/**
 * @description 修改生产中的流程
 */
export function updateCraftProcessApi(data) {
  return request({
    url: "/produce/updateCraftProcess",
    method: "post",
    data,
  });
}

/**
 * @description 完成工艺
 */
export function completeCraftApi(data) {
  return request({
    url: "/craft/complete",
    method: "post",
    data,
  });
}

/**
 * @description 恢复工艺
 */
export function recoverCraftApi(data) {
  return request({
    url: "/craft/recover",
    method: "post",
    data,
  });
}

// —————————————————————— CNC加工 ——————————————————————————

/**
 * @description 获取CNC配置
 */
export function getCNCProperties(data) {
  return request({
    url: "/cnc/properties",
    method: "get",
    data,
  });
}

/**
 * @description 更新CNC配置
 */
export function updateCNCProperties(data) {
  return request({
    url: "/cnc/updateProperties",
    method: "post",
    data,
  });
}

/**
 * @description 生成NC程序
 */
export function generateCNCProperties(data) {
  return request({
      url: "/cnc/generateNcProgram",
      method: "post",
      responseType: "arraybuffer",
      data,
    },
    false, true,
  );
}


/**
 * @description 获取所有CNC程序
 */
export function getNCProgramsApi(data) {
  return request({
      url: "/cnc/ncPrograms",
      method: "get",
      data,
    },
  );
}

/**
 * @description 删除CNC程序
 */
export function removeNCProgramsApi(data) {
  return request({
      url: "/cnc/deleteNcProgram",
      method: "post",
      data,
    },
  );
}
