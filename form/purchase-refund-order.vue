<script>
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniDataSelect from "./components/uni-data-select/components/uni-data-select/uni-data-select.vue";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import {
  addedPurchaseReturnApi,
  getBindInfoApi,
  getPurchaseDetailApi,
  getPurchaseReturnDetailApi,
  reOrderPurchaseReturnApi,
  updatePurchaseReturnApi,
} from "@/api/erp/purchase";
import { _deepCopy, _get, _isEqual, CustomToast, transferYuan, yuanToPoints } from "@/utils";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import mixins from "@/mixins/mixins";
import FeesList from "./components/FeesList/FeesList.vue";

export default {
  name: "refund",
  components: {
    FeesList,
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
  data() {
    return {
      form: {
        "orderCode": "",
        "supplierId": "",
        "purchaserId": "",
        "otherSupplier": "",
        "totalAmount": 0,
        "remark": "",
        "details": [],
        fees: {},
      },
      supplierList: [],
      visible: false,
      loading: false,

      current: 0,
      tabs: ["供应商", "其它供应商"],

      isClient: false,

      orderId: "",

      bindList: [],

      isEdit: false,
      isAgain: false,
      isNormal: false,
    };
  },
  mixins: [mixins],
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    this.orderId = option.order_id || "";

    if (this.isEdit || this.orderId) this.getInfo();
    this.isNormal = option.isNormal === "true";

    // 是否是客户下单
    this.isClient = _isEqual("ADDED_REFUND_PURCHASE", option.PAGE_TYPE);

    if (this.isClient) {
      this.current = 1;

      this.form.otherSupplier = this.GET_USER_INFO.nickName;
      this.getBindInfo();
    }
  },
  methods: {
    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const params = _deepCopy(this.form);
          console.log(params);
          params.totalAmount = yuanToPoints(params.totalAmount);
          this.loading = true;

          if (this.orderId) {
            params.purchaseOrderId = this.orderId;
          }

          const Func = this.isAgain ? reOrderPurchaseReturnApi : (this.isEdit ? updatePurchaseReturnApi : addedPurchaseReturnApi);

          Func(params)
            .then((res) => {
              uni.setStorageSync("TENP_ORDER_INFO", res.data);
              CustomToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
                success: () => {
                  uni.navigateBack();
                },
              });
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },

    getInfo() {
      const Func = this.orderId ? getPurchaseDetailApi : getPurchaseReturnDetailApi;
      Func({id: this.option.id || this.orderId})
        .then((res) => {
          const params = _deepCopy(res.data);
          console.log(params);
          params.totalAmount = transferYuan(params.totalAmount);
          params.otherSupplier = this.GET_FUNC(params, "customer.name");

          this.isAgain = ["FINISHED"].includes(params.status) && !this.orderId;

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

    onSupplierId(val) {
      const node = this.$refs.UserRef.getUserInfo(val) || {};
      this.form.orderAddress = node.address;
      this.form.orderPhone = _get(node, "contacts.0.phone");
    },


    getBindInfo() {
      getBindInfoApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.bindList = res.data?.map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));

          if (this.bindList.length) {
            this.current = 0;
            const one = _get(res.data, "0") || {};
            this.form.supplierId = one.id;
            this.form.orderPhone = _get(one, "contacts.0.phone");
            this.form.orderAddress = _get(one, "address");
          } else {
            this.current = 1;
          }
        });
    },
  },
  computed: {
    noSupplierPerm() {
      return this.isPerm("SUPPLIER_LIST");
    },
  },
};
</script>

<template>
  <view class="ko-refund ko-basic-added-form">
    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem v-if="false" label="供应商：" name="supplierId">
            <PickerUser
              style="width: 100%;"
              v-model="form.supplierId"
              placeholder="请选择"
              title="选择供应商"
              is-input
              type="supplier"
              :disabled="!!orderId"
              ref="UserRef"
              @input="onSupplierId"
              v-if="isClient ? bindList.length : true"

              :placeholder-label="GET_FUNC(form, 'customer.name')"
            />
            <UniEasyinput
              v-else
              v-model="form.otherSupplier"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>

          <view style="margin: 0 30px 20px;" v-if="!isClient && noSupplierPerm">
            <UniSegmentedControl
              :current.sync="current"
              :values="tabs"
              style-type="text"
              @clickItem="onTabItem"
            />
          </view>

          <template v-if="(isClient ? bindList.length : current === 0) && noSupplierPerm">
            <UniFormsItem label="供应商：" name="supplierId">
              <PickerUser
                style="width: 100%;"
                v-model="form.supplierId"
                placeholder="请选择"
                title="选择供应商"
                is-input
                type="supplier"
                ref="UserRef"
                :is-long-list="isClient"
                :options="bindList"
                @input="onSupplierId"

                :placeholder-label="GET_FUNC(form, 'customer.name')"
              />
            </UniFormsItem>
          </template>

          <template v-if="!(isClient ? bindList.length : current === 0) || !noSupplierPerm">
            <UniFormsItem :label="`${isClient ? '姓名' : '名称'}：`" name="otherSupplier">
              <UniEasyinput
                v-model="form.otherSupplier"
                style="width: 100%;"
                placeholder="请输入"
              />
            </UniFormsItem>
          </template>
        </view>
      </UniSection>

      <UniSection title="配送信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="电话：" name="orderPhone">
            <UniEasyinput v-model="form.orderPhone" placeholder="请输入电话" />
          </UniFormsItem>
          <UniFormsItem label="地址：" name="orderAddress">
            <UniEasyinput v-model="form.orderAddress" placeholder="请输入地址" />
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="退货产品明细" type="line">
        <view style="padding: 10px;">
          <UniFormsItem
            name="details"
            label-width="0"
          >
            <view style="width: 100%;">
              <PickerProduct
                v-model="form.details"
                :total.sync="form.totalAmount"
                :is-not-added="!!orderId"
                type="purchase"
                :is-client="isClient"
                is-actual
              />
            </view>
          </UniFormsItem>
        </view>
      </UniSection>

      <UniSection title="其它费用" type="line">
        <view style="padding: 10px;">
          <FeesList v-model="form.fees" is-form />
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
    // #ifdef H5
    display: flex;
    align-items: center;
    justify-content: center;

    .ko-basic-button {
      width: 200px;
    }

    // #endif
  }
}
</style>
