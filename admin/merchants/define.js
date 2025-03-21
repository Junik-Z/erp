/**
 * @param type 1: 页面，2: 按钮，3: tab
 */

/**
 * @description 系统权限
 */
export const SYS_PERM_TREE = [
  {
    label: "超级管理员",
    type: 1,
    perm: "ADMIN",
    id: "0",
  },
  {
    label: "普通用户",
    type: 1,
    perm: "USER",
    id: "1",
  },
  {
    label: "商户",
    type: 1,
    perm: "BUSINESS",
    id: "2",
  },
  {
    label: "监控大屏",
    type: 1,
    perm: "MONITOR",
    id: "3",
  },
  {
    label: "产品查看",
    type: 2,
    perm: "PRODUCT_READ",
    id: "4",
  },
  {
    label: "产品编辑",
    type: 2,
    perm: "PRODUCT_WRITE",
    id: "5",
  },
  {
    label: "库存查看",
    type: 2,
    perm: "STOCK_READ",
    id: "6",
  },
  {
    label: "库存编辑",
    type: 2,
    perm: "STOCK_WRITE",
    id: "7",
  },
  {
    label: "库存盘点",
    type: 2,
    perm: "STOCK_TAKING",
    id: "8",
  },
  {
    label: "客户",
    type: 1,
    perm: "SALES_MEMBER",
    id: "9",
  },
  {
    label: "销售编辑",
    type: 2,
    perm: "SALES_WRITE",
    id: "10",
  },
  {
    label: "销售查看",
    type: 2,
    perm: "SALES_READ",
    id: "11",
  },
  {
    label: "员工",
    type: 1,
    perm: "PRODUCE_MEMBER",
    id: "12",
  },
  {
    label: "生产编辑",
    type: 2,
    perm: "PRODUCE_WRITE",
    id: "13",
  },
  {
    label: "生产查看",
    type: 2,
    perm: "PRODUCE_READ",
    id: "14",
  },
  {
    label: "财务编辑",
    type: 2,
    perm: "FINANCE_WRITE",
    id: "15",
  },
  {
    label: "财务查看",
    type: 2,
    perm: "FINANCE_READ",
    id: "16",
  },
  {
    label: "供应商",
    type: 1,
    perm: "PURCHASE_MEMBER",
    id: "17",
  },
  {
    label: "采购编辑",
    type: 2,
    perm: "PURCHASE_WRITE",
    id: "18",
  },
  {
    label: "采购查看",
    type: 2,
    perm: "PURCHASE_READ",
    id: "19",
  },
  {
    label: "物流商",
    type: 1,
    perm: "DELIVERY_MEMBER",
    id: "20",
  },
  {
    label: "物流编辑",
    type: 2,
    perm: "DELIVERY_WRITE",
    id: "21",
  },
  {
    label: "物流查看",
    type: 2,
    perm: "DELIVERY_READ",
    id: "22",
  },
  {
    label: "CNC成员",
    type: 1,
    perm: "CNC_MEMBER",
    id: "23",
  },
  {
    label: "财务报表",
    type: 1,
    perm: "FINANCE_RECENT",
    id: "24",
  },
];

/**
 * @description 库存管理
 */
export const STOCK_PERM_TREE = [
  {
    label: "库存看板",
    type: 1,
    perm: ["STOCK_COUNT"],
    id: "231000000",
    children: [
      {
        label: "库存数量",
        type: 3,
        perm: "STOCK_COUNT",
        id: "231",
      },
      {
        label: "库存警告列表",
        type: 2,
        perm: "STOCK_WARNING_LIST",
        id: "230",
      },
    ],
  },
  {
    label: "入库审批",
    type: 1,
    perm: ["STOCK_INBOUND_LIST", "STOCK_INBOUND_HISTORY", "STOCK_INBOUND_CANCEL"],
    id: "210211213",
    children: [
      {
        label: "待处理",
        type: 3,
        perm: "STOCK_INBOUND_LIST",
        id: "210",
      },
      {
        label: "已完成",
        type: 3,
        perm: "STOCK_INBOUND_HISTORY",
        id: "211",
      },
      {
        label: "已取消",
        type: 3,
        perm: "STOCK_INBOUND_CANCEL",
        id: "213",
      },
      {
        label: "确认入库",
        type: 2,
        perm: "STOCK_INBOUND_CONFIRM",
        id: "214",
      },
    ],
  },
  {
    label: "出库审批",
    type: 1,
    perm: ["STOCK_OUTBOUND_LIST", "STOCK_OUTBOUND_HISTORY", "STOCK_OUTBOUND_CANCEL"],
    id: "220221223",
    children: [
      {
        label: "待处理",
        type: 3,
        perm: "STOCK_OUTBOUND_LIST",
        id: "220",
      },
      {
        label: "已完成",
        type: 3,
        perm: "STOCK_OUTBOUND_HISTORY",
        id: "221",
      },
      {
        label: "已取消",
        type: 3,
        perm: "STOCK_OUTBOUND_CANCEL",
        id: "223",
      },
      {
        label: "确认出库",
        type: 2,
        perm: "STOCK_OUTBOUND_CONFIRM",
        id: "224",
      },
    ],
  },
  {
    label: "核对库存",
    type: 1,
    perm: ["STOCK_CHECK"],
    id: "200201000",
    children: [
      {
        label: "核对库存",
        type: 3,
        perm: "STOCK_CHECK",
        id: "200",
      },
      {
        label: "刷新库存",
        type: 2,
        perm: "STOCK_REFRESH",
        id: "201",
      },
      {
        label: "库存盘点",
        type: 2,
        perm: "STOCK_CHECK_INOUT_ORDER",
        id: "204",
      },
    ],
  },
  {
    label: "其它功能",
    type: 2,
    perm: ["STOCK_PRINT"],
    id: "205000000",
    children: [
      {
        label: "打印",
        type: 2,
        perm: "STOCK_PRINT",
        id: "205",
      },
    ],
  },
];

