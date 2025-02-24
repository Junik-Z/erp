<!-- #ifdef H5 -->
<script>
import { getProduceDetailApi } from "@/api/erp/produce";
import { _deepCopy, _get, _isEmpty, _isEqual, _round, CustomToast } from "@/utils";
import { cmToPx } from "@/shop/print/utils";
import { VuePrintLast } from "@/shop/print/vue-print-last";

const PlateWidth = cmToPx(1.2);

const EdgeSize = 40;

export default {
  name: "PrintLabels",
  data() {
    return {
      gLoading: false,
      node: {},

      visible: false,
      order: {},
      boardRecord: [],
    };
  },
  methods: {
    open(node) {
      this.node = node;
      this.visible = true;
      this.getInfo();
    },

    // 生成NC程序
    getInfo() {
      this.gLoading = true;
      getProduceDetailApi({id: this.node.id})
        .then(res => {
          this.order = res.data;
          const obj = _get(_deepCopy(res.data), "customizedBoards.0") || {};

          if (_isEmpty(obj)) {
            this.visible = false;
            this.gLoading = false;

            CustomToast({
              title: "该工单不需要进行板材加工",
              icon: "none",
            });
            return false;
          }

          const iList = _get(obj, "boards.0.items");
          this.boardRecord = obj.boardRecord.map(parent => {
            parent.items = parent.items.map(item => {
              const original = iList.find((v) => _isEqual(v.rid, item.rid));
              return {
                ...item,
                original,
              };
            });

            return parent;
          });
        })
        .catch(() => {
          this.gLoading = false;
        })
        .finally(() => {
          this.gLoading = false;
        });
    },

    // 处理打印
    onPrint() {
      const el = this.$refs.LRef;
      new VuePrintLast({
        el,
        standard: "html5",
        customSize: {
          width: "60mm",
          height: "40mm",
        },
        // noPrintSelector: ".ko-basic-box-shadow",
      });
    },
  },

  computed: {
    // 获取材料尺寸
    getSize() {
      return (node) => {
        const {width, height} = _get(node, "original") || {};
        return `${width || ""}*${height || ""}`;
      };
    },

    /*  // 获取封边指示
     getEdges() {
       return node => {
         const {edges} = _get(node, "original") || {};
         return ["←", "→", "↑", "↓"].map((item, index) => `${item}${edges[index] || 0}`).join(" ");
       };
     }, */

    // 获取封边指示样式
    getEdgesStyle() {
      return node => {
        const {edges, angleType, radius, width, height} = _get(node, "original") || {};
        const zoom = EdgeSize / (width || EdgeSize);

        const style = {
          "border-left": edges[0] ? "2px solid #000" : "2px dashed #000",
          "border-right": edges[1] ? "2px solid #000" : "2px dashed #000",
          "border-top": edges[2] ? "2px solid #000" : "2px dashed #000",
          "border-bottom": edges[3] ? "2px solid #000" : "2px dashed #000",
          width: `${width * zoom}px`,
          height: `${height * zoom}px`,
        };


        if (!angleType[0] && radius[0]) {
          style["border-top-left-radius"] = `${radius[0] * zoom}px`;
        }

        if (!angleType[1] && radius[1]) {
          style["border-top-right-radius"] = `${radius[1] * zoom}px`;
        }

        if (!angleType[2] && radius[2]) {
          style["border-bottom-right-radius"] = `${radius[2] * zoom}px`;
        }

        if (!angleType[3] && radius[3]) {
          style["border-bottom-left-radius"] = `${radius[3] * zoom}px`;
        }

        return style;
      };
    },

    // 获取板材样式
    getPlateStyle() {
      return (node) => {
        const style = {};
        const {width, height} = node;
        const M = _round(PlateWidth / width, 2);

        style.width = _round(width * M + 1, 2) + "px";
        style.height = _round(height * M + 1, 2) + "px";

        return style;
      };
    },

    // 获取板材下的材料样式
    getPlateItemStyle() {
      return (item, node, pItem, iIndex, pIndex) => {
        const {width, height} = node;
        const M = _round(PlateWidth / width, 2);

        const Y = item.y; // height - item.y - item.height;

        return {
          width: item.width * M + "px",
          height: item.height * M + "px",
          transform: `translate(${item.x * M - 1}px, ${(Y) * M - 1}px)`,
          backgroundColor: (item.rid === pItem.rid && iIndex === pIndex) ? "#000" : "",
        };
      };
    },

    // 获取圆角数据
    getRound() {
      return (node, index) => {
        const {angleType, straight, width} = _get(node, "original") || {};

        const show = angleType?.[index];
        const px = straight?.[index] || [];

        const zoom = EdgeSize / (width || EdgeSize);

        if (show) {
          return {
            width: `${(px[0] || 0) * zoom}px`,
            height: `${(px[1] || 0) * zoom}px`,
          };
        }

        return {
          display: "none",
        };
      };
    },

    // 获取打印标签的封边指示器样式
    getEdgesSize() {
      return {
        "--ko-print-label-edge-width": `${EdgeSize}px`,
        "--ko-print-label-edge-height": `${EdgeSize}px`,
      };
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="打印标签">
    <view class="ko-print-label" :style="[getEdgesSize]">
      <div ref="LRef" class="ko-print-label__wrap">
        <block v-for="(wrap, wIndex) of boardRecord">
          <div class="ko-print-label__item" v-for="(item, iIndex) of wrap.items" :key="item.rid + iIndex">
            <div style="font-size: 12px;">地址：{{ order.orderAddress || "-" }}</div>
            <div style="font-size: 12px;">名称：{{ item.original.name || "-" }}</div>
            <div style="font-size: 12px;">尺寸：{{ getSize(item) }}</div>
            <div style="font-size: 12px; display: flex; align-items: center;">
              封边：
              <!--{{ getEdges(item) }}-->
              <div :style="getEdgesStyle(item)" class="ko-print-label__item--edges">
                <div
                  class="ko-print-label__item--round ko-print-label__item--round--0"
                  :style="getRound(item, 0)"
                ></div>
                <div
                  class="ko-print-label__item--round ko-print-label__item--round--1"
                  :style="getRound(item, 1)"
                ></div>
                <div
                  class="ko-print-label__item--round ko-print-label__item--round--2"
                  :style="getRound(item, 2)"
                ></div>
                <div
                  class="ko-print-label__item--round ko-print-label__item--round--3"
                  :style="getRound(item,3)"
                ></div>
              </div>
            </div>
            <div class="ko-print-label__item--no">{{ wIndex + 1 }}</div>

            <div class="ko-print-label__item--code">{{ order.orderCode }}</div>

            <div class="ko-print-label__plate" :style="getPlateStyle(wrap)">
              <div
                class="ko-print-label__plate--item"
                v-for="(plate, pIndex) of wrap.items"
                :style="getPlateItemStyle(plate, wrap, item, iIndex, pIndex)"
                :class="{active: (plate.rid === item.rid && iIndex === pIndex)}"
                :key="item.rid + iIndex + pIndex"
              >
                {{ (plate.rid === item.rid && iIndex === pIndex) ? "X" : "" }}
              </div>
            </div>
          </div>
        </block>
      </div>
    </view>
    <template #footer>
      <view class="ko-print-label__footer" style="display:flex; align-items: center;justify-content: space-around;">
        <button
          class="ko-basic-button__card"
          :loading="gLoading"
          :disabled="gLoading"
          @click="onPrint"
        >
          打印
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
@page {
  size: 60mm 40mm;
  margin: 0;
}

@media print {
  .ko-print-label__plate--item.active {
    background-color: #000 !important;
  }
}

.ko-print-label {
  width: 600px;
  height: 74vh;
  padding: 10px;
  overflow-y: auto;

  &__wrap {
  }

  // 标签项样式
  &__item {
    position: relative;
    //width: 60mm;
    height: 40mm;
    padding: 1mm 2mm;
    font-size: 10px;
    overflow: hidden;
    margin-bottom: 10px;

    &--code {
      position: absolute;
      left: 50%;
      bottom: 1mm;
      transform: translateX(-50%);
      z-index: 9;
      font-size: 16px;
    }

    &--no {
      position: absolute;
      right: 40%;
      top: 25mm;
      font-size: 22px;
      z-index: 9;
    }

    &--edges {
      width: var(--ko-print-label-edge-width);
      height: var(--ko-print-label-edge-width);
      //border: 1px dashed #000;
      position: relative;
    }

    $-radius-size: -2px;

    &--round {
      position: absolute;
      height: 10px;
      width: 10px;
      background: #fff;
      border: 2px solid #000;

      &--0 {
        top: $-radius-size;
        left: $-radius-size;
        border-top: none;
        border-left: none;
      }

      &--1 {
        top: $-radius-size;
        right: $-radius-size;
        border-top: none;
        border-right: none;
      }

      &--2 {
        bottom: $-radius-size;
        right: $-radius-size;
        border-right: none;
        border-bottom: none;
      }

      &--3 {
        bottom: $-radius-size;
        left: $-radius-size;
        border-bottom: none;
        border-left: none;
      }
    }
  }

  // 板材样式
  &__plate {
    position: absolute;
    right: 2mm;
    top: 2mm;
    border: 1px solid #000;

    &--item {
      border: 1px solid #000;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      font-weight: bold;

      &.active {
        //background: #000;
      }
    }
  }

  &__footer {
    .ko-basic-button__card {
      width: 120px;
    }
  }
}
</style>
<!-- #endif -->
