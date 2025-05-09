import { _deepCopy, _get, _isEqual, _omit, _sum } from "@/utils";

export default {
  data() {
    return {
      goods: {},
    };
  },
  props: {
    // 选择类型 purchase: 采购；sale: 销售
    type: {
      type: String,
      default: "sale",
    },
  },
  methods: {
    // 将数据处理成统一字段
    handleGoodItem(item) {
      // 判断是否是购物车内
      if ("price" in item && "productQuantity" in item) return item;

      return {
        name: item.name,
        classId: item.classId,
        levelIds: item.levelIds,
        productId: item.productId,
        images: item.images,
        price: _get(item, this.moneyKey),
        productQuantity: 0,
        extend: item.extend,
      };
    },

    // 设置
    setGoodQuantity(productQuantity, item) {
      const nItem = this.handleGoodItem(item);
      const obj = {...nItem, productQuantity};
      const sGoods = this.sGoods;
      let nObj;
      if (productQuantity) {
        nObj = {...sGoods, [nItem.productId]: obj};
        this.setGoodsObjAsync(nObj);
      } else {
        nObj = _omit(sGoods, [item.productId]);
      }
      this.setGoodsObjAsync(nObj);
    },

    // 设置商品的
    setGoodsObjAsync(obj) {
      this.$store.dispatch("setGoodsObjAsync", obj);
    },

    // 重置商品
    resetGoods() {
      this.setGoodsObjAsync({});
    },

    // 设置产品列表的样式
    setProductStyle() {
      this.$store.dispatch("setProductStyleAsync", !this.getProductStyle);
    },

    // 设置表单信息
    setOrderForm(obj) {
      const O = _deepCopy(this.getOrderInfo);
      this.setOrderInfoByKey("form", {...O.form, ...obj});
    },

    // 根据 key 设置表单数据
    setOrderInfoByKey(key, value) {
      const O = _deepCopy(this.getOrderInfo);
      this.setOrderInfo({...O, [key]: value});
    },

    // 保存数据
    setOrderInfo(obj) {
      this.$store.dispatch("setOrderInfoAsync", obj);
    },

    // 重置购物车
    reset() {
      this.$store.dispatch("onReset");
    },
  },
  computed: {
    // 获取的金额字段
    moneyKey() {
      return _isEqual("purchase", this.type) ? "purchasePrice" : "salePrice";
    },

    // 获取仓库内的产品数据
    sGoods() {
      return this.$store.state.GOODS_OBJ || {};
    },

    // 商品列表
    goodsList() {
      return Object.values(this.sGoods || {});
    },

    // 所有商品的价格
    sTotalPrice() {
      const list = this.sGoods;
      return _sum(Object.values(list)?.map(v => ((v.price || 0) * (v.productQuantity || 0))));
    },

    // 根据id获取仓库内的数据
    getGoodByID() {
      return (id) => this.sGoods?.[id] || {};
    },

    // 根据 ID 获取产品的数量
    getGoodCount() {
      return (id) => this.getGoodByID(id)["productQuantity"] || 0;
    },

    // 根据 ID 获取产品的单价
    getGoodPrice() {
      return (id) => this.getGoodByID(id)?.["price"] || 0;
    },

    // 获取产品列表的样式
    getProductStyle() {
      return this.$store.state.PRODUCT_STYLE || false;
    },

    // 获取表单样式
    getOrderInfo() {
      return this.$store.getters.oForm || {};
    },
  },
};
