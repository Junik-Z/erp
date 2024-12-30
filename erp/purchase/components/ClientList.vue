<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import {
  bindSupplierApi,
  convertSupplierListApi,
  getSupplierListApi,
  getTempSupplierListApi,
  removeSupplierApi,
  unbindSupplierApi,
} from "@/api/erp/purchase";
import { _deepCopy, _get, _isEmpty, _xor } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import mixins from "@/mixins/mixins";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";

export default {
  name: "ClientList",
  components: {
    HistoryBar,
    KoMovable,
    UvActionSheet,
    IndexList,
    UvAvatar,
    PickerUser,
    UniList,
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
      actionItem: {},

      tab: 0,

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
      const Fn = [getSupplierListApi, getTempSupplierListApi][+this.tab];

      Fn({pageSize: 1000000, pageNum: 0, ...(+this.tab === 0 ? {type: "OFFICIAL"} : {})})
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

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },

    // 供应商转换
    onConvert(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要将 ${item.name} 转为 ${["临时", "正式"][+this.tab]}供应商吗？`,
        success: (res) => {
          if (res.confirm) {
            convertSupplierListApi(item)
              .then(() => {
                uni.showToast({
                  title: "转换成功",
                });
                this.getList();
              });
          }
        },
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

    actionList() {
      return [
        {
          name: ["转为临时供应商", "转为正式供应商"][+this.tab],
          func: "onConvert",
        },
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
    <view class="ko-client__content">
      <HistoryBar
        :values="['供应商', '临时供应商']"
        v-model="tab"
        @change="getList()"
      />

      <!-- #ifdef MP -->
      <view class="ko-client__wrap">
        <IndexList :options="list" :loading="loading" is-supplier @click="onJumpInfo" button-perm="Purchase_Write">
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

              <button
                class="ko-basic-button__user"
                @click.stop="onActionClick(node)"
              >
                更多
              </button>

              <template v-if="false">
                <button class="ko-basic-button__user" @click.stop="onJump(node)">编辑</button>
                <button class="ko-basic-button__user" @click.stop="onRemove(node)">删除</button>
              </template>
            </view>
          </template>
        </IndexList>
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
          @row-click="onJumpInfo"
        >
          <template #operate="{item}" v-if="isPerm('Purchase_Write')">
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
              <button class="ko-basic-button__user" @click.stop="onConvert(item)">
                {{ ["转为临时客户", "转为正式客户"][+tab] }}
              </button>
              <button class="ko-basic-button__user" @click.stop="onJump(item)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(item)">删除</button>
            </view>
          </template>

        </KoTable>
      </view>
      <!-- #endif -->
    </view>

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

    <KoMovable
      v-if="isPerm('Purchase_Write')"
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
  height: calc(100vh - 56px);

  &__wrap {
    flex: 1;
    position: relative;
  }

  &__content {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
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
