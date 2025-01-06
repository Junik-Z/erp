<script>
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniDataSelect from "./components/uni-data-select/components/uni-data-select/uni-data-select.vue";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import { _deepCopy, _get, _isEqual, showToast, transferYuan, yuanToPoints } from "@/utils";
import {
  addedSaleReturnApi,
  getBindInfoApi,
  getSaleDetailApi,
  getSaleReturnDetailApi,
  reOrderSaleReturnApi,
  updateSaleReturnApi,
} from "@/api/erp/sale";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import mixins from "@/mixins/mixins";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import FeesList from "@/components/FeesList/FeesList.vue";

export default {
  name: "SaleRefundOrder",
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
  mixins: [mixins],
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
      options: {},
      isEdit: false,

      isClient: true,

      orderId: false,

      // 客户绑定用户列表
      bindList: [],

      current: 0,
      tabs: ["客户", "其它客户"],

      isAgain: false,
    };
  },
  created() {
  },
  onLoad(option) {
    // 是否是客户下单
    this.isClient = _isEqual("ADDED_REFUND_SALE", option.PAGE_TYPE);
    this.options = option;
    this.isEdit = !!option.id;
    this.orderId = option.order_id || "";

    if (this.isEdit || this.orderId) this.getInfo();

    if (this.isClient) {
      this.form.supplierId = this.GET_USER_INFO.userId;
      this.form.otherSupplier = this.GET_USER_INFO.nickName;

      this.getBindInfo();
    }
  },
  methods: {
    getInfo() {
      const Func = this.orderId ? getSaleDetailApi : getSaleReturnDetailApi;

      Func({id: this.options.id || this.orderId})
        .then(res => {
          const params = res.data;
          params.totalAmount = transferYuan(params.totalAmount);

          params.otherSupplier = this.GET_FUNC(params, "customer.name");

          this.isAgain = ["FINISHED"].includes(params.status) && !this.orderId;
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

          const Func = this.isAgain ? reOrderSaleReturnApi : (this.isEdit ? updateSaleReturnApi : addedSaleReturnApi);

          Func(params)
            .then(() => {
              showToast({
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

    // 获取绑定的客户列表
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
            const one = _get(res.data, "0") || {};
            this.form.supplierId = one.id;
            this.form.orderPhone = _get(one, "contacts.0.phone");
            this.form.orderAddress = _get(one, "address");
          }
        });
    },

    onSupplierId(val) {
      const node = this.$refs.UserRef.getUserInfo(val) || {};
      this.form.orderAddress = node.address;
      this.form.orderPhone = _get(node, "contacts.0.phone");
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
  <view class="ko-refund ko-basic-added-form">
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

          <UniFormsItem label="客户：" v-if="false" name="supplierId">
            <PickerUser
              style="width: 100%;"
              is-input
              title="选择客户"
              v-model="form.supplierId"
              type="client"
              :disabled="!!orderId"
              ref="UserRef"
              :is-long-list="isClient"
              :options="bindList"
              @input="onSupplierId"
              v-if="isClient ? bindList.length : true"
            />
            <UniEasyinput
              v-else
              v-model="form.otherSupplier"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>

          <template v-if="isClient ? bindList.length : current === 0">
            <UniFormsItem label="客户：" name="supplierId">
              <PickerUser
                style="width: 100%;"
                is-input
                title="选择客户"
                v-model="form.supplierId"
                :disabled="!!orderId"
                type="client"
                ref="UserRef"
                :is-long-list="isClient"
                :options="bindList"
                @input="onSupplierId"
              />
            </UniFormsItem>
          </template>

          <template v-else>
            <UniFormsItem :label="`${isClient ? '姓名' : '姓名'}：`" name="otherSupplier">
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
          <UniFormsItem name="details" label-width="0">
            <view style="width: 100%;">
              <PickerProduct
                v-model="form.details"
                :total.sync="form.totalAmount"
                :is-not-added="!!orderId"
                type="sale"
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
