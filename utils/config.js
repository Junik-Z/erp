export const CONFIG = {
  // 请求头的参数
  APP_ID: "wx525c19deacc41329",

  // #ifdef MP
  BASE_URL: "http://192.168.0.7:8093/api",
  // #endif

  // #ifdef H5
  BASE_URL: "/api",
  // #endif

  TITLE: "夸欧托手掌柜",
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
 * @description 系统菜单列表
 */
export const MENU_LIST = [
  {
    label: "库存",
    icon: "icon-kucuntongjifenxi",
    value: "/erp/stock/stock",
    modelKey: "stock",
    role: ["Admin", "Business", "Stock_Read", "Stock_Write"],
  },
  {
    label: "销售",
    icon: "icon-xiaoshoubi",
    value: "/erp/sale/sale",
    modelKey: "sale",
    role: ["Admin", "Business", "Sales_Read", "Sales_Write"],
  },
  {
    label: "采购",
    icon: "icon-icon_B_caigoujihuatibao",
    value: "/erp/purchase/purchase",
    modelKey: "purchase",
    role: ["Admin", "Business", "Purchase_Read", "Purchase_Write"],
  },
  {
    label: "生产",
    icon: "icon-Datastatistics",
    value: "/erp/produce/produce",
    isSetup: true,
    modelKey: "produce",
    role: ["Admin", "Business", "Produce_Read", "Produce_Write"],
  },
  {
    label: "财务",
    icon: "icon-tubiao-05",
    value: "/erp/finance/finance",
    modelKey: "finance",
    role: ["Admin", "Business", "Finance_Read", "Finance_Write"],
  },
  {
    label: "配送",
    icon: "icon-daishouhuo",
    value: "/erp/logistics/logistics",
    isSetup: true,
    modelKey: "logistics",
    role: ["Admin", "Business", "Delivery_Read", "Delivery_Write"],
  },
  {
    label: "产品管理",
    icon: "icon-chanpinguanli",
    value: "/erp/product/product",
    modelKey: "product",
    role: ["Admin", "Business", "Product_Read", "Product_Write"],
  },
  {
    label: "员工管理",
    icon: "icon-guanxiaobaotubiao38",
    value: "/admin/merchants/merchants",
    role: ["Admin", "Business"],
  },
  {
    label: "个人中心",
    icon: "icon-gerenzhongxin",
    value: "/admin/user/user",
    role: ["Admin", "Business", "User"],
  },
  {
    label: "超管",
    icon: "icon-chaojiguanliyuan",
    value: "/admin/admin/index",
    role: ["Admin"],
  },
];
