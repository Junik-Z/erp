<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { CustomToast } from "@/utils";
import { addSubsidyApi, editSubsidyApi, removeSubsidyApi } from "@/api/erp/produce";
import mixins from "@/mixins/mixins";

export default {
  name: "SubsidyPopup",
  data() {
    return {
      visible: false,
      loading: false,
      sLoading: false,

      form: {
        amount: null,
      },

      isEdit: false,
    };
  },
  components: {
    UniForms,
    UniFormsItem,
    UniEasyinput,
    BasicPopup,
  },
  mixins: [mixins],
  methods: {
    open(isEdit, query) {
      this.isEdit = isEdit;
      this.form = query;
      this.visible = true;
    },

    // 处理提交补贴
    onSubmit() {
      const {amount} = this.form;

      if (!amount || amount < 0) {
        CustomToast({title: "补贴金额不能小于0", icon: "none"});
        return false;
      }
      const Func = this.isEdit ? editSubsidyApi : addSubsidyApi;
      this.sLoading = true;
      Func({
        ...this.form,
        amount: this.toFen(amount),
      })
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
        content: "您确定要删除该补贴吗？",
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
      return this.isEdit ? "修改补贴金额" : "添加补贴金额";
    },
  },

};
</script>

<template>
  <BasicPopup :visible.sync="visible" :title="header">
    <view class="ko-subsidy-popup">
      <UniForms :model="form" label-align="right" ref="FormRef" label-width="110px">
        <UniFormsItem label-width="120" required label="补贴金额">
          <UniEasyinput v-model="form.amount" placeholder="请输入补贴金额" type="digit" />
        </UniFormsItem>
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
.ko-subsidy-popup {
  width: 90vw;
  padding: 16px 16px 0;
}


// #ifdef H5
.ko-subsidy-popup {
  width: 600px;
}
// #endif
</style>
