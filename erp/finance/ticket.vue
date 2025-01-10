<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  addedPaidOrderApi,
  addedReturnedOrderApi,
  confirmPaidOrderApi,
  confirmReturnedOrderApi,
  editPaidOrderApi,
  editReturnedOrderApi,
  finishPayableApi,
  finishReceivableApi,
  getAchievableListApi,
  getPaidOrderListApi,
  getPayableAchievableApi,
  getReturnedOrderListApi,
} from "@/api/erp/finance";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy, _get, _isEmpty, _pick, CustomToast, transferYuan, yuanToPoints } from "@/utils";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import KoMovable from "@/components/Movable/index.vue";

export default {
  name: "Ticket",
  components: {
    KoMovable,
    UvAvatar,
    OrderCard,
    UniListItem,
    UniEasyinput,
    FilePicker,
    UniFormsItem,
    UniForms,
    BasicPopup,
    UniCol,
    UniRow,
    BasicCard,
    LoadMore,
    UniList,
  },
  mixins: [mixins],
  data() {
    const _this = this;

    return {
      option: {},

      list: [],
      loading: false,

      // 是否是要支付的订单
      isRefund: false,

      visible: false,

      form: {
        totalAmount: "",
        voucher: "",
        remark: "",
      },
      rules: {
        totalAmount: {
          rules: [
            {
              required: true,
              errorMessage: "请输入单据金额",
            },
          ],
        },
      },

      sLoading: false,
      isEdit: false,
      cLoading: false,

      // 判断是付是应收款模块进来的
      isReceivable: false,

      confirmationList: [],

      // 处理不可完成订单
      noUnable: true,

      // 处理付款详情
      isDetails: true,


      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "时间",
          prop: "createTime",
        },
        {
          label: "凭证",
          prop: "voucher",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "voucher")),
                  size: 64,
                  shape: "square",
                },
              })],
            );
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "金额",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [_this.toYuan(row.totalAmount)]);
          },
        },
        {
          label: "操作",
          width: 260,
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  onLoad(option) {
    this.option = option;

    this.noUnable = option.noUnable === "true";
    this.isDetails = option.isDetails === "true";

    // 销售退货和采购的时候需要进行付款
    this.isRefund = ["SALE_RETURN", "PURCHASE"].includes(option.orderType);

    // 是否是应收模块
    this.isReceivable = option.isReceivable === "true";

    // #ifdef MP
    this.$refs.FormRef.setRules(this.rules);
    // #endif

    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isRefund ? getReturnedOrderListApi : getPaidOrderListApi;
      Func(this.option)
        .then(res => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 添加单据
    addedTicket(node) {
      this.confirmationList = [];
      this.visible = true;
      this.isEdit = !_isEmpty(node);

      const params = _isEmpty(node) ? _deepCopy(this.$options.data().form) : _deepCopy(node);
      params.totalAmount = transferYuan(params.totalAmount);

      this.form = params;

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 添加修改单据
    onSubmit() {
      if (this.confirmationList.length) {
        this.visible = false;
        return false;
      }

      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          this.sLoading = true;
          const Func = this.isEdit
            ? this.isRefund ? editReturnedOrderApi : editPaidOrderApi
            : this.isRefund ? addedReturnedOrderApi : addedPaidOrderApi;
          const params = _deepCopy(this.form);

          const obj = _pick(_deepCopy(this.option), ["supplierId", "orderType", "purchaserId", "orderCode"]);
          params.totalAmount = yuanToPoints(params.totalAmount);

          Func({...params, ...obj})
            .then(() => {
              uni.showToast({title: "操作成功"});
              this.getList();
              this.visible = false;
            })
            .finally(() => {
              this.sLoading = false;
            });
        }
      });
    },

    // 上一步
    onPrevious() {
      uni.navigateBack({});
    },

    // 确认单据
    onConfirmOrder(item) {
      uni.showModal({
        title: "温馨提示",
        content: "请核对单据金额，确认后将无法更改。",
        confirmText: "已确认",
        success: (resq) => {
          if (resq.confirm) {
            const Func = this.isRefund ? confirmReturnedOrderApi : confirmPaidOrderApi;
            const params = _deepCopy(item);

            this.$set(item, "__confirm_loading__", true);

            Func(params)
              .then(() => {
                CustomToast({
                  title: "单据已确认",
                  success() {
                  },
                });
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__confirm_loading__", false);
              });
          }
        },
      });
    },

    // 查询可确认订单
    queryConfirmOrder() {
      this.cLoading = true;
      const Func = this.isReceivable ? getAchievableListApi : getPayableAchievableApi;

      const params = _deepCopy(this.option);

      Func(_pick(params, ["supplierId"]))
        .then(res => {
          const list = res.data;

          if (_isEmpty(list)) {
            this.visible = false;
            uni.showModal({
              title: "温馨提示",
              content: "该客户没有可完成的订单。",
              confirmText: "继续添加",
              cancelText: "返回",
              success: (res) => {
                if (!res.confirm) {
                  uni.navigateBack({});
                }
              },
              fail(err) {
                console.log(err);
              },
            });
          } else {
            this.confirmationList = list;
            this.visible = true;
          }
        })
        .finally(() => {
          this.cLoading = false;
        });
    },

    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请核对金额是否准确。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            const Func = this.isReceivable ? finishReceivableApi : finishPayableApi;

            Func(item)
              .then(() => {
                uni.showToast({title: "核对成功"});
                this.queryConfirmOrder();
              });
          }
        },
      });
    },

    onOperate(type, item) {
      this[type]?.(item);
    },
  },
  computed: {},
};
</script>

