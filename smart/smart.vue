<script>
import mixins from "@/mixins/mixins";
import UserMsg from "./components/UserMsg.vue";
import AiMsg from "./components/AiMsg.vue";
import { PageEnums } from "@/utils/config";
import AudioMixins from "./utils/AudioMixins";
import MicBtn from "./components/MicBtn.vue";

export default {
  name: "Smart",
  components: {
    UserMsg,
    AiMsg,
    MicBtn,
  },
  mixins: [mixins, AudioMixins],
  data() {
    return {
      scrollTop: 0,
      mBRect: null,
      isMsg: false,
    };
  },
  methods: {
    // 处理文字变化
    onChange() {
      this.scrollTop += 1;
    },

    // 文本输入完毕时触发
    onComplete() {
      this.askLoading = false;
    },

    // 直接跳转到底部
    onToEnd() {
      this.scrollTop += (this.scrollTop || 999);
    },

    // 返回上一级
    onBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({url: PageEnums.home});
        },
      });
    },
  },
  computed: {
    // 胶囊的样式
    rootStyles() {
      const rect = this.mBRect || {};
      return {
        "--m-top": `${rect.top || 51}px`,
        "--m-height": `${rect.height || 32}px`,
        "--m-right": `${rect.right}px`,
        ...this.styles,
      };
    },
  },
  mounted() {
    this.mBRect = uni.getMenuButtonBoundingClientRect();
  },
};
</script>

<template>
  <view class="ko-smart" :style="[rootStyles]">

    <view class="ko-smart__wrap">
      <view class="ko-smart__header">
        <view class="ko-smart__header--wrap">
          <button class="ko-smart__header--button" @click.stop="onBack">
            <uni-icons type="left" color="#333" size="20" />
          </button>

          <button class="ko-smart__header--title" v-if="false">
            小哪吒
          </button>
        </view>
      </view>

      <scroll-view
        scroll-y="true"
        class="ko-smart__scroll"
        :scroll-top="scrollTop"
        scroll-with-animation
      >
        <view class="ko-smart__scroll--wrap">
          <view class="ko-smart__chat">
            <block v-for="item of msgList" :key="item.__id__">
              <view v-if="isEqual(item.type, 'user')">
                <UserMsg :item="item" />
              </view>
              <view v-if="isEqual(item.type, 'ai')">
                <AiMsg
                  :item="item"
                  @change="onChange"
                  @complete="onComplete"
                  @to-end="onToEnd"
                />
              </view>
              <view style="height: 10px;"></view>
            </block>
          </view>
        </view>
      </scroll-view>

      <view class="ko-smart__footer">
        <view class="ko-smart__operate" :class="{'is-cancel': isCancel}">
          <button class="ko-smart__btn-def ko-smart__input">
            <uni-icons size="24px" type="paperplane" color="#CCD8D9" />
          </button>

          <view class="ko-smart__mic">
            <MicBtn />
          </view>


          <button class="ko-smart__btn-def ko-smart__close">
            <uni-icons size="24px" type="closeempty" color="#CCD8D9" />
          </button>


          <!-- 打字聊天 -->
          <block v-if="isMsg && false">
            <view class="ko-smart__letter">
              <input
                v-model="msg"
                placeholder="发消息..."
                class="ko-smart__letter--input"
                confirm-type="send"
                @confirm="aiTextAsk(msg)"
                cursor-spacing="20"
                maxlength="-1"
                :disabled="askLoading"
              >

              <button
                class="ko-smart__letter--submit ko-basic-button__card"
                @click.stop="toVoice"
                :disabled="askLoading"
                :loading="askLoading"
              >
                <uni-icons type="mic" color="#fff" />
              </button>

              <button
                :disabled="askLoading"
                :loading="askLoading"
                class="ko-smart__letter--submit ko-basic-button__card"
                @click="aiTextAsk(msg)"
              >
                <uni-icons type="paperplane" :color="loading ? '#C7C7C7' : '#fff'" />
              </button>
            </view>
          </block>

          <!-- 语音聊天 -->
          <block v-if="!isMsg && false">
            <view class="ko-smart__effect">
              <view class="ko-smart__effect--animation"></view>
            </view>
            <view class="ko-smart__voice">
              <button
                class="ko-smart__voice--down"
                @touchstart="startRecord"
                @touchmove="moveRecord"
                @touchend="pauseRecord"
                :disabled="askLoading || playing"
                :loading="askLoading || playing"
              >
                <view class="ko-smart__voice--text">
                  {{ isCancel ? "松开取消" : "按住说话" }}
                </view>
              </button>
              <button
                class="ko-smart__letter--submit ko-basic-button__card"
                @click.stop="toWord"
                :disabled="askLoading"
                :loading="askLoading"
              >
                <i class="iconfont icon-keyboard-line"></i>
              </button>
              <button
                class="ko-smart__letter--submit"
                @click.stop="pausePlay"
                v-if="playing"
              >
                <uni-icons size="30" color="#e43d33" type="close" />
              </button>
            </view>
          </block>
        </view>
      </view>
    </view>

  </view>
</template>

<style scoped lang="scss">
@keyframes wave {
  0% {
    background-position: 80% 20%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 20% 80%;
  }
}

.ko-smart {
  --mic-size: 74px;

  height: calc(100vh);
  //background: linear-gradient(to top right, #e0f7fa, #e1bee7), linear-gradient(to top left, #BED6FF, #E2E9FF);
  background-blend-mode: multiply; /* 混合模式 */
  background: linear-gradient(135deg, #ffebee, #e3f2fd);
  background-size: 400% 400%;
  animation: wave 10s ease-in-out infinite;
  position: relative;

  // 背景颜色
  &__wrap {
    background-color: rgba(255, 255, 255, 0.02); /* 半透明背景，可按需调整透明度 */
    backdrop-filter: blur(1px); /* 模糊程度，数值越大越模糊 */
    -webkit-backdrop-filter: blur(1px); /* 兼容老版本Safari */

    display: flex;
    flex-direction: column;
    height: calc(100vh);
    overflow: hidden;
  }

  // 头部内容
  &__header {
    padding: var(--m-top) 10px;
    height: calc(var(--m-height) + var(--m-top));
    line-height: var(--m-height);
    text-align: center;

    &--button,
    &--title,
    &--wrap {
      height: var(--m-height);
      line-height: var(--m-height);
      padding: 0;
    }

    &--wrap {
      position: relative;
    }

    &--button {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    &--title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%)
    }
  }

  // 滚动内容
  &__scroll {
    flex: 1;
    overflow: hidden;

    &--wrap {
      padding: 10px 10px 20px;
    }
  }

  // 底部内容
  &__footer {
    padding: 20px 20px 40px;
  }

  // 底部操作按钮
  &__operate {
    width: 100%;
    position: relative;
  }

  &__btn-def {
    width: 42px;
    height: 42px;
    background: #1A2728;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    line-height: 1.2;
  }

  &__input {
    left: 0;
  }

  &__close {
    right: 0;
  }

  &__mic {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, -60%);
  }
}
</style>
