<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import UCountTo from "@/uni_modules/uview-ui/components/u-count-to/u-count-to.vue";
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

export default {
  name: "SendList",
  components: {
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    UniListItem, BasicCard, UniCol, UniRow, UniList, QiunDataCharts, UCountTo, UniGridItem, UniGrid,
  },
  data: () => ({
    visible: false,
  }),
  mounted() {
  },
  methods: {},
};
</script>

<template>
  <view class="ko-send">
    <UniList>
      <UniListItem>
        <template #body>
          <BasicCard>
            <view class="ko-send__info">
              <view class="ko-send__info--name">销售订单</view>
              <UniRow>
                <UniCol :span="24">
                  收件地址：哇哈哈哈
                </UniCol>
                <UniCol :span="24">
                  详细地址：哇哈哈哈
                </UniCol>
                <UniCol :span="24">
                  备注：哇哈哈哈
                </UniCol>
              </UniRow>
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button class="ko-basic-button__card" @click="visible = true">收货</button>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>
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
