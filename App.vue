<script>
import { getConfigApi, getMyInfoApi, getScanQrCodeApi, getSubscribeApi, isLogin } from "@/api/user";
import { _get, _isEqual } from "@/utils";
import dayjs from "@/utils/dayjs";

export default {
  async onLaunch(option) {
    const {query} = option || {};
    console.log(query, option);
    uni.setStorageSync("__APP_QUERY__", query);

    if (query?.scene) {
      uni.setStorageSync("__APP_SCENE__", query?.scene);
    }

    if (!isLogin()) {
      await this.onLogin();
    }

    uni.$on("$__get_all_info__",
      async () => {
        this.getInfo();
      });

    uni.$on("$on_event_source", this.getEventSource);

    // 登陆完成后需要清除计时器
    uni.$on("$__login_success__",
      () => {
        uni.$__home_set_timeout_vm__ && clearTimeout(uni.$__home_set_timeout_vm__);
      });

    // #ifdef MP
    await this.getInfo();
    // #endif

    // #ifdef MP-WEIXIN
    this.requestSubscribeMessage();
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
    getInfo() {
      return Promise.all([this.getUserInfo(), this.getConfig()])
        .then((res) => {
          // 获取所有信息成功
          uni.$emit("$__get_info_success__", res);
        });
    },

    // 获取用户信息
    getUserInfo() {
      return getMyInfoApi()
        .then((res) => {
          uni.setStorageSync("__USER_INFO__", res.data);
          uni.$emit("$__update_user_info__", res.data);
          return res.data;
        });
    },
    // 获取配置信息
    getConfig() {
      return getConfigApi()
        .then((res) => {
          uni.setStorageSync("__CONFIG_INFO__", res.data);
          uni.$emit("$__update_config_info__", res.data);
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
    getEventSource(query) {
      const ESVm = new EventSource(`${getScanQrCodeApi()}${query}`);

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
      }, false);
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';
</style>
