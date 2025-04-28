<script>
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import mixins from "@/mixins/mixins";
import { _deepCopy, CustomToast } from "@/utils";
import { editSubsidyApi, removeSubsidyApi } from "@/api/erp/produce";
import { addedCostApi } from "@/api/erp/finance";
import FilePicker from "@/components/FilePicker/FilePicker.vue";

export default {
  name: "WagePopup",
  data() {
    return {
      visible: false,
      loading: false,
      sLoading: false,
      form: {
        name: "",
        totalAmount: null,
        personId: "",
        voucher: "",
        remark: "",
        classId: "wages",
      },
      isEdit: false,
    };
  },

  components: {
    UniForms,
    UniFormsItem,
    UniEasyinput,
    BasicPopup,

    FilePicker,
  },

  mixins: [mixins],

  methods: {
    open(isEdit, query) {
      this.isEdit = isEdit;
      this.form = _deepCopy(this.$options.data().form);

      if (isEdit) {
        this.form = {...query};
      }

      this.form.personId = query.staffId;
      this.visible = true;
    },

    // 处理提交补贴
    onSubmit() {
      const Func = this.isEdit ? editSubsidyApi : addedCostApi;
      this.sLoading = true;
      const P = _deepCopy(this.form);

      const q = {
        ...P,
        ...(this.isEdit ? {amount: this.toFen(P.amount)} : {totalAmount: this.toFen(P.totalAmount)}),
      };

      Func(q)
        .then(() => {
          CustomToast({title: `${this.isEdit ? "修改" : "添加"}成功`});
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
        content: "您确定要删除该工资吗？",
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
    header() {
      return this.isEdit ? "修改员工工资" : "添加员工工资";
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" :title="header">
    <view class="ko-wage-popup">
      <UniForms :model="form"  label-align="right" ref="FormRef" label-width="110px" >
        <UniFormsItem v-if="isEdit" label="金额：" required name="amount">
          <UniEasyinput type="digit" v-model="form.amount" placeholder="请输入" />
          <text style="margin-left: 10px;">元</text>
        </UniFormsItem>

        <block v-if="!isEdit">
          <UniFormsItem label="款项名称：" required name="name">
            <UniEasyinput v-model="form.name" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="金额：" required name="totalAmount">
            <UniEasyinput type="digit" v-model="form.totalAmount" placeholder="请输入" />
            <text style="margin-left: 10px;">元</text>
          </UniFormsItem>
          <UniFormsItem label="凭证：" name="voucher">
            <FilePicker v-model="form.voucher" />
          </UniFormsItem>
          <UniFormsItem label="备注：">
            <UniEasyinput type="textarea" v-model="form.remark" placeholder="请输入" />
          </UniFormsItem>
        </block>
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