/**
 * @description 销售管理
 */
export const SALE_PERM_TREE = [
  {
    label: "销售看板",
    type: 1,
    perm: ["SALE_STATISTICS"],
    id: "340000000",
    children: [
      {
        label: "销售统计",
        type: 3,
        perm: "SALE_STATISTICS",
        id: "340",
      },
    ],
  },
  {
    label: "销售订单",
    type: 1,
    perm: ["SALE_LIST", "SALE_WAIT_PAYMENT", "SALE_HISTORY"],
    id: "300301302",
    children: [
      {
        label: "待处理",
        type: 3,
        perm: "SALE_LIST",
        id: "300",
      },
      {
        label: "待付款",
        type: 3,
        perm: "SALE_WAIT_PAYMENT",
        id: "301",
      },
      {
        label: "已完成",
        type: 3,
        perm: "SALE_HISTORY",
        id: "302",
      },
      {
        label: "提交订单",
        type: 2,
        perm: "SALE_SUBMIT",
        id: "308",
      },
      {
        label: "新增订单",
        type: 2,
        perm: "SALE_ADD",
        id: "340",
      },
      {
        label: "修改订单",
        type: 2,
        perm: "SALE_UPDATE",
        id: "306",
      },
      {
        label: "取消订单",
        type: 2,
        perm: "SALE_CANCEL",
        id: "305",
      },
      {
        label: "删除订单",
        type: 2,
        perm: "SALE_DELETE",
        id: "307",
      },
      {
        label: "已提交可修改",
        type: 2,
        perm: "SALE_RE_ORDER",
        id: "360",
        color: "#e43d33",
      },
      {
        label: "已付款列表",
        type: 3,
        perm: "SALE_PAID_ORDER",
        id: "370",
      },
      {
        label: "付款",
        type: 2,
        perm: "SALE_ADD_PAID_ORDER",
        id: "371",
      },
      {
        label: "编辑付款信息",
        type: 2,
        perm: "SALE_EDIT_PAID_ORDER",
        id: "372",
      },
      {
        "label": "快捷出库",
        "type": 2,
        "perm": "SALE_QUICK_OUT",
        "id": "373",
        color: "#e43d33",
      },
    ],
  },
  {
    label: "客户管理",
    type: 1,
    perm: ["CUSTOMER_LIST"],
    id: "320000000",
    children: [
      {
        label: "客户",
        type: 3,
        perm: "CUSTOMER_LIST",
        id: "320",
      },
      {
        label: "临时客户",
        type: 3,
        perm: "CUSTOMER_TEMP",
        id: "321",
      },
      {
        label: "绑定客户",
        type: 2,
        perm: "CUSTOMER_BIND",
        id: "327",
      },
      /* {
        label: "获取绑定客户信息",
        type: 2,
        perm: "CUSTOMER_GET_BIND_INFO",
        id: "328",
      }, */
      {
        label: "解绑客户",
        type: 2,
        perm: "CUSTOMER_UNBIND",
        id: "329",
      },
      {
        label: "添加客户",
        type: 2,
        perm: "CUSTOMER_ADD",
        id: "322",
      },
      {
        label: "转换客户身份",
        type: 2,
        perm: "CUSTOMER_CONVERT",
        id: "324",
      },
      {
        label: "编辑客户",
        type: 2,
        perm: "CUSTOMER_EDIT",
        id: "325",
      },
      {
        label: "删除客户",
        type: 2,
        perm: "CUSTOMER_DELETE",
        id: "326",
      },

      {
        label: "应收账款核对",
        type: 2,
        perm: "FINANCE_RECEIVABLE_CHECK",
        id: "551",
      },
      {
        label: "应付账款核对",
        type: 2,
        perm: "FINANCE_PAYABLE_CHECK",
        id: "541",
      },

      {
        label: "客户地址列表",
        type: 2,
        perm: "CUSTOMER_ADDRESS_LIST",
        id: "327",
      },
      {
        label: "删除地址",
        type: 2,
        perm: "CUSTOMER_ADDRESS_DELETE",
        id: "328",
      },
    ],
  },
  {
    label: "销售退货",
    type: 1,
    perm: ["SALE_RETURN_LIST", "SALE_RETURN_WAIT_PAYMENT", "SALE_RETURN_HISTORY"],
    id: "310311312",
    children: [
      {
        label: "待处理",
        type: 3,
        perm: "SALE_RETURN_LIST",
        id: "310",
      },
      {
        label: "待退款",
        type: 3,
        perm: "SALE_RETURN_WAIT_PAYMENT",
        id: "311",
      },
      {
        label: "已完成",
        type: 3,
        perm: "SALE_RETURN_HISTORY",
        id: "312",
      },
      {
        label: "添加退货单",
        type: 2,
        perm: "SALE_RETURN_ADD",
        id: "313",
      },
      {
        label: "取消订单",
        type: 2,
        perm: "SALE_RETURN_CANCEL",
        id: "314",
      },
      {
        label: "修改订单",
        type: 2,
        perm: "SALE_RETURN_UPDATE",
        id: "316",
      },
      {
        label: "删除订单",
        type: 2,
        perm: "SALE_RETURN_DELETE",
        id: "317",
      },
      {
        label: "提交订单",
        type: 2,
        perm: "SALE_RETURN_CONFIRM",
        id: "318",
      },
      {
        label: "已提交可修改",
        color: "#e43d33",
        type: 2,
        perm: "SALE_RETURN_RE_ORDER",
        id: "361",
      },
      {
        label: "已退款列表",
        type: 3,
        perm: "SALE_RETURN_RETURNED_ORDER",
        id: "373",
      },
      {
        label: "退款",
        type: 2,
        perm: "SALE_RETURN_ADD_RETURNED_ORDER",
        id: "374",
      },
      {
        label: "编辑退款信息",
        type: 2,
        perm: "SALE_RETURN_EDIT_RETURNED_ORDER",
        id: "375",
      },
      {
        "label": "快捷入库",
        "type": 2,
        "perm": "SALE_RETURN_QUICK_IN",
        "id": "376",
        color: "#e43d33",
      },
    ],
  },
  {
    label: "我的订单",
    type: 1,
    perm: ["SALE_MY", "SALE_MY_STATISTICS", "SALE_RETURN_MY"],
    id: "350351352",
    children: [
      {
        label: "销售",
        type: 3,
        perm: "SALE_MY",
        id: "350",
      },
      {
        label: "销售统计信息",
        type: 3,
        perm: "SALE_MY_STATISTICS",
        id: "351",
      },
      {
        label: "销售退货",
        type: 3,
        perm: "SALE_RETURN_MY",
        id: "352",
      },

    ],
  },
  {
    label: "定制生产",
    type: 1,
    perm: ["SALE_PRODUCE_ADD"],
    id: "342000000",
    children: [
      {
        label: "添加定制订单",
        type: 2,
        perm: "SALE_PRODUCE_ADD",
        id: "342",
      },
      {
        label: "编辑定制订单",
        type: 2,
        perm: "SALE_PRODUCE_UPDATE",
        id: "345",
      },
    ],
  },
  {
    label: "消息功能",
    type: 1,
    id: "900000000",
    children: [
      {
        label: "消息列表",
        type: 2,
        perm: "MESSAGE_LIST",
        id: "900",
      },
      {
        label: "删除消息",
        type: 2,
        perm: "DELETE_MESSAGE",
        id: "901",
      },
      {
        label: "已读消息",
        type: 2,
        perm: "READ_MESSAGE",
        id: "902",
      },
      {
        label: "创建并绑定客户",
        type: 2,
        perm: "CREATE_BIND_CUSTOMER",
        id: "903",
      },
    ],
  },
  {
    label: "其它功能",
    type: 1,
    id: "309000000",
    children: [
      {
        label: "打印",
        type: 2,
        perm: "SALE_PRINT",
        id: "309",
      },
      {
        label: "提示最近销售价格",
        type: 2,
        perm: "SALE_RECENT_PRICE",
        id: "346",
      },

      {
        label: "显示最近采购价",
        type: 2,
        perm: "PURCHASE_RECENT_PRICE",
        id: "611",
        color: "#e43d33",
      },
      {
        label: "分享下单",
        type: 2,
        perm: "SALE_SHARE",
        id: "303",
      },

      {
        label: "回填上次价格",
        type: 2,
        perm: "FILL_CUSTOMER_PRICE",
        id: "001",
        // 需要判断 mixin
        mixinKeys: ["isTkCustom"],
        color: "#e43d33",
      },
    ],
  },
];

