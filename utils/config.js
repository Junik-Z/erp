export const CONFIG = {
  // 请求头的参数
  APP_ID: "wx525c19deacc41329",

  // #ifdef MP
  BASE_URL: "http://192.168.0.7:8093/api",
  BASE_WS_URL: "ws://192.168.0.7:8093/api/ws/app",
  // #endif

  // #ifdef H5
  BASE_URL: "/api",
  BASE_WS_URL: "/api/ws/app",
  // #endif

  // BASE_URL: "https://erp.kuaouyun.cn/api",
  // BASE_WS_URL: "wss://erp.kuaouyun.cn/api/ws/app",

  TITLE: "托手掌柜",

  // 分享出去时的type： 0 - 微信小程序正式版 ；1 - 微信小程序开发版；2 - 微信小程序体验版
  SHARE_TYPE: 1,
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
 * @description 系统菜单列表
 */
export const MENU_LIST = [
  // #ifdef H5
  {
    label: "大屏数据看版",
    icon: "icon-dashboard",
    value: "/admin/dashboard/dashboard",
    modelKey: "stock",
    role: ["Admin", "Business"],
    // 是否可以被分配角色
    isUpRole: false,
  },
  // #endif

  {
    label: "库存",
    icon: "icon-kucuntongjifenxi",
    value: "/erp/stock/stock",
    modelKey: "stock",
    role: ["Admin", "Business", "Stock_Read", "Stock_Write"],
    // 是否可以被分配角色
    isUpRole: true,
  },
  {
    label: "销售",
    icon: "icon-xiaoshoubi",
    value: "/erp/sale/sale",
    modelKey: "sale",
    role: ["Admin", "Business", "Sales_Read", "Sales_Write"],
    isUpRole: true,
  },
  {
    label: "采购",
    icon: "icon-icon_B_caigoujihuatibao",
    value: "/erp/purchase/purchase",
    modelKey: "purchase",
    role: ["Admin", "Business", "Purchase_Read", "Purchase_Write"],
    isUpRole: true,
  },
  {
    label: "生产",
    icon: "icon-Datastatistics",
    value: "/erp/produce/produce",
    checkField: "produceEnable",
    modelKey: "produce",
    role: ["Admin", "Business", "Produce_Read", "Produce_Write"],
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
    role: ["Admin", "Business", "Delivery_Read", "Delivery_Write"],
    isUpRole: true,
  },
  {
    label: "产品管理",
    icon: "icon-chanpinguanli",
    value: "/erp/product/product",
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
    label: "个人中心",
    icon: "icon-gerenzhongxin",
    value: "/admin/user/user",
    role: ["Admin", "Business", "User"],
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
  logout: "退出登陆",
  reselect: "重新选择商户",
  ADDED_SALE: "分享出去添加销售单",
  ADDED_PURCHASE: "分享出去添加采购单",
  ADDED_CLIENT_BY_SALE: "分享出去让客户添加信息及绑定微信",
  BINDING_CLIENT_BY_SALE: "分享出去让客户绑定微信",
  BINDING_CLIENT_BY_PURCHASE: "分享出去让供应商绑定微信",
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
