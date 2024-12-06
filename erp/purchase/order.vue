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
import { addedPurchaseApi, getPurchaseDetailApi, updatePurchaseApi } from "@/api/erp/purchase";
import PickerProduct from "@/erp/components/PickerProduct/PickerProduct.vue";
import { _deepCopy, _isEqual, showToast, transferYuan, yuanToPoints } from "@/utils";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";

const UserInfo = uni.getStorageSync("__USER_INFO__");

export default {
  name: "Order",
  components: {
    PickerUser,
    UniSegmentedControl,
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
    visible: false,
    loading: false,

    option: {},

    current: 0,
    tabs: ["VIP供应商", "其它供应商"],

    isClient: false,
  }),
  created() {
    this.getSupplierList();
  },
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    if (this.isEdit) this.getInfo();

    // 是否是客户下单
    this.isClient = _isEqual("ADDED_PURCHASE", option.PAGE_TYPE);

    if (this.isClient) {
      this.current = 1;
    }
  },
  methods: {
    getInfo() {
      getPurchaseDetailApi({id: this.option.id})
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

          console.log(params);

          params.totalAmount = yuanToPoints(params.totalAmount);
          this.loading = true;

          const Func = this.isEdit ? updatePurchaseApi : addedPurchaseApi;

          Func(params)
            .then(() => {
              showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
                success() {
                  if (this.isClient) {
                    uni.reLaunch({
                      url: "/pages/index/index",
                    });
                  } else {
                    uni.navigateBack();
                  }
                },
              });
            })
            .finally(() => {
              this.loading = false;
            });
        }
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
  <view class="ko-order">
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
              <PickerUser
                style="width: 100%;"
                v-model="form.supplierId"
                placeholder="请选择"
                title="选择VIP供应商"
                is-input
                type="supplier"
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

      <UniSection title="产品明细" type="line">
        <view style="padding: 10px;">
          <UniFormsItem name="details" label-width="0">
            <view style="width: 100%;">
              <PickerProduct
                v-model="form.details"
                :total.sync="form.totalAmount"
                type="purchase"
                :is-client="isClient"
              />
            </view>
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="其它信息" type="line">
        <view style="padding: 10px;">
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
