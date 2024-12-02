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
import UniDataSelect from "@/erp/components/uni-data-select/components/uni-data-select/uni-data-select.vue";
import PickerProduct from "@/erp/components/PickerProduct/PickerProduct.vue";
import { _deepCopy, showToast, transferYuan, yuanToPoints } from "@/utils";
import { addedSaleApi, getCustomerListApi, getSaleDetailApi, updateSaleApi } from "@/api/erp/sale";

const UserInfo = uni.getStorageSync("__USER_INFO__");

export default {
  name: "Order",
  components: {
    PickerProduct,
    UniDataSelect,
    BasicPopup,
    UniEasyinput,
    UniDatetimePicker,
    UniFormsItem,
    UniForms,
    UniDataCheckbox,
    BasicCard,
    UniSection,
    UniCol,
    UniRow,
    UniGroup,
  },
  data: () => ({
    form: {
      "orderCode": "",
      "supplierId": "",
      "purchaserId": UserInfo.userId,
      "otherSupplier": "",
      "totalAmount": 0,
      "remark": "",
      "details": [],
    },
    supplierList: [],
    visible: false,
    loading: false,
    option: {},
  }),
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    if (this.isEdit) this.getInfo();
  },
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
    getInfo() {
      getSaleDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;
          params.totalAmount = transferYuan(params.totalAmount);
          this.form = params;
        });
    },
    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const params = _deepCopy(this.form);

          params.totalAmount = yuanToPoints(params.totalAmount);
          this.loading = true;

          const Func = this.isEdit ? updateSaleApi : addedSaleApi;

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
  <view class="ko-order">
    <UniForms
      :model="form"
      label-width="90px"
      label-align="right"
      ref="FormRef"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="VIP客户：" name="supplierId">
            <UniDataSelect
              v-model="form.supplierId"
              style="width: 100%;"
              placeholder="请选择"
              :localdata="supplierList"
            />
          </UniFormsItem>
          <UniFormsItem label="其它客户：" name="otherSupplier">
            <UniEasyinput
              v-model="form.otherSupplier"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="产品明细" type="line">
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
          <!--<UniFormsItem label="发货地址：">
            <UniEasyinput placeholder="请输入发货地址" />
          </UniFormsItem>
          <UniFormsItem label="详细地址：">
            <UniEasyinput placeholder="请输入详细地址" />
          </UniFormsItem>
          <UniFormsItem label="计划发货日期：">
            <UniDatetimePicker
              type="date"
              :clear-icon="false"
              v-model="single"
              placeholder="请选择发货日期"
            />

          </UniFormsItem>-->
          <UniFormsItem label="备注：" name="remark">
            <UniEasyinput v-model="form.remark" type="textarea" placeholder="备注(选填)" />
          </UniFormsItem>
        </view>
      </UniSection>
    </UniForms>

    <view class="ko-order__footer">
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
.ko-order {
  &__item {
    display: flex;
    flex-direction: row;
  }

  &__footer {
    padding: 10px 50px 50px;
  }
}
</style>
