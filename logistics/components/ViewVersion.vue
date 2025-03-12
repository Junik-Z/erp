<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvCountTo from "./uv-count-to/uv-count-to.vue";
import {
  cancelDeliveryApi,
  confirmDeliveryApi,
  getCountApi,
  getDeliveryMyListApi,
  putBindApi,
} from "@/api/erp/logistics";
import { _deepCopy, _get } from "@/utils";
import mixins from "@/mixins/mixins";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";

export default {
  name: "ViewVersion",
  components: {
    UniFormsItem,
    BasicPopup,
    UniEasyinput,
    PickerUser,
    UniForms,
    LoadMore,
    UvActionSheet,
    OrderCard,
    UvCountTo,
    BasicCard,
    UniCol,
    UniRow,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      chartData: {},
      opts: {
        color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
        padding: [15, 10, 0, 15],
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true,
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow",
          },
        },
      },

      CountList: [
        {
          label: "总订单数",
          key: "totalOrderCount",
          color: "#2979ff",
          span: 12,
          unit: "单",
        },
        {
          label: "总物流商数",
          key: "totalLogisticsCount",
          color: "#2979ff",
          unit: "位",
        },
        {
          label: "我的账户金额",
          key: "myAccountBalance",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "我的待处理订单",
          key: "totalOrderCount",
          color: "#e43d33",
          unit: "",
          func: "onJumpWarning",
        },
      ],
      data: {
        "myOrderCount": 0,
        "myAccountBalance": 0,
        "totalLogisticsCount": 0,
        "totalOrderCount": 0,
      },

      loading: false,
      list: [],
      actionItem: {},
      visible: false,

      form: {},

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "订单类型",
          prop: "orderType",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_TYPE_ENUMS(row.orderType)]);
          },
        },
        {
          label: "订单状态",
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "订单编号",
          prop: "orderCode",
        },
        {
          label: "时间",
          prop: "createTime",
          width: 180,
        },
        {
          label: "物流商",
          prop: "logistics",
          children: [
            {
              label: "Logo",
              prop: "logistics.logo",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {
                    props: {
                      src: _this.getImageUrl(_get(row, "logistics.logo")),
                     size: 42,
                      text: _get(row, "logistics.name") || _this.GET_SHOP_NAME,
                    },
                  })],
                );
              },
            },
            {
              label: "名称",
              prop: "logistics.name",
            },
          ],
        },
        {
          label: "物流单号",
          prop: "logisticsNo",
        },
        {
          label: "联系电话",
          prop: "orderPhone",
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  mounted() {
    this.getServerData();
  },
  methods: {
    getServerData() {
      //模拟从服务器获取数据时的延时
      setTimeout(() => {
        let res = {
          categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
          series: [
            {
              name: "成交量A",
              data: [35, 8, 25, 37, 4, 20],
            },
            {
              name: "成交量B",
              data: [70, 40, 65, 100, 44, 68],
            },
            {
              name: "成交量C",
              data: [100, 80, 95, 150, 112, 132],
            },
          ],
        };
        this.chartData = JSON.parse(JSON.stringify(res));
      }, 500);
    },
    getList() {
      this.loading = true;
      getCountApi()
        .then(res => {
          console.log(res.data);
          this.data = res.data;
        })
        .finally(() => {
          this.loading = false;
          this.getMyList();
        });
    },

    onFunc() {
    },

    getMyList() {
      this.loading = true;
      getDeliveryMyListApi({pageSize: 10000})
        .then(res => {
          console.log(res.data);
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 取消配送
    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelDeliveryApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList();
              });
          }
        },
      });
    },
    // 完成配送
    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定已完成 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            confirmDeliveryApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getMyList();
              });
          }
        },
      });
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },
    // 开启更多功能
    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },

    onBind(item) {
      this.actionItem = item;
      this.form.logisticsId = item.logisticsId;
      this.form.logisticsNo = item.logisticsNo;

      this.visible = true;
    },

    // 处理绑定物流商
    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const params = _deepCopy(this.form);
          putBindApi({...params, id: this.actionItem.id})
            .then(() => {
              uni.showToast({title: "绑定成功"});
              this.getList();
            })
            .finally(() => {
              this.visible = false;
            });
        }
      });
    },
  },
  computed: {
    getCountValue() {
      return (item) => {
        const value = _get(this.data, item.key);
        return item.unit === "元" ? this.toYuan(value) : value;
      };
    },

    actionList() {
      const node = this.actionItem || {};
      return [
        {
          name: "完成配送",
          func: "onConfirm",
          status: ["CREATED"],
        },
        {
          name: "取消配送",
          func: "onCancel",
          color: "#e43d33",
          status: ["CREATED"],
        },
      ]
        .filter(li => li.status.includes(node?.status));
    },
  },
};
</script>

<template>
  <view class="ko-view-version">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count" @click.stop="onFunc(item)">
            <view class="ko-basic-count__label">{{ item.label }}</view>
            <view class="ko-basic-count__info">
              <UvCountTo
                :separator="item.unit === '元' ? ',' : ''"
                :start-val="0"
                bold
                :end-val="getCountValue(item)"
                :color="item.color ? item.color : '#2979ff'"
              />
              <text class="ko-basic-count__info--unit" v-if="item.unit">{{ item.unit }}</text>
            </view>
          </view>
        </UniCol>
      </UniRow>
    </view>

    <view class="ko-view-version__row">
      <!-- #ifdef MP -->
      <OrderCard :spacing="10" :item="item" is-logistics @click="onJumpDetails(item, 'logistics')">
        <template #operate v-if="['CREATED'].includes(item.status)">
          <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
            <button
              class="ko-basic-button__card"
              @click.stop="onConfirm(item)"
            >
              完成配送
            </button>
            <!-- <button
               class="ko-basic-button__card"
               @click.stop="onActionClick(item)"
               v-if="['CREATED'].includes(item.status)"
             >
               更多
             </button>-->
          </view>
        </template>
      </OrderCard>
      <LoadMore :loading="loading" />
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="columns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpDetails($event, 'logistics')"
        >
          <!--
          @row-click="onJumpDetails($event, 'receivable')"
          -->
          <template #operate="{item}">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button
                class="ko-basic-button__card"
                @click.stop="onConfirm(item)"
              >
                完成配送
              </button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </view>


    <BasicPopup :visible.sync="visible" v-if="(isPerm('Delivery_Write') || (isBusiness || isAdmin)) && false">
      <view class="ko-send__popup">
        <UniForms ref="FormRef" :model="form" :rules="rules" label-width="100px" label-align="right">
          <UniFormsItem required label="物流商：" name="logisticsId">
            <view style="width: 100%;">
              <PickerUser v-model="form.logisticsId" type="logistics" is-input placeholder="请选择" />
            </view>
          </UniFormsItem>
          <UniFormsItem label="物流单号：" name="logisticsNo">
            <UniEasyinput placeholder="请输入" v-model="form.logisticsNo" />
          </UniFormsItem>
        </UniForms>
      </view>
      <template #footer>
        <button class="ko-basic-button" @click="onSubmit" style="margin: 0 40px 10px;">保存</button>
      </template>
    </BasicPopup>


    <!-- #ifdef MP -->
    <UvActionSheet
      ref="UASRef"
      :actions="actionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-view-version {
  //padding: 10px;
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 50px;
  // #endif

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: $uni-shadow-base;
    padding: 10px 0;
  }

  &__row {
    margin-top: 16px;
  }

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }

  .ko-basic-button__card {
    margin: 5px;
  }
}
</style>
