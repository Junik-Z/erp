<script>
// #ifdef H5
import { VuePrintLast } from "@/shop/print/vue-print-last";
// #endif
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { _deepCopy, _isEqual, _sum } from "@/utils";
import Dayjs from "@/utils/dayjs";
import mixins from "@/mixins/mixins";
import { getPayableCheckBillApi, getReceivableCheckBillApi } from "@/api/erp/finance";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";


export default {
  name: "CheckPopup",
  mixins: [mixins],
  data() {
    return {
      visible: false,
      checked: [],
      option: "",
      type: "",

      info: {},

      form: {
        seller: "", // 卖方
        buyer: "", // 买方
      },
    };
  },
  components: {BasicPopup, UniEasyinput},
  methods: {
    open(check, option) {
      this.checked = _deepCopy(check);
      this.type = option.customer_type;
      this.option = option;

      console.log(option);

      this.visible = true;
      this.getList();
    },

    getList() {
      const Func = {"sale": getReceivableCheckBillApi, "purchase": getPayableCheckBillApi}[this.option.customer_type];

      Func({supplierId: this.option.id})
        .then(res => {
          console.log(res);
          this.info = res.data;

          this.form.seller = this.getSeller;
          this.form.buyer = this.getBuyer;
        })
        .finally(() => {
        });
    },

    // #ifdef H5
    onPrint() {
      new VuePrintLast({
        el: this.$refs.CPPRef,
        standard: "html5",
        customSize: {
          width: "210mm",
          height: "297mm",
        },
      });
    },
    // #endif
  },
  computed: {
    // 获取表格格子
    getGridTemplateColumnsStyle() {

      let span = "auto auto auto auto";

      // #ifdef H5
      span = "200px 200px 200px 200px";
      // #endif


      return {
        "--ko-basic-table-grid-col": span,
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

    // 获取卖方信息
    getSeller() {
      return _isEqual(this.option.customer_type, "sale") ? this.GET_SHOP_NAME : this.info.name;
    },

    // 获取买方信息
    getBuyer() {
      return _isEqual(this.option.customer_type, "sale") ? this.info.name : this.GET_SHOP_NAME;
    },

    getShowText() {
      return {sale: "收", purchase: "付"}[this.option.customer_type];
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
      <view class="ko-check-popup__wrap">
        <view class="ko-check-popup__row">
          <view class="ko-check-popup__row--item">
            对账单位（卖方）：
            <!-- #ifdef MP -->
            {{ form.seller }}
            <!-- #endif -->

            <!-- #ifdef H5 -->
            <uni-easyinput v-model="form.seller" placeholder="请输入" />
            <!-- #endif -->
          </view>
          <view class="ko-check-popup__row--item">
            对账单位（买方）：
            <!-- #ifdef MP -->
            {{ form.buyer }}
            <!-- #endif -->

            <!-- #ifdef H5 -->
            <uni-easyinput v-model="form.buyer" placeholder="请输入" />
            <!-- #endif -->
          </view>
        </view>
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
              {{ toYuan(totalAmount) }}
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
              期初应{{ getShowText }}余额
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 1}/3/${getMaxRowLength + 1}/5`}]"
              style="text-align: right;"
            >
              {{ toYuan(Math.abs(info.amount || 0)) }}
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 2}/1/${getMaxRowLength + 2}/3`}]"
            >
              本期应{{ getShowText }}金额
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 2}/3/${getMaxRowLength + 2}/5`}]"
              style="text-align: right;"
            >
              {{ toYuan(totalAmount) }}
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 3}/1/${getMaxRowLength + 3}/3`}]"
            >
              本期{{ getShowText }}款金额
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 3}/3/${getMaxRowLength + 3}/5`}]"
              style="text-align: right;"
            >
              {{ toYuan(totalAmount) }}
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 4}/1/${getMaxRowLength + 4}/3`}]"
            >
              期末应{{ getShowText }}余额
            </view>
            <view
              class="ko-basic-table--cell"
              :style="[{'grid-area': `${getMaxRowLength + 4}/3/${getMaxRowLength + 4}/5`}]"
              style="text-align: right;"
            >
              {{ toYuan(Math.abs((info || {}).amount) - totalAmount) }}
            </view>
          </block>
        </view>


        <!-- #ifdef H5 -->
        <div class="ko-check-popup__table">
          <div ref="CPPRef" style="width: 100%;">
            <table class="ko-check-popup__table--content">
              <thead>
              <tr>
                <th colspan="5" style="text-align: center; padding: 10px; border-bottom: none;">
                  <h2>对账单</h2>
                </th>
              </tr>
              <tr>
                <th colspan="5" style="text-align: left; padding: 10px;">
                  <div>对账单位(卖方)：{{ form.seller }}</div>
                  <div>对账单位(买方)：{{ form.buyer }}</div>
                </th>
              </tr>
              <tr>
                <th>单据日期</th>
                <th>单据类型</th>
                <th>单据编号</th>
                <th>金额</th>
                <th style="width: 100px"></th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="(item) of checked" :key="item.id">
                <td>{{ getUpdateTime(item.updateTime) }}</td>
                <td>{{ ORDER_TYPE_ENUMS(item.orderType) }}</td>
                <td>{{ item.orderCode }}</td>
                <td>{{ toYuan(getUnsettled(item)) }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3">合计</td>
                <td>{{ toYuan(totalAmount) }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="2">期初应{{ getShowText }}余额</td>
                <td colspan="2">{{ toYuan(Math.abs(info.amount || 0)) }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="2">本期应{{ getShowText }}金额</td>
                <td colspan="2">{{ toYuan(totalAmount) }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="2">本期{{ getShowText }}款金额</td>
                <td colspan="2">{{ toYuan(totalAmount) }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="2">期末应{{ getShowText }}余额</td>
                <td colspan="2">{{ toYuan(Math.abs((info || {}).amount) - totalAmount) }}</td>
                <td></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- #endif -->
      </view>
    </scroll-view>
    <!-- #ifdef H5 -->
    <template #footer>
      <view
        style="display: flex; align-items: center; justify-content: center; padding-bottom: 10px; padding-top: 10px;"
      >
        <button class="ko-basic-button__card" style="width: 100px;" @click="onPrint">打印</button>
      </view>
    </template>
    <!-- #endif -->
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

  &__wrap {
    position: relative;
  }

  &__row {
    padding-bottom: 10px;

    &--item {
      font-size: 12px;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  // #ifdef H5
  //@page {
  //  size: 210mm 297mm;
  //  margin: 0;
  //}

  &__table {
    width: 210mm;

    position: absolute;
    left: 99999999px;

    &--content {
      width: 100%;
      border-collapse: collapse;
      @include print-style();
      border-left: 1px solid #000;
      border-top: 1px solid #000;

      tr {
        th, td {
          text-align: center;
          @include print-style();
          border-bottom: 1px solid #000;
          border-right: 1px solid #000;
          line-height: 1.8;
        }
      }
    }

  }

  // #endif
}
</style>
