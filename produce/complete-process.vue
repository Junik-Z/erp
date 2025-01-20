<script>
import { getSettledListApi } from "@/api/erp/produce";
import { _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import { CONFIG, PRICING_METHOD } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "@/produce/components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerSheet from "@/produce/components/PickerSheet.vue";
import CraftCard from "./components/CraftCard.vue";

export default {
  name: "Factory",
  components: {CraftCard, PickerSheet, TopMenus, KoList},
  data() {
    const _this = this;
    return {
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        "staffId": "",
      },

      list: [],
      loading: false,
      noMore: false,
    };
  },
  mixins: [mixins],
  onLoad(option) {
    this.queryList["staffId"] = option.id;

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
      getSettledListApi(this.queryList)
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
  },
  computed: {
    TabList() {
      return TabList;
    },

    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
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
        ...(_this.tab >= 1 ? [
          {
            label: "结算",
            prop: "finalAmount",
            render(h, {row}) {
              return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.finalAmount)]);
            },
          },
          {
            label: "数量",
            prop: "quantity",
          },
          {
            label: "时间",
            prop: "updateTime",
          },
        ] : []),
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
        ...(_this.tab < 2 ?
          [{
            label: "操作",
            slot: "operate",
          }]
          : []),
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
      <view style="padding: 5px 10px" v-for="(item) of list" :key="item.id">
        <CraftCard :item="item" show-final />
      </view>
    </KoList>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px;">
      <KoTable
        :loading="loading"
        :columns="getColumns"
        :data="list"
        empty-text="暂无数据"
        stripe
      />
    </view>
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
