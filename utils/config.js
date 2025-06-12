import { _isDev } from "@/utils/index";

// 请求地址
let BASE_URL = "http://192.168.0.7:8093/api";
let BASE_WS_URL = "ws://192.168.0.7:8093/api/ws/app";

let DEFAULT_PAGE_SIZE = 10;

// #ifdef H5
BASE_URL = "/api";
BASE_WS_URL = "/api/ws/app";

DEFAULT_PAGE_SIZE = 20;

// BASE_URL: "https://erp.kuaouyun.cn/api",
// BASE_WS_URL: "wss://erp.kuaouyun.cn/api/ws/app",
// #endif

BASE_URL = "https://erp.kuaouyun.cn/api";
BASE_WS_URL = "wss://erp.kuaouyun.cn/api/ws/app";

let type = "develop";

if (_isDev()) {
  // type = "trial";
  // type = "release";

  // #ifdef MP
  // type = "trial";
  // #endif

  // #ifdef H5
  // type = "trial";
  // #endif
} else {
  // #ifdef MP
  const accountInfo = uni.getAccountInfoSync();
  type = accountInfo?.miniProgram?.envVersion;

  if (type === "develop") {
    type = "trial";
  }
  // #endif

  // #ifdef H5
  type = "release";
  // #endif
}

console.log("当前版本为：", type);

export const CONFIG = {
  // 请求头的参数
  APP_ID: "wx525c19deacc41329",
  SystemVersion: type,

  "T_VERSION": 5,

  ...(
    {
      develop: {
        BASE_URL,
        BASE_WS_URL,
      },
      trial: {
        BASE_URL: "https://erp.kuaouyun.cn/api",
        BASE_WS_URL: "wss://erp.kuaouyun.cn/api/ws/app",
      },
      release: {
        BASE_URL: "https://erp.kuaouyun.cn/api",
        BASE_WS_URL: "wss://erp.kuaouyun.cn/api/ws/app",
      },
    }[type]
  ),

  TITLE: "托手掌柜",

  // 分享出去时的type： 0 - 微信小程序正式版 ；1 - 微信小程序开发版；2 - 微信小程序体验版
  SHARE_TYPE: {develop: 1, trial: 2, release: 0}[type],

  // WEB rem 的转换率
  H5_REM_SIZE: 136.6,

  DEFAULT_PAGE_SIZE,
};

/**
 * @description 系统角色枚举
 */
export const ROLE_LIST_ENUMS = {
  Admin: "管理员",
  User: "用户",
  Business: "业务员",
  Product_Read: "产品查看",
  Product_Write: "产品管理",
  Stock_Read: "库存查看",
  Stock_Write: "库存管理",
  Sales_Read: "销售查看",
  Sales_Write: "销售管理",
  Produce_Read: "生产查看",
  Produce_Write: "生产管理",
  Finance_Read: "财务查看",
  Finance_Write: "财务管理",
  Purchase_Read: "采购查看",
  Purchase_Write: "采购管理",
  Delivery_Read: "配送查看",
  Delivery_Write: "配送管理",
  Monitor: "监控",
  Sales_Member: "销售会员",
  Produce_Member: "生产会员",
  Purchase_Member: "采购会员",
  Delivery_Member: "送货会员",
  Stock_Taking: "库存盘点",
};

/**
 * sse 事件
 * 类型 NewOrder
 * 事件:
 *      OutboundOrder  出库单
 *      ProduceOrder  生产单
 *      PurchaseOrder 采购单
 *      SaleOrder  销售单
 *      InboundOrder  出库单
 *      PayableOrder  应付单
 *      ReceivableOrder  应收单
 *      DeliveryOrder  物流单
 */

/**
 * @description 页面枚举
 */
