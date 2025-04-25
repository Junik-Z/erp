<script>
import { _chunk, _deepCopy, _get, _isEqual, _reverse } from "@/utils";
import mixins from "@/mixins/mixins";
import KoList from "@/components/List/List.vue";
import { PRICING_METHOD } from "@/utils/config";

export default {
  name: "InProduct",
  components: {KoList},
  data() {
    return {};
  },
  props: {
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  mixins: [mixins],
  methods: {},
  computed: {
    GroupList() {
      const list = _deepCopy(this.list) || [];

      const group = _chunk(list, 3)?.map((c, i) => {
        if (i % 2 === 0) {
          return c;
        } else {
          return _reverse(c);
        }
      });


      return group.map((row, rIndex) => {
        // 下一行
        const n = group[rIndex - 1] || {};

        if (rIndex % 2 === 0) {
          return row.map((c) => {
            return {
              ...c,
              _nextStatus: c.status,
            };
          });
        } else {
          return row.map((c) => {
            return {
              ...c,
              _nextStatus: c.status,
            };
          });
        }

      });
    },

    // 获取图标
    getLogo() {
      return (image) => {
        return image ? this.getImageUrl(image) : "data:image/png;base64,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";
      };
    },

    // 获取计价方式价格
    getPricingMethodPrice() {
      return row => {
        return _isEqual(row.pricingMethod, "commission") ? `${(row.price || 0) / 10000}%` : this.toYuan(row.price);
      };
    },

    // 获取计价方式
    getPricingMethod() {
      return key => PRICING_METHOD[key];
    },

    // 获取向下图标的状态
    getDownBtnStatus() {
      return (j) => {
        const L = this.GroupList[j + 1];
        if (j % 1 !== 0) {
          return _get(L.at(-1), "_nextStatus");
        } else {
          return _get(L[0], "_nextStatus");
        }
      };
    },

    // 获取箭头颜色
    getIconColor() {
      return (status) => {
        return {
          CREATED: "#eec904",
          FINISHED: "#63e2b7",
          CANCELLED: "#2e2e32",
          APPLY_MATERIAL: "#0284c7",
        }[status] || "";
      };
    },
  },
};
</script>

<template>
  <view class="ko-in-product">
    <view class="ko-in-product__content">
      <block v-for="(G, j) of GroupList" :key="j">
        <view class="ko-in-product__content--item" :class="j % 2 !== 0 ? 'end' : 'start'">
          <block v-for="(child, k) of G" :key="k">
            <view class="ko-in-product__cell" :class="child.status">
              <view class="ko-in-product__cell--image">
                <uv-avatar
                  round
                  :src="getLogo(child.image)"
                  object-fit="cover"
                  class="ko-item-image"
                  size="30"
                />
              </view>

              <view class="ko-in-product__cell--name">{{ child.name }}</view>

              <view v-if="child.pricingMethod">{{ getPricingMethod(child.pricingMethod) }}</view>

              <view v-if="child.staffs">
                <text style="margin: 5px;" v-for="c of child.staffs" :key="c.name">{{ c.name }}</text>
              </view>
            </view>

            <!-- 左右箭头 -->
            <view
              v-if="G.length && k !== G.length - 1"
              class="ko-in-product__cell--arrow"
              :class="[child._nextStatus]"
            >
              <uni-icons
                :color="getIconColor(child._nextStatus)"
                size="40"
                :type="j % 2 === 0? 'arrow-right' : 'arrow-left'"
              />
            </view>
          </block>
        </view>

        <view
          class="ko-in-product__cell--arrow arrow-down"
          style="width: 100%"
          :class="[{ 'is-two': j % 2 !== 0 }, getDownBtnStatus(j)]"
          v-if="GroupList.length && j !== GroupList.length - 1"
        >
          <view class="arrow-down__icon">
            <uni-icons size="40" :color="getIconColor(getDownBtnStatus(j))" type="arrow-down" />
          </view>
        </view>
      </block>
    </view>
  </view>

</template>

<style scoped lang="scss">

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slide {
  0% {
    left: -100px;
  }
  100% {
    left: 120%; /* 完全移出右侧 */
  }
}

.ko-in-product {
  height: 100%;
  width: 100%;
  --item-size: calc(100% / 5 + 20px);
  --item-arrow-size: calc(100% / 5 - 30px);

  &__item {
    background: rgba(20, 31, 45, 0.1);
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;

    &.is_success {
      background: rgba(127, 231, 196, 0.2);
      position: relative;
      overflow: hidden;

      &:before {
        content: '';
        position: absolute;
        left: -100%; /*改变left的值，让其相对box影藏*/
        top: 0;
        width: 30%;
        height: 100%;

        /* 标准的语法 */
        background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0,
            rgba(127, 231, 196, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
        );
        transform: skewX(-45deg);

        animation: slide 4s infinite linear;
      }
    }
  }

  &__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 6px;
    width: var(--item-size);
    text-align: center;

    background: rgba(143, 147, 156, 0.3);

    &.CREATED {
      background: rgba(238, 201, 4, 0.3);

      .ko-in-product__cell--image {
        box-shadow: 0 0 10px #eec904;
        border-color: rgba(238, 201, 4, 1);
        animation: rotate 5s linear infinite;
      }
    }

    &.FINISHED {
      background: rgba(127, 231, 196, 0.3);

      .ko-in-product__cell--image {
        box-shadow: 0 0 10px #63e2b7;
        border-color: #63e2b7;
      }
    }

    &.APPLY_MATERIAL {
      background: #e0f2fe;

      .ko-in-product__cell--image {
        box-shadow: 0 0 10px #0284c7;
        border-color: #0284c7;
        animation: rotate 5s linear infinite;
      }
    }

    &.CANCELLED {
      background: rgba(46, 46, 50, 0.3);

      .ko-in-product__cell--image {
        box-shadow: 0 0 10px #2e2e32;
        border-color: #2e2e32;
      }
    }

    &--image {
      height: 40px;
      width: 40px;
      border-radius: 50%;
      border: 1px solid #19264a;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #19264a;
    }

    &--name {
      font-size: 16px;
      margin-top: 10px;
      margin-bottom: 8px;
    }

    &--arrow {
      display: flex;
      align-items: center;
      background: transparent;
      width: var(--item-arrow-size);
      justify-content: center;

      &.arrow-down {
        width: var(--item-size);
        height: 50px;
        justify-content: flex-end;

        &.is-two {
          justify-content: flex-start;
        }

        .arrow-down__icon {
          width: var(--item-size);
          display: flex;
          justify-content: center;
        }
      }

      &.CREATED {
        ::v-deep .uni-icons {
          color: #eec904 !important;
        }
      }

      &.FINISHED {
        color: #63e2b7;

        ::v-deep .uni-icons {
          color: #63e2b7 !important;
        }
      }

      &.APPLY_MATERIAL {
        color: #0284c7;

        ::v-deep .uni-icons {
          color: #0284c7 !important;
        }
      }

      &.CANCELLED {
        color: #2e2e32;

        ::v-deep .uni-icons {
          color: #2e2e32 !important;
        }
      }
    }

  }

  &__content {
    &--item {
      display: flex;
      overflow: hidden;

      &.end {
        justify-content: flex-end;
      }
    }
  }
}
</style>
