<script>
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import { advertisingBusinessesApi } from "@/api/admin";
import { _deepCopy, showToast } from "@/utils";
import mixins from "@/mixins/mixins";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

export default {
  name: "Store",
  components: {UniEasyinput, UniFormsItem, UniSection, UniForms},
  mixins: [mixins],
  data() {
    return {
      form: {
        "produceEnable": true,
        "deliveryEnable": true,
        "ticketTailContent": "",
      },
      loading: false,
    };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      advertisingBusinessesApi(this.form)
        .then(() => {
          uni.$emit("$__update_config_info__");
          showToast({
            title: "更新成功",
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onChangeSwitch(event, key) {
      this.form[key] = event.detail.value;
    },
  },
  onShow() {
    this.form = _deepCopy(this.GET_CONFIG_INFO);
  },
};
</script>

<template>
  <view class="ko-store">
    <UniForms label-width="100" label-align="right">
      <UniSection title="功能设置" type="line">
        <view style="padding-left: 20px;">
          <UniFormsItem label="生产模块：">
            <switch
              style="transform:scale(0.7)"
              :checked="form.produceEnable"
              @change="onChangeSwitch($event, 'produceEnable')"
            />
          </UniFormsItem>
          <UniFormsItem label="物流模块：">
            <switch
              style="transform:scale(0.7)"
              :checked="form.deliveryEnable"
              @change="onChangeSwitch($event, 'deliveryEnable')"
            />
          </UniFormsItem>
        </view>
      </UniSection>
      <UniSection title="单据设置" type="line">
        <view style="padding-left: 20px;">
          <UniFormsItem label="票据尾部内容：">
            <UniEasyinput
              type="textarea"
              v-model="form.ticketTailContent"
              placeholder="请输入"
            />
          </UniFormsItem>
        </view>
      </UniSection>
    </UniForms>

    <view style="padding: 50px;">
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
.ko-store {
  width: 100%;
  padding: 20px 10px;
}
</style>
