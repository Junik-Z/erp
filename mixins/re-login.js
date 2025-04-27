import { _isEqual } from "@/utils";

export default {
  // #ifdef MP
  data() {
    return {
      Q_ID: null,
    };
  },
  onLoad(option) {
    const [scene, __q_id__] = decodeURIComponent(option.scene || "")?.split("&") || [];
    this.Q_ID = __q_id__;

    // 当参数上有带商户标识的时候触发重新登录
    if (scene && !_isEqual(scene, "undefined")) {
      this.onLogInAgain({scene: scene}, true)
        .then(() => {
          const info = uni.getStorageSync("__USER_INFO__");

          console.log("触发重新登录了", scene, __q_id__, info);
          this.RE_REQUEST();
        });
    } else {
      this.RE_REQUEST();
    }

    uni.$on("$__get_info_success__", this.RE_REQUEST);
  },

  methods: {
    RE_REQUEST() {
      uni.__RE_LOGIN_TIME_VM__ && clearTimeout(uni.__RE_LOGIN_TIME_VM__);
      // 只执行最后一次
      uni.__RE_LOGIN_TIME_VM__ = setTimeout(() => {
        try {
          this.getList(true);
        } catch (error) {
          console.log("【RE_LOGIN ERROR】: getList 方法不存在");
        }
      }, 200);
    },
  },
  onUpload() {
    uni.off("$__get_info_success__");
  },
  // #endif
};
