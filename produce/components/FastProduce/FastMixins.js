import {
  addedCraftApi,
  addedQuickApi,
  addedTableApi,
  detailCraftApi,
  detailQuickApi,
  detailTableApi,
} from "@/api/erp/produce";

export default {
  methods: {
    // 添加快捷生产
    addedQuick(data) {
      return addedQuickApi(data);
    },

    // 添加快捷工艺
    addedCraft(data) {
      return addedCraftApi(data);
    },

    // 添加快捷表格
    addedTable(data) {
      return addedTableApi(data);
    },

    // 获取快捷详情
    getDetails(query, type) {
      const Func = {
        quick: detailQuickApi,
        craft: detailCraftApi,
        table: detailTableApi,
      }[type];
      return Func(query);
    },
  },


};
