<script>
import mixins from "@/mixins/mixins";
import reLogin from "@/mixins/re-login";
import { getOrderStatusApi } from "@/api/erp/sale";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import InProduct from "./components/InProduct.vue";


export default {
  name: "status",
  data() {
    return {
      option: {},
      list: [],
      loading: true,
    };
  },
  mixins: [mixins, reLogin],
  onLoad(option) {
    this.option = option;
    console.log("获取到的登录数据", option);
  },
  components: {UniSection, InProduct},
  methods: {
    // 获取订单详情
    getList() {
      this.loading = true;
      getOrderStatusApi({orderCode: /* "C2025041515270675003" ||  */this.Q_ID})
        .then(res => {
          this.list = res.data;

          console.log("获取到的数据", res.data, this.Q_ID);
        })
        .finally(() => {
          setTimeout(() => {
            this.$nextTick(() => {
              this.loading = false;
            });
          }, 100);
        });
      // uni.redirectTo({url: PageEnums.produceDetails + `?id=${this.Q_ID}&isOrder=true`});
    },
  },
  computed: {},
};
</script>

<template>
  <view class="ko-status">
    <block v-for="(item, index) of list" :key="index">
      <UniSection :title="item.name" type="line">
        <template #title>
          <view>
            <view>{{ item.name }}</view>
            <view style="font-weight: normal; font-size: 11px; display: flex; align-items: center">
              <view style="margin-right: 20px">
                <uni-icons type="shop" size="12" />
                {{ ORDER_TYPE_ENUMS(item.orderType) }}
              </view>
              <view v-if="false" class="ko-basic-money">
                ¥ {{ toYuan(item.amount) }}
              </view>
            </view>
          </view>
        </template>

        <view class="ko-status__item">
          <InProduct :list="item.amountsWithName" />
        </view>
      </UniSection>
    </block>

    <view class="ko-status__no-date" v-if="!list.length && !loading">
      <image
        mode="widthFix"
        class="ko-status__no-date--image"
        src="data:image/png;base64,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"
      />
      <view>暂无订单状态</view>
    </view>

    <view class="ko-status__loading" v-if="loading">
      <uv-loading-icon size="40" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-status {
  width: 100%;

  &__item {
    padding: 0 10px 10px;
  }

  &__no-date {
    text-align: center;
    padding: 50px 0;
    color: #c7c9ce;
    font-size: 14px;

    &--image {
      width: 60vw;
      margin-bottom: 30px;
    }
  }

  &__loading {
    padding: 50px 0;
  }
}
</style>
