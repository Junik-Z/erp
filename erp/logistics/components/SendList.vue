<script>
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { cancelDeliveryApi, getDeliveryHistoryListApi, getDeliveryListApi } from "@/api/erp/logistics";
import mixins from "@/mixins/mixins";

export default {
  name: "SendList",
  components: {
    LoadMore,
    HistoryBar,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
    QiunDataCharts,
  },
  mixins: [mixins],
  data: () => ({
    visible: false,

    loading: false,
    list: [],

    isHistory: false,
  }),
  mounted() {
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getDeliveryHistoryListApi : getDeliveryListApi;
      Func()
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelDeliveryApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList();
              });
          }
        },
      });
    },
  },
};
</script>

<template>
  <view class="ko-send">
    <HistoryBar v-model="isHistory" text="配送订单" @change="getList" />

    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <BasicCard>
            <view class="ko-send__info">
              <UniRow>
                <UniCol :span="24">
                  <label class="ko-basic-label">订单编号：</label>
                  <text>{{ item.orderCode }}</text>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">订单类型：</label>
                  <text>{{ ORDER_TYPE_ENUMS(item.orderType) }}</text>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">备注：</label>
                  <text>{{ item.remark || "-" }}</text>
                </UniCol>
              </UniRow>
              <view
                v-if="!isHistory"
                style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
              >
                <button class="ko-basic-button__card" @click="visible = true">发出</button>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>
      
      <LoadMore :loading="loading" />
    </UniList>

    <BasicPopup :visible.sync="visible">
      <view class="ko-send__popup">
        <UniForms label-width="100px">
          <UniFormsItem label="物流公司：">
            <UniEasyinput placeholder="请选择" />
          </UniFormsItem>
          <UniFormsItem label="快递单号：">
            <UniEasyinput placeholder="请输入" />
          </UniFormsItem>
        </UniForms>

        <button class="ko-basic-button" style="margin: 0 40px 10px;">保存</button>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-send {
  //padding: 10px;
  margin-top: 10px;

  &__row {
    margin-top: 16px;
  }

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }

  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  .ko-basic-button__card {
    margin: 5px;
  }
}
</style>
