<script>
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import mixins from "@/mixins/mixins";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { getCustomerListApi, refreshCustomerApi } from "@/api/erp/sale";
import { getSupplierListApi, refreshSupplierApi } from "@/api/erp/purchase";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";

export default {
  name: "Verification",
  components: {UvAvatar, UniSegmentedControl, UniList, UniCol, BasicCard, UniRow, LoadMore, PickerClass},
  mixins: [mixins],
  data() {
    return {
      tabs: ["客户列表", "供应商列表"],
      list: [],
      loading: false,
      current: 0,
    };
  },
  methods: {
    getList() {
      this.loading = true;
      ;[getCustomerListApi, getSupplierListApi][this.current]()
        .then((res) => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onRefresh(item) {
      this.$set(item, "__r_loading__", true);
      ;[refreshCustomerApi, refreshSupplierApi][this.current]({id: item.id})
        .then(() => {
          uni.showToast({title: "刷新成功"});
          this.getList();
        })
        .finally(() => {
          this.$set(item, "__r_loading__", false);
        });
    },

    onJump(item) {
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=${["sale", "purchase"][this.current]}`,
      });
    },
  },
};
</script>

<template>
  <view class="ko-verification">
    <view class="ko-verification__tabs">
      <UniSegmentedControl :values="tabs" style-type="text" :current.sync="current" @clickItem="getList" />
    </view>

    <UniList>
      <view class="ko-verification__wrap">
        <BasicCard :spacing="10" @click="onJump(item)" v-for="(item, index) in list" :key="index">
          <view class="ko-verification__info">
            <view class="ko-verification__info--wrap">
              <UvAvatar
                :size="64"
                :src="getImageUrl(item.logo)"
                mode="aspectFill"
                :text="item.name"
                random-bg-color
              />
              <view style="padding-left: 20px;">
                <UniRow :gutter="20">
                  <UniCol :span="24">
                    <view class="ko-verification__info--name">{{ item.name }}</view>
                  </UniCol>
                  <UniCol :span="24">
                    <view class="ko-basic-money">¥ {{ toYuan(item.amount) }}元</view>
                  </UniCol>
                </UniRow>
              </view>
            </view>
            <view
              v-if="isRefreshPayment"
              style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
            >
              <button
                class="ko-basic-button__card"
                @click.stop="onRefresh(item)"
                :loading="item.__r_loading__"
                :disabled="item.__r_loading__"
              >
                刷新款项
              </button>
            </view>
          </view>
        </BasicCard>
      </view>
      <LoadMore :loading="loading" />
    </UniList>
  </view>
</template>

<style scoped lang="scss">
.ko-verification {
  padding-bottom: 50px;

  &__tabs {
    padding: 10px;
  }

  &__wrap {
    padding: 14px;
  }

  &__info {
    display: flex;
    flex-direction: column;

    &--wrap {
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    &--name {
      font-size: 18px;
    }
  }
}
</style>
