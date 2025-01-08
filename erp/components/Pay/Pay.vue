<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import TicketMixins from "@/erp/finance/TicketMixins";
import KoList from "@/components/List/List.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { _deepCopy, _get } from "@/utils";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/components/PrintList/PrintList.vue";

export default {
  name: "ToPay",
  components: {
    PrintList, UvActionSheet,
    UniSection,
    UniListItem,
    OrderCard,
    UniForms,
    FilePicker,
    UniFormsItem,
    UniList,
    UniEasyinput,
    UniRow,
    UniCol,
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
      this.lookImage(this.getImageUrl(this.GET_FUNC(this.moreNode, "user.avatar")));
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
      return (_get(this.list, "0.customer.name") || "");
    },

    actionList() {
      const item = this.moreNode;
      return [
        {
          name: "查看凭证",
          func: "onLookVoucher",
          disabled: !item.voucher,
        },
        {
          name: "修改",
          func: "addedTicket",
        },
        {
          name: "确认单据金额",
          func: "onConfirmOrder",
        },
      ].filter(li => {
        if (li.func === "addedTicket") {
          return item.orderStatus !== "FINISHED" && !this.isDetails;
        }

        if (li.func === "onConfirmOrder") {
          return (item.orderStatus !== "FINISHED" && !this.isDetails) && !this.noUnable;
        }
        return true;
      });
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
            <view style="padding: 10px;">
              <BasicCard :spacing="10" not-padding>
                <view class="ko-pay__item--header">
                  <UniRow align="center">
                    <UniCol :span="3">
                      <view class="ko-pay__cell">金额</view>
                    </UniCol>
                    <UniCol :span="3">
                      <view class="ko-pay__cell">操作人</view>
                    </UniCol>
                    <UniCol :span="8">
                      <view class="ko-pay__cell">时间</view>
                    </UniCol>
                    <UniCol :span="6">
                      <view class="ko-pay__cell">备注</view>
                    </UniCol>
                    <UniCol :span="4">
                      <view class="ko-pay__cell">操作</view>
                    </UniCol>
                  </UniRow>
                </view>
                <view class="ko-pay__item" v-for="(item, index) of list" :key="index">
                  <UniRow align="center">
                    <UniCol :span="3">
                      <view class="ko-pay__cell"> {{ toYuan(item.totalAmount) }}</view>
                    </UniCol>
                    <UniCol :span="3">
                      <view
                        class="ko-pay__cell"
                        :class="{'ko-link': GET_FUNC(item, 'user.avatar')}"
                        @click="lookImage(getImageUrl(GET_FUNC(item, 'user.avatar')))"
                      >
                        {{ GET_FUNC(item, "user.nickName") || "-" }}
                      </view>
                    </UniCol>
                    <UniCol :span="8">
                      <view class="ko-pay__cell">{{ item.updateTime || "-" }}</view>
                    </UniCol>
                    <UniCol :span="6">
                      <view class="ko-pay__cell">{{ item.remark || "-" }}</view>
                    </UniCol>
                    <UniCol :span="4">
                      <view class="ko-pay__cell">
                        <button
                          class="ko-basic-button__user"
                          @click="onMore(item)"
                        >
                          更多
                        </button>
                      </view>
                    </UniCol>
                  </UniRow>
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
    <template #footer>
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

  &__item {
    overflow: hidden;
    font-size: 12px;

    &:nth-child(odd) {
      background: rgba(248, 248, 248, 0.99);
    }

    &--header {
      font-size: 13px;
      font-weight: 600;
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }

  &__added {
    padding: 16px;
  }

  &__footer {
    padding: 10px 50px;
  }
}
</style>
