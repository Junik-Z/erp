// #ifdef H5
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import { InfiniteScroll } from "@/uni_modules/element-ui/element.min";

// #endif
import {
  _deepCopy,
  _get,
  _haveCommonElements,
  _isEmpty,
  _isEqual,
  _isString,
  _keys,
  _omit,
  _pick,
  absYuan,
  dealBigMoney,
  transferYuan,
  yuanToPoints,
} from "@/utils";
import getCacheFile from "@/utils/fileCache";
import { CONFIG, PageEnums } from "@/utils/config";
import QS from "@/utils/qs.min";
import { goLogin, logoutApi } from "@/api/user";

import { getSaleShareIdApi } from "@/api/erp/sale";
import { getPurchaseShareIdApi } from "@/api/erp/purchase";

const User = uni.getStorageSync("__USER_INFO__");
const Sys = uni.getStorageSync("__CONFIG_INFO__");

export default {
  data() {
    return {
      MIXINS_OBJ: {
        USER: User || {},
        SYS: Sys || {},
      },
      TABS_LIST: [],
      TAB: 0,

      PAGE_MENU: [],

      PAGE_MENU_INDEX: 0,
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

      uni.$on("$__get_info_success__", () => {
        // this?.getList?.();
        this._UP_INGO();
      });

      uni.$on("$__get_user_info_success__", () => {
        this._UP_INGO();
      });

      uni.$on("$__get_config_info_success__", () => {
        this._UP_INGO();
      });
    });
  },
  // #ifdef H5
  directives: {
    InfiniteScroll,
  },
  // #endif
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
    async _GET_SHARE_APP_PARAMS_(obj, sceneName = "scene") {
      const scene = uni.getStorageSync("__APP_SCENE__") || "";
      // 添加默认的参数数据
      const query = {
        ...(obj.query || {}),
        ...(scene ? {[sceneName]: scene} : {}),
        // 分享用户的ID
        SHARE_USER_ID: this.GET_USER_INFO?.userId,
      };

      if (["ADDED_SALE", "ADDED_PURCHASE"].includes(query.PAGE_TYPE)) {
        try {
          const Func = {ADDED_SALE: getSaleShareIdApi, ADDED_PURCHASE: getPurchaseShareIdApi}[query.PAGE_TYPE];
          const res = await Func?.();
          query.SHARE_ID = res.data;
        } catch (e) {
        }
      }

      const path = `${obj.path}?${QS.stringify(query)}`;
      const obQuery = {...obj, path, type: CONFIG.SHARE_TYPE};
      return _omit(obQuery, ["query"]);
    },

    // 获取参数
    getQueryString(obj) {
      const q = QS.stringify(obj);
      return q && `?${q}` || "";
    },

    // 跳转到详情页面
    onJumpDetails(node, page_type) {
      uni.setStorageSync("TO_DETAILS", true);

      const query = QS.stringify({
        page_type,
        ...(_pick(node, ["id"])),
      });

      // 采购定制订单详情
      if (_isEqual("CUSTOMIZED", node.orderType)) {
        uni.navigateTo({
          url: PageEnums.produceDetails + `?${
            QS.stringify({
              page_type,
              id: node.orderCode,
              FORM: "PURCHASE",
            })
          }`,
        });
        return false;
      }

      // 销售生产订单详情
      if (_isEqual("PRODUCTION", node.orderType) && !_isEqual("produce", page_type)) {
        uni.navigateTo({
          url: PageEnums.produceDetails + `?${
            QS.stringify({
              page_type,
              id: node.orderCode,
              FORM: "SALE",
            })
          }`,
        });
        // page_type=outbound&id=C2025012117412171451&FORM=SALE
        return false;
      }

      if (_isEqual("produce", page_type)) {
        uni.navigateTo({
          url: PageEnums.produceDetails + `?${query}`,
        });
        return false;
      }

      uni.navigateTo({
        url: `/shop/details/details?${query}`,
      });
    },

    // 跳转到打印页面
    onJumpPrint(node, page_type, params = {}) {
      uni.setStorageSync("TO_DETAILS", true);
      uni.navigateTo({
        url: `/shop/print/print?${QS.stringify({page_type, ...(_pick(node, ["id", "orderType", "orderCode"])), ...params})}`,
      });
    },

    // 处理重新登录
    onLogout(params = {}, path, noJump = false) {
      let url = "/pages/home/home";
      // #ifdef H5
      url = "/pages/login/login";
      // #endif

      if (path) {
        url = path;
      }

      return new Promise((resolve) => {
        uni.$__IS_LOGOUT_FLAG__ = true;
        logoutApi()
          .finally(() => {
            setTimeout(() => {
              const obj = _omit(params || {}, ["scene"]);
              const query = {
                PAGE_TYPE: "logout",
                ...(obj || {}),
              };

              uni.clearStorageSync({});

              // #ifdef MP
              goLogin(params?.scene || "")
                .finally(() => {
                  setTimeout(() => {
                    if (!noJump) {
                      uni.reLaunch({
                        url: `${url}?${QS.stringify(query)}`,
                      });
                    }

                    uni.$__IS_LOGOUT_FLAG__ = false;

                    resolve();
                  }, 10);
                });
              // #endif

              // #ifdef H5
              setTimeout(() => {
                uni.reLaunch({
                  url: `${url}?${QS.stringify(query)}`,
                });
                uni.$__IS_LOGOUT_FLAG__ = false;
                resolve();
              }, 10);
              // #endif
            }, 50);
          });
      });
    },

    // 根据传入的参数进行重新登录
    onLogInAgain(option, flag = false) {
      return new Promise((resolve) => {
        if (option?.scene || flag) {
          this.onLogout(option, false, true)
            .finally(() => {
              setTimeout(() => {
                // 获取所有的用户信息
                uni.$emit("$__get_all_info__", true);
                uni.$emit("$__init_web_socket__");
                resolve();
              }, 100);
            });
        } else {
          resolve();
        }
      });
    },

    // 请求下一页数据
    RequestNextPage() {
      this?.$refs?.[this.GET_TABS_REF_NAME]?.onRequestNextPage?.();
    },

    // 合并数据
    onMergeArrays(list = [], data = [], key = "id") {
      const L = _deepCopy(list);
      data.forEach((item) => {
        const index = L.findIndex(v => _isEqual(_get(v, key), _get(item, key)));
        if (index < 0) {
          L.push(item);
        } else {
          L[index] = item;
        }
      });
      return L;
    },

    // 处理查看图片
    lookImage(url) {
      if (url) {
        if (url) {
          uni.previewImage({
            urls: [url],
          });
        }
      }
    },

    // 处理页面列表数据
    onProcessingListData(data, isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");

      let index = this.list.findIndex(v => v.id === data.id);
      let node = _isEmpty(this.node) ? this.list.at(-1) : this.node;

      node = _isEmpty(node) ? data : node;
      node = _pick(data, _keys(node));

      index = index > -1 ? index : this.nodeIndex;

      if (data?.confirmable && isPayment) {
        this.list.splice(index, 1);
      } else if (_isString(info) && this.tab === 1) {
        this.list.splice(index, 1);
        this.list.unshift(node);
      } else {
        const V = this.list[index];
        if (!_isEmpty(V) && V.id === data.id) {
          this.$set(this.list, index, {...(this.node || {}), ...node});
        } else {
          this.list.unshift(node);
        }
      }
    },
  },
  components: {
    // #ifdef H5
    KoTable,
    // #endif
  },
  // #ifdef MP
  // 页面滚动到最底部时触发
  onReachBottom() {
    this.RequestNextPage();
  },
  // #endif
  computed: {
    toYuan() {
      return transferYuan;
    },
    absYuan() {
      return absYuan;
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

    isEqual() {
      return _isEqual;
    },

    // 判断空数据
    isEmpty() {
      return _isEmpty;
    },

    // 判断用户是否可以刷新用户款项
    isRefreshPayment() {
      return this.isPerm("Finance_Write");
    },

    // 判断是否是超管
    isAdmin() {
      return this.GET_USER_ROLE.includes("ADMIN");
    },

    // 判断是否是商铺管理员
    isBusiness() {
      return this.GET_USER_ROLE.includes("BUSINESS");
    },

    // 根据传入的参数判断是否有权限
    isPerm() {
      return (perm) => this.GET_USER_ROLE?.includes?.(perm) || this.isAdmin || this.isBusiness;
    },

    // 用户信息
    GET_USER_INFO() {
      return this.MIXINS_OBJ?.USER || {};
    },

    // 商铺信息
    GET_CONFIG_INFO() {
      return this.MIXINS_OBJ?.SYS || {};
    },

    // 用户权限
    GET_USER_ROLE() {
      return _get(this.MIXINS_OBJ?.USER, "role") || [];
    },

    // 订单状态
    ORDER_STATUS_ENUMS() {
      return (type) => {
        return {
          CREATED: "待处理",
          FINISHED: "已完成",
          APPLY_MATERIAL: "申请物料",
          CANCELLED: "已取消",
        }[type] || "-";
      };
    },

    // 财务订单状态
    FINANCE_ORDER_STATUS_ENUMS() {
      return (type) => {
        return {
          CREATED: "待清帐",
          FINISHED: "已完成",
          APPLY_MATERIAL: "申请物料",
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
          CREATED: "待生产",
          APPLY_MATERIAL: "生产中",
          FINISHED: "已完成",
          PAUSED: "已暂停",
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
          CHECK_IN: "库存盘点",
          CUSTOMIZED: "采购定制",
        };
        return _get(obj, type) || "-";
      };
    },

    // 其它费用类型
    FEES_TYPE_ENUMS() {
      return (type) => {
        if (!type) return "-";
        const obj = {
          UpstairsFee: "上楼费",
          HandlingFee: "搬运费",
          InstallationFee: "安装费",
          LogisticsFee: "物流费",
          ClearAnAccount: "已付费用",
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

        let padding = [15, 15, 0, 5];

        // #ifdef H5
        padding = [20, 20, 20, 20];
        // #endif

        return {
          color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
          padding,
          fontSize: 12,
          // #ifdef H5
          height: 360,
          // #endif
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

    // 获取店铺名称
    GET_SHOP_NAME() {
      return _get(this.GET_CONFIG_INFO, "remark") || "";
    },

    // 通用 tab 列表
    GET_TAB_LIST() {
      return this.TABS_LIST?.flatMap(item => {
        if (item.roles) {
          const role = this.GET_USER_ROLE;
          if (_haveCommonElements(role, item.roles) || this.isBusiness || this.isAdmin) {
            return [item];
          } else {
            return [];
          }
        }
        return [item];
      });
    },

    // 获取当前选中的模块
    GET_TABS_REF_NAME() {
      return _get(this.GET_TAB_LIST, `${this.TAB}.ref`);
    },

    // 获取订单状态款项描述
    GET_PAYMENT_ENUMS() {
      return (name) => _get({
        SALE: "已收",
        SALE_RETURN: "已付",
        PURCHASE: "已付",
        PURCHASE_RETURN: "已收",
        PRODUCTION: "已收",
        CUSTOMIZED: "已付",
      }, name);
    },

    // 获取订单状态剩余款项描述
    GET_PAYMENT_REMAINING_ENUMS() {
      return (name) => _get({
        SALE: "剩余未收",
        SALE_RETURN: "剩余未付",
        PURCHASE: "剩余未付",
        PURCHASE_RETURN: "剩余未收",
        PRODUCTION: "剩余未收",
        CUSTOMIZED: "剩余未付",
      }, name);
    },

    // 页面路径枚举
    PageEnums() {
      return PageEnums;
    },

    // 财务确认情况
    GET_PROOFS_STATUS_ENUMS() {
      return (type) => ({
        CREATED: "财务未确认",
      })[type];
    },

    // 获取页面内的导航列表
    GET_PAGE_MENU() {
      return this.PAGE_MENU?.flatMap(item => {
        if (item.perm) {
          if (this.isPerm(item.perm) || this.isBusiness || this.isAdmin) {
            return [item];
          } else {
            return [];
          }
        }
        return [item];
      });
    },

    // 获取页面及的选中方法名
    GET_PAGE_MENU_FUNC() {
      return this.GET_PAGE_MENU?.[this.PAGE_MENU_INDEX || 0]?.func;
    },

    // 获取右下角添加按钮列表数据
    GET_MOVABLE_LIST() {
      return this.content?.filter(item => this.GET_USER_ROLE?.includes(item.perm));
    },

    // 是否显示添加按钮
    isShowMovable() {
      return this.GET_MOVABLE_LIST?.length
    }
  },
};
