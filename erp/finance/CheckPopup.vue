<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { _deepCopy, _sum } from "@/utils";
import Dayjs from "@/utils/dayjs";
import mixins from "@/mixins/mixins";

export default {
  name: "CheckPopup",
  mixins: [mixins],
  data() {
    return {
      visible: false,
      checked: [],
    };
  },
  components: {BasicPopup},
  methods: {
    open(check) {
      this.checked = _deepCopy(check);
      this.visible = true;
    },
  },
  computed: {
    // 获取表格格子
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "auto auto auto auto",
      };
    },

    // 获取单据时间
    getUpdateTime() {
      return (time) => time ? Dayjs(time).format("YYYY-MM-DD") : "";
    },

    // 合计
    total() {
      return _sum(this.checked?.map(v => v.totalAmount || 0) || []);
    },

    // 剩余
    totalAmount() {
      return _sum(this.checked?.map(v => (v.totalAmount - _sum((v.proofs || []).map(v => v.totalAmount || 0))) || 0) || []);
    },

    // 获取剩余
    getUnsettled() {
      return (item) => item.totalAmount - _sum((item.proofs || []).map(v => v.totalAmount || 0));
    },

    // 合计的样式
    getTotalStyle() {
      const rowLength = this.getMaxRowLength;
      return {
        "grid-area": `${rowLength}/1/${rowLength}/4`,
      };
    },

    // 最大表格数
    getMaxRowLength() {
      return 1 + this.checked.length + 1;
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="对账单">
    <scroll-view
      scroll-y="true"
      scroll-x="true"
      :style="[getGridTemplateColumnsStyle]"
      class="ko-check-popup"
    >
      <view class="ko-basic-table">
        <view class="ko-basic-table--cell">
          单据日期
        </view>
        <view class="ko-basic-table--cell">
          单据类型
        </view>
        <view class="ko-basic-table--cell">
          单据编号
        </view>
        <view class="ko-basic-table--cell">
          金额
        </view>
        <!-- <view class="ko-basic-table&#45;&#45;cell">
           剩余
         </view>-->


        <block v-for="(item) of checked" :key="item.id">
          <view class="ko-basic-table--cell">
            {{ getUpdateTime(item.updateTime) }}
          </view>
          <view class="ko-basic-table--cell">
            {{ ORDER_TYPE_ENUMS(item.orderType) }}
          </view>
          <view class="ko-basic-table--cell">
            {{ item.orderCode }}
          </view>
          <!--<view class="ko-basic-table&#45;&#45;cell">
            {{ toYuan(item.totalAmount) }}
          </view>-->
          <view class="ko-basic-table--cell">
            {{ toYuan(getUnsettled(item)) }}
          </view>
        </block>

        <block>
          <view class="ko-basic-table--cell" :style="[getTotalStyle]">
            合计
          </view>
          <view class="ko-basic-table--cell">
            {{ toYuan(total) }}
          </view>
          <!-- <view class="ko-basic-table&#45;&#45;cell">
             {{ toYuan(totalAmount) }}
           </view>-->
        </block>

        <block>
          <view
            class="ko-basic-table--cell"
            :style="[{'grid-area': `${getMaxRowLength + 1}/1/${getMaxRowLength + 1}/3`}]"
          >
            单据总额
          </view>
          <view
            class="ko-basic-table--cell"
            :style="[{'grid-area': `${getMaxRowLength + 1}/3/${getMaxRowLength + 1}/5`}]"
            style="text-align: right;"
          >
            {{ toYuan(total) }}
          </view>
          <view
            class="ko-basic-table--cell"
            :style="[{'grid-area': `${getMaxRowLength + 2}/1/${getMaxRowLength + 2}/3`}]"
          >
            已收
          </view>
          <view
            class="ko-basic-table--cell"
            :style="[{'grid-area': `${getMaxRowLength + 2}/3/${getMaxRowLength + 2}/5`}]"
            style="text-align: right;"
          >
            {{ toYuan(total - totalAmount) }}
          </view>
          <view
            class="ko-basic-table--cell"
            :style="[{'grid-area': `${getMaxRowLength + 3}/1/${getMaxRowLength + 3}/3`}]"
          >
            应收
          </view>
          <view
            class="ko-basic-table--cell"
            :style="[{'grid-area': `${getMaxRowLength + 3}/3/${getMaxRowLength + 3}/5`}]"
            style="text-align: right;"
          >
            {{ toYuan(totalAmount) }}
          </view>
        </block>
      </view>
    </scroll-view>
  </BasicPopup>
</template>

<style lang="scss">
.ko-check-popup {
  padding: 0 10px;
  // #ifdef MP
  width: 98vw;
  height: 77vh;
  background: #fff;
  // #endif
}
</style>