/**
 * @description 采购管理
 */
export const PURCHASE_PERM_TREE = [
  {
    label: "采购看板",
    type: 1,
    perm: ["SUPPLIER_COUNT"],
    id: "641000000",
    children: [
      {
        label: "供应商统计",
        type: 2,
        perm: "SUPPLIER_COUNT",
        id: "641",
      },
    ],
  },
  {
    label: "采购订单",
    type: 1,
    perm: ["PURCHASE_LIST", "PURCHASE_WAIT_PAYMENT", "PURCHASE_HISTORY"],
    id: "601602603",
    children: [
      {
        label: "待处理",
        type: 3,
        perm: "PURCHASE_LIST",
        id: "601",
      },
      {
        label: "待付款",
        type: 3,
        perm: "PURCHASE_WAIT_PAYMENT",
        id: "602",
      },
      {
        label: "已完成",
        type: 3,
        perm: "PURCHASE_HISTORY",
        id: "603",
      },
      {
        label: "新增采购单",
        type: 2,
        perm: "PURCHASE_ADD",
        id: "600",
      },

      {
        label: "取消采购单",
        type: 2,
        perm: "PURCHASE_CANCEL",
        id: "606",
      },
      {
        label: "编辑采购单",
        type: 2,
        perm: "PURCHASE_UPDATE",
        id: "607",
      },
      {
        label: "删除采购单",
        type: 2,
        perm: "PURCHASE_DELETE",
        id: "608",
      },
      {
        label: "提交采购单",
        type: 2,
        perm: "PURCHASE_CONFIRM",
        id: "609",
      },

      {
        label: "已提交可修改",
        color: "#e43d33",
        type: 2,
        perm: "PURCHASE_RE_ORDER",
        id: "650",
      },
      {
        label: "已付款列表",
        type: 3,
        perm: "PURCHASE_RETURNED_ORDER",
        id: "660",
      },
      {
        label: "付款",
        type: 2,
        perm: "PURCHASE_ADD_RETURNED_ORDER",
        id: "661",
      },
      {
        label: "修改付款信息",
        type: 2,
        perm: "PURCHASE_EDIT_RETURNED_ORDER",
        id: "662",
      },

      {
        "label": "快捷入库",
        "type": 2,
        "perm": "PURCHASE_QUICK_IN",
        color: "#e43d33",
        "id": "663",
      },
    ],
  },
  {
    label: "供应商管理",
    type: 1,
    perm: ["SUPPLIER_LIST", "SUPPLIER_TEMP"],
    id: "630631000",
    children: [
      {
        label: "供应商",
        type: 3,
        perm: "SUPPLIER_LIST",
        id: "630",
      },
      {
        label: "临时供应商",
        type: 3,
        perm: "SUPPLIER_TEMP",
        id: "631",
      },
      {
        label: "添加供应商",
        type: 2,
        perm: "SUPPLIER_ADD",
        id: "632",
      },
      {
        label: "绑定供应商",
        type: 2,
        perm: "SUPPLIER_BIND",
        id: "636",
      },
      /* {
        label: "获取绑定的供应商",
        type: 2,
        perm: "SUPPLIER_GET_BIND_INFO",
        id: "637",
      }, */
      {
        label: "解绑供应商",
        type: 2,
        perm: "SUPPLIER_UNBIND",
        id: "638",
      },
      {
        label: "转换供应商身份",
        type: 2,
        perm: "SUPPLIER_CONVERT",
        id: "640",
      },
      {
        label: "编辑供应商",
        type: 2,
        perm: "SUPPLIER_EDIT",
        id: "634",
      },
      {
        label: "删除供应商",
        type: 2,
        perm: "SUPPLIER_DELETE",
        id: "635",
      },

      {
        label: "应收账款核对",
        type: 2,
        perm: "FINANCE_RECEIVABLE_CHECK",
        id: "551",
      },
      {
        label: "应付账款核对",
        type: 2,
        perm: "FINANCE_PAYABLE_CHECK",
        id: "541",
      },

      {
        label: "供应商地址列表",
        type: 2,
        perm: "SUPPLIER_ADDRESS_LIST",
        id: "636",
      },
      {
        label: "删除地址",
        type: 2,
        perm: "SUPPLIER_ADDRESS_DELETE",
        id: "328",
      },
    ],
  },
  {
    label: "采购退货",
    type: 1,
    perm: ["PURCHASE_RETURN_LIST", "PURCHASE_RETURN_WAIT_PAYMENT", "PURCHASE_RETURN_HISTORY"],
    id: "620621622",
    children: [
      {
        label: "待处理",
        type: 3,
        perm: "PURCHASE_RETURN_LIST",
        id: "620",
      },
      {
        label: "待付款",
        type: 3,
        perm: "PURCHASE_RETURN_WAIT_PAYMENT",
        id: "621",
      },
      {
        label: "已完成",
        type: 3,
        perm: "PURCHASE_RETURN_HISTORY",
        id: "622",
      },
      {
        label: "添加采购退货单",
        type: 2,
        perm: "PURCHASE_RETURN_ADD",
        id: "623",
      },
      {
        label: "取消采购退货单",
        type: 2,
        perm: "PURCHASE_RETURN_CANCEL",
        id: "624",
      },
      {
        label: "编辑采购退货单",
        type: 2,
        perm: "PURCHASE_RETURN_UPDATE",
        id: "626",
      },
      {
        label: "删除采购退货单",
        type: 2,
        perm: "PURCHASE_RETURN_DELETE",
        id: "627",
      },
      {
        label: "提交订单",
        type: 2,
        perm: "PURCHASE_RETURN_CONFIRM",
        id: "628",
      },
      {
        label: "已提交可修改",
        color: "#e43d33",
        type: 2,
        perm: "PURCHASE_RETURN_RE_ORDER",
        id: "651",
      },
      {
        label: "已付款列表",
        type: 3,
        perm: "PURCHASE_RETURN_PAID_ORDER",
        id: "663",
      },
      {
        label: "付款",
        type: 2,
        perm: "PURCHASE_RETURN_ADD_PAID_ORDER",
        id: "664",
      },
      {
        label: "编辑已付款信息",
        type: 2,
        perm: "PURCHASE_RETURN_EDIT_PAID_ORDER",
        id: "665",
      },
      {
        "label": "快捷出库",
        "type": 2,
        "perm": "PURCHASE_RETURN_QUICK_OUT",
        color: "#e43d33",
        "id": "666",
      },
    ],
  },
  {
    label: "我的订单",
    type: 1,
    perm: ["PURCHASE_MY_LIST", "PURCHASE_RETURN_MY_LIST"],
    id: "653655000",
    children: [
      {
        label: "采购",
        type: 3,
        perm: "PURCHASE_MY_LIST",
        id: "653",
      },
      {
        label: "采购退货",
        type: 3,
        perm: "PURCHASE_RETURN_MY_LIST",
        id: "655",
      },
      {
        label: "我的采购统计",
        type: 2,
        perm: "PURCHASE_MY_STATISTICS",
        id: "652",
      },
    ],
  },
  {
    label: "定制采购",
    type: 1,
    perm: ["PURCHASE_RETURN_LIST"],
    id: "45000000",
    children: [
      {
        label: "添加定制订单",
        type: 2,
        perm: "PURCHASE_CUSTOMIZED_ADD",
        id: "450",
      },
      {
        label: "编辑定制订单",
        type: 2,
        perm: "PURCHASE_CUSTOMIZED_UPDATE",
        id: "453",
      },
    ],
  },
  {
    label: "消息功能",
    type: 1,
    id: "900000000",
    children: [
      {
        label: "消息列表",
        type: 2,
        perm: "MESSAGE_LIST",
        id: "900",
      },
      {
        label: "删除消息",
        type: 2,
        perm: "DELETE_MESSAGE",
        id: "901",
      },
      {
        label: "已读消息",
        type: 2,
        perm: "READ_MESSAGE",
        id: "902",
      },
      {
        label: "创建并绑定供应商",
        type: 2,
        perm: "CREATE_BIND_SUPPLIER",
        id: "904",
      },
    ],
  },
  {
    label: "其它功能",
    type: 1,
    perm: ["PURCHASE_PRINT"],
    id: "610000000",
    children: [
      {
        label: "打印",
        type: 2,
        perm: "PURCHASE_PRINT",
        id: "610",
      },
      {
        label: "显示最近采购价",
        type: 2,
        perm: "PURCHASE_RECENT_PRICE",
        id: "611",
      },
      {
        label: "提示最近销售价格",
        type: 2,
        perm: "SALE_RECENT_PRICE",
        id: "346",
        color: "#e43d33",
      },

      {
        label: "分享下单",
        type: 2,
        perm: "PURCHASE_SHARE",
        id: "604",
      },

      {
        label: "回填上次价格",
        type: 2,
        perm: "FILL_SUPPLIER_PRICE",
        id: "002",
        // 生效的商户
        mixinKeys: ["isTkCustom"],
        color: "#e43d33",
      },
    ],
  },
];

