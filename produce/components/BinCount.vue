<script>
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _sum } from "@/utils";

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
        quantity: allEdgeLength,
        price: null,
        unit: "mm",
      });

      this.count = count.map(v => {
        const price = (result || []).find(v => _isEqual(v.name, v.name))?.price || null;

        return ({
          ...v,
          price,
        });
      });

    },
  },
};
</script>

<template>
  <view class="ko-bin-count">
    <view style="display:block;">
      <view
        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;"
        v-for="(item, index) of count"
        :key="index"
      >
        <view style="display: flex; align-items: center;" v-if="item.name">
          <text>{{ item.name }}</text>
        </view>
        <view style="display: flex; align-items: center;">
          <label class="ko-basic-label">共计：</label>
          <text>{{ item.quantity }}</text>
          <block v-if="item.unit">{{ item.unit }}</block>
        </view>
        <view style="display: flex; align-items: center">
          <label class="ko-basic-label">单价：</label>
          <view style="width: 70px;">
            <uni-easyinput type="digit" v-model="item.price" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-bin-count {
  padding-bottom: 10px;
  font-size: 14px;
}
</style>
