<script>
// #ifdef H5
import CNC from "./components/CNC.vue";
import PrintLabels from "@/produce/components/PrintLabels.vue";
// #endif
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
  getProduceInListApi,
  getProduceListApi,
  pauseProduceApi,
  removeProduceApi,
} from "@/api/erp/produce";
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _isEmpty, _isEqual, _isString } from "@/utils";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "./components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import MaterialPopup from "./components/MaterialPopup.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import Settlement from "./components/Settlement.vue";
import reLogin from "@/mixins/re-login";

const PageMenu = [
  {
    label: "待生产",
    perm: "PRODUCE_PENDING",
    func: 0,
  },
  {
    label: "生产中",
    perm: "PRODUCE_LIST",
    func: 1,
  },
  {
    label: "已完成",
    perm: "PRODUCE_HISTORY",
    func: 2,
  },
];

export default {
  name: "WorkList",
  components: {
    PickerCalendars,
    TopMenus,
    KoList,
    KoMovable,
    UvActionSheet,
    HistoryBar,
    UniCol,
    UniRow,
    BasicCard,
    OrderCard,
    MaterialPopup,

    Settlement,

    // #ifdef H5
    CNC,
    PrintLabels,
    // #endif
  },
  data() {
    const _this = this;
    return {
      TabList,
      MOVABLE_LIST: [
        // #ifdef MP
        /*  {
           text: "板材",
           iconfont: "icon-icon-test",
           path: "share",
           openType: "share",
           params: {
             title: `邀请您来下单啦！`,
             path: PageEnums.produceWork,
             query: {
               PAGE_TYPE: "ADDED_PRODUCE_PACKING",
               ADDED_TYPE: "packing",
             },
           },
           perm: "SALE_SHARE",
         }, */
        // #endif
        {
          text: "常规",
          iconfont: "icon-tianjia",
          path: PageEnums.produceWork + "?ADDED_TYPE=common",
          perm: "PRODUCE_ADD",
        },
        {
          text: "板材",
          iconfont: "icon-ziyuanicon",
          path: PageEnums.produceWork + "?ADDED_TYPE=packing",
          perm: "CNC_ADD_CUSTOMIZED_BOARD",
        },
        // #ifdef H5
        {
          text: "定制",
          iconfont: "icon-dingzhishengchan",
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx",
          perm: "PRODUCE_ADD",
        },
        // #endif
      ],

      list: [],
      loading: false,
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },
      noMore: false,

      node: {},


      tableKey: +new Date(),

      PAGE_MENU: _deepCopy(PageMenu),

      // PAGE_MENU_INDEX: 2,

      noRefresh: false,

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "编号",
          prop: "orderCode",
        },
        {
          label: "日期",
          prop: "updateTime",
        },
        {
          label: "状态",
          prop: "status",
          render(h, {row}) {
            return h("span", [_this.PRODUCE_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "总价",
          prop: "totalAmount",
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.totalAmount)]);
          },
        },
        {
          label: "客户",
          prop: "customer",
          children: [
            {
              label: "Logo",
              prop: "customer.logo",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {
                    props: {
                      src: _this.getImageUrl(_get(row, "customer.logo")),
                      size: 42,
                      text: _get(row, "customer.name") || _this.GET_SHOP_NAME,
                    },
                  })],
                );
              },
            },
            {
              label: "名称",
              prop: "customer.name",
            },
          ],
        },
        {
          label: "提单用户",
          prop: "user",
          children: [
            {
              label: "头像",
              prop: "user.avatar",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "user.avatar")), size: 42}})],
                );
              },
            },
            {
              label: "昵称",
              prop: "user.nickName",
            },
          ],
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "电话",
          prop: "orderPhone",
        },
        {
          label: "计划完成时间",
          prop: "planFinishDate",
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
  mixins: [mixins, reLogin],
  onLoad() {
  },
  onShow() {
    if (!uni.getStorageSync("TO_DETAILS")) {
      this.getList(true);
    }

    setTimeout(() => {
      uni.setStorageSync("TO_DETAILS", false);
    }, 100);
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
      const Func = [getProduceInListApi, getProduceListApi, getProduceHistoryListApi][this.GET_PAGE_MENU_FUNC];
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
    onJump(row, index, isTechnology = false) {
      let query = "";
      this.noRefresh = true;
      if (row || isTechnology) {
        // &ADDED_TYPE=${type} const type = !_isEmpty(row.customizedMaterials) ? "xlsx" : !_isEmpty(row.customizedBoards) ? "packing" : "common";
        query = `?id=${row.id}`;

        if (isTechnology) {
          query += `&isTechnology=true`;
        }
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

    // 进入生产
    onDischarging(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `请确认是否需要进入生产，出料后工单将无法修改。`,
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__discharging_loading__", true);
            applyMaterialProduceApi({id: item.id, produceType: item.produceType})
              .then(() => {
                uni.showToast({title: "申请成功"});
                // this.$set(this.list[index], "status", "APPLY_MATERIAL");
                this.list.splice(index, 1);
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

    // 完成生产
    onPause(item, index) {
      console.log(item.status === "PAUSED");
      uni.showModal({
        title: "温馨提示",
        content: `您确定要${item.status === "PAUSED" ? "恢复" : "暂停"}生产吗？`,
        success: (res) => {
          if (res.confirm) {
            this.$set(this.list[index], "__pause_loading__", true);
            pauseProduceApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.$set(this.list, index, {...item, status: item.status === "PAUSED" ? "APPLY_MATERIAL" : "PAUSED"});
              })
              .finally(() => {
                this.$set(this.list[index], "__pause_loading__", false);
              });
          }
        },
      });
    },

    // 删除
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

    // 点击更多按钮
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

    // 修改工艺
    onTechnology(item, index) {
      this.onJump(item, index, true);
    },

    // 处理添加材料
    onAddedMaterial(item, index) {
      this.noRefresh = true;
      this.$refs.MPRef.open(item);
    },

    onResetList() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();
      this.getList(true);
    },

    // 确定开始结束时间了
    onCalendarConfirm(event) {
      if (event) {
        const r = event.range || {};
        this.queryList.startTime = r.before ? r.before + " 00:00:00" : "";
        this.queryList.endTime = r.after ? r.after + " 23:59:59" : "";
      } else {
        this.queryList.startTime = "";
        this.queryList.endTime = "";
      }
    },

    // 处理结算
    onSettlement(item, index) {
      this.$refs.SRef.open(item, index);
    },

    // #ifdef H5
    onCncClick(item, index) {
      this.$refs.CncRef.open(item, index);
    },

    // 处理打印标签
    onPrintLabel(obj) {
      this.$refs.PLRef.open(obj);
    },
    // #endif
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.GET_PAGE_MENU_FUNC == 2 ? !_isEqual(item.label, "操作") : true);
    },
    // #endif

    actionList() {
      const node = this.node;
      return [
        {
          name: "取消工单",
          func: "onCancel",
          status: ["CREATED"],
          perm: "PRODUCE_CANCEL",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED"],
          perm: "PRODUCE_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          status: ["CANCELLED", "CREATED"],
          perm: "PRODUCE_DELETE",
        },
      ]
        .filter(item => {
          const isPerm = this.isPerm(item.perm);

          /*  if (_isEqual(item.func, "onJump") && _isEqual(node.produceType, "customized")) {
             return this.isPerm("PURCHASE_CUSTOMIZED_UPDATE");
           } */

          return item?.status?.includes(node.status) && isPerm;
        });
    },
  },

  // 分享相关
  onShareAppMessage(res) {
    const obj = res.target.dataset.params;
    return new Promise(async (resolve) => {
      const query = await this._GET_SHARE_APP_PARAMS_(obj);
      if (query.title) query.title = `${this.GET_SHOP_NAME || ""} ${query.title}`;
      resolve(query);
    });
  },
};
</script>