/**
 * @description 生产管理
 */
export const PRODUCE_PERM_TREE = [
  {
    label: "生产看板",
    type: 1,
    perm: ["PRODUCE_STATISTICS"],
    id: "400000000",
    children: [
      {
        label: "生产统计",
        type: 3,
        perm: "PRODUCE_STATISTICS",
        id: "400",
      },
    ],
  },
  {
    label: "员工管理",
    type: 1,
    perm: ["STAFF_LIST"],
    id: "421000000",
    children: [
      {
        label: "员工列表",
        type: 3,
        perm: "STAFF_LIST",
        id: "421",
      },
      {
        label: "员工统计",
        type: 2,
        perm: "STAFF_COUNT",
        id: "420",
      },
      {
        label: "添加员工",
        type: 2,
        perm: "STAFF_ADD",
        id: "422",
      },
      {
        label: "编辑员工",
        type: 2,
        perm: "STAFF_EDIT",
        id: "424",
      },
      {
        label: "删除员工",
        type: 2,
        perm: "STAFF_DELETE",
        id: "425",
      },
      {
        label: "解绑员工",
        type: 2,
        perm: "STAFF_UNBIND",
        id: "426",
      },
      {
        label: "获取未绑定的员工",
        type: 2,
        perm: "STAFF_GET_NOT_BIND_INFO",
        id: "427",
      },
      /* {
        label: "刷新员工",
        type: 2,
        perm: "STAFF_REFRESH",
        id: "428",
      }, */
      {
        label: "绑定员工",
        type: 2,
        perm: "STAFF_BIND",
        id: "429",
      },

      {
        label: "考勤记录",
        type: 2,
        perm: "ATTENDANCE_ALL_RECORDS",
        id: "510",
      },
    ],
  },
  {
    label: "生产工单",
    type: 1,
    perm: ["PRODUCE_PENDING", "PRODUCE_LIST", "PRODUCE_HISTORY"],
    id: "401402403",
    children: [
      {
        label: "待生产",
        type: 3,
        perm: "PRODUCE_PENDING",
        id: "401",
      },
      {
        label: "生产中",
        type: 3,
        perm: "PRODUCE_LIST",
        id: "402",
      },
      {
        label: "已完成",
        type: 3,
        perm: "PRODUCE_HISTORY",
        id: "403",
      },
      {
        label: "添加生产",
        type: 2,
        perm: "PRODUCE_ADD",
        id: "404",
      },
      {
        label: "暂停/恢复生产",
        type: 2,
        perm: "PRODUCE_PAUSE",
        id: "407",
      },
      {
        label: "取消生产",
        type: 2,
        perm: "PRODUCE_CANCEL",
        id: "408",
      },
      {
        label: "编辑生产",
        type: 2,
        perm: "PRODUCE_UPDATE",
        id: "409",
      },
      {
        label: "删除生产",
        type: 2,
        perm: "PRODUCE_DELETE",
        id: "410",
      },
      {
        label: "进入生产",
        type: 2,
        perm: "PRODUCE_APPLY_MATERIAL",
        id: "411",
      },
      {
        label: "完成生产",
        type: 2,
        perm: "PRODUCE_FINISH",
        id: "412",
      },
      {
        label: "更新生产流程",
        type: 2,
        perm: "PRODUCE_UPDATE_CRAFT_PROCESS",
        id: "413",
      },
    ],
  },
  {
    label: "生产流程",
    type: 1,
    perm: ["CRAFT_WORKING_LIST", "CRAFT_WAIT_CONFIRM", "CRAFT_SETTLED"],
    id: "911000000",
    children: [
      {
        label: "生产中",
        type: 3,
        perm: "CRAFT_WORKING_LIST",
        id: "911",
      },
      {
        label: "待确认",
        type: 3,
        perm: "CRAFT_WAIT_CONFIRM",
        id: "915",
      },
      {
        label: "已完成",
        type: 3,
        perm: "CRAFT_SETTLED",
        id: "917",
      },
      {
        label: "完成流程",
        type: 2,
        perm: "CRAFT_COMPLETE",
        id: "912",
      },
      {
        label: "流程更新",
        type: 2,
        perm: "CRAFT_UPDATE",
        id: "910",
      },
      {
        label: "流程恢复",
        type: 2,
        perm: "CRAFT_RECOVER",
        id: "913",
      },
      {
        label: "申请结算",
        type: 2,
        perm: "CRAFT_APPLY_SETTLE",
        id: "914",
      },
      {
        label: "确认结算",
        type: 2,
        perm: "CRAFT_CONFIRM_SETTLE",
        id: "916",
      },
      {
        label: "取消结算",
        type: 2,
        perm: "CRAFT_CANCEL_SETTLE",
        id: "918",
      },
    ],
  },
  {
    label: "我的工资",
    type: 1,
    perm: ["CRAFT_MY_SALARY", "CRAFT_MY_MONTH", "CRAFT_MY_WORKING", "CRAFT_WAIT_MY_CONFIRM", "CRAFT_MY_SETTLED"],
    id: "900901903",
    children: [

      {
        label: "工资统计",
        type: 3,
        perm: "CRAFT_MY_SALARY",
        id: "904",
      },
      {
        label: "月度工资记录",
        type: 3,
        perm: "CRAFT_MY_MONTH",
        id: "900",
      },
      {
        label: "进行中",
        type: 3,
        perm: "CRAFT_MY_WORKING",
        id: "903",
      },
      {
        label: "待确认",
        type: 3,
        perm: "CRAFT_WAIT_MY_CONFIRM",
        id: "902",
      },
      {
        label: "已确认",
        type: 3,
        perm: "CRAFT_MY_SETTLED",
        id: "901",
      },
    ],
  },
  {
    label: "快捷功能",
    type: 1,
    perm: ["QUICK_CRAFT_LIST", "QUICK_TABLE_LIST", "QUICK_PRODUCE_LIST"],
    id: "430434438",
    children: [
      {
        label: "快速工艺列表",
        type: 2,
        perm: "QUICK_CRAFT_LIST",
        id: "430",
      },
      {
        label: "快速工艺添加",
        type: 2,
        perm: "QUICK_CRAFT_ADD",
        id: "431",
      },
      {
        label: "快速工艺删除",
        type: 2,
        perm: "QUICK_CRAFT_DELETE",
        id: "433",
      },
      {
        label: "快速表格列表",
        type: 2,
        perm: "QUICK_TABLE_LIST",
        id: "434",
      },
      {
        label: "快速表格添加",
        type: 2,
        perm: "QUICK_TABLE_ADD",
        id: "435",
      },
      {
        label: "快速表格删除",
        type: 2,
        perm: "QUICK_TABLE_DELETE",
        id: "437",
      },
      {
        label: "快速生产列表",
        type: 2,
        perm: "QUICK_PRODUCE_LIST",
        id: "438",
      },
      {
        label: "快速生产添加",
        type: 2,
        perm: "QUICK_PRODUCE_ADD",
        id: "439",
      },
      {
        label: "快速生产删除",
        type: 2,
        perm: "QUICK_PRODUCE_DELETE",
        id: "441",
      },
    ],
  },
];

