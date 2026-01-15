<script>
import mixins from "@/mixins/mixins";
import { getSaleOrderCodeApi } from "@/api/erp/produce";

export default {
  name: "GenerateCode",
  props: {
    title: {
      type: String,
      default: "扫一扫查看订单信息",
    },
  },
  data() {
    return {
      visible: false,

      image: "",
      orderCode: null,

      loading: false,
    };
  },
  mixins: [mixins],
  methods: {
    open(orderCode) {
      this.image = "";
      this.orderCode = orderCode;
      this.visible = true;

      this.getList();
    },

    // 获取二维码
    getList() {
      this.loading = true;
      getSaleOrderCodeApi({orderCode: this.orderCode})
        .then(res => {
          this.image = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    qrcode() {
      return `data:image/png;base64,${this.image}`;
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" :title="title">
    <view class="ko-generate-code">
      <uv-loading-icon v-if="loading" size="30" />

      <image
        v-if="qrcode && !loading"
        class="ko-generate-code__image"
        :src="qrcode"
        mode="aspectFill"
        show-menu-by-longpress
        lazy-load
      />
    </view>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-generate-code {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* #ifdef MP */
.ko-generate-code {
  width: 98vw;
  height: 98vw;

  &__image {
    height: 90vw;
    width: 90vw;
  }
}

/* #endif */

/* #ifdef H5 */
.ko-generate-code {
  width: 500px;
  height: 500px;

  &__image {
    height: 480px;
    width: 480px;
  }
}

/* #endif */
</style>
