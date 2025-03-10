<script>
// #ifdef H5
import { Col, Row } from "@/uni_modules/element-ui/element.min";
// #endif
import KoNotice from "@/components/Notice/Notice.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { getInboundDetailListApi, getOutboundDetailListApi } from "@/api/erp/stock";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _flattenDeep, _get } from "@/utils";
import KoTable from "./components/KoTable/KoTable.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "check",
  components: {KoTable, OrderCard, LoadMore, UniSegmentedControl, KoNotice},
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      tabList: ["入库核对", "出库核对"],
      current: 0,
      loading: false,
      option: {},
      list: [],

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
                      size: 64,
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
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "user.avatar")), size: 64}})],
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
                  Col,
                  {props: {span: 4}},
                  [
                    h(UvAvatar, {
                      props: {
                        src: _this.getImageUrl(_get(item, "images")),
                        size: 46,
                        shape: "square",
                        text: _get(item, "name") || _this.GET_SHOP_NAME,
                      },
                    }),
                  ],
                ),
                h(
                  Col,
                  {props: {span: 14}, style: {textAlign: "left"}},
                  ["产品名称：" + item.name],
                ),
                h(
                  Col,
                  {props: {span: 6}, style: {color: "red"}},
                  ["数量：" + item.productQuantity],
                ),
              ],
            )));

            console.log(list);

            return h(Row, {props: {gutter: 10}}, list);
          },
        },
        {
          label: "时间",
          prop: "createTime",
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
    getList() {
      this.loading = true;
      this.list = [];
      const Func = [getInboundDetailListApi, getOutboundDetailListApi][this.current];
      Func(this.option)
        .then(res => {
          // #ifdef MP
          this.list = res.data;
          // #endif

          // #ifdef H5
          this.list = res.data;

          console.log(this.list);
          // #endif
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
      <UniSegmentedControl :values="tabList" :current.sync="current" @clickItem="getList" />
    </view>

    <!-- #ifdef MP -->
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
      <LoadMore :loading="loading" />
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px;">
      <KoTable
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
      />
    </view>
    <!-- #endif -->
  </view>
</template>

<style lang="scss">
.ko-stock-check {
  width: 100%;

  // #ifdef H5
  &__tabs {
    width: 200px;
    margin: 0 auto;
  }

  // #endif
}
</style>
