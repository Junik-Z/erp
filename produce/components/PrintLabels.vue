<!-- #ifdef H5 -->
<script>
import { getProduceDetailApi } from "@/api/erp/produce";
import { _deepCopy, _get, _isEmpty, _isEqual, _round, CustomToast } from "@/utils";
import { cmToPx } from "@/shop/print/utils";
import { VuePrintLast } from "@/shop/print/vue-print-last";

const PlateWidth = cmToPx(1.2);

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

          console.log(this.order);

          const obj = _get(_deepCopy(res.data), "customizedBoards.0") || {};

          if (_isEmpty(obj)) {
            CustomToast({
              title: "该工单不需要进行板材加工",
              icon: "none",
            });

            this.gLoading = false;
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

    // 获取封边指示
    getEdges() {
      return node => {
        const {edges} = _get(node, "original") || {};
        return ["←", "→", "↑", "↓"].map((item, index) => `${item}${edges[index] || 0}`).join(" ");
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
      return (item, node, pItem) => {
        const {width, height} = node;
        const M = _round(PlateWidth / width, 2);

        return {
          width: item.width * M + "px",
          height: item.height * M + "px",
          transform: `translate(${item.x * M - 1}px, ${(item.y + height - item.height) * M - 1}px)`,
          backgroundColor: item.rid === pItem.rid ? "#000" : "",
        };
      };
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="打印标签">
    <view class="ko-print-label">
      <div ref="LRef" class="ko-print-label__wrap">
        <block v-for="(wrap, wIndex) of boardRecord">
          <div class="ko-print-label__item" v-for="item of wrap.items">
            <div style="font-size: 12px;">地址：{{ order.orderAddress || "-" }}</div>
            <div style="font-size: 12px;">名称：{{ item.original.name || "-" }}</div>
            <div style="font-size: 12px;">尺寸：{{ getSize(item) }}</div>
            <div style="font-size: 12px;">封边：{{ getEdges(item) }}</div>
            <div class="ko-print-label__item--no">{{ wIndex + 1 }}</div>

            <div class="ko-print-label__item--code">{{ order.orderCode }}</div>

            <div class="ko-print-label__plate" :style="getPlateStyle(wrap)">
              <div
                class="ko-print-label__plate--item"
                v-for="plate of wrap.items"
                :style="getPlateItemStyle(plate, wrap, item)"
                :class="{active: plate.rid === item.rid}"
              >
                {{ plate.rid === item.rid ? "X" : "" }}
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
      left: 60%;
      top: 25mm;
      font-size: 18px;
      z-index: 9;
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
