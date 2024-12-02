import { _get, dealBigMoney, transferYuan, yuanToPoints } from "@/utils";
import getCacheFile from "@/utils/fileCache";

// #ifdef H5
import KoTable from "@/components/KoTable/KoTable.vue";
// #endif

const User = uni.getStorageSync("__USER_INFO__");
const Sys = uni.getStorageSync("__CONFIG_INFO__");

export default {
  data() {
    return {
      _user_: User || {},
      _sys_: Sys || {},
    };
  },
  onShow() {
    this._UP_INGO();
  },
  created() {
    this._UP_INGO();
    uni.$on("$__get_info_success__", this._UP_INGO);
  },
  mounted() {
  },
  methods: {
    _UP_INGO(res) {
      this._user_ = uni.getStorageSync("__USER_INFO__") || _get(res, "0");
      this._sys_ = uni.getStorageSync("__CONFIG_INFO__") || _get(res, "1");
    },
  },
  components: {
    // #ifdef H5
    KoTable,
    // #endif
  },
  computed: {
    toYuan() {
      return transferYuan;
    },
    toFen() {
      return yuanToPoints;
    },
    toBigMoney() {
      return dealBigMoney;
    },
    getImageUrl() {
      return getCacheFile;
    },

    GET_USER_INFO() {
      return this._user_ || {};
    },

    GET_CONFIG_INFO() {
      return this._sys_ || {};
    },

    GET_USER_ROLE() {
      return _get(this._user_, "role") || [];
    },

    // 订单状态
    ORDER_STATUS_ENUMS() {
      return (type) => {
        return {
          CREATED: "已创建",
          FINISHED: "已完成",
          CANCELLED: "已取消",
        }[type] || "-";
      };
    },

    // 用户状态
    USER_SUS_ENUMS() {
      return (type) => {
        if (!type) return "-";

        const role = {
          normal: "正常",
          deactivate: "停用",
          unsubscribe: "注销",
        };

        return _get(role, type) || "-";
      };
    },

    // 生产状态
    PRODUCE_STATUS_ENUMS() {
      return (status) => {
        return {
          CREATED: "已创建",
          APPLY_MATERIAL: "已出料",
          FINISHED: "已完成",
          CANCELLED: "已取消",
        }[status] || "-";
      };
    },

    // 订单类型
    ORDER_TYPE_ENUMS() {
      return (type) => {
        if (!type) return "-";
        const obj = {
          PRODUCTION: "生产工单",
          SALE: "销售订单",
          SALE_RETURN: "销售退货订单",
          PURCHASE: "采购订单",
          PURCHASE_RETURN: "采购退货订单",
        };
        return _get(obj, type) || "-";
      };
    },
  },
};
