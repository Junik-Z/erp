<script>
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";
import { _isEmpty } from "@/utils";

export default {
  name: "CraftCard",
  mixins: [mixins],
  props: {
    item: {
      type: Object,
      default() {
        return {};
      },
    },
    showFinal: Boolean,
  },

  computed: {
    // 获取计价方式
    getPricingMethod() {
      return key => key ? PRICING_METHOD[key] : "";
    },

    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
    },
  },
};
</script>

<template>
  <BasicCard>
    <view class="ko-factory__info">
      <uni-row gutter="10">
        <uni-col :span="24">
          <label class="ko-basic-label">名称：</label>
          <text>{{ item.name }}</text>
        </uni-col>
        <uni-col :span="24">
          <label class="ko-basic-label">编号：</label>
          <text>{{ item.orderCode || "-" }}</text>
        </uni-col>
        <uni-col :span="24" v-if="item.images">
          <label class="ko-basic-label">图片：</label>
          <uv-avatar
            :src="getImageUrl(item.images)"
            shape="square"
            random-bg-color
            :size="64"
          />
        </uni-col>
        <uni-col :span="24">
          <label class="ko-basic-label">计价方式：</label>
          <text>{{ getPricingMethod(item.pricingMethod) }}</text>
        </uni-col>
        <uni-col :span="24">
          <label class="ko-basic-label">价格：</label>
          <text class="ko-basic-money">{{ toYuan(item.price) }}元</text>
        </uni-col>
        <block v-if="showFinal">
          <uni-col :span="24">
            <label class="ko-basic-label">结算：</label>
            <text class="ko-basic-money">{{ toYuan(item.finalAmount) }}元</text>
          </uni-col>
          <uni-col :span="24" v-if="!['fixedPrice', 'fixedPriceGroup'].includes(item.pricingMethod)">
            <label class="ko-basic-label">数量：</label>
            <text>{{ item.quantity }}</text>
          </uni-col>
          <uni-col :span="24">
            <label class="ko-basic-label">时间：</label>
            <text>{{ item.updateTime }}</text>
          </uni-col>
        </block>
        <uni-col :span="24">
          <view style="display: flex; align-items: center;">
            <label class="ko-basic-label">员工：</label>
            <view style="flex: 1; display: flex; flex-wrap: wrap;">
              <view
                style="padding: 5px; display: flex; flex-direction: column; justify-content: center;align-items: center;"
                v-for="staff of getStaffListLogo(item)"
                :key="staff.id"
              >
                <uv-avatar
                  :src="getImageUrl(staff.logo)"
                  random-bg-color
                  size="38"
                  :text="staff.name"
                />
                <text style="font-size: 14px; color: #8f939c;padding-top: 5px;">{{ staff.name }}</text>
              </view>
            </view>
          </view>
        </uni-col>
        <uni-col :span="24">
          <label class="ko-basic-label">描述：</label>
          <text>{{ item.description || "-" }}</text>
        </uni-col>
      </uni-row>

      <slot name="operate" v-if="$slots.operate"></slot>
    </view>
  </BasicCard>
</template>

<style scoped lang="scss">
.ko-factory {
  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }
}
</style>