/**
 * @description 财务管理
 */
export const FINANCE_PERM_TREE = [
  {
    label: "应收款",
    type: 1,
    perm: ["FINANCE_RECEIVABLE_COUNT", "FINANCE_RECEIVABLE_LIST", "FINANCE_RECEIVABLE_HISTORY"],
    id: "550553555",
    children: [
      {
        label: "账款统计",
        type: 3,
        perm: "FINANCE_RECEIVABLE_COUNT",
        id: "550",
      },
      {
        label: "未付款客户",
        type: 2,
        perm: "FINANCE_UNPAID_CUSTOMER",
        id: "500",
      },
      {
        label: "待清帐",
        type: 3,
        perm: "FINANCE_RECEIVABLE_LIST",
        id: "553",
      },
      {
        label: "已完成",
        type: 3,
        perm: "FINANCE_RECEIVABLE_HISTORY",
        id: "555",
      },
      {
        label: "取消订单",
        type: 2,
        perm: "FINANCE_RECEIVABLE_CANCEL",
        id: "556",
      },
      {
        label: "应收账款对账单",
        type: 2,
        perm: "FINANCE_RECEIVABLE_CHECK_BILL",
        id: "552",
      },
      {
        label: "确认清帐",
        type: 2,
        perm: "FINANCE_RECEIVABLE_FINISH",
        id: "557",
      },
      {
        label: "已收款列表",
        type: 2,
        perm: "FINANCE_PAID_ORDER",
        id: "502",
      },
      {
        label: "添加单据",
        type: 2,
        perm: "FINANCE_ADD_PAID_ORDER",
        id: "503",
      },
      {
        label: "编辑单据",
        type: 2,
        perm: "FINANCE_EDIT_PAID_ORDER",
        id: "504",
      },
      {
        label: "确认单据金额",
        type: 2,
        perm: "FINANCE_CONFIRM_PAID_ORDER",
        id: "505",
      },
    ],
  },
  {
    label: "应付款",
    type: 1,
    perm: ["FINANCE_PAYABLE_COUNT", "FINANCE_PAYABLE_LIST", "FINANCE_PAYABLE_HISTORY"],
    id: "540543000",
    children: [
      {
        label: "账款统计",
        type: 3,
        perm: "FINANCE_PAYABLE_COUNT",
        id: "540",
      },
      {
        label: "未付款供应商",
        type: 2,
        perm: "FINANCE_UNPAID_SUPPLIER",
        id: "501",
      },
      {
        label: "待清帐",
        type: 3,
        perm: "FINANCE_PAYABLE_LIST",
        id: "543",
      },
      {
        label: "清帐历史记录",
        type: 3,
        perm: "FINANCE_PAYABLE_HISTORY",
        id: "545",
      },
      {
        label: "应付账款对账单",
        type: 2,
        perm: "FINANCE_PAYABLE_CHECK_BILL",
        id: "542",
      },
      {
        label: "取消订单",
        type: 2,
        perm: "FINANCE_PAYABLE_CANCEL",
        id: "546",
      },
      {
        label: "确认清帐",
        type: 2,
        perm: "FINANCE_PAYABLE_FINISH",
        id: "547",
      },
      {
        label: "单据列表",
        type: 2,
        perm: "FINANCE_RETURNED_ORDER",
        id: "506",
      },
      {
        label: "添加单据",
        type: 2,
        perm: "FINANCE_ADD_RETURNED_ORDER",
        id: "507",
      },
      {
        label: "编辑单据",
        type: 2,
        perm: "FINANCE_EDIT_RETURNED_ORDER",
        id: "508",
      },
      {
        label: "确认付款单据",
        type: 2,
        perm: "FINANCE_CONFIRM_RETURNED_ORDER",
        id: "509",
      },
    ],
  },
  {
    label: "成本统计",
    type: 1,
    perm: ["COST_STATISTICS", "COST_GET_CATEGORY_LIST", "COST_GET_LIST"],
    id: "520521525",
    children: [
      {
        label: "成本统计",
        type: 3,
        perm: "COST_STATISTICS",
        id: "520",
      },
      {
        label: "分类列表",
        type: 3,
        perm: "COST_GET_CATEGORY_LIST",
        id: "521",
      },
      {
        label: "成本列表",
        type: 3,
        perm: "COST_GET_LIST",
        id: "525",
      },
      {
        label: "新增分类",
        type: 2,
        perm: "COST_CATEGORY_ADD",
        id: "522",
      },
      {
        label: "编辑分类",
        type: 2,
        perm: "COST_CATEGORY_UPDATE",
        id: "523",
      },
      {
        label: "删除分类",
        type: 2,
        perm: "COST_CATEGORY_DELETE",
        id: "524",
      },
      {
        label: "新增成本",
        type: 2,
        perm: "COST_ADD",
        id: "526",
      },
      {
        label: "编辑成本",
        type: 2,
        perm: "COST_UPDATE",
        id: "527",
      },
      {
        label: "删除成本",
        type: 2,
        perm: "COST_DELETE",
        id: "528",
      },
    ],
  },
  {
    label: "核对款项",
    type: 1,
    perm: ["CUSTOMER_LIST", "SUPPLIER_LIST"],
    id: "500501000",
    children: [
      {
        label: "应收账款核对",
        type: 2,
        perm: "FINANCE_RECEIVABLE_CHECK",
        id: "551",
      },
      {
        label: "应付账款核对",
        type: 2,
        perm: "FINANCE_PAYABLE_CHECK",
        id: "541",
      },
      {
        label: "刷新客户金额",
        type: 2,
        perm: "CUSTOMER_REFRESH",
        id: "330",
      },
      {
        label: "刷新供应商金额",
        type: 2,
        perm: "SUPPLIER_REFRESH",
        id: "639",
      },
    ],
  },
];

