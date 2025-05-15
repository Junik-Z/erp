<script>
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _sum, _toFinite, absYuan, yuanToPoints } from "@/utils";

export default {
  name: "BinCount",
  data() {
    return {
      count: [],
      allEdgeLength: 0,
      edgePrice: null,
    };
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    readonly: Boolean,
  },
  watch: {
    value: {
      handler() {
        this.onCount(_deepCopy(this.value));
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    // 处理统计
    onCount(value) {
      if (_isEmpty(value)) return false;

      const {boards, boardRecord, drillWidth, result} = value;

      const data = boardRecord.map(board => {
        // 获取板材下的第一块材料的信息
        const sItem = _get(boards, "0.items").find(v => _isEqual(v.rid, _get(board, "items.0.rid")));

        // 计算封边长度
        const rEdgeLength = _sum(board.items.map(item => {
          // 材料初始设置的信息
          const node = _get(boards, "0.items").find(v => _isEqual(v.rid, item.rid)) || {};
          let edgeLength = 0;
          (node.edges || [])
            .forEach((edge, index) => {
              if (edge) {
                // 封边的左右前背
                const w = [node.height, node.height, node.width, node.width][index];
                const len = (w) + drillWidth + 6;
                edgeLength += len;
              }
            });
          return edgeLength;
        }));

        return {
          ...board,
          rEdgeLength,
          rGroup: `${board.width - drillWidth}×${board.height - drillWidth}×${board.weight || sItem.weight || ""} (${board.color || sItem.color || ""})`,
        };
      });

      // 按板材分组
      const group = _groupBy(_deepCopy(data), (item) => item.rGroup);

      const count = [];
      let allEdgeLength = 0;

      for (const key in group) {
        const item = group[key];
        const obj = {name: key, quantity: item.length, edgeLength: _sum(item.map(v => v.rEdgeLength)), price: null};
        allEdgeLength += obj.edgeLength;
        count.push(obj);
      }

      count.push({
        name: "封边",
        quantity: allEdgeLength / 100,
        price: null,
        unit: "m",
      });

      this.count = count.map(V => {
        const price = absYuan((result || []).find(J => _isEqual(V.name, J.name))?.price || 0);
        return ({
          ...V,
          price,
        });
      });
    },

    // 处理价格改变了
    onChangePrice() {
      this.$emit("input",
        {
          ...this.value,
          result: this.count.map(V => ({...V, price: yuanToPoints(_toFinite(V.price))})),
        },
      );

      this.$emit("change-total", _sum(this.count.map(V => yuanToPoints(_toFinite(V.price)))));
    },
  },

  computed: {
    getRootStyle() {
      let gridCol = "auto auto 100px";

      // #ifdef H5
      gridCol = "auto auto 120px";
      // #endif

      return {"--ko-basic-table-grid-col": gridCol};
    },
  },
};
</script>

<template>
  <view class="ko-bin-count" :style='[getRootStyle]'>
    <view class="ko-basic-table">
      <view class="ko-basic-table--th">
        名称
      </view>
      <view class="ko-basic-table--th">
        数量
      </view>
      <view class="ko-basic-table--th">
        单价
      </view>

      <!-- 表格内容 -->
      <block v-for="(item, index) of count" :key="index">
        <view class="ko-basic-table--cell">
          {{ item.name }}
        </view>
        <view class="ko-basic-table--cell">
          {{ item.quantity }}
          <block v-if="item.unit">{{ item.unit }}</block>
        </view>
        <view class="ko-basic-table--cell">
          <uni-easyinput
            v-if="!readonly"
            @change="onChangePrice"
            @clear="onChangePrice"
            type="digit"
            v-model.trim="item.price"
          />
          <block v-else>{{ item.price }}</block>
        </view>
      </block>
    </view>
  </view>
</template>

<style lang="scss">
.ko-bin-count {
  padding-bottom: 10px;
  font-size: 14px;
}
</style>
