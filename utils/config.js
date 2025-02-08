import { _isDev } from "@/utils/index";

// 请求地址
let BASE_URL = "http://192.168.0.7:8093/api";
let BASE_WS_URL = "ws://192.168.0.7:8093/api/ws/app";

let DEFAULT_PAGE_SIZE = 5;

// #ifdef H5
BASE_URL = "/api";
BASE_WS_URL = "/api/ws/app";

DEFAULT_PAGE_SIZE = 10;

// BASE_URL: "https://erp.kuaouyun.cn/api",
// BASE_WS_URL: "wss://erp.kuaouyun.cn/api/ws/app",
// #endif

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
 * OutboundOrder  出库单
 * ProduceOrder  生产单
 * PurchaseOrder 采购单
 * SaleOrder  销售单
 * InboundOrder  出库单
 * PayableOrder  应付单
 * ReceivableOrder  应收单
 * DeliveryOrder  物流单
 */

/**
 * @description 页面枚举
 */
export const PageEnums = {
  home: "/pages/home/home",

  // 添加付款单据
  ticket: "/erp/finance/ticket",
  // 新增修改销售订单
  editSale: "/form/sale-order",
  // 添加销售退货单
  saleRefund: "/form/sale-refund-order",

  // 新增修改采购订单
  editPurchase: "/form/purchase-order",
  // 添加采购退货单
  refundPurchase: "/form/purchase-refund-order",

  // 销售客户
  saleClient: "/erp/sale/sale?TO_REF=CLRef",
  // 采购供应商
  purchaseClient: "/erp/purchase/purchase?TO_REF=CLRef",

  // 销售客户下单返回地址
  saleClientAddedBack: "/erp/sale/sale?TO_REF=MOLRef",
  // 采购供应商下单返回地址
  purchaseClientAddedBack: "/erp/purchase/purchase?TO_REF=MOLRef",

  // 物流商
  logisticsClient: "/erp/logistics/logistics?TO_REF=RLRef",

  // 添加产品
  addedProduct: "/product/added",
  // 添加产品
  product: "/product/product",

  // 分享出去进来
  shareAddedProduct: "/shop/binding/binding",

  // 批量分享
  shareProduct: "/shop/binding/share",

  // 生产
  produceLoading: "/produce/loading",
  // 生产
  produce: "/produce/produce",
  // 生产工单
  produceWorkList: "/produce/work-list",
  // 员工管理
  produceStaff: "/produce/staff",
  // 新员工
  produceNewStaff: "/produce/new-staff",
  // 员工的已完结工单列表
  produceStaffCompleteProcess: "/produce/complete-process",
  // 新的生产工单
  produceWork: "/produce/work",
  // 员工工艺工资
  salary: "/produce/salary",
  // 生产流程
  factory: "/produce/factory",
  // 生产详情
  produceDetails: "/produce/details",

  // 员工，我的工资
  produceSalary: "/produce/salary",

  // 考勤
  attend: "/attend/attend",
  // 考勤记录
  attendRecord: "/attend/record",
  // 打卡二维码
  attendCheckIn: "/attend/check-in",
};

/**
 * @description 系统菜单列表
 */
export const MENU_LIST = [
  {
    label: "库存",
    icon: "icon-kucuntongjifenxi",
    value: "/erp/stock/stock",
    modelKey: "stock",
    role: ["Admin", "Business", "Stock_Read", "Stock_Write", "Stock_Taking"],
    // 是否可以被分配角色
    isUpRole: true,
    // 是否有会员系统
    isMember: false,
  },
  {
    label: "销售",
    icon: "icon-xiaoshoubi",
    value: "/erp/sale/sale",
    modelKey: "sale",
    role: ["Admin", "Business", "Sales_Read", "Sales_Write", "Sales_Member"],
    isUpRole: true,
    // 是否有会员系统
    // isMember: true,
    // memberLabel: "客户",
  },
  {
    label: "采购",
    icon: "icon-icon_B_caigoujihuatibao",
    value: "/erp/purchase/purchase",
    modelKey: "purchase",
    role: ["Admin", "Business", "Purchase_Read", "Purchase_Write", "Purchase_Member"],
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
    role: ["Admin", "Business", "Produce_Read", "Produce_Write", "Produce_Member"],
    isUpRole: true,
  },
  {
    label: "财务",
    icon: "icon-tubiao-05",
    value: "/erp/finance/finance",
    modelKey: "finance",
    role: ["Admin", "Business", "Finance_Read", "Finance_Write"],
    isUpRole: true,
  },
  {
    label: "配送",
    icon: "icon-daishouhuo",
    value: "/erp/logistics/logistics",
    checkField: "deliveryEnable",
    modelKey: "logistics",
    role: ["Admin", "Business", "Delivery_Read", "Delivery_Write", "Delivery_Member"],
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
    role: ["Admin", "Business", "Product_Read", "Product_Write"],
    isUpRole: true,
  },
  {
    label: "员工管理",
    icon: "icon-guanxiaobaotubiao38",
    value: "/admin/merchants/merchants",
    role: ["Admin", "Business"],
    isUpRole: false,
  },
  {
    label: "考勤",
    icon: "icon-kaoqindaka",
    value: PageEnums.attend,
    role: ["Admin", "Business", "Produce_Member", "Product_Write"],
    isUpRole: false,
  },
  {
    label: "个人中心",
    icon: "icon-gerenzhongxin",
    value: "/admin/user/user",
    role: ["*"],
    isUpRole: false,
  },
  {
    label: "超管",
    icon: "icon-chaojiguanliyuan",
    value: "/admin/admin/index",
    role: ["Admin"],
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
  ADDED_SALE: "分享出去添加销售单",
  ADDED_PURCHASE: "分享出去添加采购单",
  ADDED_REFUND_PURCHASE: "分享出去添加采购退货单",
  ADDED_CLIENT_BY_SALE: "分享出去让客户添加信息及绑定微信",
  BINDING_CLIENT_BY_SALE: "分享出去让客户绑定微信",
  BINDING_CLIENT_BY_PURCHASE: "分享出去让供应商绑定微信",
  BINDING_CLIENT_BY_LOGISTICS: "分享出去绑定物流商维修",
  BINDING_PRODUCT: "分享出去批量绑定产品",
};

/**
 * @description 页面类型对呀的页面地址
 */
export const PAGE_TYPE_CORRESPOND_PATH = {
  ADDED_SALE: PageEnums.editSale,
  BINDING_CLIENT_BY_SALE: "/client/binding/binding",
  ADDED_PURCHASE: PageEnums.editPurchase,
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
  none: "没有定价方式",
};

/**
 * @description 生产工单类型
 */
export const PRODUCTION_TYPE_ENUMS = {
  common: "常规生产",
  packing: "板材定制",
  xlsx: "表格定制生产",
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
  /* {
    name: "1220x2440x9",
    value: "1220x2440x9",
  },
  {
    name: "1220x2440x18",
    value: "1220x2440x18",
  },
  {
    name: "1220x2440x17",
    value: "1220x2440x17",
  },
  {
    name: "1220x2750x9",
    value: "1220x2750x9",
  },
  {
    name: "1220x2750x18",
    value: "1220x2750x18",
  },
  {
    name: "1220x2750x17",
    value: "1220x2750x17",
  }, */
];
