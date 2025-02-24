<script>
import Dayjs from "@/utils/dayjs";
import mixins from "@/mixins/mixins";
import { _keys } from "@/utils";

export default {
  name: "LatestPrice",
  mixins: [mixins],
  props: {
    type: String,

    recentPrice: {
      type: Object,
      default() {
        return {};
      },
    },
    userRecent: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    // 获取售卖采购描述
    getRecentText() {
      return {purchase: "采购", sale: "销售"}[this.type];
    },

    // 获取售卖采购描述
    getKhText() {
      return {purchase: "供应商", sale: "客户"}[this.type];
    },

    // 获取其它价格
    getRecentPrice() {
      return _keys((this.recentPrice)).sort()?.map(key => {
        return {
          label: Dayjs(key).format("YYYY-MM-DD"),
          value: this.toYuan(this.recentPrice?.[key] || 0),
        };
      });
    },
    // 获取其它价格
    getUserRecent() {
      return _keys((this.userRecent)).sort()?.map(key => {
        return {
          label: Dayjs(key).format("YYYY-MM-DD"),
          value: this.toYuan(this.userRecent?.[key] || 0),
        };
      });
    },
  },
};
</script>

<template>
  <view class="ko-latest-price" style="--ko-basic-table-grid-col: auto auto;">
    <view class="ko-latest-price__item">
      <view style="font-size: 12px; margin-bottom: 10px;">
        其它{{ getRecentText }}价格：
      </view>
      <view class="ko-basic-table">
        <!--<view class="ko-basic-table&#45;&#45;th">时间</view>-->
        <!--<view class="ko-basic-table&#45;&#45;th">金额</view>-->
        <block style="color: #c7c9ce;" v-for="(cv, k) of getRecentPrice" :key="k">
          <view class="ko-basic-table--cell">{{ cv.label }}</view>
          <view class="ko-basic-table--cell">{{ cv.value }}</view>
        </block>
      </view>
    </view>
    <view class="ko-latest-price__item">
      <view style="font-size: 12px; margin-bottom: 10px;">
        当前{{ getKhText }}{{ getRecentText }}价格：
      </view>
      <view class="ko-basic-table">
        <!--<view class="ko-basic-table&#45;&#45;th">时间</view>-->
        <!--<view class="ko-basic-table&#45;&#45;th">金额</view>-->
        <block style="color: #c7c9ce;" v-for="(cv, k) of getUserRecent" :key="k">
          <view class="ko-basic-table--cell">{{ cv.label }}</view>
          <view class="ko-basic-table--cell">{{ cv.value }}</view>
        </block>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.ko-latest-price {
  width: 100%;
  height: 100%;

  &__item {
    padding: 5px 0;
  }
}
</style>