export const PageEnums = {
  home: "/pages/home/home",
  Index: "/pages/index/index",

  qrcode: "/erp/qrcode/qrcode",
  login: "/pages/login/login",

  // —————————— 销售管理 ——————————————————————
  // 销售首页
  saleLoading: "/sale/loading",

  // 销售看板
  saleView: "/sale/view",
  // 销售
  sale: "/sale/sale",
  // 销售订单列表
  saleOrderList: "/sale/order-list",
  // 客户管理
  saleClient: "/sale/client",
  // 添加客户管理
  saleNewClient: "/sale/new-client",
  // 销售退货列表
  saleRefundList: "/sale/refund",
  // 我的销售订单
  saleMyList: "/sale/my-order",

  // 新增修改销售订单
  NewSale: "/form/sale-order",
  // 添加销售退货单
  saleRefund: "/form/sale-refund-order",

  // 销售客户下单返回地址
  saleClientAddedBack: "/sale/my-order",


  // —————————— 采购管理 ——————————————————————
  // 销售首页
  purchaseLoading: "/purchase/loading",

  // 采购看板
  purchaseView: "/purchase/view",
  // 采购
  purchase: "/purchase/purchase",
  // 采购新订单列表
  purchaseOrder: "/purchase/order",
  // 供应商管理
  purchaseClient: "/purchase/supplier",
  // 添加采购管理
  purchaseNewClient: "/purchase/new-supplier",
  // 采购退货列表
  purchaseRefundList: "/purchase/refund",
  // 我的采购订单
  purchaseMyList: "/purchase/my-order",

  // 采购供应商下单返回地址
  purchaseClientAddedBack: "/purchase/supplier",

  // 新增修改采购订单
  NewPurchase: "/form/purchase-order",
  // 添加采购退货单
  refundPurchase: "/form/purchase-refund-order",


  // ———————————— 产品管理 ————————————————————
  // 添加产品
  product: "/product/product",

  // 购物列表
  shopping: "/product/shopping",

  // 产品分类
  productClassify: "/product/classify",
  // 产品扩张字段
  productField: "/product/field",
  // 添加产品
  addedProduct: "/product/added",
  // 产品详情
  productDetail: "/product/detail",
  // 添加产品描述
  productDesc: "/product/desc",


  // ———————————— 财务管理 ————————————————————
  financeLoading: "/finance/loading",
  // 应收款
  financeReceivable: "/finance/receivable",
  // 新应收款
  financeOrOrder: "/finance/or-order",
  // 应付款
  financePay: "/finance/pay",
  // 应付款
  financeApPay: "/finance/ap-pay",
  // 其它支出
  financeExpenses: "/finance/expenses",
  // 核对款项
  financeVerification: "/finance/verification",

  // 添加付款单据
  financeTicket: "/finance/ticket",
  // 核对款项
  financeCheck: "/finance/check",
  // 核对款项
  financeReconcile: "/finance/reconcile",
  // 财务报表
  financeReports: "/finance/reports",
  // 最近交易
  financeLately: "/finance/lately",

  // ———————————— 生产管理 ————————————————————
  // 生产
  produceLoading: "/produce/loading",
  // 生产
  produce: "/produce/produce",
  // 生产工单
  produceWorkList: "/produce/work-list",

  // 新的生产工单
  produceWork: "/process/work",
  // 生产详情
  produceDetails: "/process/details",

  // 考勤
  attend: "/attend/attend",
  // 考勤记录
  attendRecord: "/attend/record",
  // 打卡二维码
  attendCheckIn: "/attend/check-in",

  // ———————————— 通用产品选择 ————————
  // 选择产品页面
  pickerProduct: "/shop/list/list",

  // 分享出去进来
  shareAddedProduct: "/shop/binding/binding",
  // 批量分享
  shareProduct: "/shop/binding/share",

  // ———————————— 授权管理 ————————————
  // 授权页面
  adminAuthorization: "/admin/merchants/authorization",
  // 服务续费
  adminRenewal: "/admin/renewal",
  // 店铺设置
  adminSetShop: "/admin/set-sys",
  // 管理微信用户
  WeChat: "/admin/we-chat",
  // 设置权限
  SetRole: "/admin/set-role",
  // 个人中心
  User: "/admin/user",

  // ———————————— 消息管理 ————————————
  // 消息列表
  messageList: "/message/list/list",

  // ———————————— 物流管理 ————————————
  // 物流
  logisticsLoading: "/logistics/loading",
  // 配送
  logisticsDelivery: "/logistics/delivery",
  // 物流商
  logisticsProvider: "/logistics/provider",
  // 我的配送
  logisticsMyDelivery: "/logistics/my-delivery",
  // 新物流商
  logisticsNewProvider: "/logistics/new-provider",

  // ———————————— 库存管理 ————————————
  // 库存管理
  stockLoading: "/stock/loading",

  // 库存看板
  stockView: "/stock/view",
  // 入库审批
  stockWarehouse: "/stock/warehouse",
  // 出库审批
  stockOut: "/stock/out",
  // 核对库存
  stockVerification: "/stock/verification",
  // 库存管理
  stock: "/stock/stock",
  // 核销库存
  stockCheck: "/stock/check",
  // 库存预警
  stockWarning: "/stock/warning",

  // ———————————— 员工管理 ————————————
  // 员工管理
  produceStaff: "/staff/staff",
  // 新员工
  produceNewStaff: "/staff/new-staff",
  // 生产流程
  factory: "/staff/factory",
  // 员工工资列表
  staffWages: "/staff/wages",
  // 员工工艺
  salary: "/staff/salary",

  // ——————————————— 智能客服 ————————————————
  smart: "/smart/smart",

  // ——————————————— 订单状态 ————————————————
  orderStatus: "/order/status",

  // ——————————————— 店铺 ———————————————————
  // 店铺配置
  shopUp: "/shop/set-up",

  // ——————————————— 用户绑定 ———————————————
  clientBinding: "/client/binding",
  // 绑定供应商
  supplierBinding: "/client/supplier",
  // 绑定员工
  staffBinding: "/client/staff",

  // ———————————————— 大卖场 ————————————————
  hypermarket: "/shop/hypermarket",
  // 设置推荐商品/设置活动商品
  setRecommend: "/shop/recommend",
};

