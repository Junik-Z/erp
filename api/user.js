import request from "@/request";
import { CONFIG } from "@/utils/config";

/**
 * @description 判断是不是已经登录了
 */
export function isLogin() {
  return !!uni.getStorageSync("Cookie");
}

/**
 * @description 处理微信登录
 */
export function goLogin(tenantId = "") {
  return new Promise((resolve, reject) => {
    if (uni.__LOGIN_LOADING__) {
      reject("__stop__");
      return false;
    }

    uni.login({
      success: resp => {
        uni.__LOGIN_LOADING__ = true;

        const {code} = resp;
        loginApi({code, tenantId})
          .then((res) => {
            uni.$emit("$__login_success__", res);
            console.log("$__login_success__", res.data);
            uni.setStorageSync("__APP_SCENE__", res.data);
            resolve(res);
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
 * @description 处理微信切换登录
 */
export function switchLogin(tenantId = "") {
  return new Promise((resolve, reject) => {
    if (uni.__LOGIN_LOADING__) {
      reject("__stop__");
      return false;
    }

    // 不需要调切换接口
    if (uni) {
      // uni.setStorageSync("__APP_SCENE__", tenantId);
      // uni.$emit("$__login_success__");
      resolve({data: tenantId});
      return false;
    }

    uni.login({
      success: resp => {
        uni.__LOGIN_LOADING__ = true;
        const {code} = resp;
        switchLoginApi({code, tenantId})
          .then((res) => {
            uni.setStorageSync("__APP_SCENE__", res.data);

            uni.$emit("$__get_all_info__");
            resolve(res);
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
 * @deprecated 切换登录
 */
export function switchLoginApi(data) {
  return request({url: "/index/switch/login", method: "POST", data});
}

/**
 * @description 获取图片链接地址
 */
export function getImgUrl(url) {
  return `${CONFIG.BASE_URL}${url}`;
}

/**
 * @description 获取文件链接地址
 */
export function getFileUrl(url) {
  if (/^https?:\/\//.test(url)) return url;
  return `${CONFIG.BASE_URL}${url}`;
}

/**
 * @description 文件上传接口
 */
export function uploadFileApi() {
  return `${CONFIG.BASE_URL}/files/upload`;
}

/**
 * @description 上传物料
 */
export function readMaterialListFileApi() {
  return `${CONFIG.BASE_URL}/produce/readMaterialListFile`;
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
 * @description 处理登录
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

// —————————————————— 消息管理 ——————————————
/**
 * @description 获取消息列表
 */
export function getMessageListApi(data) {
  return request({
    url: "/message/myMessageList",
    method: "get",
    data,
  });
}

/**
 * @description 获取我的未读消息数据
 */
export function getMessageCountApi(data) {
  return request({
    url: "/message/myUnreadMessageCount",
    method: "get",
    data,
  });
}

/**
 * @description 删除消息
 */
export function removeMessageApi(data) {
  return request({
    url: "/message/deleteMessage",
    method: "post",
    data,
  });
}

/**
 * @description 发送内部员工消息
 */
export function sendInternalMessageApi(data) {
  return request({
    url: "/message/sendInternalMessage",
    method: "post",
    data,
  });
}


/**
 * @description 标记已读
 */
export function readMessageApi(data) {
  return request({
    url: "/message/readMessage",
    method: "post",
    data,
  });
}

/**
 * @description 绑定供应商
 */
export function bindSupplierMessageApi(data) {
  return request({
    url: "/message/createAndBindSupplier",
    method: "post",
    data,
  });
}

/**
 * @description 绑定客户
 */
export function bindCustomerMessageApi(data) {
  return request({
    url: "/message/createAndBindCustomer",
    method: "post",
    data,
  });
}

/**
 * @description 获取登录段数据
 */
export function getMonitorJumpApi(data) {
  return request({
    url: "/index/monitor/jump",
    method: "get",
    data,
  });
}

// ———————————————————— 微信用户管理 ————————————
export function getWxUsersApi(data) {
  return request({
    url: "/user/get-all-users",
    method: "get",
    data,
  });
}

/**
 * @description 设置用户标签
 */
export function setUserTagApi(data) {
  return request({
    url: "/user/set-tag",
    method: "post",
    data,
  });
}

/**
 * @description 设置维护人员
 */
export function setMaintenanceApi(data) {
  return request({
    url: "/manage/setMaintenance",
    method: "post",
    data,
  });
}

// —————————————————— 用户绑定接口 ——————————————
/**
 * @description 生成客户绑定二维码
 */
export function customerCodeApi(data) {
  return request({
    url: "/customer/bind-code",
    method: "get",
    data,
  });
}

/**
 * @description 客户绑定
 */
export function applyCustomerCodeApi(data) {
  return request({
    url: "/customer/bind-apply",
    method: "get",
    data,
  });
}

/**
 * @description 生成员工绑定二维码
 */
export function staffCodeApi(data) {
  return request({
    url: "/staff/bind-code",
    method: "get",
    data,
  });
}

/**
 * @description 员工绑定
 */
export function applyStaffCodeApi(data) {
  return request({
    url: "/staff/bind-apply",
    method: "get",
    data,
  });
}

/**
 * @description 生成供应商绑定二维码
 */
export function supplierCodeApi(data) {
  return request({
    url: "/supplier/bind-code",
    method: "get",
    data,
  });
}

/**
 * @description 供应商绑定
 */
export function applySupplierCodeApi(data) {
  return request({
    url: "/supplier/bind-apply",
    method: "get",
    data,
  });
}

// ——————————————————— 商户 ————————————————————
/**
 * @deprecated 获取我的商户
 */
export function myBusinessApi(data) {
  return request({url: "/main/myBusiness", method: "get", data});
}

/**
 * @deprecated 添加/修改商家分类
 */
export function addBusinessClassifyApi(data) {
  return request({url: "/manage/addBusinessClassify", method: "post", data});
}

/**
 * @deprecated 删除商家分类
 */
export function deleteBusinessClassifyApi(data) {
  return request({url: "/manage/deleteBusinessClassify", method: "post", data});
}

/**
 * @deprecated 商家分类
 */
export function businessClassifyApi(data) {
  return request({url: "/manage/businessClassify", method: "get", data});
}


// ———————————————————— 卖场 ——————————————————————
/**
 * @deprecated 卖场列表
 */
export function supplyListApi(data) {
  return request({url: "/supply/list", method: "get", data});
}

/**
 * @deprecated 获取卖场设置
 */
export function getSettingApi(data) {
  return request({url: "/supply/getSetting", method: "get", data});
}

/**
 * @deprecated 卖场设置
 */
export function saleSettingApi(data) {
  return request({url: "/manage/saleSetting", method: "post", data});
}

/**
 * @deprecated 获取卖场活动商品
 */
export function getActivityApi(data) {
  return request({url: "/supply/getActivity", method: "get", data});
}

/**
 * @deprecated 获取卖场推荐商品
 */
export function getRecommendApi(data) {
  return request({url: "/supply/getRecommend", method: "get", data});
}

/**
 * @deprecated 获取卖场商品分类
 */
export function getSupplyProductClassApi(data) {
  return request({url: "/supply/product/class", method: "get", data});
}

/**
 * @deprecated 获取卖场商品扩张字段
 */
export function getSupplyProductFieldApi(data) {
  return request({url: "/supply/product/field", method: "get", data});
}

/**
 * @deprecated 获取卖场商品列表
 */
export function getSupplyProductListApi(data) {
  return request({url: "/supply/product/list", method: "get", data});
}

/**
 * @deprecated 获取卖场广告列表
 */
export function getSupplyADListApi(data) {
  return request({url: "/supply/ad/list", method: "get", data});
}

/**
 * @deprecated 获取商户信息
 */
export function getShopInfoApi(data) {
  return request({url: "/supply/shop/index", method: "get", data});
}
