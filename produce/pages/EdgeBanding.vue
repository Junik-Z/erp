<script>
import { _deepCopy, _isEmpty, _round } from "@/utils";
import UvCheckbox from "../components/uv-checkbox/components/uv-checkbox/uv-checkbox.vue";

export default {
  name: "EdgeBanding",
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    formData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      radiusVisible: false,
      rsForm: {},

      form: {},

      isEmit: false,
      isOn: false,
    };
  },
  watch: {
    value: {
      handler() {
        if (this.isEmit) return false;
        this.form = _deepCopy(this.value);
      },
      immediate: true,
    },
    form: {
      handler() {
        this.emitTime && clearTimeout(this.emitTime);
        this.isEmit = true;
        this.$emit("input", _deepCopy(this.form));
        this.emitTime = setTimeout(() => {
          this.isEmit = false;
        }, 10);
      },
      deep: true,
    },
  },
  components: {UvCheckbox},
  methods: {
    // 设置封边
    setEdges(item, index) {
      this.$set(item, index, item[index] ? 0 : 1);
    },

    // 开启圆角设置
    openAngleType(index) {
      const {angleType, radius, straight} = _deepCopy(this.form);
      const T = angleType[index] || 0;
      const R = radius[index] || 0;
      const S = (straight || [])[index] || [0, 0];
      this.rsForm = {
        angleType: T,
        radius: R,
        width: S[0] || 0,
        height: S[1] || 0,
      };
      this.rsIndex = index;
      this.radiusVisible = true;
    },

    // 保存设置的圆角
    onSubmitAngle() {
      const {angleType, radius, width, height} = _deepCopy(this.rsForm);
      // const {width, height} = _deepCopy(this.form);
      /* const len = width > height ? height : width;

      if (_isEqual(angleType, 0)) {
      } */

      this.form.angleType[this.rsIndex] = angleType;
      if (angleType == 0) {
        this.form.straight[this.rsIndex] = [0, 0];
        this.form.radius[this.rsIndex] = radius;
      }
      if (angleType == 1) {
        if (!this.form.straight) this.form.straight = [[0, 0], [0, 0], [0, 0], [0, 0]];
        this.form.radius[this.rsIndex] = 0;
        this.form.straight[this.rsIndex] = [width || 0, height || 0];
      }
      this.radiusVisible = false;

      this.$nextTick(() => {
        this.$emit("input", _deepCopy(this.form));
      });
    },

    // 切换圆角类型
    onChangeAngleType(event) {
      this.rsForm.angleType = +event.detail.value;
    },
  },
  computed: {
    // 获取封边元素的样式
    getEdgeStyle() {
      return (form, vss) => {
        const F = _deepCopy(form);
        if (_isEmpty(F)) return {};
        const scale = _round(130 / (vss?.width || 130), 2);
        const style = {};

        const [l, r, t, b] = F.edges || [];

        const bigBd = "3px solid #000";

        if (t) {
          style["border-top"] = bigBd;
        }

        if (r) {
          style["border-right"] = bigBd;
        }

        if (b) {
          style["border-bottom"] = bigBd;
        }

        if (l) {
          style["border-left"] = bigBd;
        }

        return {
          ...style,
          borderRadius: F.radius ?
            F.radius.map((v, i) => {
              const value = v * scale + "px";
              const us = F.angleType?.[i] || 0;
              return us ? 0 : value;
            }).join(" ")
            : 0,
        };
      };
    },

    // 是否要显示圆角参数
    isShowRadius() {
      return (index) => {
        const {angleType, radius, straight} = _deepCopy(this.form);
        const T = angleType?.[index];
        if (T) {
          const S = straight?.[index] || [];
          return S.some(v => v > 0);
        }
        return (radius?.[index] || 0) > 0;
      };
    },

    // 是否数直角
    isAngle() {
      return (index) => {
        const {angleType} = _deepCopy(this.form);
        const T = angleType?.[index];
        return !!T;
      };
    },

    // 获取指定圆角的数据
    getRadiusType() {
      return (index) => {
        const {angleType, radius, straight} = _deepCopy(this.form);
        const T = angleType?.[index];
        if (T) {
          const S = straight?.[index] || [];
          return S.join("*");
        }
        return radius?.[index] || 0;
      };
    },

    // 设置角度样式
    getAngleStyle() {
      return (index, form, data) => {
        const F = _deepCopy(data);
        if (_isEmpty(F)) return {};

        const {angleType, radius, straight} = _deepCopy(form);

        const scale = _round(180 / (F?.width || 180), 2);

        const T = angleType[index];

        // 直角
        if (T) {
          const S = (straight || [])[index] || [];
          return {
            width: `${(S[0] || 0) * scale}px`,
            height: `${(S[1] || 0) * scale}px`,
            opacity: T,
          };
        }

        const R = radius[index];

        return {
          width: T ? R * scale + "px" : 0,
          height: T ? R * scale + "px" : 0,
          opacity: T,
        };
      };
    },
  },
};
</script>

