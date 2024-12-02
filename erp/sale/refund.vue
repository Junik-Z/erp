<script>
import UniDatetimePicker
  from "@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniDataSelect from "@/erp/components/uni-data-select/components/uni-data-select/uni-data-select.vue";
import PickerProduct from "@/erp/components/PickerProduct/PickerProduct.vue";
import { _deepCopy, showToast, yuanToPoints } from "@/utils";
import { addedSaleReturnApi, getCustomerListApi, updateSaleReturnApi } from "@/api/erp/sale";

export default {
  name: "refund",
  components: {
    PickerProduct,
    UniDataSelect,
    UniForms,
    BasicCard,
    UniSection,
    UniFormsItem,
    UniEasyinput,
    UniDatetimePicker,
  },
  data: () => ({
    form: {
      "orderCode": "",
      "supplierId": "",
      "purchaserId": "",
      "otherSupplier": "",
      "totalAmount": 0,
      "remark": "",
      "details": [],
    },
    supplierList: [],
    visible: false,
    loading: false,
  }),
  created() {
    this.getSupplierList();
  },
  methods: {
    // 供应商名称
    getSupplierList() {
      getCustomerListApi()
        .then(res => {
          this.supplierList = res.data?.map(item => ({
            text: item.name,
            value: item.id,
          }));
        });
    },
    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const params = _deepCopy(this.form);
          console.log(params);
          params.totalAmount = yuanToPoints(params.totalAmount);
          this.loading = true;

          const Func = this.isEdit ? updateSaleReturnApi : addedSaleReturnApi;

          Func(params)
            .then(() => {
              showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
                success() {
                  uni.navigateBack();
                },
              });
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
  },
};
</script>

<template>
  <view class="ko-refund">
    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <view style="padding: 10px;">
            <UniFormsItem label="客户：" name="supplierId">
              <UniDataSelect
                v-model="form.supplierId"
                style="width: 100%;"
                placeholder="请选择"
                :localdata="supplierList"
              />
            </UniFormsItem>
          </view>
        </view>
      </UniSection>

      <UniSection title="退货产品明细" type="line">
        <view style="padding: 10px;">
          <UniFormsItem name="details" label-width="0">
            <view style="width: 100%;">
              <PickerProduct
                v-model="form.details"
                :total.sync="form.totalAmount"
              />
            </view>
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="其它信息" type="line">
        <view style="padding: 10px;">
          <!--<UniFormsItem label="收货地址：">
            <UniEasyinput placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="详细地址：">
            <UniEasyinput placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="计划退货日期：">
            <UniDatetimePicker
              type="date"
              :clear-icon="false"
              v-model="single"
              placeholder="请选择"
            />
          </UniFormsItem>-->
          <UniFormsItem label="备注：" name="remark">
            <UniEasyinput v-model="form.remark" type="textarea" placeholder="备注(选填)" />
          </UniFormsItem>
        </view>
      </UniSection>

    </UniForms>

    <view class="ko-refund__footer">
      <button
        class="ko-basic-button"
        @click="onSubmit"
        :loading="loading"
        :disabled="loading"
      >
        保存
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-refund {
  padding-bottom: 50px;

  &__footer {
    padding: 10px 50px 50px;
  }
}
</style>
