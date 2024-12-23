<script>
import { getConfigApi, getMyInfoApi, getScanQrCodeApi, getSubscribeApi, getWSUrl, isLogin } from "@/api/user";
import { _deepCopy, _get, _isEnv, _isEqual, _omit } from "@/utils";
import dayjs from "@/utils/dayjs";

export default {
  async onLaunch(option) {
    const {query: _query} = option || {};
    console.log("App.vue", _query, option, option.path);

    let query = _deepCopy(_query);
    // 是要进入扫码登陆页面
    const isQrcodePage = _isEqual(option.path, "erp/qrcode/qrcode");

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

    uni.$on("$__init_event_source__", this.getEventSource);

    uni.$on("$__init_web_socket__", this.initiateWebSocket);

    uni.$on("$__update_config_info__", this.getConfig);

    // #ifdef MP
    // 当进入的不是 [首页, 自助绑定] 时需要先获取用户信息
    if (!["pages/home/home", "client/binding/binding", "/erp/sale/order", "/erp/purchase/order"].includes(option.path)) {
      await this.getInfo();
    }
    // #endif

    // #ifdef MP-WEIXIN
    !_isEnv() && this.requestSubscribeMessage();
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

    // 获取订阅消息
    requestSubscribeMessage() {
      function fn(tmplIds) {
        uni.requestSubscribeMessage({
          tmplIds: tmplIds,
          success: (res) => {
            console.log(res);
          },
          fail: (err) => {
            console.log(err);
          },
        });
      }

      getSubscribeApi()
        .then(req => {
          const tmplIds = req.data;

          console.log("订阅通知消息", tmplIds);

          uni.getSetting({
            withSubscriptions: true,
            success: (res) => {
              const msg = res.subscriptionsSetting || {};

              if (!msg) {
                uni.showModal({
                  title: "温馨提示",
                  content: `亲，授权消息我们会在预约变化时第一时间发通知给你！`,
                  success: (res) => {
                    if (res.confirm) {
                      fn(tmplIds);
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
                  content: `亲，授权消息我们会在预约变化时第一时间发通知给你！`,
                  success: (res) => {
                    if (res.confirm) {
                      fn(tmplIds);
                    }
                  },
                });
              }
            },
          });
        });
    },

    // 开启长链接
    getEventSource() {
      const ESVm = new EventSource(getScanQrCodeApi());

      console.log("触发调用了");

      uni.$__EVENT_SOUECE_VM__ = ESVm;

      /*  ESVm.onmessage = function (res) {
         console.log("接收到消息了:", res);
         uni.$emit("$_on_message", res);
       }; */

      ESVm.onopen = (event) => {
        console.log(`EventSource 链接成功. ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`, event);
      };

      ESVm.onerror = (event) => {
        console.error("EventSource 链接错误:", event);
      };

      // 链接成功
      ESVm.addEventListener("connect", (res) => {
        console.log("EventSource 消息接收成功", res.data);
      }, false);

      // 表示登陆成功
      ESVm.addEventListener("X-Tenant-ID", (res) => {
        const scene = res.data;
        uni.setStorageSync("__APP_SCENE__", scene);
        uni.$emit("$__login_success__", scene);
        uni.setStorageSync("Cookie", scene);

        ESVm?.close();
      }, false);

      // 获取到的二维码图片
      ESVm.addEventListener("scanCode", (res) => {
        const codeImage = res.data;
        uni.$emit("$__success_code_images__", codeImage);
      }, false);
    },

    // 发起 WebSocket
    initiateWebSocket() {
      try {
        uni.$__SOCKET_TASK__ = uni.connectSocket({
          url: getWSUrl(),
          multiple: true,
          // #ifndef H5
          header: {
            "Cookie": uni.getStorageSync("Cookie"),
          },
          // #endif
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
        uni.$emit("$__web_socket_message__", res);
      }
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';
</style>
