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
    // 采购的新样式
    PURCHASE_STYLE: noClear.purchaseStyle || false,
    // 应收款新样式
    OR_STYLE: noClear.orStyle || false,
    // 应付款新样式
    AP_STYLE: noClear.apStyle || false,

    orderInfo: {
      isEdit: false,
      isShare: false,
      isSale: false,
      form: {},
    },

    newMsg: false,
  },
  getters: {
    oForm(state) {
      return state.orderInfo;
    },
    // 有新消息
    isNewMsg(state) {
      return state.newMsg;
    },

    // 下单样式
    sBill(state) {
      return state.BILL_STYLE;
    },
    // 商品列表样式
    sProductStyle(state) {
      return state.PRODUCT_STYLE;
    },
    // 销售样式
    sSaleStyle(state) {
      return state.SALE_STYLE || false;
    },
    // 采购样式
    sPurchaseStyle(state) {
      return state.PURCHASE_STYLE;
    },
    // 应收款样式
    sOrStyle(state) {
      return state.OR_STYLE;
    },
    // 应付款样式
    sApStyle(state) {
      return state.AP_STYLE;
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
    setPurchaseStyle(state, payload) {
      const obj = uni.getStorageSync(NO_CLEAR_KEY) || {};
      state.PURCHASE_STYLE = payload;
      uni.setStorageSync(NO_CLEAR_KEY, {...obj, purchaseStyle: payload});
    },
    setOrStyle(state, payload) {
      const obj = uni.getStorageSync(NO_CLEAR_KEY) || {};
      state.OR_STYLE = payload;
      uni.setStorageSync(NO_CLEAR_KEY, {...obj, orStyle: payload});
    },
    setApStyle(state, payload) {
      const obj = uni.getStorageSync(NO_CLEAR_KEY) || {};
      state.AP_STYLE = payload;
      uni.setStorageSync(NO_CLEAR_KEY, {...obj, apStyle: payload});
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

    setPurchaseStyleAsync({commit}, payload) {
      commit("setPurchaseStyle", payload);
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

    setOrStyleAsync({commit}, payload) {
      commit("setOrStyle", payload);
    },
    setApStyleAsync({commit}, payload) {
      commit("setApStyle", payload);
    },
  },
});
