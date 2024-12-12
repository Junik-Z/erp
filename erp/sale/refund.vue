<script>
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniDataSelect from "@/erp/components/uni-data-select/components/uni-data-select/uni-data-select.vue";
import PickerProduct from "@/erp/components/PickerProduct/PickerProduct.vue";
import { _deepCopy, _get, _isEqual, showToast, transferYuan, yuanToPoints } from "@/utils";
import { addedSaleReturnApi, getSaleDetailApi, getSaleReturnDetailApi, updateSaleReturnApi } from "@/api/erp/sale";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import mixins from "@/mixins/mixins";
import PickerUser from "@/components/PickerUser/PickerUser.vue";

export default {
  name: "refund",
  components: {
    PickerUser,
    UniSegmentedControl,
    PickerProduct,
    UniDataSelect,
    UniForms,
    BasicCard,
    UniSection,
    UniFormsItem,
    UniEasyinput,
  },
  mixins: [mixins],
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
    options: {},
    isEdit: false,


    current: 0,
    tabs: ["客户", "其它客户"],

    isClient: false,

    orderId: false,
  }),
  created() {
  },
  onLoad(option) {
    this.options = option;
    this.isEdit = !!option.id;
    this.orderId = option.order_id || "";

    if (this.isEdit || this.orderId) this.getInfo();

    // 是否是客户下单
    this.isClient = _isEqual("ADDED_SALE", option.PAGE_TYPE);

    if (this.isClient) {
      this.current = 1;
    }

  },
  methods: {
    getInfo() {
      const Func = this.orderId ? getSaleDetailApi : getSaleReturnDetailApi;

      Func({id: this.options.id || this.orderId})
        .then(res => {
          const params = res.data;
          params.totalAmount = transferYuan(params.totalAmount);
          this.form = params;
          console.log(res);
        });
    },

    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const params = _deepCopy(this.form);
          console.log(params);
          params.totalAmount = yuanToPoints(params.totalAmount);

          if (this.orderId) {
            params.saleOrderId = this.orderId;
          }

          this.loading = true;

          const Func = this.isEdit ? updateSaleReturnApi : addedSaleReturnApi;

          Func(params)
            .then(() => {
              showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
                success: () => {
                  if (this.orderId) {
                    uni.redirectTo({
                      url: "/erp/sale/sale?PAGE_INDEX=3",
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
        }else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
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
  <view class="ko-refund">
    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <view style="margin: 0 30px 20px;" v-if="!isClient && false">
            <UniSegmentedControl
              :current.sync="current"
              :values="tabs"
              style-type="text"
              @click-item="onTabItem"
            />
          </view>

          <template v-if="current === 0">
            <UniFormsItem label="客户：" name="supplierId">
              <PickerUser
                style="width: 100%;"
                is-input
                title="选择客户"
                v-model="form.supplierId"
                type="client"
                disabled
              />
            </UniFormsItem>
          </template>

          <template v-if="current === 1 && false">
            <UniFormsItem :label="`${isClient ? '姓名' : '其它客户'}：`" name="otherSupplier">
              <UniEasyinput
                v-model="form.otherSupplier"
                style="width: 100%;"
                placeholder="请输入"
              />
            </UniFormsItem>
            <UniFormsItem :label="`${isClient ? '联系电话' : '客户电话'}：`" name="otherSupplierPhone">
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
                is-not-added
                :is-edit-price="isPerm('Sales_Write')"
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
  padding-bottom: 80px;

  &__footer {
    padding: 10px 50px 50px;
  }
}
</style>
