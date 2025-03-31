<script>
import KoNotice from "@/components/Notice/Notice.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { getInboundDetailListApi, getOutboundDetailListApi } from "@/api/erp/stock";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _flattenDeep, _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import KoList from "@/components/List/List.vue";

export default {
  name: "check",
  components: {KoList, OrderCard, LoadMore, UniSegmentedControl, KoNotice},
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
          label: "订单编号",
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
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottom: index === (row.details?.length - 1) ? "" : "0.5px solid #c7c9ce",
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
    this.option = option;
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

      Func({...this.option, ...this.queryList})
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<template>
  <view class="ko-stock-check">
    <KoNotice />
    <view class="ko-stock-check__tabs" style="padding: 10px;">
      <UniSegmentedControl :values="tabList" :current.sync="current" @clickItem="getList(true)" />
    </view>

    <!-- #ifdef MP -->
    <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
      <view style="padding: 10px;">
        <OrderCard
          v-for="item of list"
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
        :data="list"
        empty-text="暂无数据"
        stripe

        @next-load="RequestNextPage"
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

  // #ifdef H5
  &__tabs {
    width: 200px;
    margin: 0 auto;
  }

  // #endif
}
</style>
