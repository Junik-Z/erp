import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// 商品列表
const GOOD_OBJ_KEY = "__GOOD_OBJ_KEY__";
// 用户信息
const USER_INFO_KEY = "__USER_INFO__";
// 配置信息
const CONFIG_INFO_KEY = "__CONFIG_INFO__";
// 不被清除的数据
export const NO_CLEAR_KEY = "__NO_CLEAR_KEY__";

const noClear = uni.getStorageSync(NO_CLEAR_KEY) || {};

export default new Vuex.Store({
  state: {
    GOODS_OBJ: uni.getStorageSync(GOOD_OBJ_KEY) || {},
    USER_INFO: uni.getStorageSync(USER_INFO_KEY) || {},
    CONFIG_INFO: uni.getStorageSync(CONFIG_INFO_KEY) || {},

    // 产品的新样式
    PRODUCT_STYLE: noClear.productStyle || false,
    // 购物的新样式
    BILL_STYLE: noClear.billStyle || false,
    // 销售的新样式
    SALE_STYLE: noClear.saleStyle || false,

    orderInfo: {
      isEdit: false,
      isShare: false,
      isSale: false,
      form: {},
    },

    newMsg: false,
  },
  getters: {
    sBill(state) {
      return state.BILL_STYLE;
    },

    sProductStyle(state) {
      return state.PRODUCT_STYLE;
    },

    oForm(state) {
      return state.orderInfo;
    },

    isNewMsg(state) {
      return state.newMsg;
    },

    gSaleStyle(state) {
      return state.SALE_STYLE || false;
    },
  },
  mutations: {
    reset(state) {
      state.GOODS_OBJ = {};
      state.orderInfo = {
        isEdit: false,
        isShare: false,
        isSale: false,
        form: {},
      };
    },

    setGoodsObj(state, payload) {
      state.GOODS_OBJ = payload;
      // uni.setStorageSync(GOOD_OBJ_KEY, state.GOODS_OBJ);
    },
    setUserInfo(state, payload) {
      state.USER_INFO = payload;
      uni.setStorageSync(USER_INFO_KEY, state.USER_INFO);
    },
    setConfigInfo(state, payload) {
      state.CONFIG_INFO = payload;
      uni.setStorageSync(CONFIG_INFO_KEY, state.CONFIG_INFO);
    },
    setProductStyle(state, payload) {
      const obj = uni.getStorageSync(NO_CLEAR_KEY) || {};
      state.PRODUCT_STYLE = payload;
      uni.setStorageSync(NO_CLEAR_KEY, {...obj, productStyle: payload});
    },
    setBillStyle(state, payload) {
      const obj = uni.getStorageSync(NO_CLEAR_KEY) || {};
      state.BILL_STYLE = payload;
      uni.setStorageSync(NO_CLEAR_KEY, {...obj, billStyle: payload});
    },
    setSaleStyle(state, payload) {
      const obj = uni.getStorageSync(NO_CLEAR_KEY) || {};
      state.SALE_STYLE = payload;
      uni.setStorageSync(NO_CLEAR_KEY, {...obj, saleStyle: payload});
    },

    setOrderInfo(state, payload) {
      state.orderInfo = payload;
    },

    setNewMsg(state, payload) {
      state.newMsg = payload;
    },
  },
  actions: {
    setGoodsObjAsync({commit}, payload) {
      commit("setGoodsObj", payload);
    },
    setUserInfoAsync({commit}, payload) {
      commit("setUserInfo", payload);
    },
    setConfigInfoAsync({commit}, payload) {
      commit("setConfigInfo", payload);
    },
    setProductStyleAsync({commit}, payload) {
      commit("setProductStyle", payload);
    },
    setBillStyleAsync({commit}, payload) {
      commit("setBillStyle", payload);
    },

    setOrderInfoAsync({commit}, payload) {
      commit("setOrderInfo", payload);
    },

    onReset({commit}) {
      commit("reset");
    },

    setNewMsgAsync({commit}, payload) {
      commit("setNewMsg", payload);
    },
    setSaleStyleAsync({commit}, payload) {
      commit("setSaleStyle", payload);
    },
  },
});
