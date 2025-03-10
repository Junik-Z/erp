import { goLogin } from "@/api/user";
import { CONFIG } from "@/utils/config";
import { _isDev, _isEqual } from "@/utils";

export const baseURl = CONFIG.BASE_URL;

let isFlag = false;
const reqList = [];

uni.__WIFI_ERROR_MODEL__ = false;

export default function request(config, isLoading = false, whole = false) {
  isLoading && uni.showLoading();

  return new Promise((resolve, reject) => {

    // #ifndef H5
    const Cookie = uni.getStorageSync("Cookie");
    // #endif

    const scene = uni.getStorageSync("__APP_SCENE__") || "";
    const query = uni.getStorageSync("__APP_QUERY__") || {};

    // #ifdef H5
    const Token = uni.getStorageSync("AccessToken") || "";
    // #endif

    uni.request({
      url: baseURl + config["url"],
      method: config["method"],
      // #ifdef H5
      withCredentials: true,
      enableCookie: true,
      // #endif
      header: {
        "Content-Type": "application/json",
        // #ifndef H5
        ...(Cookie ? {Cookie} : {}),
        // #endif

        // #ifdef H5
        ...(Token && false && _isDev() ? {Authorization: Token} : {}),
        // #endif

        "X-MiniApp-Env": CONFIG.SystemVersion,
        "X-MiniApp-ID": CONFIG.APP_ID,
        "X-Tenant-ID": scene || "",

        "T-VERSION": CONFIG.T_VERSION,
      },
      data: config["data"],

      ...(config.responseType ? {responseType: config.responseType} : {}),

      success: async (res) => {
        // #ifndef H5
        const cookie = res.header["set-cookie"] || res.header["Set-Cookie"];
        if (cookie) {
          uni.setStorageSync("Cookie", cookie);
        }
        // #endif

        const {code, msg} = res.data || {};

        isLoading && uni.hideLoading();

        if ([502, 500].includes(res.statusCode)) {
          uni.showModal({
            title: "温馨提示",
            content: "系统维护中，请稍后再试！",
            showCancel: false,
            confirmText: "确定",
          });
          reject("服务器维护中。请稍后再试！");
          return false;
        }

        if (whole) {
          resolve(res.data);
          return false;
        }

        if (res.statusCode === 200 && code === 200) {
          // #ifdef H5
          uni.$__IS_LOGOUT_FLAG__ = false;
          // #endif
          resolve(res.data);
        } else if (_isEqual(code, 402)) {

          uni.showModal({
            title: "过期提醒",
            content: msg,
            showCancel: false,
            confirmText: "重试",
            success: async (resp) => {

              await goLogin();
              uni.$emit("$__get_all_info__");

              if (resp.confirm) {
                uni.reLaunch({
                  url: "/pages/home/home",
                });
              }
            },
          });

          reject(res);
        } else if (_isEqual(code, 401)) {

          // #ifdef H5
          uni.setStorageSync("__APP_SCENE__", "");
          uni.setStorageSync("Cookie", "");

          uni.reLaunch({
            url: "/pages/login/login",
          });

          if ("true") return false;
          // #endif

          if (uni.$__IS_LOGOUT_FLAG__) return false;

          if (!isFlag) {
            isFlag = true;
            uni.setStorageSync("Cookie", "");

            try {
              // #ifdef MP
              await goLogin();
              console.log("重新登录了");
              query?.scene && (uni.__FLAG__ = false);

              uni.$emit("$__get_all_info__");
              isFlag = false;
              // #endif

              /*  reqList.forEach(item => {
                 request(item.config, item.isLoading).then(item.resolve).catch(item.reject);
               }); */

            } catch (e) {
              console.log("登录报错", e);
              isFlag = true;
              /* uni.showModal({
                title: "温馨提示",
                content: "登录失败，请稍后再试。",
                showCancel: true,
                confirmText: "重试",
                async success(resp) {
                  await goLogin();
                  uni.$emit("$__get_all_info__");

                  isFlag = true;

                  if (resp.confirm) {
                    uni.reLaunch({
                      url: "/pages/home/home",
                    });
                  }
                },
              }); */
              reject(res);
            }
          } else {
            if (!_isEqual(config["url"], "/index/wx/login")) {
              reqList.push({
                config,
                isLoading,
                resolve,
                reject,
              });
            }
          }
        } else if (code === 403) {
          uni.showToast({
            title: msg,
            icon: "none",
          });
          reject(res);
        } else {
          uni.showToast({title: msg, icon: "none"});
          reject(res);
        }
      },
      fail(res) {
        isLoading && uni.hideLoading();
        reject(res);

        if (uni.__WIFI_ERROR_MODEL__) return false;
        uni.__WIFI_ERROR_MODEL__ = true;
        // console.log(res)
        uni.showModal({
          title: "网络错误",
          content: "请求出错了，请检查WI-FI/数据流量或请稍后再试！",
          showCancel: false,
          success() {
            uni.__WIFI_ERROR_MODEL__ = false;
          },
        });
      },

      complete() {
        isLoading && uni.hideLoading();
      },
    });
  });
}
