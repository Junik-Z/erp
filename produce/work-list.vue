<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import {
  applyMaterialProduceApi,
  cancelProduceApi,
  finishProduceApi,
  getProduceDetailApi,
  getProduceHistoryListApi,
  getProduceListApi,
  removeProduceApi,
} from "@/api/erp/produce";
import mixins from "@/mixins/mixins";
import { _deepCopy, _isEmpty, _isEqual, _isString } from "@/utils";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "@/produce/components/TopMenus.vue";
import { TabList } from "@/produce/define";

export default {
  name: "WorkList",
  components: {
    TopMenus,
    KoList,
    KoMovable,
    UvActionSheet,
    HistoryBar,
    UniCol,
    UniRow,
    BasicCard,
  },
  data() {
    const _this = this;
    return {
      TabList,

      isHistory: false,
      list: [],
      loading: false,
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },
      noMore: false,

      node: {},

      MovableList: [
        {
          text: "常规",
          iconPath: "/static/images/icons/added.png",
          path: PageEnums.produceWork + "?ADDED_TYPE=common",
        },
        {
          text: "板材",
          iconPath: "/static/images/icons/added.png",
          path: PageEnums.produceWork + "?ADDED_TYPE=packing",
        },
        {
          text: "定制",
          iconPath: "/static/images/icons/added.png",
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx",
        },
      ],

      tableKey: +new Date(),

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
  onLoad() {
  },
  onShow() {
    this.getList(true);
  },
  onReachBottom() {
    this.onRequestNextPage();
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset && !this.noRefresh) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (this.noRefresh && info && this.list.length) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Func = this.isHistory ? getProduceHistoryListApi : getProduceListApi;
      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;

          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },
    onJump(row) {
      let query = "";
      this.noRefresh = true;
      if (row) {
        const type = !_isEmpty(row.customizedMaterials) ? "xlsx" : !_isEmpty(row.customizedBoards) ? "packing" : "common";
        query = `?id=${row.id}&ADDED_TYPE=${type}`;
      }
      uni.navigateTo({
        url: PageEnums.produceWork + query,
      });
    },
    onCancel(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `确定要取消生产工单吗？此操作不可撤销。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__cancel_loading__", true);
            cancelProduceApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.list.splice(index, 1);
              })
              .finally(() => {
                this.$set(item, "__cancel_loading__", false);
              });
          }
        },
      });
    },
    onDischarging(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `请确认是否需要申请出料，出料后工单将无法修改。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__discharging_loading__", true);
            applyMaterialProduceApi({id: item.id})
              .then(() => {
                uni.showToast({title: "申请成功"});
                // this.getList(true);
              })
              .finally(() => {
                this.$set(item, "__discharging_loading__", false);
              });
          }
        },
      });
    },
    // 完成生产
    onFinish(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `请确认您是否已真正完成工单。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__finish_loading__", true);
            finishProduceApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.list.splice(index, 1);
              })
              .finally(() => {
                this.$set(item, "__finish_loading__", false);
              });
          }
        },
      });
    },

    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此工单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removeProduceApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});
                // this.getList(true);
                this.list.splice(index, 1);
              })
              .finally(() => {
                this.$set(item, "__r_loading__", false);
              });
          }
        },
      });
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    // 处理新增
    onAddedJump({item}) {
      this.noRefresh = true;
      uni.navigateTo({
        url: item.path,
      });
    },

    // 更新列表数据
    updateList() {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getProduceDetailApi({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif

    actionList() {
      const node = this.node;
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
    <TopMenus :tabs="TabList" :current="2" />

    <HistoryBar v-model="isHistory" text="生产" @change="getList(true)" />

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px" v-for="(item, index) of list" :key="item.id">
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
                  @click.stop="onDischarging(item, index)"
                  :loading="item.__discharging_loading__"
                  :disabled="item.__discharging_loading__"
                >
                  申请出料
                </button>

                <button
                  class="ko-basic-button__card"
                  v-if="['APPLY_MATERIAL'].includes(item.status)"
                  @click.stop="onFinish(item, index)"
                  :loading="item.__finish_loading__"
                  :disabled="item.__finish_loading__"
                >
                  完成生产
                </button>

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item, index)"
                  v-if='["CREATED", "CANCELLED"].includes(item.status)'
                >
                  更多
                </button>
              </view>
            </view>
          </BasicCard>
        </view>
      </KoList>
    </view>
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
        <template #operate="{item, index}" v-if="isPerm('Produce_Write')">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              class="ko-basic-button__card"
              v-if="['CREATED'].includes(item.status)"
              @click.stop="onDischarging(item, index)"
              :loading="item.__discharging_loading__"
              :disabled="item.__discharging_loading__"
            >
              申请出料
            </button>
            <button
              class="ko-basic-button__card"
              v-if="['APPLY_MATERIAL'].includes(item.status)"
              @click.stop="onFinish(item, index)"
              :loading="item.__finish_loading__"
              :disabled="item.__finish_loading__"
            >
              完成生产
            </button>
            <button
              class="ko-basic-button__card"
              v-if="['CREATED'].includes(item.status)"
              @click.stop="onCancel(item, index)"
              :loading="item.__cancel_loading__"
              :disabled="item.__cancel_loading__"
            >
              取消工单
            </button>
            <button
              class="ko-basic-button__card"
              v-if="['CREATED', 'CANCELLED'].includes(item.status)"
              @click.stop="onJump(item, index)"
            >
              修改
            </button>
            <button
              class="ko-basic-button__card"
              v-if="['CREATED', 'CANCELLED'].includes(item.status)"
              @click.stop="onRemove(item, index)"
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

    <KoMovable
      :content="MovableList"
      v-if="isPerm('Produce_Write')"
      @click="onAddedJump"
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
