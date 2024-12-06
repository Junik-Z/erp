<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _deepCopy, _sum } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import UniNumberBox from "@/components/uni-number-box/components/uni-number-box/uni-number-box.vue";

export default {
  name: "PickerProduct",
  components: {
    UniNumberBox,
    LoadMore,
    BasicCard,
    UniCol,
    UniRow,
  },
  mixins: [mixins],
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    total: [String, Number],
    type: String, // 选择类型 purchase: 显示入库价格
    isClient: Boolean, // 客户输入
  },
  data: () => ({
    list: [],
  }),
  methods: {
    onAdded() {
      uni.navigateTo({
        url: "/shop/list/list",
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          getShopList: (data) => {
            this.list = data.list;
            this.$emit("input", data.list);
          },
        },
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("setShopList", {list: this.list, type: this.type, isClient: this.isClient});
        },
      });
    },

    onRemove(index) {
      this.list.splice(index, 1);
      this.$emit("input", this.list);
    },

  },
  watch: {
    value: {
      handler(val) {
        this.list = _deepCopy(val);
      },
      immediate: true,
      deep: true,
    },

    getTotalMoney() {
      this.$emit("update:total", this.getTotalMoney);
    },

    list: {
      handler(val) {
        this.$emit("input", val);
      },
      deep: true,
    },
  },
  computed: {
    getTotalMoney() {
      return _sum(this.list?.map(item => ((item.price || 0) * (item.productQuantity || 0)) || 0));
    },
  },
};
</script>

<template>
  <view class="ko-picker">
    <BasicCard v-for="(item, index) of list" :key="index">
      <view class="ko-picker__node">
        <image
          v-if="item.images"
          mode="scaleToFill"
          class="ko-picker__node--image"
          :src="getImageUrl(item.images)"
        />

        <view class="ko-picker__item">
          <UniRow>
            <UniCol :span="24">
              <label class="ko-basic-label">名称：</label>
              {{ item.name }}
            </UniCol>
            <UniCol :span="24">
              <label class="ko-basic-label">单价：</label>
              <text class="ko-basic-money">¥ {{ toYuan(item.price) }} 元</text>
            </UniCol>
            <UniCol :span="24">
              <view style="display: flex; align-items: center;">
                <label class="ko-basic-label">数量：</label>
                <UniNumberBox v-model="item.productQuantity" />
              </view>
            </UniCol>
            <UniCol :span="24">
              <view style="display: flex;justify-content: flex-end; align-items: center; margin-top: 8px;">
                <button class="ko-basic-button__card" @click="onRemove(index)">
                  移除
                </button>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </view>
    </BasicCard>

    <LoadMore v-if="!list.length" :no-more="true" :content-text="{contentnomore: '暂无产品数据'}" />

    <view style="display: flex; align-items: center; margin-top: 8px;">
      <button class="ko-basic-button__card" @click="onAdded()">添加</button>
    </view>

    <view style="margin-top: 10px;">
      <view style="margin-top: 4px;">
        <label class="ko-basic-label">产品总额：</label>
        <text class="ko-basic-money">¥ {{ toYuan(getTotalMoney) }}元</text>
      </view>
      <view style="margin-top: 4px;" v-if="false">
        <label class="ko-basic-label">总额大写：</label>
        <text class="ko-basic-money">¥ {{ toBigMoney(toYuan(getTotalMoney)) }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-picker {
  width: 100%;

  &__item {
    flex: 1;
    padding-left: 10px;
  }

  &__node {
    display: flex;
    align-items: center;
    overflow: hidden;

    &--image {
      height: 120px;
      width: 120px;
      border-radius: 6px;
      overflow: hidden;
    }
  }

  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
