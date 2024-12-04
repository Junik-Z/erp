import request from "@/request";
import { CONFIG } from "@/utils/config";

/**
 * @description 判断是不是已经登陆了
 */
export function isLogin() {
  return !!uni.getStorageSync("Cookie");
}

/**
 * @description 处理微信登陆
 */
export function goLogin() {
  return new Promise((resolve, reject) => {
    if (uni.__LOGIN_LOADING__) {
      reject("__stop__");
      return false;
    }

    uni.login({
      success: resp => {
        uni.__LOGIN_LOADING__ = true;

        const {code} = resp;
        loginApi({code})
          .then((res) => {
            resolve(res);
            uni.$emit("$__login_success__", res);
          })
          .catch(reject)
          .finally(() => {
            setTimeout(() => {
              uni.__LOGIN_LOADING__ = false;
            }, 10);
          });
      },
    });
  });
}

/**
 * @description 获取图片链接地址
 */
export function getImgUrl(url) {
  return `${CONFIG.BASE_URL}${url}`;
}

/**
 * @description 获取我的信息
 */
export function getMyInfoApi(data) {
  return request({
    url: "/main/myInfo",
    method: "get",
    data,
  });
}

/**
 * @description 获取首页及配置信息
 */
export function getConfigApi(data) {
  return request({
    url: "/main/index",
    method: "get",
    data,
  });
}

/**
 * @description 获取订阅消息
 */
export function getSubscribeApi(data) {
  return request({
    url: "/main/subscribe",
    method: "get",
    data,
  });
}

/**
 * @description 处理登陆
 */
export function loginApi(data) {
  return request({
    url: "/index/wx/login",
    method: "post",
    data,
  });
}

/**
 * @description 获取二维码
 */
export function getWxQrCodeApi() {
  return request({
    url: "/index/wx/code/login",
    method: "post",
  });
}

/**
 * @description 处理监听扫码状态
 */
export function getScanQrCodeApi() {
  return CONFIG.BASE_URL + "/index/wx/scan/login";
}

/**
 * @description 扫码成功回调
 */
export function getScanCallbackApi(data) {
  return request({
    url: "/index/wx/scanCode/callback",
    method: "get",
    data,
  });
}

/**
 * @description 上传图片
 */
export function uploadBase64Api(data) {
  return request({
    url: "/files/base64",
    method: "POST",
    data,
  });
}

/**
 * @description 更新我的信息
 */
export function updateMyInfoApi(data) {
  return request({
    url: "/main/updateMyInfo",
    method: "post",
    data,
  });
}

/**
 * @description 退出
 */
export function logoutApi(data) {
  return request({
    url: "/logout",
    method: "post",
    data,
  });
}

/**
 * @description 获取 socket 地址
 */
export function getWSUrl() {
  return CONFIG.BASE_WS_URL;
}
