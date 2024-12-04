import { _get, _isEmpty, _omit, dealBigMoney, transferYuan, yuanToPoints } from "@/utils";
import getCacheFile from "@/utils/fileCache";
import { CONFIG } from "@/utils/config";
import QS from "@/utils/qs.min";

// #ifdef H5
import KoTable from "@/erp/components/KoTable/KoTable.vue";
// #endif

const User = uni.getStorageSync("__USER_INFO__");
const Sys = uni.getStorageSync("__CONFIG_INFO__");

export default {
  data() {
    return {
      MIXINS_OBJ: {
        USER: User || {},
        SYS: Sys || {},
      },
    };
  },
  onShow() {
    this.$nextTick(() => {
      this._UP_INGO();
    });
  },
  created() {
    this.$nextTick(() => {
      this._UP_INGO();
      uni.$on("$__get_info_success__", this._UP_INGO);
    });
  },
  mounted() {
  },
  methods: {
    _UP_INGO(res) {
      const UserInfo = uni.getStorageSync("__USER_INFO__") || _get(res, "0");
      const SysInfo = uni.getStorageSync("__CONFIG_INFO__") || _get(res, "1");

      this.$set(this.MIXINS_OBJ, "USER", UserInfo);
      this.$set(this.MIXINS_OBJ, "SYS", SysInfo);
    },

    // 获取通用的分享 query 参数
    _GET_SHARE_APP_PARAMS_(obj) {
      const scene = uni.getStorageSync("__APP_SCENE__") || "";
      // 添加默认的参数数据
      const query = {
        ...(obj.query || {}),
        ...(scene ? {scene} : {}),
        // 分享用户的ID
        SHARE_USER_ID: this.GET_USER_INFO?.userId,
      };
      const path = `${obj.path}?${QS.stringify(query)}`;
      const obQuery = {...obj, path, type: CONFIG.SHARE_TYPE};

      return _omit(obQuery, ["query"]);
    },

    // 获取参数
    getQueryString(obj) {
      const q = QS.stringify(obj);
      return q && `?${q}` || "";
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
      return this.MIXINS_OBJ?.USER || {};
    },

    GET_CONFIG_INFO() {
      return this.MIXINS_OBJ?.SYS || {};
    },

    GET_USER_ROLE() {
      return _get(this.MIXINS_OBJ?.USER, "role") || [];
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

    // 获取通用图标组件的参数
    getBasicChartsOptions() {
      return (data = {}) => {
        // 空y轴数据
        const notCat = _isEmpty(data.categories);
        // 空x图表数据
        const notSeries = data.series?.every(item => _isEmpty(item.data));

        return {
          color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
          padding: [15, 15, 0, 5],
          enableScroll: false,
          legend: {
            show: false,
          },
          xAxis: {
            dashLength: 10,
          },
          yAxis: {
            disableGrid: notCat && notSeries,
            gridType: "dash",
            dashLength: 2,
            data: [],
          },
          extra: {
            column: {
              type: "group",
              width: 16,
              barBorderCircle: true,
            },
            line: {
              type: "straight",
              width: 2,
              activeType: "hollow",
            },
          },
        };
      };
    },

    // 获取数据
    GET_FUNC() {
      return _get;
    },
  },
};
