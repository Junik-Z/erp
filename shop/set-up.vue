<script>
import { getConfigApi } from "@/api/user";
import mixins from "@/mixins/mixins";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { advertisingBusinessesApi, generateQRCodeApi, generateSupplyQRCodeApi, getPaySettingApi } from "@/api/admin";
import { _deepCopy, _isEqual, CustomToast } from "@/utils";
import { PageEnums } from "@/utils/config";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import Draw from "./Draw.vue";
import MSwitch from "@/pages/index/MSwitch.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import Recommend from "./recommend.vue";

export default {
  name: "SetUp",
  mixins: [mixins],
  components: {
    MSwitch,
    BasicPopup,
    UniEasyinput,
    UniSection,
    FilePicker,
    Draw,
    UniSegmentedControl,
    Recommend,
  },
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
      pTitle: "店铺二维码",

      paySetting: false,

      dVisible: false,
      gDLoading: false,
      dQrCode: "",

      current: 0,
    };
  },
  async onLoad() {
    await this.getList();
    await this.getPayStatus();
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
          // if (this.form.enableShop) this.generateQRCode();
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

      /*  if (_isEqual(key, "enableShop") && event.detail.value) {
         this.generateQRCode();
       } */
      console.log(this.form);
    },

    // 预览店铺
    onPreview() {
      uni.navigateTo({
        url: PageEnums.shopping + "?isPreview=true",
      });
    },

    // 生成网店二维码
    generateQRCode() {
      this.visible = true;
      this.qrCode = "";

      this.gLoading = true;
      generateQRCodeApi()
        .then(res => {
          this.qrCode = res.data;
        })
        .finally(() => {
          this.gLoading = false;
          setTimeout(() => {
            this.$refs.DRef && this.$refs.DRef.drawQRCode();
          }, 500);
        });
    },

    // 生成供应连二维码
    generateSupplyQRCode() {
      this.dVisible = true;
      this.dQrCode = "";

      this.gDLoading = true;
      generateSupplyQRCodeApi()
        .then(res => {
          this.dQrCode = res.data;
        })
        .finally(() => {
          this.gDLoading = false;
          setTimeout(() => {
            this.$refs.DDRef && this.$refs.DDRef.drawQRCode();
          }, 500);
        });
    },

    // 前往卖场
    toHypermarket() {
      uni.navigateTo({
        url: PageEnums.hypermarket,
      });
    },

    // 开启关闭支付
    onAsyncChange(event) {
      console.log(event);
      uni.showModal({
        title: event ? "支付功能开通提示" : "支付功能关闭提示",
        content: "该功能需联系业务专员完成权限配置。",
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
          }
        },
      });
    },

    // 获取店铺支付状态
    getPayStatus() {
      getPaySettingApi()
        .then(res => {
          this.paySetting = _isEqual(res.data, "PAY");
        });
    },

    // 设置推荐/活动 商品
    onRecommend(type) {
      uni.navigateTo({
        url: PageEnums.setRecommend + `?type=${type}`,
      });
    },
  },
};
</script>

