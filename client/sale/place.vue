<script>
import UniGroup from "@/uni_modules/uni-group/components/uni-group/uni-group.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniDataCheckbox from "@/uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniDatetimePicker
  from "@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";

export default {
  name: "Order",
  components: {
    BasicPopup,
    UniEasyinput,
    UniDatetimePicker,
    UniFormsItem, UniForms, UniDataCheckbox, BasicCard, UniSection, UniCol, UniRow, UniGroup,
  },
  data: () => ({
    form: {},
    single: "",
    visible: false,
  }),
  methods: {},
};
</script>

<template>
  <view class="ko-order">
    <UniForms :model-value="form" label-width="120px" label-align="right">
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="订单名称：">
            <UniEasyinput placeholder="请输入" />
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="产品明细" type="line">
        <view style="padding: 10px;">
          <BasicCard>
            <UniRow class="ko-order__item">
              <UniCol :span="12">编号： 1</UniCol>
              <UniCol :span="12">名称： 1</UniCol>
              <UniCol :span="12">规格： 1</UniCol>
              <UniCol :span="12">产品图片： 1</UniCol>
              <UniCol :span="12">数量： 1</UniCol>
              <UniCol :span="12">单价： 1</UniCol>

              <UniCol :span="24">
                <view style="display: flex;justify-content: flex-end; align-items: center; margin-top: 8px;">
                  <button class="ko-basic-button__card">移除</button>
                </view>
              </UniCol>
            </UniRow>
          </BasicCard>
          <view style="display: flex; align-items: center; margin-top: 8px;">
            <button class="ko-basic-button__card" @click="visible = true">添加</button>
          </view>

          <view style="margin-top: 10px;">
            <view style="margin-top: 4px;">
              销售总额：1000元
            </view>
            <view style="margin-top: 4px;">
              销售总额大写：
            </view>
          </view>
        </view>
      </UniSection>

      <UniSection title="配送明细" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="送货地址：">
            <UniEasyinput placeholder="请输入送货地址" />
          </UniFormsItem>
          <UniFormsItem label="详细地址：">
            <UniEasyinput placeholder="请输入详细地址" />
          </UniFormsItem>
          <UniFormsItem label="计划送货日期：">
            <UniDatetimePicker
              type="date"
              :clear-icon="false"
              v-model="single"
              placeholder="请选择送货日期"
            />

          </UniFormsItem>
          <UniFormsItem label="备注：">
            <UniEasyinput type="textarea" placeholder="备注(选填)" />
          </UniFormsItem>
        </view>
      </UniSection>

    </UniForms>

    <BasicPopup :visible.sync="visible">
      <view class="ko-order__popup">
        <UniForms label-width="100px">
          <UniFormsItem label="产品：">
            <UniEasyinput placeholder="请选择产品" />
          </UniFormsItem>
          <UniFormsItem label="销售数量：">
            <UniEasyinput placeholder="请输入销售数量" />
          </UniFormsItem>
          <UniFormsItem label="销售单价：">
            <UniEasyinput placeholder="请输入销售单价" />
          </UniFormsItem>
          <!-- <UniFormsItem label="可用数量：">
             <span>40</span>
           </UniFormsItem>-->
        </UniForms>

        <button class="ko-basic-button" style="margin: 0 40px 10px;">保存</button>
      </view>
    </BasicPopup>

    <view class="ko-order__footer">
      <button class="ko-basic-button">保存</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-order {
  &__item {
    display: flex;
    flex-direction: row;

    view {
      width: calc(50% - 10px);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-around;

    padding: 10px 50px 50px;

    .ko-basic-button {
      width: 40%;
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
