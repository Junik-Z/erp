<script>
import {
  applySettleApi,
  cancelSettleApi,
  completeCraftApi,
  confirmSettleApi,
  craftUpdateApi,
  getSettledListApi,
  getWaitConfirmListApi,
  getWorkingListApi,
  recoverCraftApi,
} from "@/api/erp/produce";
import { _deepCopy, _get, _groupBy, _isEmpty, _isNotUnNil, _keys, CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "./components/TopMenus.vue";
import { TabList } from "./define";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerSheet from "./components/PickerSheet.vue";
import CraftCard from "./components/CraftCard.vue";

const PageMenu = [
  {
    label: "生产中",
    perm: "CRAFT_WORKING_LIST",
    func: 0,
  },
  {
    label: "待确认",
    perm: "CRAFT_WAIT_CONFIRM",
    func: 1,
  },
  {
    label: "已确认",
    perm: "CRAFT_SETTLED",
    func: 2,
  },
];

export default {
  name: "Factory",
  components: {CraftCard, PickerSheet, TopMenus, KoList},
  data() {
    const _this = this;
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

      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      list: [],
      loading: false,
      noMore: false,

      node: {},
      nodeIndex: null,

      visible: false,

      form: {
        "name": "",
        "description": "",
        "images": "",
        "pricingMethod": "none",
        "price": null,
        // "sequence": 0,
        "staffList": [],
      },
      pLoading: false,

      settlementVisible: false,

      // 结算数量
      settlementQuantity: 1,

      groupList: {},

      tableKey: +new Date(),

      PAGE_MENU: _deepCopy(PageMenu),
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
        this.groupList = {};
        this.tableKey = +new Date();
        this.noMore = false;
      }

      // #ifdef H5
      const top = _deepCopy(this.$refs?.WrapRef?.scrollTop);
      // #endif

      this.loading = true;
      const Func = [getWorkingListApi, getWaitConfirmListApi, getSettledListApi][this.GET_PAGE_MENU_FUNC];
      Func(this.queryList)
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

          // #ifdef H5
          this.$nextTick(() => {
            this.$refs.WrapRef.scrollTop = top;
          });
          // #endif
        });
    },

    onUpdateGroupList() {
      this.groupList = _groupBy(this.list, (item) => item.orderCode);
    },

    // 重置列表
    onResetList() {
      this.noRefresh = false;
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.getList(true);
    },

    // 选中
    onSelect({func}) {
      this[func](_deepCopy(this.node), this.nodeIndex);
    },

    onActionClick(node, index) {
      this.node = node;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },

    // 编辑
    onEditor(item, index) {
      this.nodeIndex = index;
      const node = _deepCopy(item);
      node.price = this.toYuan(node.price);
      node._placeholder_label_ = (node.staffs || [])?.map(v => v.name)?.join("、");

      this.form = node;
      this.visible = true;

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 保存修改流程
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (this.isPriceRules) {
          this.pLoading = false;
          uni.showToast({
            title: `请输入${PRICING_METHOD[this.form.pricingMethod]}`,
            icon: "none",
          });
          return false;
        }

        if (!valid) {
          this.pLoading = true;
          const params = _deepCopy(this.form);

          params.price = _isNotUnNil(params.price) ? this.toFen(params.price) : null;

          craftUpdateApi(params)
            .then(() => {
              CustomToast({
                title: "更新成功",
              });
              this.$set(this.list, this.nodeIndex, params);
              this.visible = false;
              this.onUpdateGroupList();
            })
            .finally(() => {
              this.pLoading = false;
            });
        } else {
          this.pLoading = false;
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },

    // 处理结算
    onSettlement(item, index) {
      this.node = _deepCopy(item);
      this.settlementQuantity = null;
      this.settlementVisible = true;
    },

    // 确认结算
    onFinish(item, index, key) {
      uni.showModal({
        title: "温馨提示",
        content: `请先与员工确认金额无误后再结算。`,
        confirmText: "确认无误",
        success: (res) => {
          if (res.confirm) {
            confirmSettleApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.groupList[key].splice(index, 1);
              });
          }
        },
      });
    },

    // 取消结算
    onCancel(item, index, key) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消吗？`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            cancelSettleApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.groupList[key].splice(index, 1);
              });
          }
        },
      });
    },

    // 结算
    onSettlementSubmit() {
      if (_isEmpty(this.node)) {
        CustomToast({
          title: "未匹配到流程，请重试。",
        });
        return false;
      }

      const quantity = +this.settlementQuantity;

      if (!["fixedPrice", "fixedPriceGroup"].includes(this.node.pricingMethod)) {
        if (isNaN(quantity)) {
          CustomToast({
            title: "请输入数字字符",
            icon: "none",
          });
          return false;
        }

        if (quantity < 0) {
          CustomToast({
            title: "数量不能少于1",
            icon: "none",
          });
          return false;
        }
      }

      this.pLoading = true;

      applySettleApi({...this.node, quantity})
        .then(() => {
          uni.showModal({
            title: "温馨提示",
            content: "请与员工核对金额，核对无误后，请及时前往待确认列表，完成最终的确认结算流程。",
            showCancel: false,
          });
        })
        .finally(() => {
          this.settlementVisible = false;
          this.pLoading = false;
        });
    },

    // 完成工艺
    onComplete(item, index, key) {
      completeCraftApi(item)
        .then(() => {
          this.$set(this.groupList[key][index], "status", "FINISHED");
          CustomToast({
            title: "操作成功",
          });
        });
    },

    // 恢复工艺
    onRecover(item, index, key) {
      recoverCraftApi(item)
        .then(() => {
          this.$set(this.groupList[key][index], "status", "CREATED");
          CustomToast({
            title: "操作成功",
          });
        });
    },
  },
  computed: {
    actionList() {
      return [];
    },

    TabList() {
      return TabList;
    },

    // 获取计价方式
    getPricingMethod() {
      return key => key ? PRICING_METHOD[key] : "";
    },

    // 处理计价方式
    getPricingMethodOption() {
      return _keys(PRICING_METHOD).map(key => {
        return {
          value: key,
          name: PRICING_METHOD[key],
        };
      });
    },

    // 获取价格校验
    isPriceRules() {
      return this.form.pricingMethod && this.form.pricingMethod !== "none" && !this.form.price;
    },

    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
    },

    // 获取单元格的分配
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "auto ".repeat([5, 7, 7][this.GET_PAGE_MENU_FUNC]).trim(),
      };
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
        ...(_this.GET_PAGE_MENU_FUNC >= 1 ? [
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
                  "align-items": "center",
                  "justify-content": "center",
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
        ...(_this.GET_PAGE_MENU_FUNC < 2 ?
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
    <TopMenus :tabs="TabList" :path="PageEnums.factory" />

    <HistoryBar
      v-model="PAGE_MENU_INDEX"
      :values="GET_PAGE_MENU"
      label-key="label"

      @change="onResetList()"
      :is-show-search="false"
      ref="SearchRef"
    />

    <!-- #ifdef MP -->
    <view style="padding: 0;">
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view :style="[getGridTemplateColumnsStyle]">
          <block v-for="(child, key) of groupList" :key="key">
            <uni-section :title="key" type="line">
              <view class="ko-basic-table">
                <view class="ko-basic-table--th">名称</view>
                <view class="ko-basic-table--th">计价方式</view>
                <view class="ko-basic-table--th">价格</view>

                <block v-if="GET_PAGE_MENU_FUNC > 0">
                  <view class="ko-basic-table--th">数量</view>
                  <view class="ko-basic-table--th">结算</view>
                </block>

                <block v-if="GET_PAGE_MENU_FUNC > 1">
                  <view class="ko-basic-table--th">日期</view>
                </block>

                <view class="ko-basic-table--th">员工</view>
                <view class="ko-basic-table--th" v-if="GET_PAGE_MENU_FUNC <= 1">操作</view>

                <block v-for="(item, index) of child" :key="item.id">
                  <view class="ko-basic-table--cell">
                    {{ item.name }}
                  </view>
                  <view class="ko-basic-table--cell">
                    {{ getPricingMethod(item.pricingMethod) }}
                  </view>
                  <view class="ko-basic-table--cell">
                    {{ toYuan(item.price) }}
                  </view>

                  <block v-if="GET_PAGE_MENU_FUNC > 0">
                    <view class="ko-basic-table--cell">{{ item.quantity }}</view>
                    <view class="ko-basic-table--cell">{{ toYuan(item.finalAmount) }}</view>
                  </block>

                  <block v-if="GET_PAGE_MENU_FUNC > 1">
                    <view class="ko-basic-table--cell">{{ item.updateTime }}</view>
                  </block>

                  <view class="ko-basic-table--cell">
                    <view
                      style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;"
                    >
                      <view
                        style="padding: 2px; display: flex; flex-direction: column; justify-content: center;align-items: center;"
                        v-for="staff of getStaffListLogo(item)"
                        :key="staff.id"
                      >
                        <uv-avatar
                          :src="getImageUrl(staff.logo)"
                          random-bg-color
                          size="18"
                          :text="staff.name"
                        />
                        <text style="font-size: 10px; color: #8f939c;padding-top: 2px;">{{ staff.name }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="ko-basic-table--cell" v-if="GET_PAGE_MENU_FUNC <= 1">
                    <view
                      style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap;"
                    >
                      <block v-if="GET_PAGE_MENU_FUNC === 0">
                        <block v-if="['CREATED'].includes(item.status)">
                          <button
                            class="ko-basic-button__card"
                            @click.stop="onComplete(item, index, key)"
                            v-if="isPerm('CRAFT_COMPLETE')"
                          >
                            完成
                          </button>
                          <button
                            class="ko-basic-button__card"
                            @click.stop="onSettlement(item, index)"
                            v-if="isPerm('CRAFT_APPLY_SETTLE')"
                          >
                            结算
                          </button>
                          <button
                            class="ko-basic-button__card"
                            @click.stop="onEditor(item, index)"
                            v-if="isPerm('CRAFT_UPDATE')"
                          >
                            编辑
                          </button>
                        </block>

                        <button
                          class="ko-basic-button__card"
                          @click.stop="onRecover(item, index, key)"
                          v-if="['FINISHED'].includes(item.status) && isPerm('CRAFT_RECOVER')"
                        >
                          恢复
                        </button>
                      </block>
                      <button
                        class="ko-basic-button__card"
                        @click.stop="onCancel(item, index, key)"
                        v-if="[1].includes(GET_PAGE_MENU_FUNC) && isPerm('CRAFT_CANCEL_SETTLE')"
                      >
                        取消
                      </button>
                      <button
                        class="ko-basic-button__card"
                        @click.stop="onFinish(item, index, key)"
                        v-if="[1].includes(GET_PAGE_MENU_FUNC) && isPerm('CRAFT_CONFIRM_SETTLE')"
                      >
                        确认
                      </button>
                    </view>
                  </view>
                </block>
              </view>
            </uni-section>
          </block>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view
      class="ko-factory__table-wrap"
      v-infinite-scroll="onRequestNextPage"
      infinite-scroll-immediate
      :infinite-scroll-delay="200"
      :infinite-scroll-disabled="noMore"
      :infinite-scroll-distance="200"
      :key="tableKey"
      ref="WrapRef"
    >
      <block v-for="(child, key) of groupList" :key="key">
        <uni-section :title="key" type="line">
          <KoTable
            :loading="loading"
            :columns="getColumns"
            :data="child"
            stripe
          >
            <template #operate="{item, index}">
              <view style="display: flex; align-items: center; justify-content: center;">
                <block v-if="GET_PAGE_MENU_FUNC === 0">
                  <block v-if="['CREATED'].includes(item.status)">
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onComplete(item, index, key)"
                      v-if="isPerm('CRAFT_COMPLETE')"
                    >
                      完成
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onSettlement(item, index)"
                      v-if="isPerm('CRAFT_APPLY_SETTLE')"
                    >
                      结算
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onEditor(item, index)"
                      v-if="isPerm('CRAFT_UPDATE')"
                    >
                      编辑
                    </button>
                  </block>

                  <button
                    class="ko-basic-button__card"
                    @click.stop="onRecover(item, index, key)"
                    v-if="['FINISHED'].includes(item.status) && isPerm('CRAFT_RECOVER')"
                  >
                    恢复
                  </button>
                </block>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item, index, key)"
                  v-if="[1].includes(GET_PAGE_MENU_FUNC) && isPerm('CRAFT_CANCEL_SETTLE')"
                >
                  取消
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onFinish(item, index, key)"
                  v-if="[1].includes(GET_PAGE_MENU_FUNC) && isPerm('CRAFT_CONFIRM_SETTLE')"
                >
                  确认
                </button>
              </view>
            </template>
          </KoTable>
        </uni-section>
      </block>

      <view v-if="!list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">暂无数据</view>
      <view v-if="noMore && list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">
        没有更多数据了
      </view>
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

    <BasicPopup :visible.sync="visible" title="编辑流程">
      <view class="ko-factory__popup">
        <uni-forms label-align="right" ref="FormRef" :model="form">
          <uni-forms-item
            label="名称"
            name="name"
            :rules="[{required: true, errorMessage: '请输入名称'}]"
            required
          >
            <uni-easyinput v-model="form.name" placeholder="请输入名称" />
          </uni-forms-item>
          <uni-forms-item label="图片" name="images">
            <FilePicker
              v-model="form.images"
              :image-styles="{
                width: '100px',
                height: '100px',
              }"
            />
          </uni-forms-item>
          <uni-forms-item label="计价方式" name="pricingMethod">
            <PickerSheet
              :options="getPricingMethodOption"
              style="width: 100%"
              v-model="form.pricingMethod"
            />
          </uni-forms-item>
          <uni-forms-item
            label="价格"
            name="price"
            :required="form.pricingMethod && form.pricingMethod !== 'none'"
          >
            <uni-easyinput type="digit" v-model="form.price" placeholder="请输入" />
          </uni-forms-item>
          <uni-forms-item
            label="员工"
            name="staffList"
            v-if="visible"
          >
            <view style="width: 100%;">
              <PickerUser
                style="width: 100%;"
                is-input
                title="选择员工"
                v-model="form.staffList"
                type="staff"
                multiple
                is-confirm
                ref="UserRef"

                :placeholder-label="form._placeholder_label_"
              />
              <view v-if="!isPerm('STAFF_LIST')" style="font-size: 10px;color: #e43d33; margin-top: 5px;">
                您没有获取员工信息权限，请联系管理员授权。
              </view>
            </view>
          </uni-forms-item>
          <uni-forms-item label="描述" name="description">
            <uni-easyinput type="textarea" v-model="form.description" placeholder="请输入" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-factory__popup--footer">
          <button
            class="ko-basic-button__card"
            @click="onSubmit"
            :loading="pLoading"
            :disabled="pLoading"
          >
            保存
          </button>
        </view>
      </template>
    </BasicPopup>

    <BasicPopup :visible.sync="settlementVisible" title="结算">
      <view class="ko-factory__popup">

        <view
          style="padding: 10px; font-size: 12px;color: #8f939c;"
        >
          计价方式：{{ getPricingMethod(node.pricingMethod) }};
          金额：
          <text class="ko-basic-money">{{ toYuan(node.price) }}元</text>
        </view>

        <uni-forms label-align="right" v-if="!['fixedPrice', 'fixedPriceGroup'].includes(node.pricingMethod)">
          <uni-forms-item
            label="数量"
            name="name"
            required
          >
            <uni-easyinput type="digit" v-model="settlementQuantity" placeholder="请输入数量" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-factory__popup--footer">
          <button
            class="ko-basic-button__card"
            @click="onSettlementSubmit"
            :loading="pLoading"
            :disabled="pLoading"
          >
            结算
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-factory {
  padding-top: 10px;

  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }

  &__popup {
    padding: 10px;

    // #ifndef H5
    width: 98vw;
    // #endif

    // #ifdef H5
    width: 600px;
    // #endif

    &--footer {
      display: flex;
      align-items: center;
      justify-content: space-around;

      .ko-basic-button__card {
        width: 120px;
      }
    }
  }

  // #ifdef H5
  &__table-wrap {
    height: calc(100vh - 164px);
    padding: 10px;
    overflow-y: auto;
  }

  // #endif
}
</style>
