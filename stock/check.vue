<script>
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { getInboundDetailListApi, getOutboundDetailListApi } from "@/api/erp/stock";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _flattenDeep, _get, _groupBy, _isEmpty, _omit } from "@/utils";
import mixins from "@/mixins/mixins";
import KoList from "@/components/List/List.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";

export default {
  name: "check",
  components: {
    PickerCalendars,
    KoList,
    OrderCard,
    LoadMore,
    HistoryBar,
    UniEasyinput,
    UniRow,
    UniCol,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      tabList: ["入库核对", "出库核对"],
      current: 0,
      loading: false,
      option: {},
      list: [],
      noMore: false,

      queryList: {
        pageNum: 0,
        pageSize: 10,
      },

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
          width: 210,
        },
        {
          label: "状态",
          width: 80,
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_STATUS_ENUMS(row.status)]);
          },
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
          label: "下单用户",
          prop: "customer",
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
          label: "产品详情",
          prop: "details",
          render: (h, {row}) => {
            const list = _flattenDeep(row.details?.map((item, index) => h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  // borderBottom: index === (row.details?.length - 1) ? "" : "0.5px solid #c7c9ce",
                  paddingBottom: index === (row.details?.length - 1) ? 0 : "5px",
                },
              },
              [
                h(
                  "div",
                  {},
                  [
                    h(UvAvatar, {
                      props: {
                        src: _this.getImageUrl(_get(item, "images")),
                        size: 32,
                        shape: "square",
                        text: _get(item, "name") || _this.GET_SHOP_NAME,
                      },
                      style: {marginRight: "10px"},
                    }),
                  ],
                ),
                h(
                  "div",
                  {style: {textAlign: "left"}},
                  [item.name],
                ),
                h(
                  "div",
                  {style: {textAlign: "center", width: "16px"}},
                  ["×"],
                ),
                h(
                  "div",
                  {style: {color: "red"}},
                  [item.productQuantity],
                ),
              ],
            )));

            return h("div", list);
          },
        },
        {
          label: "日期",
          prop: "updateTime",
          width: 180,
        },
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
      ],
      // #endif
    };
  },
  onLoad(option) {
    this.option = _deepCopy(option);
    this.queryList.productName = option.name;
    this.queryList.id = option.id;
    this.getList();
  },
  methods: {
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset = false) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      this.loading = true;
      const Func = [getInboundDetailListApi, getOutboundDetailListApi][this.current];

      let params = _deepCopy(this.queryList);

      if (params.id) {
        params = _omit(params, ["productName"]);
      } else {
        params = _omit(params, ["id"]);
      }

      Func(params)
        .then(res => {
          this.list = [...this.list, ...res.data]; //this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onClickTabs() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();

      const option = _deepCopy(this.option);
      this.queryList.productName = option.name;
      this.queryList.id = option.id;

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
  },
  computed: {
    // 获取分组数据
    getGroupList() {
      const list = _deepCopy(this.list) || [];
      const group = _groupBy(list, (item) => item.id) || {};

      return Object.keys(group)
        ?.map(key => {
          const L = group?.[key] || [];
          const item = L?.[0] || {};
          return {...item, details: _flattenDeep(L.map(v => v.details))};
        });
    },
  },
};
</script>

<template>
  <view class="ko-stock-check">
    <view class="ko-stock-check__tabs" style="padding: 10px 0 0;">
      <HistoryBar
        :values="tabList"
        v-model="current"
        is-show-search
        @change="onClickTabs"
        ref="SearchRef"
      >
        <view class="ko-basic-search">
          <UniRow :gutter="10">
            <UniCol :span="24">
              <UniEasyinput
                v-model="queryList.productName"
                placeholder="请输入产品名称"
                @input="queryList.id = ''"
              />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderCode" placeholder="请输入编号" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入客户名称" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
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
              <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
                <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onClickTabs">重置</button>
                <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getList(true)">搜索</button>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </HistoryBar>
    </view>

    <!-- #ifdef MP -->
    <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
      <view style="padding: 10px;">
        <OrderCard
          v-for="item of getGroupList"
          :key="item.id"
          is-check-stock
          :item="item"
          is-new
          show-order-type
          :spacing="10"
        />
      </view>
    </KoList>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px; flex: 1; overflow: hidden;">
      <KoTable
        :loading="loading"
        :columns="columns"
        :data="getGroupList"
        empty-text="暂无数据"
        stripe

        @load-next="RequestNextPage"
        :no-more="noMore || loading"
      />
    </view>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-stock-check {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
