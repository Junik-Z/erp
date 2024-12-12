<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { bindSupplierApi, getSupplierListApi, removeSupplierApi, unbindSupplierApi } from "@/api/erp/purchase";
import { _deepCopy, _isEmpty, _xor } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import mixins from "@/mixins/mixins";
import IndexUser from "@/components/IndexList/IndexList.vue";

export default {
  name: "ClientList",
  components: {
    IndexUser,
    UvAvatar, PickerUser, KoTable, LoadMore, UniCol, UniRow, UniFab, BasicCard, UniListItem, UniList,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      content: [
        // #ifdef MP
        {
          text: "分享",
          iconPath: "/static/images/icons/share.png",
          path: "share",
          openType: "share",
          params: {
            title: "填写信息",
            content: "邀请您填写信息，方便下次联系。",
            path: "/erp/purchase/client?type=added",
          },
        },
        // #endif
        {
          text: "新增",
          iconPath: "/static/images/icons/added.png",
          path: "/erp/purchase/client",
        },
      ],
      list: [],
      loading: false,

      visible: false,
      bindUserList: [],
      isBind: false,
      item: {},

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "供应商Logo",
          prop: "logo",
          width: 100,
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {props: {src: _this.getImageUrl(row.logo), size: 64}})],
            );
          },
        },
        {
          label: "昵称",
          prop: "name",
        },
        {
          label: "联系电话",
          prop: "phone",
        },
        {
          label: "地址",
          prop: "address",
        },
        {
          label: "发票抬头",
          prop: "invoiceTitle",
        },
        {
          label: "纳税人识别号",
          prop: "taxNumber",
        },
        {
          label: "开票类型",
          prop: "invoiceType",
        },
        {
          label: "税率",
          prop: "taxRate",
        },
        {
          label: "开户行",
          prop: "bank",
        },
        {
          label: "银行账号",
          prop: "bankAccount",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 260,
          render(h, {row}) {
            return h("div", [
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onUnbind.bind(_this, row)},
                },
                "解绑微信",
              ),
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onJump.bind(_this, row)},
                }
                , "修改"),
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onRemove.bind(_this, row)},
                }
                , "删除"),
            ]);
          },
        },
      ],
      // #endif
    };
  },
  methods: {
    getList() {
      this.loading = true;
      getSupplierListApi({pageSize: 1000000, pageNum: 0})
        .then((res) => {
          this.list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onTrigger(event) {
      if ("uni") {
        uni.navigateTo({url: "/erp/purchase/client"});
        return false;
      }

      const {path} = event.item || {};
      this.$refs.FabRef.close();
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJump(row) {
      uni.navigateTo({url: `/erp/purchase/client?id=${row.id}`});
    },

    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 供应商吗？`,
        success: (res) => {
          if (res.confirm) {
            removeSupplierApi(node)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              });
          }
        },
      });
    },

    // 解绑
    onUnbind(user) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要解绑供应商吗？`,
        success: (res) => {
          if (res.confirm) {

            Promise.all(
              user.map(userId => unbindSupplierApi({
                supplierId: this.item.id,
                userId,
              })),
            )
              .then(() => {
                uni.showToast({title: "解绑成功"});
                this.getList();
              });
          }
        },
      });
    },

    // 绑定
    onBind(user = []) {
      Promise.all(
        user.map(userId => bindSupplierApi({
          supplierId: this.item.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({title: "绑定成功"});
          this.getList();
        });
    },

    onBindPopup(item, isBind) {

      console.log(item);

      this.bindUserList = _deepCopy(item)?.users?.map(v => v.userId) || [];
      this.isBind = isBind;
      this.item = item;
      this.visible = true;
    },

    onConfirm(checked) {
      const users = _xor(this.bindUserList, checked);
      !_isEmpty(users) && this[this.isBind ? "onBind" : "onUnbind"](users);
      this.visible = false;
    },

    onJumpInfo(item) {
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=purchase`,
      });
    },

  },
  computed: {
    getBindingParams() {
      return (node) => {
        return {
          path: "/client/binding/binding",
          query: {
            // 客户列表 ID
            CLIENT_LIST_ID: node.id,
            PAGE_TYPE: "BINDING_CLIENT_BY_PURCHASE",
          },
        };
      };
    },
  },
};
</script>

<template>
  <view class="ko-client">
    <UniList>
      <!-- #ifdef MP -->
      <view class="ko-client__wrap">
        <IndexUser :options="list" @click="onJumpInfo" button-perm="Purchase_Write">
          <template #default="{node}">
            <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 4px">
              <!--<button
                @click.stop="() => {}"
                open-type="share"
                :data-params="getBindingParams(node)"
                class="ko-basic-button__card"
              >
                邀请绑定
              </button>-->
              <button @click.stop="onBindPopup(node, true)" class="ko-basic-button__user">绑定客户</button>
              <button @click.stop="onBindPopup(node, false)" class="ko-basic-button__user">解绑客户</button>
              <button class="ko-basic-button__user" @click.stop="onJump(node)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(node)">删除</button>
            </view>
          </template>
        </IndexUser>
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
    </UniList>

    <PickerUser
      v-if="isPerm('Purchase_Write')"
      :visible.sync="visible"
      :title="isBind ? '选择绑定客户' : '解绑客户'"
      is-confirm
      :value="bindUserList"
      :disabled="isBind ? bindUserList : []"
      :checked-list="isBind ? [] : bindUserList"
      multiple
      @confirm="onConfirm"
    />

    <UniFab
      v-if="isPerm('Purchase_Write')"
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      :content="[] || content"
      direction="vertical"
      @fab-click="onTrigger"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-client {
  width: 100%;

  &__wrap {
    height: calc(100vh - 66px);
  }

  :deep(.uni-list-item__container ) {
    display: block;
  }

  &__info {
    font-size: 14px;
    color: $uni-base-color;

    &--logo {
      display: flex;
      align-items: center;
    }

    &--button {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 8px;
      flex-wrap: wrap;
    }

    &--image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
      padding-left: 20px;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }
}
</style>