<template>
  <view class="ko-ticket">
    <view class="ko-ticket__wrap">
      <!-- #ifdef MP -->
      <UniList>
        <view style="padding: 10px;">
          <BasicCard :spacing="10" v-for="(item, index) of list" :key="index">
            <view class="ko-ticket__item">
              <view class="ko-ticket__item--info">
                <UniRow :gutter="10">
                  <UniCol :span="24" v-if="item.voucher">
                    <view style="display: flex; align-items: center;">
                      <label class="ko-basic-label">凭证：</label>
                      <image
                        class="ko-ticket__item--image ko-basic-box-shadow"
                        :src="getImageUrl(item.voucher)"
                        mode="scaleToFill"
                      />
                    </view>
                  </UniCol>
                  <UniCol :span="24">
                    <view>
                      <label class="ko-basic-label">{{ current === 2 ? "收款金额" : "付款金额" }}：</label>
                      <text class="ko-basic-money"> {{ toYuan(item.totalAmount) }}元</text>
                    </view>
                  </UniCol>
                  <UniCol :span="24">
                    <view style="display: flex; align-items: center;">
                      <label class="ko-basic-label">客户：</label>
                      <view style="margin-right: 10px;">
                        <UvAvatar
                          :size="38"
                          :text="GET_FUNC(item, 'customer.name') || ''"
                          :src="getImageUrl(GET_FUNC(item, 'customer.logo'))"
                          random-bg-color
                        />
                      </view>
                      <text>{{ GET_FUNC(item, "customer.name") || "-" }}</text>
                    </view>
                  </UniCol>
                  <UniCol :span="24">
                    <view style="display: flex; align-items: center;">
                      <label class="ko-basic-label">操作人：</label>
                      <view style="margin-right: 10px;">
                        <UvAvatar
                          :size="38"
                          random-bg-color
                          :src="getImageUrl(GET_FUNC(item, 'user.avatar'))"
                          :text="GET_FUNC(item, 'user.nickName') || ''"
                        />
                      </view>
                      <text>{{ GET_FUNC(item, "user.nickName") || "-" }}</text>
                    </view>
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">时间：</label>
                    <text>{{ item.updateTime || "-" }}</text>
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">备注：</label>
                    <text>{{ item.remark || "-" }}</text>
                  </UniCol>
                </UniRow>
                <view class="ko-ticket__item--button" v-if="item.orderStatus !== 'FINISHED' && !isDetails">
                  <button class="ko-basic-button__card" @click.stop="addedTicket(item)">修改</button>
                  <button class="ko-basic-button__card" v-if="!noUnable" @click.stop="onConfirmOrder(item)">
                    确认单据金额
                  </button>
                </view>
              </view>
            </view>
          </BasicCard>
        </view>
        <LoadMore :loading="loading" content-text="没有更多单据了" />
      </UniList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <KoTable
        :columns="columns"
        :loading="loading"
        :data="list"
      >
        <template #operate="{item}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <view class="ko-ticket__item--button" v-if="item.orderStatus !== 'FINISHED' && !isDetails">
              <button class="ko-basic-button__card" @click.stop="addedTicket(item)">修改</button>
              <button class="ko-basic-button__card" v-if="!noUnable" @click.stop="onConfirmOrder(item)">
                确认单据金额
              </button>
            </view>
          </view>
        </template>
      </KoTable>
      <!-- #endif -->
    </view>

    <BasicPopup :visible.sync="visible">
      <view class="ko-ticket__popup">
        <UniForms
          label-width="100px"
          ref="FormRef"
          :rules="rules"
          :model="form"
          label-align="right"
          v-if="!confirmationList.length"
        >
          <UniFormsItem label="单据金额：" name="totalAmount" required>
            <UniEasyinput
              style="width: 100%;"
              placeholder="请输入"
              type="digit"
              v-model.trim="form.totalAmount"
            />
            <text style="margin-left: 10px;">元</text>
          </UniFormsItem>
          <UniFormsItem label="凭证：" name="voucher">
            <FilePicker
              v-model="form.voucher"
              :image-styles="{border: {radius: '6px'}, width: 160, height: 160}"
            />
          </UniFormsItem>
          <UniFormsItem label="备注：" name="remark">
            <UniEasyinput
              style="width: 100%;"
              placeholder="请输入"
              v-model="form.remark"
              type="textarea"
            />
          </UniFormsItem>
        </UniForms>

        <UniList v-else>
          <UniListItem v-for="(item, index) of confirmationList" :key="index">
            <template #body>
              <OrderCard
                :item="item"
                :operate='[{label: "订单确认",type: "onConfirm"}]'
                @operate="onOperate"
              />
            </template>
          </UniListItem>
        </UniList>
      </view>

      <template #footer>
        <button
          class="ko-basic-button"
          style="margin: 0 40px 10px;"
          @click="onSubmit"
          :loading="sLoading"
          :disabled="sLoading"
        >
          {{ confirmationList.length ? "完成" : (isEdit ? "修改" : "添加") }}
        </button>
      </template>
    </BasicPopup>

    <KoMovable @click="addedTicket('')" v-if="!isDetails" />

    <!-- #ifdef MP -->
    <view class="ko-ticket__footer ko-basic-footer" v-if="!noUnable && false">
      <button class="ko-basic-button__card" @click="onPrevious">取消</button>
      <button
        class="ko-basic-button__card"
        @click="queryConfirmOrder"
        :loading="cLoading"
        :disabled="cLoading"
      >
        查询可完成订单
      </button>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="ko-ticket__footer" v-if="!noUnable && false">
      <button class="ko-basic-button" @click="onPrevious">取消</button>
      <button
        class="ko-basic-button"
        @click="queryConfirmOrder"
        :loading="cLoading"
        :disabled="cLoading"
      >
        查询可完成订单
      </button>
    </view>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-ticket {
  padding-bottom: 90px;

  &__wrap {
    // #ifdef MP
    height: calc(100vh - 90px);

    font-size: 14px;
    color: $uni-base-color;
    // #endif
    overflow-y: auto;

    // #ifdef H5
    padding: 20px;
    // #endif
  }

  &__item {
    display: flex;
    overflow: hidden;

    &--image {
      width: 120px;
      height: 120px;
      border-radius: 6px;
    }

    &--info {
      flex: 1;
      padding-left: 10px;
    }

    &--button {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 8px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    // #ifdef MP
    justify-content: space-around;
    // #endif
    // #ifdef H5
    justify-content: center;
    margin-top: 30px;

    .ko-basic-button__card {
      margin: 20px;
    }

    // #endif

    .ko-basic-button__card {
      width: 40%;
    }
  }

  &__popup {
    // #ifdef MP
    width: 96vw;
    height: 70vh;
    // #endif
    background: #fff;
    padding: 10px;
  }
}
</style>
