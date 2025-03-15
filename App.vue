<script>
import { getConfigApi, getMyInfoApi, getSubscribeApi, getWSUrl, isLogin } from "@/api/user";
import { _deepCopy, _get, _isDev, _isEqual, _omit } from "@/utils";
import { CONFIG, PageEnums } from "@/utils/config";

export default {
  async onLaunch(option) {
    uni.setStorageSync("TO_DETAILS", false);

    const {query: _query} = option || {};
    console.log("App.vue", _query, option, option.path);

    let query = _deepCopy(_query);
    // 是要进入扫码登录页面
    const isQrcodePage = [PageEnums.qrcode, PageEnums.messageList].includes("/" + option.path);// _isEqual(option.path, "erp/qrcode/qrcode");

    if (isQrcodePage) {
      query.login_code = query.scene;
      query = _omit(query, ["scene"]);
    }

    uni.setStorageSync("__APP_QUERY__", query);

    if (query?.scene) {
      const arr = decodeURIComponent(query.scene)?.split("&") || [];
      uni.setStorageSync("__APP_SCENE__", arr[0]);
    }

    if (!isLogin()) {
      await this.onLogin();
    }

    uni.$on("$__get_all_info__", this.getInfo);

    uni.$on("$__init_web_socket__", this.initiateWebSocket);

    uni.$on("$__update_config_info__", this.getConfig);

    // #ifdef MP-WEIXIN
    uni.$on("$__ask_request_message__", this.askSubscribeMessage);

    !_isDev() && uni.$on("$__request_message__", this.requestSubscribeMessage);
    // #endif

    // #ifdef MP
    // 当进入的不是 [首页, 自助绑定] 时需要先获取用户信息
    if (!["pages/home/home", "client/binding/binding", PageEnums.editSale, PageEnums.editPurchase].includes(option.path)) {
      await this.getInfo();
    }
    // #endif

    // #ifdef MP-WEIXIN
    /* !_isEnv() && this.requestSubscribeMessage(); */
    // #endif
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
  },
  methods: {
    onLogin() {
      // #ifdef MP-WEIXIN
      // goLogin();
      // #endif

      // #ifdef H5
      uni.redirectTo({
        url: "/pages/login/login",
      });
      // #endif
    },

    // 获取必要的信息
    getInfo(isUpload = false) {
      return Promise.all([this.getUserInfo(), this.getConfig()])
        .then((res) => {
          setTimeout(() => {
            // 获取所有信息成功
            !isUpload && uni.$emit("$__get_info_success__", res);
          }, 20);
        });
    },

    // 获取用户信息
    getUserInfo() {
      return getMyInfoApi()
        .then((res) => {
          uni.setStorageSync("__USER_INFO__", res.data);
          uni.$emit("$__get_user_info_success__", res.data);

          uni.$emit("$__request_message__");
          return res.data;
        });
    },

    // 获取配置信息
    getConfig() {
      return getConfigApi()
        .then((res) => {
          uni.setStorageSync("__CONFIG_INFO__", res.data);
          uni.$emit("$__get_config_info_success__", res.data);
          return res.data;
        });
    },

    // 发起授权通知消息
    askSubscribeMessage() {
      uni.requestSubscribeMessage({
        tmplIds: uni.__TMPL_IDS__,
        success: (res) => {
          console.log(res);
          uni.$__ASK_SUBSCRIBE_MSG__ = false;
        },
        fail: (err) => {
          console.log(err);
        },
      });
    },

    // 获取订阅消息
    requestSubscribeMessage() {
      getSubscribeApi()
        .then(req => {
          const tmplIds = req.data;

          uni.__TMPL_IDS__ = tmplIds;

          uni.$__ASK_SUBSCRIBE_MSG__ = false;

          console.log("订阅通知消息", tmplIds);

          uni.getSetting({
            withSubscriptions: true,
            success: (res) => {
              const msg = res.subscriptionsSetting || {};

              if (!msg) {
                uni.showModal({
                  title: "温馨提示",
                  content: `亲，授权消息我们会在订单变化时第一时间发通知给你！`,
                  success: (res) => {
                    if (res.confirm) {
                      this.askSubscribeMessage();
                    }
                  },
                });

                return false;
              }

              // 获取所有的状态
              const allEnabled = tmplIds?.map(key => _get(msg, key)) || [];

              if (allEnabled.includes("reject")) {
                uni.showModal({
                  title: "温馨提示",
                  content: "亲，您把小程序通知关闭了，将不能实时收到我们的消息哦。在右上角的设置【通知管理】里面开启。",
                });
              }

              if (!allEnabled.every(key => _isEqual("accept", key))) {
                uni.showModal({
                  title: "温馨提示",
                  content: `亲，授权消息我们会在订单变化时第一时间发通知给你！`,
                  success: (res) => {
                    if (res.confirm) {
                      this.askSubscribeMessage();
                    }
                  },
                });
              } else if (allEnabled.some(key => _isEqual("accept", key))) {
                uni.$__ASK_SUBSCRIBE_MSG__ = true;

                /* uni.showModal({
                  title: "温馨提示",
                  content: `亲，授权消息我们会在订单变化时第一时间发通知给你！`,
                  success: (res) => {
                    if (res.confirm) {
                      this.askSubscribeMessage();
                    }
                  },
                }); */
              }
            },
          });
        });
    },

    // 发起 WebSocket
    initiateWebSocket() {
      try {
        const scene = uni.getStorageSync("__APP_SCENE__") || "";

        uni.$__SOCKET_TASK__ = uni.connectSocket({
          url: getWSUrl(),
          multiple: true,
          header: {
            // #ifndef H5
            "Cookie": uni.getStorageSync("Cookie"),
            // #endif

            "X-MiniApp-Env": CONFIG.SystemVersion,
            "X-MiniApp-ID": CONFIG.APP_ID,
            "X-Tenant-ID": scene || "",

            "T-VERSION": CONFIG.T_VERSION,
          },
          fail: (e) => {
            console.error(e);
          },
        });

        // #ifndef MP-TOUTIAO
        uni.onSocketMessage(this.onMessage);

        // 监听WebSocket错误
        uni.onSocketError((res) => {
          uni.showToast({
            icon: "error",
            duration: 3000,
            title: "网络请求失败!",
          });
        });
        uni.onSocketOpen((res) => {
          console.log("connected");
          this.connected = true;
        });
        // #endif

        // #ifdef MP-TOUTIAO
        socketTask.onMessage(this.onMessage);

        socketTask.onSocketOpen((res) => {
          console.log("connected");
          this.connected = true;
        });
        // #endif
      } catch (e) {
      }
    },

    onMessage(res) {
      console.log("WebSocket 接收到的消息", res);
      // "{"data":{"type":"ReceivableOrder","comment":"有新应收单"},"askEnum":"NewOrder"}"
      try {
        const data = JSON.parse(res.data);
        uni.$emit("$__web_socket_message__", data);
      } catch (e) {
        // uni.$emit("$__web_socket_message__", res);
      }
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';
</style>
