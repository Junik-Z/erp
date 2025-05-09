<script>
import { _deepCopy, _get, _isEmpty } from "@/utils";
import { getReportRecentListApi } from "@/api/erp/finance";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

export default {
  name: "lately",
  components: {
    KoList,
    OrderCard,
    UniRow,
    UniCol,
    UniEasyinput,
  },
  data() {
    return {
      loading: false,
      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },
      noMore: false,

      tableKey: +new Date(),

      tab: 0,
    };
  },
  mixins: [mixins],
  onLoad() {
    this.getList(true);
  },
  methods: {
    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 请求列表
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      this.loading = true;
      const params = _deepCopy(this.queryList);

      params.type = _get(this.Tabs, `${this.tab}.value`);

      getReportRecentListApi(params)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
          console.log(res.data);
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 获取数据
    onResetList() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SRef.onShowSearch(false);
      this.getList(true);
    },
  },

  computed: {
    Tabs() {
      return [
        {
          label: "收入",
          value: "INCOME",
        },
        {
          label: "支出",
          value: "EXPENSE",
        },
        {
          label: "其他支出",
          value: "OTHER_EXPENSES",
        },
      ];
    },

    // 表格头部
    // #ifdef H5
    columns() {
      return [
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
          label: "类型",
          prop: "orderType",
          render: (h, {row}) => {
            return h("div", {}, `${this.ORDER_TYPE_ENUMS(row.orderType)}`);
          },
        },
        {
          label: "日期",
          prop: "updateTime",
          width: 180,
        },
        {
          label: "客户/供应商",
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
                      src: this.getImageUrl(_get(row, "customer.logo")),
                      size: 42,
                      text: _get(row, "customer.name") || this.GET_SHOP_NAME,
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
          label: "金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money", style: "color: #388E3C;"}, ` ${this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "成本(元)",
          prop: "costAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money", style: "color: #D32F2F;"}, ` ${this.toYuan(row.costAmount)}`);
          },
        },
        {
          label: "利润(元)",
          prop: "profitAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money", style: "color: #303F9F;"}, ` ${this.toYuan(row.profitAmount)}`);
          },
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
        },
      ];
    },
    // #endif
  },
};
</script>

<template>
  <!-- #ifdef H5 -->
  <KoList
    class="ko-lately__h5"
    :no-more="noMore"
    hide-tips
    @load-next="RequestNextPage"
    @lower="RequestNextPage"
    :data="list"
    :loading="loading"
  >
    <!-- #endif -->
    <view class="ko-lately">
      <!-- #ifdef MP -->
      <Notice />
      <!-- #endif -->

      <HistoryBar
        v-model="tab"
        :values="Tabs"
        label-key="label"
        @change="onResetList(true)"
        ref="SRef"

        is-show-search
      >
        <view class="ko-basic-search">
          <UniRow :gutter="10">
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderCode" placeholder="请输入编号" />
            </UniCol>
            <block v-if="[0, 1].includes(tab)">
              <UniCol :span="24">
                <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入客户/供应商名称" />
              </UniCol>
              <UniCol :span="24">
                <UniEasyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
              </UniCol>
            </block>
            <block v-else>
              <UniCol :span="24">
                <UniEasyinput v-model="queryList.orderType" placeholder="费用名称" />
              </UniCol>
            </block>
            <UniCol :span="24">
              <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
                <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onResetList(true)">重置</button>
                <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getList(true)">搜索</button>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </HistoryBar>

      <!-- #ifdef MP -->
      <view style="padding: 10px;">
        <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
          <view
            v-for="(item, index) of list"
            :key="index"
            style="padding: 5px"
          >
            <OrderCard
              :item="item"
              is-reports
              is-new
              show-order-type
              is-hide-status
              is-hide-user
            />
          </view>
        </KoList>
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px; height: 100%; overflow: hidden;">
        <KoTable
          :columns="columns"
          :data="list"
          empty-text="暂无数据"
          stripe
          :no-more="noMore"
          no-refresh
        />
      </view>
      <!-- #endif -->
    </view>

    <!-- #ifdef H5 -->
  </KoList>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-lately {
  padding-top: 10px;

  // #ifdef MP
  padding-bottom: 30px;
  // #endif


  // #ifdef H5
  &__h5 {
    height: calc(100vh - 56px - 10px);
    overflow-y: auto;
  }

  // #endif

}
</style>
