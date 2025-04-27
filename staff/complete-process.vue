<script>
import { getSalaryListApi, getSettledListApi } from "@/api/erp/produce";
import { _groupBy, _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "./components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerSheet from "./components/PickerSheet.vue";
import CraftCard from "./components/CraftCard.vue";

export default {
  name: "Factory",
  components: {CraftCard, PickerSheet, TopMenus, KoList},
  data() {
    return {
      queryList: {
        pageSize: 20,
        pageNum: 0,
        "staffId": "",
      },

      list: [],
      loading: false,
      noMore: false,

      groupList: {},

      tableKey: +new Date(),
    };
  },
  mixins: [mixins],
  onLoad(option) {
    this.queryList["staffId"] = option.id;

    this.getList(true);
  },
  // #ifdef MP
  onReachBottom() {
    this.onRequestNextPage();
  },
  // #endif
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
        this.tableKey = +new Date();
      }

      this.loading = true;
      getSettledListApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.groupList = _groupBy(this.list, (item) => item.orderCode);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    TabList() {
      return TabList;
    },

    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
    },

    // 获取单元格的分配
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "auto ".repeat(6).trim(),
      };
    },

    // 获取计价方式
    getPricingMethod() {
      return key => PRICING_METHOD[key];
    },

    // 获取时间
    getCreateTime() {
      return time => time && time.split(" ")[0] || "";
    },

    getPrice() {
      return item => ["commission", "priceCommission"].includes(item.pricingMethod) ? item.price / 10000 : this.toYuan(item.price);
    },

    // 获取数量
    getQuantity() {
      return item => _isEqual("priceCommission", item.pricingMethod) ? this.toYuan(item.quantity) : item.quantity;
    },

    // #ifdef H5
    getColumns() {
      const _this = this;
      return [
        {
          label: "序号",
          type: "index",
          width: 60,
        },
        {
          label: "名称",
          prop: "name",
        },
        {
          label: "图片",
          prop: "images",
          render(h, {row}) {
            return h(
              UvAvatar,
              {
                props: {
                  src: _this.getImageUrl(row.images),
                },
              });
          },
        },
        {
          label: "计价方式",
          prop: "pricingMethod",
          render(h, {row}) {
            return h("span", [PRICING_METHOD[row.pricingMethod]]);
          },
        },
        {
          label: "价格",
          prop: "price",
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.price)]);
          },
        },
        {
          label: "数量",
          prop: "quantity",
        },
        {
          label: "结算",
          prop: "finalAmount",
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.finalAmount)]);
          },
        },
        {
          label: "日期",
          prop: "updateTime",
        },
        {
          label: "员工",
          prop: "staffList",
          render(h, {row}) {
            return h("div", {
                style: {
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                },
              },
              _this.getStaffListLogo(row)
                .map(item => h(
                  "div",
                  {
                    style: {
                      padding: "5px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  },
                  [
                    h(
                      UvAvatar,
                      {
                        props: {
                          src: _this.getImageUrl(item.logo),
                          randomBgColor: true,
                          size: 38,
                          text: item.name,
                        },
                      }),
                    h("span", {
                      style: {fontSize: "14px", color: "#8f939c", paddingTop: "5px"},
                    }, [item.name]),
                  ],
                )),
            );
          },
        },
        {
          label: "描述",
          prop: "description",
          render(h, {row}) {
            return h("span", [row.description]);
          },
        },
      ];
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-factory">
    <!-- #ifdef MP -->
    <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
      <view :style="[getGridTemplateColumnsStyle]">
        <block v-for="(child, key) of groupList" :key="key">
          <uni-section :title="key" type="line">
            <view class="ko-basic-table">
              <view class="ko-basic-table--th">名称</view>
              <view class="ko-basic-table--th">计价方式</view>
              <view class="ko-basic-table--th">价格</view>
              <view class="ko-basic-table--th">数量</view>
              <view class="ko-basic-table--th">结算</view>
              <view class="ko-basic-table--th">日期</view>

              <block v-for="item of child" :key="item.id">
                <view class="ko-basic-table--cell">{{ item.name }}</view>
                <view class="ko-basic-table--cell">{{ getPricingMethod(item.pricingMethod) }}</view>
                <view class="ko-basic-table--cell">{{ getPrice(item) }}</view>
                <view class="ko-basic-table--cell">{{ getQuantity(item) }}</view>
                <view class="ko-basic-table--cell">{{ toYuan(item.finalAmount) }}</view>
                <view class="ko-basic-table--cell">{{ getCreateTime(item.updateTime) }}</view>
              </block>
            </view>
          </uni-section>
        </block>
      </view>
    </KoList>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <KoList
      style="padding: 10px; height: calc(100vh - 70px);"
      :no-more="noMore"
      hide-tips
      @load-next="onRequestNextPage"
      @lower="onRequestNextPage"
      :data="list"
      :loading="loading"
    >
      <block v-for="(child, key) of groupList" :key="key">
        <uni-section :title="key" type="line">
          <KoTable
            :columns="getColumns"
            :data="child"
            stripe
            no-refresh
          />
        </uni-section>
      </block>

      <view v-if="!list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">暂无数据</view>
      <view v-if="noMore && list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">
        没有更多数据了
      </view>
    </KoList>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-factory {
  padding-top: 20px;

  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }
}
</style>
