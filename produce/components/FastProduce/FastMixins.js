import { addedCraftApi, addedQuickApi, detailCraftApi, detailQuickApi } from "@/api/erp/produce";

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

    // 获取快捷详情
    getDetails(query, type) {
      const Func = {
        quick: detailQuickApi,
        craft: detailCraftApi,
      }[type];
      return Func(query);
    },
  },


};
