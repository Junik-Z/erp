<script>
import { PageEnums } from "@/utils/config";
import { _isEmpty } from "../../utils";

export default {
  name: "GoodsDesc",
  props: {
    value: String,
    carousel: {
      type: Array,
      default() {
        return [];
      },
    },
    subClasses: Array,
  },
  data() {
    return {
      takeOverName: null,
    };
  },
  created() {
    this.takeOverName = `$_on_good_desc_over_${this._uid}`;
    uni.$on(this.takeOverName, this.getTakList);
  },
  methods: {
    getTakList(data) {
      console.log("接收到的数据轮播图数据", data);
      this.$emit("input", data.html);
      this.$emit("update:carousel", data.carousel);
      this.$emit("update:subClasses", data.subClasses);
    },

    // 商品详情
    toDesc(type) {
      uni.navigateTo({
        url: PageEnums.productDesc,
        // #ifdef MP
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          on_good_desc_over: (obj) => {
            this.getTakList(obj);
          },
        },
        // #endif
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("on_good_desc_over", {
            type,
            value: this.value,
            takeOverName: this.takeOverName,
            carousel: this.carousel,
            subClasses: this.subClasses,
          });
        },
      });
    },
  },
  computed: {
    showAdded() {
      return _isEmpty(this.value) && _isEmpty(this.carousel) && _isEmpty(this.subClasses);
    },
  },
  onUnload() {
    uni.$off(this.takeOverName, this.getTakList);
  },
  beforeDestroy() {
    uni.$off(this.takeOverName, this.getTakList);
  },
};
</script>

<template>
  <view class="ko-goods-desc">
    <button class="ko-basic-button__card" v-if="showAdded" @click="toDesc('added')">添加</button>
    <block v-else>
      <button class="ko-basic-button__card" @click="toDesc('view')">查看</button>
      <button class="ko-basic-button__card" @click="toDesc('edit')">修改</button>
    </block>
  </view>
</template>

<style scoped lang="scss">
.ko-goods-desc {
  display: flex;
  align-items: center;
}
</style>
