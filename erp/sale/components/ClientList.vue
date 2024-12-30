<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _xor } from "@/utils";
import BasicMixins from "@/mixins/mixins";
import { bindCustomerApi, getCustomerListApi, removeCustomerApi, unbindCustomerApi } from "@/api/erp/sale";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";

export default {
  name: "ClientList",
  components: {
    KoMovable,
    UvActionSheet,
    IndexList,
    PickerUser,
    UvAvatar,
    UniList,
  },
  mixins: [BasicMixins],
  data() {
    const _this = this;
    return {
      content: [
        // #ifdef MP
        /* {
          text: "分享",
          iconPath: "/static/images/icons/share.png",
          path: "share",
          openType: "share",
          params: {
            title: "填写信息",
            path: "/erp/sale/client",
            query: {
              PAGE_TYPE: "ADDED_CLIENT_BY_SALE",
            },
          },
        }, */
        // #endif
        {
          text: "新增",
          iconPath: "/static/images/icons/added.png",
          path: "/erp/sale/client",
        },
      ],

      list: [],
      loading: false,
      visible: false,

      bindUserList: [],
      isBind: false,
      item: {},

      actionItem: {},

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "客户Logo",
          prop: "logo",
          width: 100,
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "logo")),
                  size: 64,
                  text: _get(row, "name") || _this.GET_SHOP_NAME,
                },
              })],
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
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  methods: {
    getList() {
      this.loading = true;
      getCustomerListApi({pageSize: 1000000, pageNum: 0})
        .then((res) => {
          console.log("客户列表", res.data);
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

    onJump(row) {
      uni.navigateTo({url: `/erp/sale/client?id=${row.id}`});
    },

    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 客户吗？`,
        success: (res) => {
          if (res.confirm) {
            removeCustomerApi(node)
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
        content: `您确定要解绑客户吗？`,
        success: (res) => {
          if (res.confirm) {

            Promise.all(
              user.map(userId => unbindCustomerApi({
                customerId: this.item.id,
                userId,
              })),
            )
              .then(() => {
                uni.showToast({
                  title: "解绑成功",
                });
                this.getList();
              });
          }
        },
      });
    },

    // 绑定
    onBind(user = []) {
      Promise.all(
        user.map(userId => bindCustomerApi({
          customerId: this.item.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({
            title: "绑定成功",
          });
          this.getList();
        });
    },

    onBindPopup(item, isBind) {
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

    onTrigger(event) {
      if ("uni") {
        uni.navigateTo({url: "/erp/sale/client"});
        return false;
      }
      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJumpInfo(item) {
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=sale`,
      });
    },

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      if (item.openType) return false;

      this[item.func](_deepCopy(this.actionItem), ...(item.arg || []));
    },

  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif

    getBindingParams() {
      return (node) => {
        return {
          path: "/client/binding/binding",
          query: {
            // 客户列表 ID
            CLIENT_LIST_ID: node.id,
            PAGE_TYPE: "BINDING_CLIENT_BY_SALE",
          },
        };
      };
    },

    actionList() {
      // const node = _deepCopy(this.actionItem);
      return [
        /* {
          openType: "share",
          dataParams: !_isEmpty(node) && this.getBindingParams(node),
          name: "邀请绑定",
        }, */
        /* {
          name: "绑定客户",
          func: "onBindPopup",
          arg: [true],
        },
        {
          name: "解绑客户",
          func: "onBindPopup",
          arg: [false],
        }, */
        {
          name: "编辑",
          func: "onJump",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
        },
      ];
    },
  },
};
</script>

<template>
  <view class="ko-client">

    <UniList>
      <!-- #ifdef MP -->
      <view class="ko-client__wrap">
        <IndexList :options="list" :loading="loading" @click="onJumpInfo" button-perm="Sales_Write">
          <template #default="{node}">
            <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 4px">
              <!--<button
                    @click.stop="() => {}"
                    open-type="share"
                    :data-params="getBindingParams(actionItem)"
                    class="ko-basic-button__card"
                  >
                    邀请绑定
                  </button>
                  -->

              <button @click.stop="onBindPopup(node, true)" class="ko-basic-button__user">绑定客户</button>
              <button @click.stop="onBindPopup(node, false)" class="ko-basic-button__user">解绑客户</button>


              <button
                class="ko-basic-button__user"
                @click.stop="onActionClick(node)"
              >
                更多
              </button>


              <template v-if="false">
                <button @click.stop="onBindPopup(node, true)" class="ko-basic-button__user">绑定客户</button>
                <button @click.stop="onBindPopup(node, false)" class="ko-basic-button__user">解绑客户</button>

                <button class="ko-basic-button__user" @click.stop="onJump(node)">编辑</button>
                <button class="ko-basic-button__user" @click.stop="onRemove(node)">删除</button>
              </template>
            </view>
          </template>
        </IndexList>
      </view>
      <!--
       <button
                    @click.stop="() => {}"
                    open-type="share"
                    :data-params="getBindingParams(item)"
                    class="ko-basic-button__card"
                  >
                    邀请绑定
                  </button>
      -->
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="getColumns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpInfo($event)"
        >
          <template #operate="{item}" v-if="isPerm('Sales_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <!--<button
                @click.stop="() => {}"
                open-type="share"
                :data-params="getBindingParams(node)"
                class="ko-basic-button__card"
              >
                邀请绑定
              </button>-->
              <button @click.stop="onBindPopup(item, true)" class="ko-basic-button__user">绑定客户</button>
              <button @click.stop="onBindPopup(item, false)" class="ko-basic-button__user">解绑客户</button>
              <button class="ko-basic-button__user" @click.stop="onJump(item)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(item)">删除</button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </UniList>

    <PickerUser
      v-if="isPerm('Sales_Write')"
      :visible.sync="visible"
      :title="isBind ? '选择绑定客户' : '解绑客户'"
      is-confirm
      :value="bindUserList"
      :disabled="isBind ? bindUserList : []"
      :checked-list="isBind ? [] : bindUserList"
      multiple
      @confirm="onConfirm"
    />

    <KoMovable
      v-if="isPerm('Sales_Write')"
      @click="onTrigger('')"
    />

    <!-- #ifdef MP -->
    <UvActionSheet
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

    &--button {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 8px;
      flex-wrap: wrap;
    }

    &--logo {
      display: flex;
      align-items: center;
    }

    &--image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }

    &--name {
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
