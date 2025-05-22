<script>
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import { advertisingBusinessesApi } from "@/api/admin";
import { CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { getConfigApi } from "@/api/user";
import FilePicker from "@/components/FilePicker/FilePicker.vue";

export default {
  name: "Store",
  components: {UniEasyinput, UniFormsItem, UniSection, UniForms, FilePicker},
  mixins: [mixins],
  data() {
    return {
      form: {
        "produceEnable": true,
        "deliveryEnable": true,
        "ticketTailContent": "",
        "logo": "",
        "merchantBgImg": "",
        "merchantAddress": "",
        "merchantPhone": "",
        "merchantProfile": "",
      },
      loading: false,
    };
  },
  methods: {
    getList() {
      getConfigApi()
        .then((res) => {
          this.form = res.data;
        });
    },

    onSubmit() {
      this.loading = true;
      advertisingBusinessesApi(this.form)
        .then(() => {
          CustomToast({
            title: "更新成功",
          });
          uni.$emit("$__update_config_info__");
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onChangeSwitch(event, key) {
      this.form[key] = event.detail.value;
    },
  },
  onLoad() {
    this.getList();
  },
};
</script>

<template>
  <view class="ko-store ko-basic-added-form">
    <UniForms label-width="70px" label-align="right">
      <UniSection title="店铺信息" type="line" v-if="false">
        <view style="padding-left: 20px;">
          <UniFormsItem label="LOGO">
            <FilePicker
              v-model="form.logo"
              :image-styles="{border: {radius: '6px'}, width: 100, height: 100}"
            />
          </UniFormsItem>
          <UniFormsItem label="背景图">
            <FilePicker
              v-model="form.merchantBgImg"
              :image-styles="{border: {radius: '6px'}, width: 160, height: 100}"
            />
          </UniFormsItem>
          <UniFormsItem label="商户地址">
            <UniEasyinput
              v-model.trim="form.merchantAddress"
              placeholder="请输入"
            />
          </UniFormsItem>
          <UniFormsItem label="联系电话">
            <UniEasyinput
              v-model.trim="form.merchantPhone"
              placeholder="请输入"
            />
          </UniFormsItem>
          <UniFormsItem label="简介">
            <UniEasyinput
              type="textarea"
              v-model.trim="form.merchantProfile"
              placeholder="请输入"
            />
          </UniFormsItem>
        </view>
      </UniSection>


      <!-- <UniSection title="功能设置" type="line">
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
       </UniSection>-->
      <UniSection title="单据设置" type="line">
        <view style="padding-left: 20px;">
          <UniFormsItem label="票据尾部内容" label-width="110px">
            <UniEasyinput
              type="textarea"
              v-model.trim="form.ticketTailContent"
              placeholder="请输入"
            />
          </UniFormsItem>
        </view>
      </UniSection>
    </UniForms>

    <view class="ko-store__footer">
      <button
        class="ko-basic-button__card"
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
  padding: 20px 10px;

  &__footer {
    padding: 50px;
    display: flex;
    justify-content: center;

    .ko-basic-button__card {
      width: 120px;
    }

    /* #ifdef H5 */
    .ko-basic-button__card {
      width: 260px;
    }

    /* #endif */
  }
}
</style>
