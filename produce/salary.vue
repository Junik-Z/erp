<!-- 员工工资 -->
<script>
import { getMySalaryApi, getMySettledListApi, getMyWorkingListApi, getWaitMyConfirmListApi } from "@/api/erp/produce";
import { _deepCopy, _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "@/produce/components/TopMenus.vue";
import { TabList } from "./define";

export default {
  name: "salary",
  components: {TopMenus, KoList},
  data() {
    return {
      MySalary: 0,
      CountList: [
        {
          label: "我的工资",
          key: "MySalary",
          color: "#2979ff",
          unit: "元",
          span: 24,
        },
      ],

      tab: 0,
      values: [
        "待处理",
        "待确认",
        "已结算",
      ],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },

      list: [],
      loading: false,
      noMore: false,

      node: {},
      nodeIndex: null,
    };
  },
  mixins: [mixins],
  onLoad() {
    this.getMySalary();

    this.getList(true);
  },
  onReachBottom() {
    this.onRequestNextPage();
  },
  methods: {
    // 获取我的工资
    getMySalary() {
      getMySalaryApi()
        .then(res => {
          this.MySalary = res.data;
          console.log(res.data);
        });
    },

    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      const Func = [getMyWorkingListApi, getWaitMyConfirmListApi, getMySettledListApi][this.tab];
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
        });
    },

    onResetList() {
    },

    onSelect({func}) {
      this[func](_deepCopy(this.node), this.nodeIndex);
    },

    onActionClick(node, index) {
      this.node = node;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
  },
  computed: {
    getCountValue() {
      return (item) => {
        return this[item.key];
      };
    },

    actionList() {
      return [];
    },

    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif


    TabList() {
      return TabList;
    },
  },
};
</script>

<template>
  <view class="ko-salary">
    <TopMenus :tabs="TabList" :current="3" />

    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count">
            <view class="ko-basic-count__label">{{ item.label }}</view>
            <view class="ko-basic-count__info">
              <uv-count-to
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
      v-model="tab"
      :values="values"
      @change="getList(true)"
      :is-show-search="false"
      ref="SearchRef"
    />

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
              >
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

            <!-- <button
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
             </button>-->
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <uv-action-sheet
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
.ko-salary {

}
</style>
