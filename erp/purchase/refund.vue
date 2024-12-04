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
import {
  addedPurchaseReturnApi,
  getPurchaseReturnDetailApi,
  getSupplierListApi,
  updatePurchaseReturnApi,
} from "@/api/erp/purchase";
import { _deepCopy, _isEqual, showToast, transferYuan, yuanToPoints } from "@/utils";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";

export default {
  name: "refund",
  components: {
    UniSegmentedControl,
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

    current: 0,
    tabs: ["VIP供应商", "其它供应商"],

    isClient: false,
  }),
  onLoad(option) {
    this.option = option;

    console.log(option);

    this.isEdit = !!option.id;
    if (this.isEdit) this.getInfo();
    // 是否是客户下单
    this.isClient = _isEqual("ADDED_PURCHASE", option.PAGE_TYPE);
    if (this.isClient) {
      this.current = 1;
    } else {
      this.getSupplierList();
    }
  },
  methods: {
    // 供应商名称
    getSupplierList() {
      getSupplierListApi()
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

          const Func = this.isEdit ? updatePurchaseReturnApi : addedPurchaseReturnApi;

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

    getInfo() {
      getPurchaseReturnDetailApi({id: this.option.id})
        .then((res) => {
          const params = _deepCopy(res.data);
          console.log(params);
          params.totalAmount = transferYuan(params.totalAmount);

          this.form = params;
        });
    },

    onTabItem() {
      if (this.current === 0) {
        this.form.otherSupplier = "";
        this.form.otherSupplierPhone = "";
      }

      if (this.current === 1) {
        this.form.supplierId = "";
      }

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
          <view style="margin: 0 30px 20px;" v-if="!isClient">
            <UniSegmentedControl
              :current.sync="current"
              :values="tabs"
              style-type="text"
              @click-item="onTabItem"
            />
          </view>

          <template v-if="current === 0">
            <UniFormsItem label="VIP供应商：" name="supplierId">
              <UniDataSelect
                v-model="form.supplierId"
                style="width: 100%;"
                placeholder="请选择"
                :localdata="supplierList"
              />
            </UniFormsItem>
          </template>

          <template v-if="current === 1">
            <UniFormsItem :label="`${isClient ? '姓名' : '其它供应商'}：`" name="otherSupplier">
              <UniEasyinput
                v-model="form.otherSupplier"
                style="width: 100%;"
                placeholder="请输入"
              />
            </UniFormsItem>
            <UniFormsItem :label="`${isClient ? '联系电话' : '供应商电话'}：`" name="otherSupplierPhone">
              <UniEasyinput
                v-model="form.otherSupplierPhone"
                style="width: 100%;"
                type="tel"
                placeholder="请输入"
              />
            </UniFormsItem>
          </template>
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
