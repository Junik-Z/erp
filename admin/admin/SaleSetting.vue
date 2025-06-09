<script>
import mixins from "@/mixins/mixins";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { _deepCopy } from "@/utils";
import { getSettingApi, saleSettingApi } from "@/api/user";

export default {
  name: "SaleSetting",
  components: {
    FilePicker,
  },
  mixins: [mixins],
  data() {
    return {
      form: {
        banner: [],
        head: "",
      },
      rules: {},
      sLoading: false,
    };
  },
  created() {
    this.getInfo();
  },
  methods: {
    getInfo() {
      getSettingApi()
        .then(res => {
          const data = res.data || {};
          data.banner = data.banner ? (data.banner || "").split(",") : [];
          this.form = data;
        });
    },

    onSubmit() {
      this.$refs.FRef.validate()
        .then(() => {
          const params = _deepCopy(this.form);
          params.banner = params.banner.join(",");
          this.sLoading = true;

          saleSettingApi({...params})
            .then(() => {
              uni.showToast({title: "操作成功"});
            })
            .finally(() => {
              this.sLoading = false;
            });
        });
    },
  },
  mounted() {
  },
};
</script>

<template>
  <view class="ko-sale-setting">
    <uv-form
      :model="form"
      :rules="rules"
      :label-width="80"
      label-align="right"
      ref="FRef"
    >
      <uv-form-item label="head：" prop="head">
        <FilePicker
          v-model="form.head"
          :image-styles="{border: {radius: '6px'}, width: 84, height: 84}"
        />
      </uv-form-item>
      <uv-form-item label="banner：" prop="banner">
        <FilePicker
          v-model="form.banner"
          :image-styles="{border: {radius: '6px'}, width: 100, height: 100}"
          :limit="9"
          file-extname="png,jpg,jpeg"
          show-update-list
          return-type="array"
        />
      </uv-form-item>
    </uv-form>

    <view style="display: flex; align-items: center; justify-content: center; margin-top: 30px;">
      <button
        class="ko-basic-button__card"
        style="width: 120px"
        @click="onSubmit"
        :loading="sLoading"
        :disabled="sLoading"
      >
        提交
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-sale-setting {
  width: 100%;
  padding: 20px;
}

// #ifdef H5
.ko-sale-setting {
  width: 1024px;
  margin: 0 auto;
}
// #endif
</style>
