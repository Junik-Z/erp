<script>
import { addSubsidyApi, editSubsidyApi, getSalaryListApi, removeSubsidyApi } from "@/api/erp/produce";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _pick, CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "./components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerSheet from "./components/PickerSheet.vue";
import CraftCard from "./components/CraftCard.vue";
import WageCard from "./components/WageCard.vue";
import KoMovable from "@/components/Movable/index.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

export default {
  name: "Factory",
  components: {
    KoMovable,
    CraftCard,
    PickerSheet,
    TopMenus,
    KoList,
    WageCard,
    UniForms,
    UniFormsItem,
    UniEasyinput,
  },
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

      visible: false,

      title: "添加补贴金额",
      amount: null,
      isEdit: false,
      sLoading: false,
      aId: null,
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
      }

      this.loading = true;
      getSalaryListApi(this.queryList)
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

    // 添加补贴
    onAdded(item) {
      this.amount = null;
      this.isEdit = false;

      if (item) {
        this.title = "修改补贴金额";
        this.isEdit = true;
        this.amount = this.toYuan(Math.abs(item.amount));
        this.aNode = item;
      }
      this.visible = true;
    },

    // 处理提交补贴
    onSubmit() {
      if (!this.amount || this.amount < 0) {
        CustomToast({title: "补贴金额不能小于0", icon: "none"});
        return false;
      }

      const Func = this.isEdit ? editSubsidyApi : addSubsidyApi;
      this.sLoading = true;
      Func({
        staffId: this.queryList["staffId"],
        ...(this.isEdit ? _pick(_deepCopy(this.aNode), ["orderCode", "id"]) : {}),
        amount: this.toFen(this.amount),
      })
        .then(() => {
          CustomToast({title: `${this.isEdit ? "修改" : "添加"}成功`});
          this.getList(true);
          this.visible = false;
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    // 删除补贴金额
    onRemove(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除该补贴吗？",
        success: (res) => {
          if (res.confirm) {
            removeSubsidyApi(item)
              .then(() => {
                CustomToast({title: "操作成功"});
                this.getList(true);
              });
          }
        },
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

    getPrice() {
      return item => ["commission", "priceCommission"].includes(item.pricingMethod) ? item.price / 10000 : this.toYuan(item.price);
    },

    // 获取数量
    getQuantity() {
      return item => _isEqual("priceCommission", item.pricingMethod) ? this.toYuan(item.quantity) : item.quantity;
    },

    // 获取客户名称
    getCustomerName() {
      return child => _get(child, `0.customer.name`) || "";
    },

    // 获取订单地址
    getOrderAddress() {
      return child => _get(child, `0.orderAddress`) || "";
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
            return h("span", {class: "ko-basic-money"}, [_this.getPrice(row)]);
          },
        },
        {
          label: "数量",
          prop: "quantity",
          render(h, {row}) {
            return h("span", [_this.getQuantity(row)]);
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
  <view class="ko-wages">
    <!-- #ifdef MP -->
    <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
      <view :style="[getGridTemplateColumnsStyle]">
        <block v-for="(child, key) of groupList" :key="key">
          <uni-section :title="key" type="line">
            <template #title>
              <view>
                <view>{{ key }}</view>
                <view style="font-weight: normal; font-size: 11px; display: flex; align-items: center">
                  <view v-if="getCustomerName(child)">
                    <uni-icons type="person" size="12" />
                    {{ getCustomerName(child) }}
                  </view>
                  <view style="margin-left: 20px;" v-if="getOrderAddress(child)">
                    <uni-icons type="location" size="12" />
                    {{ getOrderAddress(child) }}
                  </view>
                </view>
              </view>
            </template>

            <view style="padding: 0 10px;">
              <WageCard @remove="onRemove(item)" @editor="onAdded(item)" v-for="item of child" :key="item.id"
                        :node="item" />
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

    <KoMovable @click="onAdded(false)">
      <view style="font-size: 12px; line-height: 1.3;">
        <view>添加</view>
        <view>补贴</view>
      </view>
    </KoMovable>

    <BasicPopup :visible.sync="visible" :title="title">
      <view class="ko-wages__popup">
        <UniForms>
          <UniFormsItem label-width="120" required label="补贴金额">
            <UniEasyinput v-model="amount" placeholder="请输入补贴金额" type="digit" />
          </UniFormsItem>
        </UniForms>
      </view>

      <template #footer>
        <view style="display: flex; justify-content: center; align-items: center;">
          <button
            class="ko-basic-button__card"
            style="width: 120px;"
            @click.stop="onSubmit"
            :loading="sLoading"
            :disabled="sLoading"
          >
            提交
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-wages {
  padding-top: 20px;

  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }

  &__popup {
    width: 90vw;
    padding: 16px 16px 0;
  }
}
</style>
