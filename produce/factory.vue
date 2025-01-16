<!-- 员工工资 -->
<script>
import { getSettledListApi, getWaitConfirmListApi, getWorkingListApi } from "@/api/erp/produce";
import { _deepCopy, _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "@/produce/components/TopMenus.vue";
import { TabList } from "./define";

export default {
  name: "Factory",
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
        "生产中",
        "待结算",
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
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      const Func = [getWorkingListApi, getWaitConfirmListApi, getSettledListApi][this.tab];
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
      this.noRefresh = false;
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.getList(true);
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
    actionList() {
      return [];
    },

    TabList() {
      return TabList;
    },

    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-factory">
    <TopMenus :tabs="TabList" :current="4" />

    <HistoryBar
      v-model="tab"
      :values="values"
      @change="onResetList()"
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
                <UniCol :span="24">
                  <label class="ko-basic-label">预计完成时间：</label>
                  <text>{{ item.planFinishDate }}</text>
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
.ko-factory {
  //padding-top: 10px;
}
</style>
