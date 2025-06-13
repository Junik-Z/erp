<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  cancelDeliveryApi,
  confirmDeliveryApi,
  getCountApi,
  getDeliveryHistoryListApi,
  getDeliveryListApi,
  putBindApi,
} from "@/api/erp/logistics";
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from './components/TopMenus.vue'

const PageMenu = [
  {
    label: "配送",
    perm: "DELIVERY_LIST",
    func: 0,
  },
  {
    label: "已完成",
    perm: "DELIVERY_HISTORY",
    func: 1,
  },
];

export default {
  name: "SendList",
  components: {
    KoList,
    UvCountTo,
    PickerUser,
    UniEasyinput,
    UniFormsItem,
    UniForms,
    BasicPopup,
    UvActionSheet,
    OrderCard,
    LoadMore,
    HistoryBar,
    UniCol,
    UniRow,
    TopMenus
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      loading: false,
      list: [],

      PAGE_MENU: _deepCopy(PageMenu),

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },

      noMore: false,

      actionItem: {},

      visible: false,

      form: {
        logisticsId: "",
        logisticsNo: "",
      },

      rules: {
        logisticsId: {
          rules: [
            {
              required: true,
              errorMessage: "请选择物流商",
            },
          ],
        },
      },

      CountList: [
        {
          label: "总订单数",
          key: "totalOrderCount",
          color: "#2979ff",
          // #ifndef H5
          span: 12,
          // #endif
          unit: "单",
          // #ifdef H5
          span: 8,
          // #endif
        },
        {
          label: "总物流商数",
          key: "totalLogisticsCount",
          color: "#2979ff",
          unit: "位",
          // #ifdef H5
          span: 8,
          // #endif
        },
        {
          label: "待处理订单数",
          key: "waitDealOrderCount",
          color: "#2979ff",
          // #ifdef H5
          span: 8,
          // #endif
        },
      ],
      data: {
        "waitDealOrderCount": 0,
        "totalLogisticsCount": 0,
        "totalOrderCount": 0,
      },

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
          label: "编号",
          prop: "orderCode",
        },
        {
          label: "日期",
          prop: "updateTime",
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
          width: 300,
        },
      ],
      // #endif
      tableKey: +new Date(),
    };
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
  },
  mounted() {
  },
  methods: {
    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.tableKey = +new Date();
        this.queryList.pageNum = 0;
        this.list = [];
      }
      if (this.isPerm("LOGISTICS_COUNT")) {
        this.loading = true;
        getCountApi()
          .then(res => {
            console.log(res.data);
            this.data = res.data;
          })
          .finally(() => {
            this.loading = false;
            this.getMyList(reset);
          });
      } else {
        this.getMyList(reset);
      }
    },
    getMyList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }
      this.loading = true;

      const Func = [getDeliveryListApi, getDeliveryHistoryListApi][this.GET_PAGE_MENU_FUNC];

      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
          console.log(res);
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onFunc() {
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
                this.getList(true);
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
                this.getList(true);
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
              uni.showToast({title: "指定成功"});
              this.getList(true);
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
          perm: "DELIVERY_CONFIRM",
        },
        {
          name: "取消配送",
          func: "onCancel",
          color: "#e43d33",
          status: ["CREATED"],
          perm: "DELIVERY_CANCEL",
        },
      ]
        .filter(item => this.isPerm(item.perm) && item.status.includes(node?.status));
    },
  },
};
</script>

<template>
  <view class="ko-send">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <TopMenus :path="PageEnums.logisticsDelivery"/>

    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10" v-if="isPerm('LOGISTICS_COUNT')">
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

    <HistoryBar
      v-model="PAGE_MENU_INDEX"
      :values="GET_PAGE_MENU"
      label-key="label"

      @change="getList(true)"
    />

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px" v-for="item of list" :key="item.id">
          <OrderCard
            :item="item"
            is-logistics
            @click="onJumpDetails(item, 'logistics')"
            is-new
            show-order-type
            show-order-phone
          >
            <template #operate>
              <view style="display: flex; align-items: center; justify-content: flex-end;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onBind(item)"
                  v-if="['CREATED'].includes(item.status) && isPerm('DELIVERY_BIND')"
                >
                  指定物流商
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item)"
                  v-if="['CREATED'].includes(item.status)"
                >
                  更多
                </button>
              </view>
            </template>
          </OrderCard>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px; flex: 1; overflow: hidden">
      <KoTable
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJumpDetails($event, 'logistics')"
        @load-next="RequestNextPage"
        :no-more="noMore || loading"
      >
        <!--
        @row-click="onJumpDetails($event, 'receivable')"
        -->
        <template #operate="{item}">
          <view
            style="display: flex; align-items: center; justify-content: center;"
          >
            <button
              class="ko-basic-button__card"
              @click.stop="onBind(item)"
              v-if="['CREATED'].includes(item.status) && isPerm('DELIVERY_BIND')"
            >
              指定物流商
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onConfirm(item)"
              v-if="['CREATED'].includes(item.status) && isPerm('DELIVERY_CONFIRM')"
            >
              完成配送
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onCancel(item)"
              v-if="['CREATED'].includes(item.status) && isPerm('DELIVERY_CANCEL')"
            >
              取消配送
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

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

    <BasicPopup :visible.sync="visible" v-if="isPerm('DELIVERY_BIND')">
      <view class="ko-send__popup">
        <UniForms ref="FormRef" :model="form" :rules="rules" label-width="100px" label-align="right">
          <UniFormsItem required label="物流商：" name="logisticsId">
            <view style="width: 100%;">
              <PickerUser v-if="isPerm('LOGISTICS_LIST')" v-model="form.logisticsId" type="logistics" is-input placeholder="请选择" />
              <view v-if="!isPerm('LOGISTICS_LIST')" style="font-size: 10px;color: #e43d33; margin-top: 5px;">
                您没有获取物流信息权限，请联系管理员授权。
              </view>
            </view>
          </UniFormsItem>
          <UniFormsItem label="物流单号：" name="logisticsNo">
            <UniEasyinput placeholder="请输入" v-model="form.logisticsNo" />
          </UniFormsItem>
        </UniForms>
      </view>
      <template #footer>
        <view style="display: flex; justify-content: center; align-items: center">
        <button class="ko-basic-button__card" @click="onSubmit" style="width: 120px">保存</button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-send {
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 50px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;

  .ko-history {
    //width: 500px;
  }

  // #endif

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

  &__popup {
    // #ifdef MP
    width: 90vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;


    // #ifdef H5
    width: 100%;
    // #endif
  }
}
</style>
