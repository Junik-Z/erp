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

    console.log("打印出来的商户ID", scene, _isDev());

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
        "X-MiniApp-Env": CONFIG.SystemVersion,
        // #endif
        // #ifdef H5
        ...(Token && false && _isDev() ? {Authorization: Token} : {}),
        // #endif
        "X-MiniApp-ID": CONFIG.APP_ID,
        "X-Tenant-ID": scene || "",
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

        if (whole) {
          resolve(res.data);
          return false;
        }

        if (res.statusCode === 200 && code === 200) {
          resolve(res.data);
        } else if (code === 401) {
          if (uni.$__IS_LOGOUT_FLAG__) return false;

          if (!isFlag) {
            isFlag = true;

            // #ifdef H5
            uni.setStorageSync("__APP_SCENE__", "");
            // #endif

            uni.setStorageSync("Cookie", "");

            try {
              // #ifdef H5
              uni.reLaunch({
                url: "/pages/login/login",
              });
              // #endif

              // #ifdef MP
              await goLogin();
              console.log("重新登陆了");
              query?.scene && (uni.__FLAG__ = false);

              uni.$emit("$__get_all_info__");
              isFlag = false;
              // #endif

              /*  reqList.forEach(item => {
                 request(item.config, item.isLoading).then(item.resolve).catch(item.reject);
               }); */

            } catch (e) {
              console.log("登陆报错", e);
              isFlag = true;
              uni.showModal({
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
              });
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
          uni.showToast({
            title: msg,
            icon: "none",
          });
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
    });
  });
}