/**
 * @description 系统菜单列表
 */
export const MENU_LIST = [
  {
    label: "库存",
    icon: "icon-kucuntongjifenxi",
    value: PageEnums.stockLoading,
    modelKey: "stock",
    role: ["ADMIN", "BUSINESS", "STOCK_READ", "STOCK_WRITE", "STOCK_TAKING"],
    // 是否可以被分配角色
    isUpRole: true,
    // 是否有会员系统
    isMember: false,
  },
  {
    label: "销售",
    icon: "icon-xiaoshoubi",
    value: PageEnums.saleLoading,
    modelKey: "sale",
    role: ["ADMIN", "BUSINESS", "SALES_READ", "SALES_WRITE", "SALES_MEMBER"],
    isUpRole: true,
    // 是否有会员系统
    // isMember: true,
    // memberLabel: "客户",
  },
  {
    label: "采购",
    icon: "icon-icon_B_caigoujihuatibao",
    value: PageEnums.purchaseLoading,
    modelKey: "purchase",
    role: ["ADMIN", "BUSINESS", "PURCHASE_READ", "PURCHASE_WRITE", "PURCHASE_MEMBER"],
    isUpRole: true,
    // 是否有会员系统
    // isMember: true,
    // memberLabel: "供应商",
  },
  {
    label: "生产",
    icon: "icon-Datastatistics",
    value: PageEnums.produceLoading,
    checkField: "produceEnable",
    modelKey: "produce",
    role: ["ADMIN", "BUSINESS", "PRODUCE_READ", "PRODUCE_WRITE", "PRODUCE_MEMBER"],
    isUpRole: true,
  },
  {
    label: "财务",
    icon: "icon-tubiao-05",
    value: PageEnums.financeLoading,
    modelKey: "finance",
    role: ["ADMIN", "BUSINESS", "FINANCE_READ", "FINANCE_WRITE"],
    isUpRole: true,
  },
  {
    label: "财务报表",
    icon: "icon-caiwubaobiao1",
    value: PageEnums.financeReports,
    modelKey: "finance_reports",
    role: ["ADMIN", "BUSINESS", "FINANCE_RECENT"],
    isUpRole: true,
  },
  {
    label: "配送",
    icon: "icon-daishouhuo",
    value: PageEnums.logisticsLoading,
    checkField: "deliveryEnable",
    modelKey: "logistics",
    role: ["ADMIN", "BUSINESS", "DELIVERY_READ", "DELIVERY_WRITE", "DELIVERY_MEMBER"],
    isUpRole: true,
    // 是否有会员系统
    // isMember: true,
    // memberLabel: "物流商",
  },
  {
    label: "产品管理",
    icon: "icon-chanpinguanli",
    value: PageEnums.product,
    modelKey: "product",
    role: ["ADMIN", "BUSINESS", "PRODUCT_READ", "PRODUCT_WRITE"],
    isUpRole: true,
  },
  {
    label: "板材加工",
    icon: "icon-ziyuanicon",
    value: "CNC_MEMBER",
    modelKey: "cnc",
    role: ["ADMIN", "CNC_MEMBER"],
    isUpRole: true,
    // 不显示在首页菜单
    noShowInHome: true,
  },
  {
    label: "员工管理",
    icon: "icon-guanxiaobaotubiao38",
    value: PageEnums.SetRole,
    role: ["ADMIN", "BUSINESS"],
    isUpRole: false,
  },
  /*  {
     label: "用户管理",
     icon: "icon-a-yonghuguanli11",
     value: PageEnums.WeChat,
     role: ["ADMIN", "BUSINESS"],
     isUpRole: false,
   }, */
  {
    label: "考勤",
    icon: "icon-kaoqindaka",
    value: PageEnums.attend,
    role: ["ADMIN", "BUSINESS", "PRODUCE_MEMBER", "PRODUCE_READ"],
    isUpRole: false,
  },
  {
    label: "店铺",
    icon: "icon-dianpu",
    value: PageEnums.shopUp,
    role: ["ADMIN", "BUSINESS"],
    isUpRole: false,
  },
  {
    label: "个人中心",
    icon: "icon-gerenzhongxin",
    value: PageEnums.User,
    role: ["*"],
    isUpRole: false,
  },
  {
    label: "超管",
    icon: "icon-chaojiguanliyuan",
    value: "/admin/admin/index",
    role: ["ADMIN"],
    isUpRole: false,
  },
];

