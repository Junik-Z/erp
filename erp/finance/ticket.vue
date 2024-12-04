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
import { _deepCopy, _isEmpty, _isEqual, _pick, showToast, transferYuan, yuanToPoints } from "@/utils";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";

export default {
  name: "Ticket",
  components: {
    OrderCard,
    UniListItem,
    UniFab,
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
  data: () => ({
    option: {},

    step: 0,
    list: [],
    loading: false,

    // 是否是退款凭证
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

    isReceivable: false,

    confirmationList: [],
  }),
  onLoad(option) {
    this.option = option;
    this.isRefund = ["SALE_RETURN", "PURCHASE_RETURN"].includes(option.orderType);
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
      this.$refs.FormRef.clearValidate();
    },

    // 添加修改单据
    onSubmit() {
      if (this.confirmationList.length) {
        this.visible = false;
        return false;
      }

      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func = this.isEdit
            ? this.isRefund ? editReturnedOrderApi : editPaidOrderApi
            : this.isRefund ? addedReturnedOrderApi : addedPaidOrderApi;
          const params = _deepCopy(this.form);

          params.supplierId = this.option.supplierId;
          params.orderType = this.option.orderType;
          params.purchaserId = this.option.purchaserId;
          params.totalAmount = yuanToPoints(params.totalAmount);

          Func(params)
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

    // 下一步
    onNext() {
      if (_isEqual(this.step, 1)) {
        this.queryConfirmOrder();
        return false;
      }

      if (_isEqual(this.step, 0)) {
        this.step += 1;
        this.getList();
      }
    },

    // 上一步
    onPrevious() {
      if (_isEqual(this.step, 0)) {
        uni.navigateBack({});
      } else {
        this.step -= 1;
      }
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
                showToast({
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
};
</script>

<template>
  <view class="ko-ticket">
    <view class="ko-ticket__wrap">
      <UniList>
        <view style="padding: 10px;">
          <BasicCard :spacing="10" v-for="(item, index) of list" :key="index">
            <view class="ko-ticket__item">

              <view class="ko-ticket__item--info">
                <UniRow :gutter="10">
                  <UniCol :span="24" v-if="item.vouchers">
                    <label class="ko-basic-label">凭证：</label>

                    <image
                      class="ko-ticket__item--image ko-basic-box-shadow"
                      :src="getImageUrl(item.voucher)"
                      mode="scaleToFill"
                    />
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">金额：</label>
                    <text class="ko-basic-money">
                      ¥ {{ toYuan(item.totalAmount) }}元
                    </text>
                  </UniCol>
                  <UniCol :span="24" v-if="false">
                    <label class="ko-basic-label">大写：</label>
                    <text class="ko-basic-money">
                      {{ toBigMoney(toYuan(item.totalAmount)) }}
                    </text>
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">更新时间：</label>
                    <text>{{ item.updateTime || "-" }}</text>
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">备注：</label>
                    <text>{{ item.remark || "-" }}</text>
                  </UniCol>
                </UniRow>
                <view class="ko-ticket__item--button" v-if="step === 0 && item.orderStatus !== 'FINISHED'">
                  <button class="ko-basic-button__card" @click.stop="addedTicket(item)">修改</button>
                </view>
                <view class="ko-ticket__item--button" v-if="step === 1 && item.orderStatus !== 'FINISHED'">
                  <button class="ko-basic-button__card" @click.stop="onConfirmOrder(item)">确认单据金额</button>
                </view>
              </view>
            </view>
          </BasicCard>
        </view>

        <LoadMore :loading="loading" :content-text="{contentnomore: '没有更多单据了'}" />
      </UniList>
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
              v-model="form.logo"
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

    <UniFab
      v-if="step === 0"
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      direction="vertical"
      @fab-click="addedTicket()"
      :offset-button="70"
    />

    <view class="ko-ticket__footer ko-basic-footer">
      <button class="ko-basic-button" @click="onPrevious">{{ ["取消", "上一步"][step] || "取消" }}</button>
      <button
        class="ko-basic-button"
        @click="onNext"
        :loading="cLoading"
        :disabled="cLoading"
      >
        {{ ["下一步", "查询可完成订单"][step] }}
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-ticket {
  padding-bottom: 90px;

  &__wrap {
    height: calc(100vh - 90px);
    overflow-y: auto;
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
    justify-content: space-around;

    .ko-basic-button {
      width: 40%;
    }
  }

  &__popup {
    width: 96vw;
    height: 70vh;
    background: #fff;
    padding: 10px;
  }
}
</style>