/**
 * @description 配送管理
 */
export const LOGISTICS_PERM_TREE = [
  {
    label: "配送",
    type: 1,
    perm: ["LOGISTICS_COUNT", "DELIVERY_LIST", "DELIVERY_HISTORY"],
    id: "810816000",
    children: [
      {
        label: "物流统计",
        type: 2,
        perm: "LOGISTICS_COUNT",
        id: "820",
      },
      {
        label: "发货列表",
        type: 2,
        perm: "DELIVERY_LIST",
        id: "810",
      },
      {
        label: "发货历史记录",
        type: 2,
        perm: "DELIVERY_HISTORY",
        id: "812",
      },
      {
        label: "指定物流商",
        type: 2,
        perm: "DELIVERY_BIND",
        id: "813",
      },
      {
        label: "取消配送",
        type: 2,
        perm: "DELIVERY_CANCEL",
        id: "814",
      },
      {
        label: "完成配送",
        type: 2,
        perm: "DELIVERY_CONFIRM",
        id: "815",
      },
    ],
  },
  {
    label: "物流商管理",
    type: 1,
    perm: ["LOGISTICS_LIST"],
    id: "820000000",
    children: [
      {
        label: "物流商列表",
        type: 2,
        perm: "LOGISTICS_LIST",
        id: "821",
      },
      {
        label: "添加物流商",
        type: 2,
        perm: "LOGISTICS_ADD",
        id: "822",
      },
      {
        label: "编辑物流商",
        type: 2,
        perm: "LOGISTICS_EDIT",
        id: "824",
      },
      {
        label: "删除物流商",
        type: 2,
        perm: "LOGISTICS_DELETE",
        id: "825",
      },
      {
        label: "绑定物流商",
        type: 2,
        perm: "LOGISTICS_BIND",
        id: "826",
      },
      {
        label: "解绑物流商",
        type: 2,
        perm: "LOGISTICS_UNBIND",
        id: "827",
      },
      {
        label: "获取绑定的物流商",
        type: 2,
        perm: "LOGISTICS_GET_BIND_INFO",
        id: "828",
      },
      {
        label: "核对物流款项",
        type: 2,
        perm: "DELIVERY_CHECK_LIST",
        id: "816",
      },
      /* {
        label: "刷新物流商",
        type: 2,
        perm: "LOGISTICS_REFRESH",
        id: "829",
      }, */
    ],
  },
  {
    label: "我的配送",
    type: 1,
    perm: ["DELIVER_MY_STATISTICS", "DELIVERY_MY_LIST"],
    id: "800801000",
    children: [
      {
        label: "我的统计",
        type: 3,
        perm: "DELIVER_MY_STATISTICS",
        id: "800",
      },
      {
        label: "我的列表",
        type: 3,
        perm: "DELIVERY_MY_LIST",
        id: "801",
      },
      /* {
        label: "审核列表",
        type: 2,
        perm: "DELIVERY_CHECK_MY_LIST",
        id: "802",
      }, */
    ],
  },
];

