<script>
import { getConfigApi, getMyInfoApi, getSubscribeApi, getWSUrl, isLogin, readMessageApi } from "@/api/user";
import { _deepCopy, _get, _isDev, _isEqual, _omit } from "@/utils";
import { CONFIG, MSG_TYPE_ENUMS, PageEnums } from "@/utils/config";

const AC = uni.createInnerAudioContext();

export default {
  async onLaunch(option) {
    // 解决浏览器端 F5刷新导致 WebSocket 断开链接
    // #ifdef H5
    const Token = uni.getStorageSync("AccessToken") || "";
    if (Token) {
      this.initiateWebSocket();
    }
    // #endif

    uni.setStorageSync("TO_DETAILS", false);

    const {query: _query} = option || {};
    console.log("App.vue", _query, option, option.path);

    let query = _deepCopy(_query);
    // 是要进入扫码登录页面
    const isQrcodePage = [PageEnums.qrcode].includes("/" + option.path); // _isEqual(option.path, "erp/qrcode/qrcode");

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
  },
  onShow() {
    console.log("App Show");
    // #ifdef H5
    uni.__HIDE_TIME_VM__ && clearTimeout(uni.__HIDE_TIME_VM__);

    if (uni.__TITLE__) {
      document.title = uni.__TITLE__;
      uni.__TITLE__ = "";
    }// 恢复默认标题
    // #endif
  },
  onHide() {
    console.log("App Hide");
    this.onFlash();
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

            // #ifdef MP | H5
            this.initiateWebSocket();
            // #endif

          }, 20);
        });
    },

    // 获取用户信息
    getUserInfo() {
      return getMyInfoApi()
        .then((res) => {
          const data = res.data;
          uni.setStorageSync("__USER_INFO__", data);
          uni.$emit("$__get_user_info_success__", data);

          this.$store.dispatch("setUserInfoAsync", data);

          uni.$emit("$__request_message__");
          return res.data;
        });
    },

    // 获取配置信息
    getConfig() {
      return getConfigApi()
        .then((res) => {
          const data = res.data;
          uni.setStorageSync("__CONFIG_INFO__", data);
          uni.$emit("$__get_config_info_success__", data);
          this.$store.dispatch("setConfigInfoAsync", data);
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
        // #ifdef H5
        const Token = uni.getStorageSync("AccessToken") || "";
        // #endif

        if (uni.$__SOCKET_TASK__) uni.$__SOCKET_TASK__.close();

        uni.$__SOCKET_TASK__ = uni.connectSocket({
          url: getWSUrl(),
          multiple: true,
          header: {
            // #ifndef H5
            "Cookie": uni.getStorageSync("Cookie"),
            // #endif

            // #ifdef H5
            ...(Token ? {Authorization: Token} : {}),
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
        uni.onSocketError(() => {
          /* uni.showToast({
            icon: "error",
            duration: 3000,
            title: "网络请求失败!",
          }); */
          console.log("WebSocket 链接错误");
        });
        uni.onSocketOpen(() => {
          console.log("WebSocket 启动成功");
        });
        // #endif

        // #ifdef MP-TOUTIAO
        socketTask.onMessage(this.onMessage);

        socketTask.onSocketOpen((res) => {
        });
        // #endif
      } catch (e) {
      }
    },

    // 播放来消息了
    play() {
      AC.src = "https://erp.kuaouyun.cn/api/files/down/static/notice.mp3";
      AC.volume = 1;
      AC.play();
    },

    // 收到的消息
    onMessage(res) {
      // console.log("WebSocket 接收到的消息", res.data);
      // "{"data":{"type":"ReceivableOrder","comment":"有新应收单"},"askEnum":"NewOrder"}"

      try {
        const resp = JSON.parse(res.data);
        uni.$emit("$__web_socket_message__", resp);
        const {askEnum, data} = resp;

        console.log("接收到的 WebSocket 消息", resp, data);

        /**
         * InternalStaffNotice: 调发送消息接口来的消息
         */
        if (["InternalStaffNotice"].includes(askEnum)) {
          uni.$emit("$__update_msg_count__");

          this.play();

          // #ifdef MP
          uni.$emit("$__web_socket_notice__", resp);
          // #endif

          // #ifndef MP
          const not = this.$notify({
            title: MSG_TYPE_ENUMS[data.type],
            message: data.content,
            duration: 0,
            showClose: false,
            onClick: () => {
              readMessageApi({id: data.id})
                .then(res => {
                  console.log("已标记为已读", res);
                  this.$alert(data.content, MSG_TYPE_ENUMS[data.type], {
                    confirmButtonText: "确定",
                  });
                })
                .finally(() => {
                  uni.$emit("$__update_msg_count__");
                  not.close();
                });
            },
          });
          this.onFlash();
          // #endif

          // uni.showModal({
          //   title: "消息提示",
          //   content: data.content,
          //   showCancel: false,
          //   confirmText: "已知晓",
          //   success: (resp) => {
          //     if (resp.confirm) {
          //       console.log(resp);
          //       readMessageApi({id: data.id})
          //         .then(res => {
          //           console.log("已标记为已读", res);
          //         })
          //         .finally(() => {
          //           uni.$emit("$__update_msg_count__");
          //         });
          //     }
          //   },
          // });
        }
      } catch (e) {
        // uni.$emit("$__web_socket_message__", res);
      }
    },

    // 开启Title闪烁
    onFlash() {
      // #ifdef H5
      uni.__TITLE__ = _deepCopy(document.title);
      let flag = false;

      function flashTitle() {
        if (!document.hasFocus()) { // 检测窗口是否失去焦点
          flag = !flag;
          document.title = flag ? `【您有新消息】${uni.__TITLE__}` : " "; // 切换标题内容
          uni.__HIDE_TIME_VM__ = setTimeout(flashTitle, 500); // 每0.5秒切换一次
        } else {
          document.title = uni.__TITLE__; // 恢复默认标题
        }
      }

      this.isNewMsg && flashTitle();
      // #endif
    },
  },
  computed: {
    isNewMsg() {
      return this.$store.getters.isNewMsg;
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';
</style>