/**
 * @description 首页页面类型
 * @type {{logout: string}}
 */
export const HOME_PAGE_TYPE_ENUMS = {
  logout: "退出登录",
  reselect: "重新选择商户",
  SALE_SHARE: "分享出去添加销售单",
  SHARE_PURCHASE: "分享出去添加采购单",
  ADDED_REFUND_PURCHASE: "分享出去添加采购退货单",
  ADDED_CLIENT_BY_SALE: "分享出去让客户添加信息及绑定微信",
  BINDING_CLIENT_BY_SALE: "分享出去让客户绑定微信",
  BINDING_CLIENT_BY_PURCHASE: "分享出去让供应商绑定微信",
  BINDING_CLIENT_BY_LOGISTICS: "分享出去绑定物流商维修",
  BINDING_PRODUCT: "分享出去批量绑定产品",
  SHARE_PRODUCE_PACKING: "分享出去下单板材",
};

/**
 * @description 页面类型对呀的页面地址
 */
export const PAGE_TYPE_CORRESPOND_PATH = {
  SALE_SHARE: PageEnums.NewSale,
  BINDING_CLIENT_BY_SALE: "/client/binding/binding",
  SHARE_PURCHASE: PageEnums.NewPurchase,
  BINDING_CLIENT_BY_PURCHASE: "/client/binding/binding",
};

/**
 * @description WebSocket 消息类型
 */
export const WEB_SOCKET_ENUMS = {
  OutboundOrder: "出库单",
  ProduceOrder: "生产单",
  PurchaseOrder: "采购单",
  SaleOrder: "销售单",
  InboundOrder: "出库单",
  PayableOrder: "应付单",
  ReceivableOrder: "应收单",
  DeliveryOrder: "物流单",
};

/**
 * @description 财务看版其它费用固定 id 不可修改; wages: 工资; freight: 运费
 */
export const FINANCE_CLASSIFY_FIXED_ID = ["wages", "freight"];

/**
 * @description 计价方式
 */
export const PRICING_METHOD = {
  pieceWork: "计件工作",
  piecePriceGroup: "计件价格组内平分",
  timingWork: "计时工作",
  fixedPrice: "固定价格",
  fixedPriceGroup: "固定价格组内平分",
  dailyRate: "按日工资",
  commission: "总单价提成",
  priceCommission: "金额提成",
  none: "没有定价方式",
};

/**
 * @description 板材规格枚举
 */
export const PLATE_SPECIF_ENUMS = [
  {
    name: "1220×2440",
    value: "1220×2440",
  },
  {
    name: "1220×2750",
    value: "1220×2750",
  },
];

export const WAGE_TYPE_ENUMS = {
  ProductionSettlement: "生产结算",
  ClearAnAccount: "工资/补贴/奖金发放",
  SubsidyAndBonus: "补贴/奖金所得",
  CancelSettlement: "取消结算",
};

/**
 * @description 消息类型
 */
export const MSG_TYPE_ENUMS = {
  NewUserNotice: "新用户提醒",
  InternalStaffNoticeSender: "发送的消息",
  InternalStaffNoticeReceiver: "消息提醒",
};

/**
 * @description 微信用户标签
 */
export const WX_USER_TAG_ENUMS = {
  newUser: "新用户",
  customerTag: "客户",
  supplierTag: "供应商",
  staffTag: "员工",
  logisticTag: "物流商",
  blacklist: "黑名单",
};