<template>
  <view class="ko-shop-up ko-basic-added-form">
    <view class="ko-shop-up__tabs">
      <UniSegmentedControl
        :values="['店铺', '店铺信息', '活动商品', '推荐商品']"
        :current.sync="current"
      />
    </view>

    <uv-form :model="form" label-width="90px" label-align="right">
      <block v-if="isEqual(current, 0)">
        <UniSection title="店铺开关" type="line">
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
              >
                {{ form.enableShop ? "启用" : "关闭" }}店铺
              </view>


              <button
                v-if="form.enableShop"
                class="ko-basic-button__card"
                style="margin-left: 10px;"
                @click.stop="generateQRCode"
              >
                <view style="display: flex; align-items: center; justify-content: center;">
                  <i style="margin-right: 2px; font-size: 13px" class="iconfont icon-erweima"></i>
                  二维码
                </view>
              </button>
            </view>

            <!-- #ifdef MP -->
            <button class="ko-basic-button__card" @click.stop="onPreview">前往店铺</button>
            <!-- #endif -->
          </view>
        </UniSection>

        <UniSection title="供应链开关" type="line">
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
              >
                {{ form.enableShop ? "启用" : "关闭" }}供应链
              </view>
              <button
                v-if="form.enableShop"
                class="ko-basic-button__card"
                style="margin-left: 10px;"
                @click.stop="generateSupplyQRCode"
              >
                <view style="display: flex; align-items: center; justify-content: center;">
                  <i style="margin-right: 2px; font-size: 13px" class="iconfont icon-erweima"></i>
                  二维码
                </view>
              </button>
            </view>

            <!-- #ifdef MP -->
            <button class="ko-shop-up__hypermarket" @click.stop="toHypermarket">
              <uv-image
                width="24px"
                height="24px"
                shape="square"
                lazy-load
                radius="3px"
                :custom-style="{marginRight: '4px'}"
                src="data:image/png;base64,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"
              />

              供应链
            </button>
            <!-- #endif -->
          </view>
        </UniSection>

        <UniSection title="支付开关" type="line">
          <uv-form-item label="开启支付：">
            <uv-switch
              async-change
              v-model="paySetting"
              @change="onAsyncChange"
            />
          </uv-form-item>
        </UniSection>
      </block>

      <block v-if="isEqual(current, 1)">
        <UniSection title="店铺信息" type="line">
          <view>
            <uv-form-item label="Logo：">
              <FilePicker
                v-model="form.logo"
                :image-styles="{border: {radius: '6px'}, width: 100, height: 100}"
              />
            </uv-form-item>
            <uv-form-item label="背景图：">
              <FilePicker
                v-model="form.merchantBgImg"
                :image-styles="{border: {radius: '6px'}, width: 160, height: 100}"
              />
            </uv-form-item>
            <uv-form-item label="商户地址：">
              <uv-input
                v-model.trim="form.merchantAddress"
                placeholder="请输入"
              />
            </uv-form-item>
            <uv-form-item label="联系电话：">
              <uv-input
                v-model.trim="form.merchantPhone"
                placeholder="请输入"
                type="number"
              />
            </uv-form-item>
            <uv-form-item label="简介：">
              <uv-textarea
                v-model.trim="form.merchantProfile"
                placeholder="请输入"
              />
            </uv-form-item>
          </view>
        </UniSection>
      </block>

      <block v-if="isEqual(current, 2)">
        <UniSection title="活动商品" type="line">
          <Recommend type="activity" />
        </UniSection>
      </block>

      <block v-if="isEqual(current, 3)">
        <UniSection title="推荐商品" type="line">
          <Recommend type="recommend" />
        </UniSection>
      </block>

      <!--  <UniSection title="活动商品" type="line">
          <view style="display: flex; align-items: center;">
            <button class="ko-basic-button__card" @click="onRecommend('activity')">设置</button>
          </view>
        </UniSection>

        <UniSection title="推荐商品" type="line">
          <view style="display: flex; align-items: center;">
            <button class="ko-basic-button__card" @click="onRecommend('recommend')">设置</button>
          </view>
        </UniSection>-->
    </uv-form>

    <view class="ko-shop-up__footer" v-if="current < 2">
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
        <view class="ko-shop-up__qr-code ko-generate-qr">
          <view class="ko-generate-qr__wrap">
            <view class="ko-generate-qr__code">
              <!--<image
                mode="aspectFill"
                :src="getImageUrl(qrCode)"
                class="ko-generate-qr__code&#45;&#45;image"
                show-menu-by-longpress
                style="z-index: 99;"
                lazy-load
                v-if="false"
              />-->
              <Draw ref="DRef" :code="qrCode" :avatar="logo ? getImageUrl(logo) : ''" />
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
      </view>
    </BasicPopup>

    <BasicPopup :visible.sync="dVisible" title="供应链二维码">
      <view class="ko-shop-up__popup">
        <view class="ko-shop-up__qr-code ko-generate-qr">
          <view class="ko-generate-qr__wrap">
            <view class="ko-generate-qr__code">
              <Draw ref="DDRef" :code="dQrCode" :avatar="logo ? getImageUrl(logo) : ''" />
            </view>
          </view>
        </view>
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

@keyframes gradient {
  0% {
    background-position: 0 50%
  }

  50% {
    background-position: 100% 50%
  }

  100% {
    background-position: 0 50%
  }
}

@keyframes shine {
  0% {
    transform: rotate(45deg) translateX(-150%)
  }

  100% {
    transform: rotate(45deg) translateX(150%)
  }
}

@keyframes particle {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(0)
  }

  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(1)
  }
}

.ko-shop-up {
  padding: 10px;

  &__header {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &--info {
      display: flex;
      align-items: center;

      &--text {
        margin-left: 10px;
        color: #c7c9ce;
        white-space: nowrap;

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

  &__hypermarket {
    width: auto;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    animation: gradient 8s linear infinite;
    box-shadow: 0 0 35px rgba(0, 255, 252, 0.2);
    color: #333;
    background: linear-gradient(45deg, rgba(0, 255, 252, 0.1), rgba(252, 0, 255, 0.1), rgba(0, 255, 252, 0.1));
    background-size: 400%;
    white-space: nowrap;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: rotate(45deg);
      transition: .5s;
      animation: shine 3s linear infinite;
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
    //box-shadow: 0 0 20rpx #00000022;
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
