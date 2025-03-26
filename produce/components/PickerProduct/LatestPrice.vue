<script>
import Dayjs from "@/utils/dayjs";
import mixins from "@/mixins/mixins";
import { _get, _keys } from "@/utils";

export default {
  name: "LatestPrice",
  mixins: [mixins],
  props: {
    node: Object,
  },
  methods: {
    transformData(obj) {
      return _keys(obj)
          .sort()
          ?.map(key => ({
            label: Dayjs(key).format("YYYY-MM-DD"),
            value: this.toYuan(obj[key] || 0),
          }))
        || [];
    },
  },
  computed: {
    isSale() {
      return _get(this.saleObj, "show");
    },
    isPurchase() {
      return _get(this.purchaseObj, "show");
    },

    saleObj() {
      return _get(this.node, "sale") || {};
    },

    sRecent() {
      return this.transformData(_get(this.saleObj, "recent") || {});
    },

    sUser() {
      return this.transformData(_get(this.saleObj, "user") || {});
    },

    purchaseObj() {
      return _get(this.node, "purchase") || {};
    },


    pRecent() {
      return this.transformData(_get(this.purchaseObj, "recent") || {});
    },

    pUser() {
      return this.transformData(_get(this.purchaseObj, "user") || {});
    },
  },
};
</script>

<template>
  <view class="ko-latest-price" style="--ko-basic-table-grid-col: auto auto;">
    <!-- 销售 -->
    <view class="ko-latest-price__wrap" v-if="isSale">
      <block v-if="(sRecent.length || sUser.length)">
        <view class="ko-latest-price__item" v-if="sRecent.length">
          <view style="font-size: 12px; margin-bottom: 4px;">
            最近售价：
          </view>
          <view class="ko-basic-table">
            <block style="color: #c7c9ce;" v-for="(cv, k) of sRecent" :key="k">
              <view class="ko-basic-table--cell">{{ cv.label }}</view>
              <view class="ko-basic-table--cell">{{ cv.value }}</view>
            </block>
          </view>
        </view>
        <view class="ko-latest-price__item" v-if="sUser.length">
          <view style="font-size: 12px; margin-bottom: 4px;">
            当前客户售价：
          </view>
          <view class="ko-basic-table">
            <block style="color: #c7c9ce;" v-for="(cv, k) of sUser" :key="k">
              <view class="ko-basic-table--cell">{{ cv.label }}</view>
              <view class="ko-basic-table--cell">{{ cv.value }}</view>
            </block>
          </view>
        </view>
      </block>
      <block v-else>
        <view style="font-size: 12px; color:#c7c9ce;text-align: center;">暂无最近售价</view>
      </block>
    </view>

    <!-- 采购 -->
    <view class="ko-latest-price__wrap" v-if="isPurchase">
      <block v-if="(pRecent.length || pUser.length)">
        <view class="ko-latest-price__item" v-if="pRecent.length">
          <view style="font-size: 12px; margin-bottom: 4px;">
            最近采购价：
          </view>
          <view class="ko-basic-table">
            <block style="color: #c7c9ce;" v-for="(cv, k) of pRecent" :key="k">
              <view class="ko-basic-table--cell">{{ cv.label }}</view>
              <view class="ko-basic-table--cell">{{ cv.value }}</view>
            </block>
          </view>
        </view>
        <view class="ko-latest-price__item" v-if="pUser.length">
          <view style="font-size: 12px; margin-bottom: 4px;">
            当前供应商采购价：
          </view>
          <view class="ko-basic-table">
            <block style="color: #c7c9ce;" v-for="(cv, k) of pUser" :key="k">
              <view class="ko-basic-table--cell">{{ cv.label }}</view>
              <view class="ko-basic-table--cell">{{ cv.value }}</view>
            </block>
          </view>
        </view>
      </block>
      <block v-else>
        <view style="font-size: 12px; color:#c7c9ce;text-align: center;">暂无最近采购价</view>
      </block>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-latest-price {
  width: 100%;
  height: 100%;

  display: flex;

  &__wrap + &__wrap {
    margin-left: 6px;
  }

  &__wrap {
    flex: 1;
  }

  &__item {
    padding: 5px 0;
  }
}
</style>
