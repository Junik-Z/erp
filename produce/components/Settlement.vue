<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { _deepCopy, _isEmpty, _isEqual, CustomToast } from "@/utils";
import { applySettleApi, getProduceDetailApi } from "@/api/erp/produce";
import KoList from "@/components/List/List.vue";
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";

export default {
  name: "Settlement",
  components: {
    KoList,
    BasicPopup,
  },
  mixins: [mixins],
  data() {
    return {
      visible: false,

      node: null,

      CraftList: [],

      loading: false,

      sVisible: false,
      sQuantity: null,
      pLoading: false,

      sNode: {},
    };
  },
  methods: {
    // 开启弹窗
    open(item, index) {
      console.log(item);
      this.node = _deepCopy(item);
      this.visible = true;

      this.getInfo(index);
    },

    // 获取生产工单详情
    getInfo() {
      getProduceDetailApi({id: this.node.id})
        .then(res => {
          const params = res.data;
          this.CraftList = params.craftProcesses;
          console.log(this.CraftList);
        });
    },

    // 处理结算
    onSettlement(item, index) {
      this.sNode = _deepCopy(item);
      this.sVisible = true;
    },

    // 结算
    onSettlementSubmit() {
      if (_isEmpty(this.node)) {
        CustomToast({
          title: "未匹配到流程，请重试。",
        });
        return false;
      }

      const quantity = +this.sQuantity;

      if (!["fixedPrice", "fixedPriceGroup"].includes(this.node.pricingMethod)) {
        if (isNaN(quantity)) {
          CustomToast({
            title: "请输入数字字符",
            icon: "none",
          });
          return false;
        }

        if (quantity < 0) {
          CustomToast({
            title: "数量不能少于1",
            icon: "none",
          });
          return false;
        }
      }

      this.pLoading = true;

      applySettleApi({...this.node, quantity})
        .then(() => {
          uni.showModal({
            title: "温馨提示",
            content: "请与员工核对金额，核对无误后，请及时前往待确认列表，完成最终的确认结算流程。",
            showCancel: false,
          });
        })
        .finally(() => {
          this.settlementVisible = false;
          this.pLoading = false;
        });
    },
  },

  computed: {
    // 获取单元格的分配
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "auto ".repeat(5).trim(),
      };
    },
    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
    },

    // 获取计价方式价格
    getPricingMethodPrice() {
      return row => {
        return _isEqual(row.pricingMethod, "commission") ? `${(row.price || 0) / 10000}%` : this.toYuan(row.price);
      };
    },

    // 获取计价方式
    getPricingMethod() {
      return key => key ? PRICING_METHOD[key] : "";
    },

  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" :title="'生产流程'">
    <view class="ko-settlement">
      <KoList :loading="loading" :no-more="true" :no-data="!CraftList.length">
        <view :style="[getGridTemplateColumnsStyle]">

          <view class="ko-basic-table">
            <view class="ko-basic-table--th">名称</view>
            <view class="ko-basic-table--th">计价方式</view>
            <view class="ko-basic-table--th">价格</view>
            <view class="ko-basic-table--th">员工</view>
            <view class="ko-basic-table--th">操作</view>

            <block v-for="(item, index) of CraftList" :key="item.id">
              <view class="ko-basic-table--cell">
                {{ item.name }}
              </view>
              <view class="ko-basic-table--cell">
                {{ getPricingMethod(item.pricingMethod) }}
              </view>
              <view class="ko-basic-table--cell">
                {{ getPricingMethodPrice(item) }}
              </view>
              <view class="ko-basic-table--cell">
                <view
                  style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;"
                >
                  <view
                    style="padding: 2px; display: flex; flex-direction: column; justify-content: center;align-items: center;"
                    v-for="staff of getStaffListLogo(item)"
                    :key="staff.id"
                  >
                    <uv-avatar
                      :src="getImageUrl(staff.logo)"
                      random-bg-color
                      size="18"
                      :text="staff.name"
                    />
                    <text style="font-size: 10px; color: #8f939c;padding-top: 2px;">{{ staff.name }}</text>
                  </view>
                </view>
              </view>

              <view class="ko-basic-table--cell">
                <view
                  style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap;"
                >
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onSettlement(item, index)"
                    v-if="isPerm('CRAFT_APPLY_SETTLE')"
                  >
                    结算
                  </button>
                </view>
              </view>
            </block>
          </view>
        </view>
      </KoList>
    </view>


    <BasicPopup :visible.sync="sVisible" title="结算">
      <view class="ko-settlement__factory">

        <view
          style="padding: 10px; font-size: 12px;color: #8f939c;"
        >
          计价方式：{{ getPricingMethod(sNode.pricingMethod) }}

          <text class="ko-basic-money" style="margin-left: 5px;" v-if="sNode.pricingMethod !== 'commission'">
            {{ toYuan(sNode.price) }}元
          </text>
          <text class="ko-basic-money" style="margin-left: 6px;" v-else>{{ sNode.price / 10000 }}%</text>
        </view>

        <uni-forms label-align="right" v-if="!['commission'].includes(sNode.pricingMethod)">
          <uni-forms-item
            label="数量"
            name="name"
            required
          >
            <uni-easyinput type="digit" v-model="sQuantity" placeholder="请输入数量" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-settlement__factory--footer">
          <button
            class="ko-basic-button__card"
            @click="onSettlementSubmit"
            :loading="pLoading"
            :disabled="pLoading"

          >
            结算
          </button>
        </view>
      </template>
    </BasicPopup>
  </BasicPopup>
</template>

<style scoped lang="scss">
// 结算工单
.ko-settlement {
  // #ifdef MP
  width: 98vw;
  height: 80vh;

  &__factory {
    width: 60vw;
    padding: 10px;

    &--footer {
      display: flex;
      justify-content: center;
      align-items: center;

      .ko-basic-button__card {
        width: 100px;
      }
    }
  }

  // #endif

}
</style>
