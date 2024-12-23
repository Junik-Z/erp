<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import {
  applyMaterialProduceApi,
  cancelProduceApi,
  finishProduceApi,
  getProduceHistoryListApi,
  getProduceListApi,
  removeProduceApi,
} from "@/api/erp/produce";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import { _deepCopy, _isEqual } from "@/utils";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";

export default {
  name: "ClientList",
  components: {UvActionSheet, LoadMore, HistoryBar, UniCol, UniRow, UniFab, BasicCard, UniListItem, UniList},
  data() {
    const _this = this;
    return {
      isHistory: false,
      list: [],
      loading: false,
      actionItem: {},

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "工单单号",
          prop: "orderCode",
        },
        {
          label: "计划完成时间",
          prop: "planFinishDate",
        },
        {
          label: "状态",
          prop: "status",
          render: (h, {row}) => {
            return h("div", {}, [_this.PRODUCE_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          slot: "operate",
          width: 380,
        },
      ],
      // #endif
    };
  },
  mixins: [mixins],
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getProduceHistoryListApi : getProduceListApi;
      Func({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onJump(row) {
      let query = "";
      if (row) {
        query = `?id=${row.id}`;
      }

      uni.navigateTo({
        url: "/erp/produce/work" + query,
      });
    },
    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `确定要取消生产工单吗？此操作不可撤销。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__cancel_loading__", true);
            cancelProduceApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__cancel_loading__", false);
              });
          }
        },
      });
    },
    onDischarging(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请确认是否需要申请出料，出料后工单将无法修改。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__discharging_loading__", true);
            applyMaterialProduceApi({id: item.id})
              .then(() => {
                uni.showToast({title: "申请成功"});
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__discharging_loading__", false);
              });
          }
        },
      });
    },
    onFinish(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请确认您是否已真正完成工单。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__finish_loading__", true);
            finishProduceApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__finish_loading__", false);
              });
          }
        },
      });
    },

    onRemove(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此工单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removeProduceApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__r_loading__", false);
              });
          }
        },
      });
    },

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif

    actionList() {
      const node = this.actionItem;
      return [
        {
          name: "取消工单",
          func: "onCancel",
          status: ["CREATED"],
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED"],
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          status: ["CANCELLED", "CREATED"],
        },
      ]
        .filter(li => li.status.includes(node.status));
    },
  },
};
</script>

<template>
  <view class="ko-client">
    <HistoryBar v-model="isHistory" text="生产工单" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="(item, index) of list" :key="index">
        <template #body>
          <BasicCard @click="onJumpDetails(item, 'produce')">
            <view class="ko-client__info">
              <UniRow gutter="10">
                <UniCol :span="24">
                  <label class="ko-basic-label">计划编号：</label>
                  <text>{{ item.orderCode }}</text>
                </UniCol>
                <UniCol :span="24" v-if="false">
                  <label class="ko-basic-label">原材料总值：</label>
                  <text class="ko-basic-money"> {{ toYuan(item.totalRawMaterialAmount) }}元</text>
                </UniCol>
                <UniCol :span="24" v-if="false">
                  <label class="ko-basic-label">成品总值：</label>
                  <text class="ko-basic-money"> {{ toYuan(item.totalProductAmount) }}元</text>
                </UniCol>
                <UniCol :span="24" v-if="false">
                  <label class="ko-basic-label">预计创造价值：</label>
                  <text class="ko-basic-money"> {{ toYuan(item.totalAmount) }}元</text>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">预计完成时间：</label>
                  <text>{{ item.planFinishDate }}</text>
                </UniCol>
                <UniCol :span="24" v-if="isHistory">
                  <label class="ko-basic-label">工单状态：</label>
                  <text>{{ PRODUCE_STATUS_ENUMS(item.status) }}</text>
                </UniCol>
              </UniRow>
              <view
                style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
                v-if="isPerm('Produce_Write')"
              >
                <button
                  class="ko-basic-button__card"
                  v-if="['CREATED'].includes(item.status)"
                  @click.stop="onDischarging(item)"
                  :loading="item.__discharging_loading__"
                  :disabled="item.__discharging_loading__"
                >
                  申请出料
                </button>

                <button
                  class="ko-basic-button__card"
                  v-if="['APPLY_MATERIAL'].includes(item.status)"
                  @click.stop="onFinish(item)"
                  :loading="item.__finish_loading__"
                  :disabled="item.__finish_loading__"
                >
                  完成生产
                </button>

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item)"
                  style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"
                  v-if='["CREATED", "CANCELLED"].includes(item.status)'
                >
                  <i class="iconfont icon-gengduocaozuo"></i>
                </button>

                <template v-if="false">
                  <button
                    class="ko-basic-button__card"
                    v-if="['CREATED'].includes(item.status)"
                    @click.stop="onCancel(item)"
                    :loading="item.__cancel_loading__"
                    :disabled="item.__cancel_loading__"
                  >
                    取消工单
                  </button>
                  <button
                    class="ko-basic-button__card"
                    v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                    @click.stop="onJump(item)"
                  >
                    修改
                  </button>
                  <button
                    class="ko-basic-button__card"
                    v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                    @click.stop="onRemove(item)"
                    :loading="item.__r_loading__"
                    :disabled="item.__r_loading__"
                  >
                    删除
                  </button>
                </template>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>
      <LoadMore :loading="loading" />
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="getColumns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpDetails($event, 'produce')"
        >
          <template #operate="{item}" v-if="isPerm('Produce_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button
                class="ko-basic-button__card"
                v-if="['CREATED'].includes(item.status)"
                @click.stop="onDischarging(item)"
                :loading="item.__discharging_loading__"
                :disabled="item.__discharging_loading__"
              >
                申请出料
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['APPLY_MATERIAL'].includes(item.status)"
                @click.stop="onFinish(item)"
                :loading="item.__finish_loading__"
                :disabled="item.__finish_loading__"
              >
                完成生产
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED'].includes(item.status)"
                @click.stop="onCancel(item)"
                :loading="item.__cancel_loading__"
                :disabled="item.__cancel_loading__"
              >
                取消工单
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                @click.stop="onJump(item)"
              >
                修改
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                @click.stop="onRemove(item)"
                :loading="item.__r_loading__"
                :disabled="item.__r_loading__"
              >
                删除
              </button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </UniList>

    <UniFab
      v-if="isPerm('Produce_Write')"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      direction="vertical"
      @fab-click="onJump()"
    />

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
.ko-client {
  width: 100%;

  .ko-basic-button__card {
    margin: 5px;
  }

  :deep(.uni-list-item__container ) {
    display: block;
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
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }
}
</style>
