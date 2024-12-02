import request from "@/request";

/**
 * @description 获取所有商户列表
 */
export function getBusinessesListApi(data) {
  return request({
    url: "/manage/businesses",
    method: "get",
    data,
  });
}

/**
 * @description 获取商户用户列表
 */
export function getBusinessesUserListApi(data) {
  return request({
    url: "/manage/businessUsers",
    method: "get",
    data,
  });
}

/**
 * @description 获取商家二维码
 */
export function getBusinessesQRCodeApi(data) {
  return request({
    url: "/manage/getBusinessQRCode",
    method: "get",
    data,
  });
}

/**
 * @description 开户商户
 */
export function addedBusinessesApi(data) {
  return request({
    url: "/manage/addBusiness",
    method: "post",
    data,
  });
}

/**
 * @description 配置管理
 */
export function advertisingBusinessesApi(data) {
  return request({
    url: "/manage/advertising",
    method: "post",
    data,
  });
}

/**
 * @description 生成商户二维码
 */
export function generateQRCodeBusinessesApi(data) {
  return request({
    url: "/manage/generateQRCode",
    method: "post",
    data,
  });
}

/**
 * @description 设置商户角色
 */
export function setBusinessUserRoleApi(data) {
  return request({
    url: "/manage/setBusinessUserRole",
    method: "post",
    data,
  });
}

/**
 * @description 获取用户列表
 */
export function getUserListApi(data) {
  return request({
    url: "/user/list",
    method: "get",
    data,
  });
}

/**
 * @description 设置用户权限
 */
export function setUserRoleApi(data) {
  return request({
    url: "/user/set-permission",
    method: "post",
    data,
  });
}

/**
 * @description 获取权限组用户列表
 */
export function getPermissionsApi(data) {
  return request({
    url: "/user/list-permission",
    method: "get",
    data,
  });
}
