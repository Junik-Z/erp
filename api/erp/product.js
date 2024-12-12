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
  }, true);
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
