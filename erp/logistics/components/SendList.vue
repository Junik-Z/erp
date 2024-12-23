<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  cancelDeliveryApi,
  confirmDeliveryApi,
  getDeliveryHistoryListApi,
  getDeliveryListApi,
  putBindApi,
} from "@/api/erp/logistics";
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get } from "@/utils";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";

export default {
  name: "SendList",
  components: {
    PickerUser,
    UniEasyinput,
    UniFormsItem,
    UniForms,
    BasicPopup,
    UvActionSheet,
    OrderCard,
    LoadMore,
    HistoryBar,
    UniListItem,
    UniCol,
    UniRow,
    UniList,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      loading: false,
      list: [],

      isHistory: false,

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
                      size: 64,
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
    };
  },
  mounted() {
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getDeliveryHistoryListApi : getDeliveryListApi;
      Func({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.list = res.data;
          console.log(res.data);
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
                this.getList();
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
  <view class="ko-send">
    <HistoryBar v-model="isHistory" text="配送订单" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <OrderCard :item="item" is-logistics @click="onJumpDetails(item, 'logistics')">
            <template #operate v-if="isPerm('Delivery_Write') || (isBusiness || isAdmin)">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onBind(item)"
                  v-if="['CREATED'].includes(item.status)"
                >
                  指定物流商
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item)"
                  v-if="['CREATED'].includes(item.status)"
                  style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"
                >
                  <i class="iconfont icon-gengduocaozuo"></i>
                </button>
              </view>
            </template>
          </OrderCard>
        </template>
      </UniListItem>
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
            <view
              v-if="isPerm('Delivery_Write')"
              style="display: flex; align-items: center; justify-content: center;"
            >
              <button
                class="ko-basic-button__card"
                @click.stop="onBind(item)"
                v-if="['CREATED'].includes(item.status)"
              >
                指定物流商
              </button>
              <button
                class="ko-basic-button__card"
                @click.stop="onConfirm(item)"
                v-if="['CREATED'].includes(item.status)"
              >
                完成配送
              </button>
              <button
                class="ko-basic-button__card"
                @click.stop="onCancel(item)"
                v-if="['CREATED'].includes(item.status)"
              >
                取消配送
              </button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </UniList>

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

    <BasicPopup :visible.sync="visible" v-if="isPerm('Delivery_Write') || (isBusiness || isAdmin)">
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
  </view>
</template>

<style scoped lang="scss">
.ko-send {
  //padding: 10px;
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 50px;
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

  .ko-basic-button__card {
    margin: 5px;
  }
}
</style>
