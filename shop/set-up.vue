<script>
import { getConfigApi } from "@/api/user";
import mixins from "@/mixins/mixins";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { advertisingBusinessesApi, generateQRCodeApi } from "@/api/admin";
import { _deepCopy, _isEqual, CustomToast } from "@/utils";
import { PageEnums } from "@/utils/config";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import Draw from "./Draw.vue";

export default {
  name: "SetUp",
  mixins: [mixins],
  components: {BasicPopup, UniEasyinput, UniFormsItem, UniSection, UniForms, FilePicker, Draw},
  data() {
    return {
      form: {
        "ticketTailContent": "",
        "logo": "",
        "merchantBgImg": "",
        "merchantAddress": "",
        "merchantPhone": "",
        "merchantProfile": "",
        enableShop: false,
      },

      qrCode: "",
      visible: false,
      loading: false,

      logo: "",
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    // 获取配置信息
    getList() {
      getConfigApi()
        .then((res) => {
          const data = res.data;
          this.form = data;
          this.logo = _deepCopy(data.logo);
          this.$store.dispatch("setConfigInfoAsync", data);
          if (this.form.enableShop) this.generateQRCode();
        });
    },
    // 提交配置
    onSubmit() {
      this.loading = true;
      advertisingBusinessesApi(this.form)
        .then(() => {
          CustomToast({title: "更新成功"});
          this.getList();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 开关
    onChangeSwitch(event, key) {
      this.$set(this.form, key, event.detail.value);

      if (_isEqual(key, "enableShop") && event.detail.value) {
        this.generateQRCode();
      }
      console.log(this.form);
    },

    // 预览店铺
    onPreview() {
      uni.navigateTo({
        url: PageEnums.shopping + "?isPreview=true",
      });
    },

    // 生产网店二维码
    generateQRCode() {
      this.gLoading = true;
      generateQRCodeApi()
        .then(res => {
          this.qrCode = res.data;
          // this.visible = true;
        })
        .finally(() => {
          this.gLoading = false;
        });
    },
  },
};
</script>

<template>
  <view class="ko-shop-up ko-basic-added-form">
    <UniForms label-width="90px" label-align="right">

      <view class="ko-shop-up__header">
        <view class="ko-shop-up__header--info">
          <switch
            style="transform:scale(1.2)"
            :checked="form.enableShop"
            @change="onChangeSwitch($event, 'enableShop')"
          />
          <view
            class="ko-shop-up__header--info--text"
            :class="{'is-active': form.enableShop}"
            @click="generateQRCode"
          >
            {{ form.enableShop ? "启用" : "关闭" }}店铺
          </view>
        </view>

        <!-- #ifdef MP -->
        <button :disabled="!form.enableShop" class="ko-basic-button__card" @click.stop="onPreview">预览店铺</button>
        <!-- #endif -->
      </view>

      <view v-if="form.enableShop" class="ko-shop-up__qr-code ko-generate-qr">
        <view class="ko-generate-qr__wrap">
          <view class="ko-generate-qr__code">
            <image
              mode="aspectFill"
              :src="getImageUrl(qrCode)"
              class="ko-generate-qr__code--image"
              show-menu-by-longpress
              style="z-index: 99;"
              lazy-load
              v-if="false"
            />
            <Draw :code="qrCode" :avatar="logo ? getImageUrl(logo) : ''" />
          </view>

          <view class="ko-generate-qr__wrap--line"></view>
        </view>
        <!-- <image
           class="ko-shop-up__qr-code&#45;&#45;image"
           :src="getImageUrl(qrCode)"
           mode="aspectFill"
           show-menu-by-longpress
           lazy-load
         />-->
      </view>

      <UniSection title="店铺信息" type="line">
        <view>
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


    </UniForms>

    <view class="ko-shop-up__footer">
      <button
        class="ko-basic-button__card"
        @click="onSubmit"
        :loading="loading"
        :disabled="loading"
      >
        保存
      </button>
    </view>

    <BasicPopup :visible.sync="visible" title="店铺二维码">
      <view class="ko-shop-up__popup">
        <view class="ko-shop-up__popup--qrcode" v-if="qrCode">
          <image
            class="ko-shop-up__popup--qrcode--image"
            :src="getImageUrl(qrCode)"
            mode="aspectFill"
            show-menu-by-longpress
            lazy-load
          />
        </view>

        <button
          class="ko-basic-button__card"
          style="margin: 0 40px 10px;"
          @click="visible = false"
          v-if="false"
        >
          关闭
        </button>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">

$borderRadius: 30rpx;

@keyframes ClipPath {
  0%,
  100% {
    clip-path: inset(0 0 98% 0);
  }
  25% {
    clip-path: inset(0 98% 0 0);
  }
  50% {
    clip-path: inset(98% 0 0 0);
  }
  75% {
    clip-path: inset(0 0 0 98%);
  }
}

.ko-shop-up {
  padding: 20px 10px;

  &__header {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &--info {
      display: flex;
      align-items: center;

      &--text {
        margin-left: 10px;
        color: #c7c9ce;

        &.is-active {
          color: #2A79FF;
        }
      }
    }
  }

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

  &__popup {
    // #ifdef MP
    width: 98vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;

    &--qrcode {
      // #ifdef MP
      width: calc(98vw - 16px * 2);
      height: calc(98vw - 16px * 2);
      // #endif
      margin-bottom: 10px;

      &--image {
        height: 100%;
        width: 100%;
      }
    }
  }

  // #ifdef H5
  &__popup {
    width: 600px;

    &--qrcode {
      width: calc(600px - 16px * 2);
      height: calc(600px - 16px * 2);
    }

  }

  // #endif
}


.ko-generate-qr {
  display: flex;
  justify-content: center;
  align-items: center;

  &__code {
    width: 100%;
    height: 100%;
    /* display: flex;
     justify-content: center;
     align-items: center;*/

    &--image {
      width: var(--image-size);
      height: var(--image-size);
      border-radius: $borderRadius;
    }
  }

  &__wrap {
    // #ifdef MP
    --image-size: 90vw;
    // #endif

    width: calc(var(--image-size) + 20px);
    height: calc(var(--image-size) + 20px);

    display: flex;
    flex-direction: row;
    aspect-ratio: 1;
    opacity: 1;
    border-radius: $borderRadius;
    background: white;
    box-shadow: 0 0 20rpx #00000022;
    position: relative;

    /*&--line {
      position: absolute;
      text-align: center;
      font-size: 24px;
      border-radius: 15px;
      transition: all .3s;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;

      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 2px solid rgb(90, 90, 90);
        transition: all .5s;
        border-radius: $borderRadius;
        animation: ClipPath 3s infinite linear;
      }

      &::after {
        animation: ClipPath 3s infinite -1.5s linear;
      }
    }*/
  }

  // #ifdef H5
  &__wrap {
    --image-size: 400px;
  }

  // #endif
}
</style>