/**
 * @description 产品管理
 */
export const PRODUCT_PERM_TREE = [
  {
    label: "产品管理",
    type: 1,
    perm: ["PRODUCT_LIST"],
    id: "110000000",
    children: [
      {
        label: "新增产品",
        type: 2,
        perm: "PRODUCT_ADD",
        id: "110",
      },
      {
        label: "编辑产品",
        type: 2,
        perm: "PRODUCT_EDIT",
        id: "112",
      },
      {
        label: "删除产品",
        type: 2,
        perm: "PRODUCT_DELETE",
        id: "113",
      },
      {
        label: "上下架销售",
        type: 2,
        perm: "PRODUCT_UPDOWN_SALE",
        id: "114",
      },
      {
        label: "上下架采购",
        type: 2,
        perm: "PRODUCT_UPDOWN_PURCHASE",
        id: "115",
      },
      {
        label: "分享产品",
        type: 2,
        perm: "SHARE_PRODUCT",
        id: "130",
      },
      /* {
        label: "获取已分享的产品",
        type: 2,
        perm: "SHARE_GET_SHARE_PRODUCT",
        id: "132",
      },
      {
        label: "检查重复分享",
        type: 2,
        perm: "SHARE_CHECK_DUPLICATE",
        id: "133",
      },
      {
        label: "获取产品扩展信息",
        type: 2,
        perm: "SHARE_GET_PRODUCT_EXT",
        id: "131",
      },*/

      {
        label: "接收分享的产品",
        type: 2,
        perm: "SHARE_RECEIVE_SHARE_PRODUCT",
        id: "134",
      },
    ],
  },
  {
    label: "分类管理",
    type: 1,
    perm: ["PRODUCT_CLASS_LIST"],
    id: "100000000",
    children: [
      {
        label: "新增分类",
        type: 2,
        perm: "PRODUCT_CLASS_ADD",
        id: "100",
      },
      {
        label: "编辑分类",
        type: 2,
        perm: "PRODUCT_CLASS_EDIT",
        id: "101",
      },
      {
        label: "删除分类",
        type: 2,
        perm: "PRODUCT_CLASS_DELETE",
        id: "102",
      },
      {
        label: "上下架销售分类",
        type: 2,
        perm: "PRODUCT_CLASS_UPDOWN_SALE",
        id: "103",
      },
      {
        label: "上下架采购分类",
        type: 2,
        perm: "PRODUCT_CLASS_UPDOWN_PURCHASE",
        id: "104",
      },
    ],
  },
  {
    label: "扩展字段",
    type: 1,
    perm: ["PRODUCT_FIELD_LIST"],
    id: "120000000",
    children: [
      {
        label: "新增字段",
        type: 2,
        perm: "PRODUCT_FIELD_ADD",
        id: "120",
      },
      {
        label: "编辑字段",
        type: 2,
        perm: "PRODUCT_FIELD_EDIT",
        id: "121",
      },
      {
        label: "删除字段",
        type: 2,
        perm: "PRODUCT_FIELD_DELETE",
        id: "122",
      },
    ],
  },
];

