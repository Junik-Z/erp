<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import TicketMixins from "./TicketMixins";
import KoList from "@/components/List/List.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import OrderCard from "../OrderCard.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { _deepCopy, _get, _isEqual } from "@/utils";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "../PrintList.vue";

export default {
  name: "ToPay",
  components: {
    PrintList, UvActionSheet,
    UniSection,
    OrderCard,
    UniForms,
    FilePicker,
    UniFormsItem,
    UniEasyinput,
    BasicCard,
    UvAvatar,
    KoList,
    BasicPopup,
  },
  mixins: [TicketMixins],
  data() {
    return {
      visible: false,
      title: "付款",
      list: [],

      moreNode: {},
    };
  },
  watch: {
    visible: {
      handler(to) {
        if (!to) this.$emit("close");
      },
    },
  },
  methods: {
    open(query) {
      this.list = [];
      this.visible = true;
      this.setOption(query);
    },

    onLast() {
      if (this.last > 0 || this.isEdit) {
        this.onSubmit();
      } else {
        this.visible = false;
        this.$emit("success");
      }
    },

    onLookVoucher() {
      this.lookImage(this.getImageUrl(this.GET_FUNC(this.moreNode, "voucher")));
    },

    onSelect(node) {
      this[node.func](_deepCopy(this.moreNode));
    },

    onMore(item) {
      this.moreNode = _deepCopy(item);
      this.$refs.UASRef.open();
    },
  },
  computed: {
    getTitle() {
      return (_get(this.list, "0.customer.name") || (["SALE_RETURN"].includes(this.option.FORM) ? "退款" : "付款"));
    },

    actionList() {
      const node = this.moreNode || {};
      return [
        {
          name: "查看凭证",
          func: "onLookVoucher",
          disabled: !node.voucher,
        },
        {
          name: "修改",
          func: "addedTicket",
        },
        {
          name: "确认单据金额",
          func: "onConfirmOrder",
        },
      ].filter(item => {
        if (_isEqual(item.func, "addedTicket")) {
          return node.orderStatus !== "FINISHED" && !this.isDetails;
        }

        if (_isEqual(item.func, "onConfirmOrder")) {
          return ((node.orderStatus !== "FINISHED" && !this.isDetails) && !this.noUnable) && ({
            RECEIVABLE: this.isPerm("FINANCE_CONFIRM_PAID_ORDER"),
            PAY_LISE: this.isPerm("FINANCE_CONFIRM_RETURNED_ORDER"),
          }[this.option.FORM]);
        }

        return true;
      });
    },

    // 判断是否有权限修改已付款金额
    isPayEdit() {
      return {
        SALE: this.isPerm("SALE_EDIT_PAID_ORDER"),
        SALE_RETURN: this.isPerm("SALE_RETURN_EDIT_RETURNED_ORDER"),
        PURCHASE: this.isPerm("PURCHASE_EDIT_RETURNED_ORDER"),
        PURCHASE_RETURN: this.isPerm("PURCHASE_RETURN_EDIT_PAID_ORDER"),
        RECEIVABLE: this.isPerm("FINANCE_EDIT_PAID_ORDER") || this.isPerm("FINANCE_CONFIRM_PAID_ORDER"),
        PAY_LISE: this.isPerm("FINANCE_EDIT_RETURNED_ORDER") || this.isPerm("FINANCE_CONFIRM_RETURNED_ORDER"),
      }[this.option.FORM];
    },

    // 判断是否有权限添加付款单
    isPaySubmit() {
      return {
        SALE: this.isPerm("SALE_ADD_PAID_ORDER"),
        SALE_RETURN: this.isPerm("SALE_RETURN_ADD_RETURNED_ORDER"),
        PURCHASE: this.isPerm("PURCHASE_ADD_RETURNED_ORDER"),
        PURCHASE_RETURN: this.isPerm("PURCHASE_RETURN_ADD_PAID_ORDER"),
        RECEIVABLE: this.isPerm("FINANCE_ADD_PAID_ORDER"),
        PAY_LISE: this.isPerm("FINANCE_ADD_RETURNED_ORDER"),
      }[this.option.FORM];
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" :title="getTitle">
    <view class="ko-pay">
      <UniSection title="已付" type="line" v-if="list.length">
        <view class="ko-pay__wrap">
          <KoList :safe-area-inset-bottom="false" :loading="loading" no-more :no-data="!list.length" hide-tips>
            <view style="padding: 10px; --ko-basic-table-grid-col: auto auto auto auto auto;">
              <BasicCard :spacing="10" not-padding>
                <view class="ko-basic-table">
                  <view class="ko-basic-table--th">
                    金额
                  </view>
                  <view class="ko-basic-table--th">
                    操作人
                  </view>
                  <view class="ko-basic-table--th">
                    日期
                  </view>
                  <view class="ko-basic-table--th">
                    备注
                  </view>
                  <view class="ko-basic-table--th">
                    操作
                  </view>

                  <block v-for="(item, index) of list" :key="index">
                    <view class="ko-basic-table--cell"> {{ toYuan(item.totalAmount) }}</view>
                    <view
                      class="ko-basic-table--cell"
                      :class="{'ko-link': GET_FUNC(item, 'user.avatar')}"
                      @click="lookImage(getImageUrl(GET_FUNC(item, 'user.avatar')))"
                    >
                      {{ GET_FUNC(item, "user.nickName") || "-" }}
                    </view>
                    <view class="ko-basic-table--cell">{{ item.updateTime || "-" }}</view>
                    <view class="ko-basic-table--cell">{{ item.remark || "-" }}</view>
                    <view class="ko-basic-table--cell">
                      <button
                        class="ko-basic-button__user"
                        @click="onMore(item)"
                        v-if="isPayEdit"
                      >
                        更多
                      </button>
                    </view>
                  </block>

                </view>
              </BasicCard>
            </view>
          </KoList>
        </view>
      </UniSection>
      <UniSection :title="`${isEdit ? '修改' : ''}剩余`" type="line" v-if="last > 0 || isEdit">
        <view class="ko-pay__added">
          <UniForms
            label-width="100px"
            ref="FormRef"
            :rules="rules"
            :model="form"
            label-align="right"
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
                :image-styles="{border: {radius: '6px'}, width: 80, height: 80}"
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
        </view>
      </UniSection>

      <UvActionSheet
        ref="UASRef"
        :actions="actionList"
        safe-area-inset-bottom
        round="10"
        cancel-text="取消"
        @select="onSelect"
      />
    </view>
    <template #footer v-if="isPaySubmit">
      <view class="ko-pay__footer">
        <button
          class="ko-basic-button__card"
          @click="onLast"
          :loading="sLoading"
          :disabled="sLoading"
        >
          {{ last > 0 ? "付款" : isEdit ? "修改" : "完成" }}
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-pay {
  // #ifdef MP
  width: 98vw;
  height: 78vh;
  // #endif

  // #ifdef H5
  width: 600px;

  ::v-deep .uv-popup__content.bottom {
    max-width: 800px;
    margin: 0 auto;
  }

  // #endif

  &__wrap {
    flex: 1;
  }

  &__cell {
    // #ifdef MP
    font-size: 11px;
    padding: 4px;
    line-height: 1.2;
    // #endif
    text-align: center;
    min-height: 18px;

    // #ifdef H5
    font-size: 14px;
    padding: 8px;
    // #endif
  }

  &__added {
    padding: 16px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;

    .ko-basic-button__card {
      width: 120px;
    }
  }
}
</style>
