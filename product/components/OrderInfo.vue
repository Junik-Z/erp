<script>
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";

import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import mixins from "@/mixins/mixins";
import { _get, _isEmpty } from "@/utils";
import { getBindInfoApi } from "@/api/erp/sale";
import PickerAddress from "./PickerAddress.vue";
import FeesList from "./FeesList/FeesList.vue";

export default {
  name: "OrderInfo",
  components: {
    PickerAddress,
    UniEasyinput,
    UniFormsItem,
    UniForms,
    UniSegmentedControl,
    PickerUser,
    FeesList,
    UniSection,
  },
  mixins: [mixins],
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: Boolean,
    isShare: Boolean,
    isSale: Boolean,
  },
  data() {
    return {
      form: {
        "orderCode": "",
        "supplierId": "",
        "purchaserId": "",
        "otherSupplier": "",
        "otherSupplierPhone": "",
        "totalAmount": null,
        "remark": "",
        "orderAddress": "",
        "orderPhone": "",
        "details": [],
        fees: {},
      },
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
      bindList: [],
      current: 0,
      tabs: ["客户", "其它"],

      noMore: false,

      bQuery: {
        pageNum: 0,
        pageSize: 20,
      },
    };
  },
  mounted() {
  },
  watch: {
    value: {
      handler() {
        this.form = {...this.form, ...this.value};
      },
      deep: true,
      immediate: true,
    },
    form: {
      handler() {
        const params = this.form;
        if (this.current === 0) {
          params.otherSupplier = "";
          params.otherSupplierPhone = "";
        }
        if (this.current === 1) {
          params.supplierId = "";
        }
        this.$emit("change", params);
      },
      deep: true,
    },
  },
  methods: {
    onTabItem() {
      /* if (this.current === 0) {
        this.form.otherSupplier = "";
        this.form.otherSupplierPhone = "";
      }

      if (this.current === 1) {
        this.form.supplierId = "";
      } */
    },

    onSupplierId(val) {
      const node = this.$refs.UserRef.getUserInfo(val) || {};
      this.form.orderAddress = node.address;
      this.form.orderPhone = _get(node, "contacts.0.phone");
    },

    validate() {
      return new Promise(resolve => {
        this.$refs.FormRef.validate(resolve);
      });
    },

    getBindInfo() {
      getBindInfoApi(this.bQuery)
        .then(res => {
          const data = res.data?.map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));

          this.bindList = this.onMergeArrays(this.bindList, data, "value");
          this.noMore = _isEmpty(data) || data.length < this.bQuery.pageSize;

          if (this.bQuery.pageNum === 0) {

            if (this.bindList.length) {
              this.current = 0;
              const one = _get(res.data, "0") || {};
              this.form.supplierId = one.id;
              this.form.orderPhone = _get(one, "contacts.0.phone");
              this.form.orderAddress = _get(one, "address");
            } else {
              this.current = 1;
            }
          }
        });
    },

    onLower() {
      if (this.noMore) return false;
      this.bQuery.pageNum += 1;
      this.getBindInfo();
    },

    updateFees() {
      this.$refs.FLRes && this.$refs.FLRes.getList();
    },
  },
  computed: {
    noCustomerPerm() {
      return this.isPerm("CUSTOMER_LIST");
    },
  },
};
</script>

<template>
  <UniForms
    :model="form"
    :rules="rules"
    label-width="90px"
    label-align="right"
    ref="FormRef"
  >
    <UniSection title="基础信息" type="line">
      <block v-if="isSale">
        <view style="margin: 0 30px 20px;" v-if="noCustomerPerm">
          <UniSegmentedControl
            :current.sync="current"
            :values="tabs"
            style-type="text"
            @clickItem="onTabItem"
          />
        </view>

        <template v-if="current === 0 && noCustomerPerm">
          <UniFormsItem label="客户：" name="supplierId">
            <PickerUser
              style="width: 100%;"
              is-input
              title="选择客户"
              v-model="form.supplierId"
              type="client"
              ref="UserRef"

              :placeholder-label="GET_FUNC(form, 'customer.name')"

              :is-long-list="isShare"
              :options="bindList"
              @input="onSupplierId"
            />
          </UniFormsItem>
        </template>

        <template v-if="current === 1 || !noCustomerPerm">
          <UniFormsItem :label="`${isShare ? '姓名' : '姓名'}：`" name="otherSupplier">
            <UniEasyinput
              v-model="form.otherSupplier"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>
        </template>
      </block>

      <block v-else>
        <view style="margin: 0 30px 20px;" v-if="bindList.length">
          <UniSegmentedControl
            :current.sync="current"
            :values="tabs"
            style-type="text"
            @clickItem="onTabItem"
          />
        </view>

        <template v-if="current === 0 && bindList.length">
          <UniFormsItem label="客户：" name="supplierId">
            <PickerUser
              style="width: 100%;"
              is-input
              title="选择客户"
              v-model="form.supplierId"
              type="client"
              ref="UserRef"
              :placeholder-label="GET_FUNC(form, 'customer.name')"
              :is-long-list="true"
              :options="bindList"
              @input="onSupplierId"
              @lower="onLower"
            />
          </UniFormsItem>
        </template>

        <template v-if="current === 1">
          <UniFormsItem :label="`${isShare ? '姓名' : '姓名'}：`" name="otherSupplier">
            <UniEasyinput
              v-model="form.otherSupplier"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>
        </template>
      </block>


      <UniFormsItem label="电话：" name="orderPhone">
        <UniEasyinput v-model="form.orderPhone" placeholder="请输入电话" />
      </UniFormsItem>
      <UniFormsItem label="地址：" name="orderAddress">
        <view style="display: flex; align-items: center; width: 100%">
          <view style="flex: 1; width: 100%">
            <UniEasyinput v-model="form.orderAddress" placeholder="请输入地址" />
          </view>
          <PickerAddress
            v-if="form.supplierId"
            :supplierId="form.supplierId"
            v-model="form.orderAddress"
            type="sale"
          />
        </view>
      </UniFormsItem>
    </UniSection>

    <UniSection title="其它费用" type="line" v-if="!isShare && false">
      <view style="padding: 10px;">
        <FeesList ref="FLRes" v-model="form.fees" is-form is-goods />
      </view>
    </UniSection>

    <UniSection title="其它信息" type="line">
      <UniFormsItem label="备注：" name="remark">
        <UniEasyinput v-model="form.remark" type="textarea" placeholder="备注(选填)" />
      </UniFormsItem>
    </UniSection>
  </UniForms>
</template>

<style scoped lang="scss">

</style>