/**
 * @description 数控加工
 */
export const CNC_PERM_TREE = [
  {
    label: "数控(CNC)",
    type: 1,
    perm: ["CNC_PROPERTIES", "CNC_UPDATE_PROPERTIES"],
    id: "700000000",
    children: [
      {
        label: "添加CNC板材订单",
        type: 2,
        perm: "CNC_ADD_CUSTOMIZED_BOARD",
        id: "706",
      },
      {
        label: "CNC设备属性",
        type: 2,
        perm: "CNC_PROPERTIES",
        id: "700",
      },
      {
        label: "更新CNC设备",
        type: 2,
        perm: "CNC_UPDATE_PROPERTIES",
        id: "701",
      },
      {
        label: "CNC程序列表",
        type: 2,
        perm: "CNC_NC_PROGRAMS",
        id: "702",
      },
      {
        label: "删除CNC程序",
        type: 2,
        perm: "CNC_DELETE_PROGRAM",
        id: "703",
      },
      {
        label: "生成CNC程序",
        type: 2,
        perm: "CNC_GENERATE_PROGRAM",
        id: "704",
      },
      {
        label: "CNC板材计算",
        type: 2,
        perm: "CNC_CUSTOMIZED_BOARD_CALCULATE",
        id: "705",
      },
    ],
  },
];

/**
 * @description 财务报表
 */
export const FINANCE_REPORTS_PERM_TREE = [
  {
    label: "财务报表",
    type: 1,
    perm: ["FINANCE_REPORT_ASSETS", "FINANCE_REPORT_TREND", "FINANCE_REPORT_RECENT"],
    id: "931932933",
    children: [
      {
        "label": "资产统计",
        "type": 3,
        "perm": "FINANCE_REPORT_ASSETS",
        "id": "931",
      },
      {
        "label": "收支趋势",
        "type": 3,
        "perm": "FINANCE_REPORT_TREND",
        "id": "932",
      },
      {
        "label": "最近交易",
        "type": 3,
        "perm": "FINANCE_REPORT_RECENT",
        "id": "933",
      },
      {
        "label": "最近列表",
        "type": 2,
        "perm": "FINANCE_REPORT_RECENT_LIST",
        "id": "934",
      },
    ],
  },
];

/**
 * @description 考勤打卡
 */
export const ATTEND_PERM_TREE = [
  {
    label: "所有考勤记录",
    type: 2,
    perm: "ATTENDANCE_ALL_RECORDS",
    id: "510",
  },
];

/**
 * @description 消息权限
 */
export const MESSAGE_PERM_TREE = [
  {
    label: "消息管理",
    type: 1,
    perm: ["MESSAGE_LIST"],
    id: "",
    children: [
      {
        label: "消息列表",
        type: 2,
        perm: "MESSAGE_LIST",
        id: "",
      },
      {
        label: "删除消息",
        type: 2,
        perm: "DELETE_MESSAGE",
        id: "",
      },
      {
        label: "已读消息",
        type: 2,
        perm: "READ_MESSAGE",
        id: "",
      },
      {
        label: "创建并绑定客户",
        type: 2,
        perm: "CREATE_BIND_CUSTOMER",
        id: "",
      },
      {
        label: "创建并绑定供应商",
        type: 2,
        perm: "CREATE_BIND_SUPPLIER",
        id: "",
      },
    ],
  },
];