<template>
  <view class="ko-edge-banding">
    <view class="ko-edge-banding__edge" :style="[getEdgeStyle(form, formData)]">
      <!-- 封边设置 -->
      <block>
        <button
          class="ko-basic-button__card edge left"
          @click="setEdges(form.edges, 0)"
        >
          <view class="ko-edge-banding__edge--button-content" style="display: flex; align-items: center;">
            <UvCheckbox is-alone readonly :value="form.edges[0]" />
            封边
          </view>
        </button>
        <button
          class="ko-basic-button__card edge right"
          @click="setEdges(form.edges, 1)"
        >
          <view class="ko-edge-banding__edge--button-content" style="display: flex; align-items: center;">
            <UvCheckbox is-alone readonly :value="form.edges[1]" />
            封边
          </view>
        </button>
        <button
          class="ko-basic-button__card edge top"
          @click="setEdges(form.edges, 2)"
        >
          <view class="ko-edge-banding__edge--button-content" style="display: flex; align-items: center;">
            <UvCheckbox is-alone readonly :value="form.edges[2]" />
            封边
          </view>
        </button>
        <button
          class="ko-basic-button__card edge bottom"
          @click="setEdges(form.edges, 3)"
        >
          <view class="ko-edge-banding__edge--button-content" style="display: flex; align-items: center;">
            <UvCheckbox is-alone readonly :value="form.edges[3]" />
            封边
          </view>
        </button>
      </block>

      <!-- 圆直角设置 -->
      <block>
        <view class="ko-edge-banding__edge--radius TL">
          <view
            class="ko-edge-banding__edge--radius--info"
            v-if="isShowRadius(0)"
            :class="{'is-angle': isAngle(0)}"
          >
            {{ getRadiusType(0) }}
          </view>
          <button class="ko-basic-button__card" @click.stop="openAngleType(0)">圆角</button>
        </view>
        <view class="ko-edge-banding__edge--radius TR">
          <button class="ko-basic-button__card" @click.stop="openAngleType(1)">圆角</button>
          <view
            class="ko-edge-banding__edge--radius--info"
            v-if="isShowRadius(1)"
            :class="{'is-angle': isAngle(1)}"
          >
            {{ getRadiusType(1) }}
          </view>
        </view>
        <view class="ko-edge-banding__edge--radius BR">
          <button class="ko-basic-button__card" @click.stop="openAngleType(2)">圆角</button>
          <view
            class="ko-edge-banding__edge--radius--info"
            v-if="isShowRadius(2)"
            :class="{'is-angle': isAngle(2)}"
          >
            {{ getRadiusType(2) }}
          </view>
        </view>
        <view class="ko-edge-banding__edge--radius BL">
          <view
            class="ko-edge-banding__edge--radius--info"
            v-if="isShowRadius(3)"
            :class="{'is-angle': isAngle(3)}"
          >
            {{ getRadiusType(3) }}
          </view>
          <button class="ko-basic-button__card" @click.stop="openAngleType(3)">圆角</button>
        </view>
      </block>

      <!-- 直角显示 -->
      <block>
        <view class="ko-edge-banding__edge--angle TL" :style="[getAngleStyle(0, form, formData)]"></view>
        <view class="ko-edge-banding__edge--angle TR" :style="[getAngleStyle(1, form, formData)]"></view>
        <view class="ko-edge-banding__edge--angle BR" :style="[getAngleStyle(2, form, formData)]"></view>
        <view class="ko-edge-banding__edge--angle BL" :style="[getAngleStyle(3, form, formData)]"></view>
      </block>
    </view>

    <BasicPopup :visible.sync="radiusVisible" title="圆角设置">
      <view class="ko-edge-banding__radius-popup">
        <uni-forms label-width="110px" label-align="right" ref="RSRef" :model="rsForm">
          <uni-forms-item label="圆角类型：" name="angleType">
            <radio-group @change="onChangeAngleType">
              <radio color="#4177f6" value="0" :checked="rsForm.angleType == 0">圆角</radio>
              <radio color="#4177f6" style="margin-left: 10px;" value="1" :checked="rsForm.angleType == 1">直角</radio>
            </radio-group>
          </uni-forms-item>
          <block v-if="rsForm.angleType == 0">
            <uni-forms-item label="圆角大小：">
              <uni-easyinput type="digit" v-model="rsForm.radius" placeholder="请输入" />
            </uni-forms-item>
          </block>
          <block v-if="rsForm.angleType == 1">
            <uni-forms-item label="宽：">
              <uni-easyinput type="digit" v-model="rsForm.width" placeholder="请输入" />
            </uni-forms-item>
            <uni-forms-item label="高：">
              <uni-easyinput type="digit" v-model="rsForm.height" placeholder="请输入" />
            </uni-forms-item>
          </block>
        </uni-forms>
      </view>
      <template #footer>
        <view style="display: flex; align-items: center; justify-content: center; padding: 10px;">
          <button class="ko-basic-button__card" @click="onSubmitAngle">保存</button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-edge-banding {
  display: flex;
  justify-content: center;
  align-items: center;

  // 封边样式
  &__edge {
    width: 130px;
    height: 100px;
    border: 3px dotted #000;
    position: relative;
    transition: border .3s;

    .ko-basic-button__card {
      font-size: 12px;
      padding: 6px 10px;
    }

    .edge {
      position: absolute;
      z-index: 9;

      &.top {
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      &.bottom {
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 50%);
      }

      &.right {
        top: 50%;
        right: 0;
        transform: translate(50%, -50%);
      }

      &.left {
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
      }

    }

    &--wrap {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &--button-content {
      position: relative;

      &:before {
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9;
      }
    }

    &--radius {
      position: absolute;
      display: flex;
      align-items: center;


      &--info {
        padding: 0 4px;
        font-size: 11px;
        color: #8f939c;
        display: flex;
        align-items: center;

        &::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          border-left: 1px solid #8f939c;
          border-bottom: 1px solid #8f939c;
          border-bottom-left-radius: 7px;
          margin-right: 2px;
        }

        &.is-angle {
          &::before {
            border-radius: 0;
          }
        }
      }

      &.TL {
        top: 0;
        left: 0;
        transform: translate(-110%, -100%);
      }

      &.TR {
        top: 0;
        right: 0;
        transform: translate(110%, -100%);
      }

      &.BR {
        bottom: 0;
        right: 0;
        transform: translate(110%, 100%);
      }

      &.BL {
        bottom: 0;
        left: 0;
        transform: translate(-110%, 100%);
      }
    }

    &--angle {
      position: absolute;
      background: #fff;

      &.TL {
        top: -3px;
        left: -3px;
        border-bottom: 3px solid #000;
        border-right: 3px solid #000;
      }

      &.TR {
        top: -3px;
        right: -3px;
        border-bottom: 3px solid #000;
        border-left: 3px solid #000;
      }

      &.BR {
        bottom: -3px;
        right: -3px;
        border-top: 3px solid #000;
        border-left: 3px solid #000;
      }

      &.BL {
        bottom: -3px;
        left: -3px;
        border-top: 3px solid #000;
        border-right: 3px solid #000;
      }
    }
  }

  &__radius-popup {
    // #ifdef MP
    width: 96vw;
    height: 40vh;
    // #endif
    padding: 10px;
  }
}
</style>
