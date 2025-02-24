<script>
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import {
  addedPurchaseApi,
  getBindInfoApi,
  getPurchaseCheckShareIdApi,
  getPurchaseDetailApi,
  reOrderPurchaseApi,
  updatePurchaseApi,
} from "@/api/erp/purchase";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import { _deepCopy, _get, _isEqual, CustomToast, transferYuan, yuanToPoints } from "@/utils";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import FeesList from "@/components/FeesList/FeesList.vue";
import mixins from "@/mixins/mixins";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import { PageEnums } from "@/utils/config";

const UserInfo = uni.getStorageSync("__USER_INFO__");

export default {
  name: "Order",
  components: {
    OrderCard,
    LoadMore,
    FeesList,
    PickerUser,
    UniSegmentedControl,
    PickerProduct,
    UniEasyinput,
    UniFormsItem,
    UniForms,
    UniSection,
  },
  mixins: [mixins],
  data() {
    return {
      form: {
        "orderCode": "",
        "supplierId": "",
        "purchaserId": UserInfo.userId,
        "otherSupplier": "",
        "totalAmount": 0,
        "remark": "",
        "orderAddress": "",
        "orderPhone": "",
        "details": [],
        fees: {},
      },
      visible: false,
      loading: false,

      option: {},

      current: 0,
      tabs: ["供应商", "其它供应商"],

      isClient: false,

      clientTabs: ["下单", "已完成"],
      clientCurrent: 0,
      orderList: [],

      isEdit: false,

      // 客户绑定用户列表
      bindList: [],

      rules: {
        orderPhone: {
          rules: [
            {
              format: "string",
              validateFunction: function (rule, value, data, callback) {
                const regexMobile = /^1[3-9]\d{9}$/;
                if (!regexMobile.test(value)) {
                  return callback("手机号码不合法");
                }
                callback();
              },
            },
          ],
        },
      },

      isAgain: false,

      // 正常跳转
      isNormal: false,
    };
  },
  created() {
  },
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    if (this.isEdit) this.getInfo();
    this.isNormal = option.isNormal === "true";

    // 是否是客户下单
    this.isClient = _isEqual("ADDED_PURCHASE", option.PAGE_TYPE);

    if (this.isClient) {

      if (this.option.SHARE_ID) {
        getPurchaseCheckShareIdApi({id: decodeURIComponent(this.option.SHARE_ID)})
          .then(res => {
            this.form.id = decodeURIComponent(this.option.SHARE_ID);
            console.log(res);
            if (res.data) {
              uni.redirectTo({
                url: PageEnums.purchaseClientAddedBack,
                fail() {
                  uni.navigateBack();
                },
              });
            }
          });
      }

      this.current = 1;

      this.onLogInAgain(this.option)
        .finally(() => {
          setTimeout(() => {
            this.form.otherSupplier = this.GET_USER_INFO.nickName;
            this.getBindInfo();
          }, 10);
        });
    } else {
      this.current = 0;
    }

    // #ifdef MP
    this.$refs.FormRef.setRules(this.rules);
    // #endif
  },
  methods: {
    getInfo() {
      getPurchaseDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;
          params.totalAmount = transferYuan(params.totalAmount);

          params.otherSupplier = this.GET_FUNC(params, "customer.name");

          this.isAgain = ["FINISHED"].includes(params.status);

          this.form = params;
        });
    },
    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const params = _deepCopy(this.form);
          params.totalAmount = yuanToPoints(params.totalAmount);
          // params.details = this.$refs.PPRef.getDiscountedPrices();

          this.loading = true;
          const Func = this.isAgain ? reOrderPurchaseApi : (this.isEdit ? updatePurchaseApi : addedPurchaseApi);
          Func(params)
            .then((res) => {
              CustomToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
                success() {
                  if (this.isClient && !this.isNormal) {
                    uni.redirectTo({
                      url: PageEnums.purchaseClientAddedBack,
                      fail() {
                        uni.navigateBack();
                      },
                    });
                  } else {
                    uni.navigateBack();
                  }
                },
              });
              uni.setStorageSync("TENP_ORDER_INFO", res.data);
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
};
</script>

<template>
  <view class="ko-order ko-basic-added-form">
    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
      :rules="rules"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <view style="margin: 0 30px 20px;" v-if="!isClient">
            <UniSegmentedControl
              :current.sync="current"
              :values="tabs"
              style-type="text"
              @clickItem="onTabItem"
            />
          </view>

          <template v-if="current === 0">
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
              />
            </UniFormsItem>
          </template>

          <template v-if="current === 1">
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

      <UniSection title="产品明细" type="line">
        <view style="padding: 10px;">
          <UniFormsItem name="details" label-width="0">
            <view style="width: 100%;">
              <PickerProduct
                v-model="form.details"
                :total.sync="form.totalAmount"
                type="purchase"
                :is-client="isClient"
                is-actual
                ref="PPRef"
                :is-show-recent="isPerm('Purchase_Write')"
                :supplier-id="form.supplierId"
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
