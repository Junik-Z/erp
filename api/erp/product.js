import request from "@/request";

/**
 * @description 获取所有的产品列表
 */
export function getProductListApi(data) {
  return request({
    url: "/product/list",
    method: "get",
    data,
  });
}

/**
 * @description 获取产品字段列表
 */
export function getProductFieldApi(data) {
  return request({
    url: "/product/field",
    method: "get",
    data,
  });
}

/**
 * @description 获取产品分类
 */
export function getProductClassApi(data) {
  return request({
    url: "/product/class",
    method: "get",
    data,
  });
}

/**
 * @description 获取产品详情
 */
export function getDetailApi(data) {
  return request({
    url: "/product/detail",
    method: "get",
    data,
  });
}

/**
 * @description 新增产品分类
 */
export function addedProductClassApi(data) {
  return request({
    url: "/product/class/add",
    method: "post",
    data,
  });
}

/**
 * @description 修改产品分类
 */
export function editProductClassApi(data) {
  return request({
    url: "/product/class/edit",
    method: "post",
    data,
  });
}

/**
 * @description 删除产品分类
 */
export function deleteProductClassApi(data) {
  return request({
    url: "/product/class/delete",
    method: "post",
    data,
  });
}

/**
 * @description 新增产品字段
 */
export function addedProductFieldApi(data) {
  return request({
    url: "/product/field/add",
    method: "post",
    data,
  });
}

/**
 * @description 修改产品字段
 */
export function editProductFieldApi(data) {
  return request({
    url: "/product/field/edit",
    method: "post",
    data,
  });
}

/**
 * @description 删除产品字段
 */
export function deleteProductFieldApi(data) {
  return request({
    url: "/product/field/delete",
    method: "post",
    data,
  });
}

/**
 * @description 新增产品
 */
export function addedProductApi(data) {
  return request({
    url: "/product/add",
    method: "post",
    data,
  });
}

/**
 * @description 修改产品
 */
export function editProductApi(data) {
  return request({
    url: "/product/edit",
    method: "post",
    data,
  });
}

/**
 * @description 删除产品
 */
export function deleteProductApi(data) {
  return request({
    url: "/product/delete",
    method: "post",
    data,
  });
}

/**
 * @description 上下架销售
 */
export function upDownSaleApi(data) {
  return request({
    url: "/product/upDownSale",
    method: "post",
    data,
  });
}

/**
 * @description 上下架采购
 */
export function upDownPurchaseApi(data) {
  return request({
    url: "/product/upDownPurchase",
    method: "post",
    data,
  });
}


/**
 * @description 上下架销售分类
 */
export function upDownSaleClassApi(data) {
  return request({
    url: "/product/class/upDownSale",
    method: "post",
    data,
  });
}

/**
 * @description 上下架采购分类
 */
export function upDownPurchaseClassApi(data) {
  return request({
    url: "/product/class/upDownPurchase",
    method: "post",
    data,
  });
}

/**
 * @description 检查重复产品
 */
export function checkDuplicateApi(data) {
  return request({
    url: "/product/checkDuplicate",
    method: "post",
    data,
  });
}


/**
 * @description 分享出去获取分享ID
 */
export function shareProductApi(data) {
  return request({url: "/share/shareProduct", method: "post", data});
}

/**
 * @description 检查重复产品
 */
export function checkDuplicateByShareApi(data) {
  return request({url: "/share/checkDuplicate", method: "post", data});
}


/**
 * @description 获取所有分享的产品
 */
export function getShareProductApi(data) {
  return request({url: "/share/getShareProduct", method: "get", data});
}


/**
 * @description 获取所有分享的产品
 */
export function getProductExtApi(data) {
  return request({url: "/share/getProductExt", method: "get", data});
}

/**
 * @description 接收分享过来的产品
 */
export function receiveShareProductApi(data) {
  return request({url: "/share/receiveShareProduct", method: "post", data});
}


/**
 * @description 获取员工
 */
export function getStaffListApi(data) {
  return request({url: "/staff/list", method: "get", data});
}


/**
 * @description 获取未被绑定的员工
 */
export function getNotBindInfoApi(data) {
  return request({url: "/staff/getNotBindInfo", method: "get", data});
}

/**
 * @description 添加员工
 */
export function addedStaffApi(data) {
  return request({url: "/staff/add", method: "post", data});
}

/**
 * @description 修改员工
 */
export function editStaffApi(data) {
  return request({url: "/staff/edit", method: "post", data});
}

/**
 * @description 删除员工
 */
export function removeStaffApi(data) {
  return request({url: "/staff/delete", method: "post", data});
}


/**
 * @description 绑定员工
 */
export function bindStaffApi(data) {
  return request({url: "/staff/bind", method: "post", data});
}

/**
 * @description 解绑员工
 */
export function unbindStaffApi(data) {
  return request({url: "/staff/unbind", method: "post", data});
}

/**
 * @description 刷新员工金额
 */
export function refreshStaffApi(data) {
  return request({url: "/staff/refresh", method: "post", data});
}


/**
 * @description 员工详情
 */
export function getStaffInfoApi(data) {
  return request({url: "/staff/detail", method: "get", data});
}

/**
 * @description 获取员工列表
 */
export function getStaffUserListApi(data) {
  return request({url: "/staff/user-list", method: "get", data});
}
