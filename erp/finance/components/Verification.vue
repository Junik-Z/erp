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
import { getUnpaidCustomerApi, getUnpaidSupplierApi } from "@/api/erp/finance";
import IndexUser from "@/components/IndexList/IndexList.vue";

export default {
  name: "Verification",
  components: {
    IndexUser,
    UvAvatar,
    UniSegmentedControl,
    UniList,
    UniCol,
    BasicCard,
    UniRow,
    LoadMore,
    PickerClass,
  },
  mixins: [mixins],
  props: {
    isReconcile: Boolean,
  },
  data() {
    return {
      list: [],
      loading: false,
      current: 0,
    };
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = (this.isReconcile ? [getUnpaidCustomerApi, getUnpaidSupplierApi] : [getCustomerListApi, getSupplierListApi])[this.current];

      Func({pageSize: 1000000, pageNum: 0})
        .then((res) => {
          this.list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));
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

    onClickItem(it, node) {
      this.onRefresh(node);
    },
  },
  computed: {
    getTabsList() {
      return this.isReconcile ? ["客户列表", "供应商列表"] : ["客户列表", "供应商列表"];
    },

    getEvents() {
      return this.isRefreshPayment && !this.isReconcile ? [{label: "刷新款项"}] : [];
    },
  },
};
</script>

<template>
  <view class="ko-verification">
    <view class="ko-verification__tabs">
      <UniSegmentedControl :values="getTabsList" style-type="text" :current.sync="current" @clickItem="getList" />
    </view>

    <view class="ko-verification__content">
      <IndexUser
        @click="onJump"
        :options="list"
        :events="getEvents"
        @click-item="onClickItem"
        show-amount
      />
      <!--<LoadMore :loading="loading" />-->
    </view>

    <UniList v-if="false">
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
                <UniRow :gutter="10">
                  <UniCol :span="24">
                    <view class="ko-verification__info--name">{{ item.name }}</view>
                  </UniCol>
                  <UniCol :span="24">
                    <view class="ko-basic-money"> {{ toYuan(item.amount) }}元</view>
                  </UniCol>
                </UniRow>
              </view>
            </view>
            <view
              v-if="isRefreshPayment && !isReconcile"
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
  display: flex;
  flex-direction: column;
  height: calc(88vh - 20px);

  &__tabs {
    padding: 10px;
  }

  &__content {
    height: 100%;
    flex: 1;
    position: relative;
  }

  &__wrap {
    padding: 14px;
    position: relative;
    height: 100%;
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
