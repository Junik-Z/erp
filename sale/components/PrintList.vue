<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getPrintListApi } from "@/api/admin";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _isEmpty } from "@/utils";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

export default {
  name: "PrintList",
  components: {UvLoadingIcon, BasicCard, BasicPopup},
  data() {
    return {
      list: {/* ss: ["xx", "xsss"] */},
      visible: false,
      params: {},
      loading: false,
      sessionId: "",
      printerName: "",
    };
  },

  methods: {
    open(params) {
      this.visible = true;
      this.params = params;
      this.sessionId = "";
      this.printerName = "";

      this.loading = true;
      getPrintListApi({pageSize: 1000, pageNum: 0})
        .finally(() => {
          setTimeout(() => {
            getPrintListApi({pageSize: 1000, pageNum: 0})
              .then(res => {
                console.log(res.data);
                this.list = res.data;
              })
              .finally(() => {
                this.loading = false;
              });
          }, 3500);
        });
    },

    onSubmit() {
      this.$emit("submit", {...this.params, sessionId: this.sessionId, printerName: this.printerName});
      this.visible = false;
    },

    onChecked(sessionId, printerName) {
      this.sessionId = sessionId;
      this.printerName = printerName;
    },
  },

  computed: {
    isDisabled() {
      return _isEmpty(this.list);
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="选择打印机">
    <view class="ko-print-list">
      <view class="ko-print-list__loading" v-if="loading">
        <UvLoadingIcon :size="40" vertical text="正在与打印机建立连接，请稍候..." />
      </view>

      <template v-for="(item, key) in list">
        <BasicCard v-for="child in item" :key="child" :spacing="10">
          <button class="ko-print-list__item" @click.stop="onChecked(key, child)">
            <radio :checked="printerName === child" style="transform:scale(0.9)" color="#256eff" />
            <text>
              {{ child }}
            </text>
          </button>
        </BasicCard>
      </template>

      <view v-if="!loading && isDisabled" class="ko-print-list__loading" style="color: #999;">没有可用的打印机</view>
    </view>

    <template #footer>
      <view class="ko-print-list__footer">
        <button style="width: 120px;" :disabled="isDisabled" class="ko-basic-button__card" @click="onSubmit">
          打印
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-print-list {
  // #ifdef MP
  width: 96vw;
  // #endif
  padding: 10px;
  position: relative;
  min-height: 140px;

  &__item {
    padding: 0;
    text-align: left;
    height: 36px;
    line-height: 36px;

    text {
      padding-left: 10px;
    }
  }

  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 7;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__footer {
    padding: 0 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

}
</style>
