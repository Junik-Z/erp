<script>
import { PageEnums } from "@/utils/config";

export default {
  name: "GoodsDesc",
  props: {
    value: String,
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
      console.log("接收到的数据", data);
      this.$emit("input", data);
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
          res.eventChannel.emit("on_good_desc_over", {type, value: this.value, takeOverName: this.takeOverName});
        },
      });
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
    <button class="ko-basic-button__card" v-if="!value" @click="toDesc('added')">添加</button>
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
