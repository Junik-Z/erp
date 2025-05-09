<script>
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import FilePicker from "./FilePicker/FilePicker.vue";
import mixins from "@/mixins/mixins";
import { _deepCopy, _isNotUnNil, _keys, CustomToast } from "@/utils";
import { addSettlementApi, removeSubsidyApi } from "@/api/erp/produce";
import PickerSheet from "@/staff/components/PickerSheet.vue";
import { PRICING_METHOD } from "@/utils/config";

export default {
  name: "SettlePopup",
  data() {
    return {
      visible: false,
      sLoading: false,
      form: {
        "name": "",
        "description": "",
        "images": "",
        "pricingMethod": "none",
        "price": null,
      },
    };
  },
  components: {
    PickerSheet,
    UniForms,
    UniFormsItem,
    UniEasyinput,
    BasicPopup,

    FilePicker,
  },
  mixins: [mixins],
  props: {
    name: String
  },
  methods: {
    open(query) {
      this.form = _deepCopy(this.$options.data().form);
      this.form.staffId = query.staffId;
      this.form.orderCode = query.orderCode;
      this.form.orderId = query.orderId;
      this.visible = true;
    },

    // 处理提交补贴
    onSubmit() {
      this.sLoading = true;
      const params = _deepCopy(this.form);

      params.price = ["commission", "priceCommission"].includes(params.pricingMethod) ? (params.price || 0) * 10000 : _isNotUnNil(params.price) ? this.toFen(params.price) : null;

      // 金额提成
      if (["priceCommission"].includes(params.pricingMethod)) params.quantity = this.toFen(params.quantity);

      addSettlementApi(params)
        .then(() => {
          CustomToast({title: `添加成功`});
          this.visible = false;
          this.$emit("success");
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    // 删除补贴金额
    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除该结算吗？",
        success: (res) => {
          if (res.confirm) {
            removeSubsidyApi(item)
              .then(() => {
                CustomToast({title: "操作成功"});
                this.$emit("remove", item, index);
              });
          }
        },
      });
    },
  },
  computed: {
    // 价格描述
    getPriceLabel() {
      return {commission: "提成比例", priceCommission: "提成比例"}?.[this.form.pricingMethod] || "价格";
    },
    // 获取计价方式
    getPricingMethod() {
      return key => key ? PRICING_METHOD[key] : "";
    },

    // 处理计价方式
    getPricingMethodOption() {
      return _keys(PRICING_METHOD).map(key => {
        return {
          value: key,
          name: PRICING_METHOD[key],
        };
      });
    },

    // 结算数量
    getQuantityLabel() {
      return {priceCommission: "金额"/* , dailyRate: "天数" */}?.[this.form.pricingMethod] || "数量";
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="添加生产结算">
    <view class="ko-wage-popup">
      <UniForms :model="form" label-align="right" ref="FormRef" label-width="80px">
        <UniFormsItem required label="员工">
          <PickerUser
            style="width: 100%;"
            placeholder="请选择员工"
            is-input
            title="选择员工"
            v-model="form.staffId"
            type="staff"
            is-confirm
            ref="UserRef"
            no-safe-bottom
            :placeholder-label="name"
          />
        </UniFormsItem>

        <uni-forms-item
          label="名称"
          name="name"
          :rules="[{required: true, errorMessage: '请输入名称'}]"
          required
        >
          <uni-easyinput v-model="form.name" placeholder="请输入名称" />
        </uni-forms-item>
        <uni-forms-item label="图片" name="images">
          <FilePicker
            v-model="form.images"
            :image-styles="{width: '100px',height: '100px'}"
          />
        </uni-forms-item>
        <uni-forms-item label="计价方式" name="pricingMethod">
          <PickerSheet
            :options="getPricingMethodOption"
            style="width: 100%"
            v-model="form.pricingMethod"
            @change="form.price = 0"
          />
        </uni-forms-item>
        <uni-forms-item
          :label="getPriceLabel"
          name="price"
          :required="form.pricingMethod && form.pricingMethod !== 'none'"
        >
          <uni-easyinput
            type="digit"
            v-model="form.price"
            placeholder="请输入"
          />
        </uni-forms-item>
        <uni-forms-item
          :label="getQuantityLabel"
          name="price"
          v-if="!['none', 'commission'].includes(form.pricingMethod)"
          :required="form.pricingMethod && form.pricingMethod !== 'none'"
        >
          <uni-easyinput
            type="digit"
            v-model="form.quantity"
            placeholder="请输入"
          />
        </uni-forms-item>
        <uni-forms-item label="描述" name="description">
          <uni-easyinput type="textarea" v-model="form.description" placeholder="请输入" />
        </uni-forms-item>
      </UniForms>
    </view>
    <template #footer>
      <view style="display: flex; justify-content: center; align-items: center;">
        <button
          class="ko-basic-button__card"
          style="width: 120px;"
          @click.stop="onSubmit"
          :loading="sLoading"
          :disabled="sLoading"
        >
          提交
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-wage-popup {
  width: 90vw;
  padding: 16px 16px 0;
}

// #ifdef H5
.ko-wage-popup {
  width: 600px;
}
// #endif
</style>
