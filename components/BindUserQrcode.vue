<script>
import mixins from "@/mixins/mixins";
import { customerCodeApi, staffCodeApi, supplierCodeApi } from "@/api/user";

export default {
  name: "BindUserQrcode",
  props: {
    title: {
      type: String,
      default: "绑定二维码",
    },
  },
  data() {
    return {
      visible: false,
      image: "",
      orderCode: null,
      loading: false,

      type: "",
      node: null,
    };
  },
  mixins: [mixins],
  methods: {
    open(q, type) {
      this.image = "";
      this.node = q;
      this.type = type;
      this.visible = true;
      this.getList();
    },

    // 获取二维码
    getList() {
      this.loading = true;
      const Func = {
        client: customerCodeApi,
        supplier: supplierCodeApi,
        staff: staffCodeApi,
      }[this.type];

      const key = {client: "customerId", supplier: "supplierId", staff: "staffId"}[this.type];

      Func({[key]: this.node.value})
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
    <view class="ko-bind-user-qrcode">
      <uv-loading-icon v-if="loading" size="30" />

      <view class="ko-bind-user-qrcode__wrap">
        <image
          v-if="qrcode && !loading"
          class="ko-bind-user-qrcode__image"
          :src="qrcode"
          mode="aspectFill"
          show-menu-by-longpress
          lazy-load
        />

        <view
          v-if="qrcode && !loading"
          class="ko-bind-user-qrcode__tis"
        >
          二维码10分钟内有效，请注意时间。
        </view>
      </view>
    </view>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-bind-user-qrcode {
  display: flex;
  justify-content: center;
  align-items: center;

  &__tis {
    font-size: 12px;
    text-align: center;
    color: #f29e99;
    margin-top: 16px;
  }

  &__wrap {
    display: flex;
    flex-direction: column;
  }
}

/* #ifdef MP */
.ko-bind-user-qrcode {
  width: 98vw;
  min-height: 98vw;

  &__image {
    height: 90vw;
    width: 90vw;
  }
}

/* #endif */

/* #ifdef H5 */
.ko-bind-user-qrcode {
  width: 500px;
  min-height: 500px;

  &__image {
    height: 480px;
    width: 480px;
  }
}

/* #endif */
</style>
