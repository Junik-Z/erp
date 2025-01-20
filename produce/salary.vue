<!-- 员工工资 -->
<script>
import { getMySalaryApi, getMySettledListApi, getMyWorkingListApi, getWaitMyConfirmListApi } from "@/api/erp/produce";
import { _deepCopy, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import { CONFIG, PRICING_METHOD } from "@/utils/config";
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
        "生产中",
        "待确认",
        "已确认",
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

      tableKey: +new Date(),
    };
  },
  mixins: [mixins],
  onLoad() {
    this.getMySalary();

    this.getList(true);
  },
  // #ifdef MP
  onReachBottom() {
    this.onRequestNextPage();
  },
  // #endif
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
        this.tableKey = +new Date();
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
        return this.toYuan(this[item.key]);
      };
    },

    actionList() {
      return [];
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

    TabList() {
      return TabList;
    },

    // 获取计价方式
    getPricingMethod() {
      return key => PRICING_METHOD[key];
    },

    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
    },
  },
};
</script>

<template>
  <view class="ko-salary">
    <TopMenus :tabs="TabList" :path="PageEnums.produceSalary" />

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
          <BasicCard>
            <view class="ko-salary__info">
              <uni-row gutter="10">
                <uni-col :span="24">
                  <label class="ko-basic-label">名称：</label>
                  <text>{{ item.name }}</text>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">编号：</label>
                  <text>{{ item.orderCode || "-" }}</text>
                </uni-col>
                <uni-col :span="24" v-if="item.images">
                  <label class="ko-basic-label">图片：</label>
                  <uv-avatar
                    :src="getImageUrl(item.images)"
                    shape="square"
                    random-bg-color
                    :size="64"
                  />
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">计价方式：</label>
                  <text>{{ getPricingMethod(item.pricingMethod) }}</text>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">价格：</label>
                  <text class="ko-basic-money">{{ toYuan(item.price) }}元</text>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">结算：</label>
                  <text class="ko-basic-money">{{ toYuan(item.finalAmount) }}元</text>
                </uni-col>
                <uni-col :span="24" v-if="!['fixedPrice', 'fixedPriceGroup'].includes(item.pricingMethod)">
                  <label class="ko-basic-label">数量：</label>
                  <text>{{ item.quantity }}</text>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">时间：</label>
                  <text>{{ item.updateTime }}</text>
                </uni-col>
                <uni-col :span="24">
                  <view style="display: flex; align-items: center;">
                    <label class="ko-basic-label">员工：</label>
                    <view style="flex: 1; display: flex; flex-wrap: wrap;">
                      <view
                        style="padding: 5px; display: flex; flex-direction: column; justify-content: center;align-items: center;"
                        v-for="staff of getStaffListLogo(item)"
                        :key="staff.id"
                      >
                        <uv-avatar
                          :src="getImageUrl(staff.logo)"
                          random-bg-color
                          size="38"
                          :text="staff.name"
                        />
                        <text style="font-size: 14px; color: #8f939c;padding-top: 5px;">{{ staff.name }}</text>
                      </view>
                    </view>
                  </view>
                </uni-col>
                <uni-col :span="24">
                  <label class="ko-basic-label">描述：</label>
                  <text>{{ item.description || "-" }}</text>
                </uni-col>
              </uni-row>
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
        :key="tableKey"
      />
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
  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }

  // #ifdef H5
  .ko-basic-count__wrap {
    width: 1024px;
    margin: 0 auto;
  }

  // #endif
}
</style>
