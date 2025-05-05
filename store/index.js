import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const GOOD_OBJ_KEY = "__GOOD_OBJ_KEY__";

const USER_INFO_KEY = "__USER_INFO__";
const CONFIG_INFO_KEY = "__CONFIG_INFO__";
export const PRODUCT_STYLE_KEY = "__PRODUCT_STYLE__";
export const BILL_KEY = "__BILL_KEY__";

export default new Vuex.Store({
  state: {
    GOODS_OBJ: uni.getStorageSync(GOOD_OBJ_KEY) || {},
    USER_INFO: uni.getStorageSync(USER_INFO_KEY) || {},
    CONFIG_INFO: uni.getStorageSync(CONFIG_INFO_KEY) || {},

    PRODUCT_STYLE: uni.getStorageSync(PRODUCT_STYLE_KEY) || false,
    BILL: uni.getStorageSync(BILL_KEY) || false,
  },
  getters: {
    sBill(state) {
      return state.BILL;
    },
    sProductStyle(state) {
      return state.PRODUCT_STYLE;
    },
  },
  mutations: {
    setGoodsObj(state, payload) {
      state.GOODS_OBJ = payload;
      // uni.setStorageSync(GOOD_OBJ_KEY, state.GOODS_OBJ);
    },
    setUserInfo(state, payload) {
      state.USER_INFO = payload;
      console.log(payload, "用户信息");
      uni.setStorageSync(USER_INFO_KEY, state.USER_INFO);
    },
    setConfigInfo(state, payload) {
      state.CONFIG_INFO = payload;
      uni.setStorageSync(CONFIG_INFO_KEY, state.CONFIG_INFO);
    },
    setProductStyle(state, payload) {
      state.PRODUCT_STYLE = payload;
      uni.setStorageSync(PRODUCT_STYLE_KEY, state.PRODUCT_STYLE);
    },
    setBillStyle(state, payload) {
      state.BILL = payload;
      uni.setStorageSync(BILL_KEY, state.BILL);
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
  },
});