<template>
  <view class="ko-work-list">
    <TopMenus :tabs="TabList" :path="PageEnums.produceWorkList" />

    <HistoryBar
      v-model="PAGE_MENU_INDEX"
      :values="GET_PAGE_MENU"
      label-key="label"

      @change="getList(true)"
      is-show-search
      ref="SearchRef"
    >
      <view class="ko-basic-search">
        <UniRow :gutter="10">
          <UniCol :span="24">
            <uni-easyinput v-model="queryList.orderCode" placeholder="请输入编号" />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput v-model="queryList['customer.name']" placeholder="请输入客户名称" />
          </UniCol>
          <UniCol :span="24" v-if="false">
            <uni-easyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
          </UniCol>
          <UniCol :span="24">
            <PickerCalendars
              placeholder="请选择开始结束时间"
              mode="range"
              @confirm="onCalendarConfirm"
              ref="PCRef"
            />
          </UniCol>
          <UniCol :span="24">
            <view style="display: flex;align-items: center;justify-content: space-around; padding-top: 10px;">
              <button
                style="width: 35%;"
                class="ko-basic-button__card"
                @click.stop="onResetList(true)"
              >
                重置
              </button>
              <button
                style="width: 35%;"
                class="ko-basic-button__card"
                @click.stop="getList(true)"
              >
                搜索
              </button>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </HistoryBar>

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 10px;">
          <block v-for="(item, index) of list" :key="item.id">
            <OrderCard
              :item="item"
              :spacing="10"
              @click="onJumpDetails(item, 'produce')"
              is-new
              show-order-phone
              is-work
            >
              <template #operate>
                <view style="display: flex; align-items: center; justify-content: flex-end;">
                  <button
                    class="ko-basic-button__card"
                    v-if="GET_PAGE_MENU_FUNC === 0 && isPerm('PRODUCE_UPDATE')"
                    @click.stop="onAddedMaterial(item, index)"
                  >
                    添加物料
                  </button>

                  <button
                    class="ko-basic-button__card"
                    v-if="['CREATED'].includes(item.status) && isPerm('PRODUCE_APPLY_MATERIAL')"
                    @click.stop="onDischarging(item, index)"
                    :loading="item.__discharging_loading__"
                    :disabled="item.__discharging_loading__"
                  >
                    进入生产
                  </button>
                  <button
                    class="ko-basic-button__card"
                    v-if="['APPLY_MATERIAL', 'PAUSED'].includes(item.status) && isPerm('PRODUCE_PAUSE')"
                    @click.stop="onPause(item, index)"
                    :loading="item.__pause_loading__"
                    :disabled="item.__pause_loading__"
                  >
                    {{ item.status === "PAUSED" ? "恢复" : "暂停" }}
                  </button>
                  <button
                    class="ko-basic-button__card"
                    v-if="['APPLY_MATERIAL', 'PAUSED'].includes(item.status) && isPerm('PRODUCE_UPDATE_CRAFT_PROCESS')"
                    @click.stop="onTechnology(item, index)"
                  >
                    修改工艺
                  </button>
                  <button
                    class="ko-basic-button__card"
                    v-if="['APPLY_MATERIAL'].includes(item.status) && isPerm('PRODUCE_FINISH')"
                    @click.stop="onFinish(item, index)"
                    :loading="item.__finish_loading__"
                    :disabled="item.__finish_loading__"
                  >
                    完成
                  </button>

                  <!-- 结算 -->
                  <button
                    class="ko-basic-button__card"
                    v-if="['FINISHED'].includes(item.status) && isPerm('CRAFT_APPLY_SETTLE')"
                    @click.stop="onSettlement(item, index)"
                  >
                    结算
                  </button>

                  <!-- 更多按钮 -->
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onActionClick(item, index)"
                    v-if='["CREATED", "CANCELLED"].includes(item.status)'
                  >
                    更多
                  </button>
                </view>
              </template>
            </OrderCard>
          </block>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="ko-work-list__table">
      <KoTable
        :loading="loading"
        :columns="getColumns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJumpDetails($event, 'produce')"

        @next-load="onRequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item, index}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <block>
              <button
                class="ko-basic-button__card"
                v-if="GET_PAGE_MENU_FUNC === 0 && isPerm('PRODUCE_UPDATE')"
                @click.stop="onAddedMaterial(item, index)"
              >
                添加物料
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED'].includes(item.status) && isPerm('PRODUCE_APPLY_MATERIAL')"
                @click.stop="onDischarging(item, index)"
                :loading="item.__discharging_loading__"
                :disabled="item.__discharging_loading__"
              >
                进入生产
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['APPLY_MATERIAL', 'PAUSED'].includes(item.status) && isPerm('PRODUCE_PAUSE')"
                @click.stop="onPause(item, index)"
                :loading="item.__pause_loading__"
                :disabled="item.__pause_loading__"
              >
                {{ item.status === "PAUSED" ? "恢复" : "暂停" }}
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['APPLY_MATERIAL'].includes(item.status) && isPerm('PRODUCE_FINISH')"
                @click.stop="onFinish(item, index)"
                :loading="item.__finish_loading__"
                :disabled="item.__finish_loading__"
              >
                完成
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['APPLY_MATERIAL', 'PAUSED'].includes(item.status) && isPerm('PRODUCE_UPDATE_CRAFT_PROCESS')"
                @click.stop="onTechnology(item, index)"
              >
                修改工艺
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED'].includes(item.status) && isPerm('PRODUCE_CANCEL')"
                @click.stop="onCancel(item, index)"
                :loading="item.__cancel_loading__"
                :disabled="item.__cancel_loading__"
              >
                取消工单
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED', 'CANCELLED'].includes(item.status) && isPerm('PRODUCE_UPDATE')"
                @click.stop="onJump(item, index)"
              >
                编辑
              </button>
              <button
                class="ko-basic-button__card"
                v-if="['CREATED', 'CANCELLED'].includes(item.status) && isPerm('PRODUCE_DELETE')"
                @click.stop="onRemove(item, index)"
                :loading="item.__r_loading__"
                :disabled="item.__r_loading__"
              >
                删除
              </button>
            </block>
            <button
              class="ko-basic-button__card"
              v-if="['APPLY_MATERIAL'].includes(item.status) && (isPerm('CNC_NC_PROGRAMS') || isPerm('CNC_PROPERTIES'))"
              @click.stop="onCncClick(item, index)"
            >
              CNC
            </button>
          </view>
        </template>
      </KoTable>
    </view>

    <CNC ref="CncRef" @print-label="onPrintLabel" />

    <PrintLabels ref="PLRef" />
    <!-- #endif -->

    <MaterialPopup ref="MPRef" @close="noRefresh = false" />

    <KoMovable
      :content="GET_MOVABLE_LIST"
      v-if="isShowMovable"
      @click="onAddedJump"
    />

    <Settlement ref="SRef" />

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

<style lang="scss">
.ko-work-list {
  padding-top: 10px;

  width: 100%;

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

  // #ifdef H5
  &__table {
    height: calc(100vh - 64px - 90px);
    padding: 10px;
  }

  // #endif
}
</style>
