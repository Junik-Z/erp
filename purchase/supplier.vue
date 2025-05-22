<script>
import {
  bindSupplierApi,
  convertSupplierListApi,
  getDetailSupplierApi,
  getSupplierListApi,
  getTempSupplierListApi,
  removeSupplierApi,
  unbindSupplierApi,
} from "@/api/erp/purchase";
import { _deepCopy, _get, _isEmpty, _isEqual, _isString, _set, CustomToast } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import mixins from "@/mixins/mixins";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import { PageEnums } from "@/utils/config";
import TopMenus from "./components/TopMenus.vue";
import BindUserQrcode from "@/components/BindUserQrcode.vue";

export default {
  name: "ClientList",
  components: {
    BindUserQrcode,
    TopMenus,
    HistoryBar,
    KoMovable,
    UvActionSheet,
    IndexList,
    UvAvatar,
    PickerUser,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      list: [],
      loading: false,

      visible: false,
      bindUserList: [],
      isBind: false,

      noMore: false,
      queryList: {
        pageSize: 20, pageNum: 0,
      },

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
                  size: 42,
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
          label: "金额",
          prop: "amount",
          width: 100,
          render: (h, {row}) => {
            return h(
              "span",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [_this.toYuan(Math.abs(row.amount || 0))],
            );
          },
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
          width: 360,
          slot: "operate",
        },
      ],
      // #endif
      tableKey: +new Date(),

      noRefresh: false,

      node: {},
      nodeIndex: null,
    };
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
  },
  methods: {
    getListNode(item) {
      return {
        ...item,
        value: item.id,
        label: item.name,
        logo: item.logo,
      };
    },

    getList(reset = false) {

      if (reset && !this.noRefresh) {
        this.tableKey = +new Date();
        this.list = [];
        this.queryList.pageNum = 0;
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (this.noRefresh && info && this.list.length) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Fn = [getSupplierListApi, getTempSupplierListApi][+this.tabIndex];

      Fn({...this.queryList, ...(+this.tabIndex === 0 ? {type: "OFFICIAL"} : {})})
        .then((res) => {
          const list = (res.data || []).map(this.getListNode);

          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;

          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    onTrigger(event) {
      if ("uni") {
        uni.navigateTo({url: PageEnums.purchaseNewClient});
        return false;
      }
      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJump(row) {
      this.noRefresh = true;
      uni.navigateTo({url: `${PageEnums.purchaseNewClient}?id=${row.id}`});
    },

    onRemove(row, index) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 供应商吗？`,
        success: (res) => {
          if (res.confirm) {
            removeSupplierApi(node)
              .then(() => {
                uni.showToast({title: "删除成功"});
                // this.getList(true);
                this.list.splice(index, 1);
              });
          }
        },
      });
    },

    // 解绑
    onUnbind(user) {
      Promise.all(
        user.map(userId => unbindSupplierApi({
          supplierId: this.node.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({title: "操作成功"});
          const node = _deepCopy(this.list[this.nodeIndex]);
          node.users = node.users?.filter?.(item => !(user || []).includes(item.userId)) || [];
          this.$set(this.list, this.nodeIndex, node);
        });
    },

    // 绑定
    onBind(user = []) {
      Promise.all(
        user.map(userId => bindSupplierApi({
          supplierId: this.node.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({title: "操作成功"});

          const node = _deepCopy(this.list[this.nodeIndex]);

          const UList = _get(node, "users") || [];
          _set(node, "users", [...UList, ...(user || []).map(id => this.$refs.SPURef?.getUserInfo?.(id) || {})]);

          this.$set(this.list, this.nodeIndex, node);
        });
    },

    onBindPopup(item, index) {
      this.node = item;
      this.nodeIndex = index;

      this.$refs.SPURef?.open?.({supplierId: item.value});
    },

    onConfirm(obj) {
      if (!_isEmpty(obj?.add)) {
        if (this.isPerm("SUPPLIER_BIND")) {
          this.onBind(obj?.add);
        } else {
          CustomToast({
            title: "您没有权限绑定",
            icon: "none",
          });
        }
      }

      if (!_isEmpty(obj?.remove)) {
        if (this.isPerm("SUPPLIER_UNBIND")) {
          this.onUnbind(obj?.remove);
        } else {
          CustomToast({
            title: "您没有权限解绑",
            icon: "none",
          });
        }
      }

      this.visible = false;
    },

    onJumpInfo(item) {
      if (this.isPerm("FINANCE_RECEIVABLE_CHECK") || this.isPerm("FINANCE_PAYABLE_CHECK")) {
        this.noRefresh = true;
        uni.navigateTo({
          url: PageEnums.financeCheck + `?id=${item.id}&customer_type=purchase&FORM=purchase`,
        });
      }
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    // 供应商转换
    onConvert(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要将 ${item.name} 转为 ${["临时", "正式"][+this.tabIndex]}供应商吗？`,
        success: (res) => {
          if (res.confirm) {
            convertSupplierListApi(item)
              .then(() => {
                uni.showToast({
                  title: "转换成功",
                });
                // this.getList(true);
                this.list.splice(index, 1);
              });
          }
        },
      });
    },

    onLower() {
      this.noRefresh = false;
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.noRefresh = false;
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    // 更新列表数据
    updateList() {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getDetailSupplierApi({id})
        .then(res => {
          const data = res.data || {};
          const index = this.list.findIndex(v => v.id === data.id);
          const node = this.node || {};

          const item = this.getListNode(data);

          if (index > -1) {
            this.$set(this.list, index, {...node, ...item});
          } else {
            this.list.unshift({...node, ...item});
          }
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 处理索引点击按钮
    onClickEvent({button, item, $index}) {
      if (_isEqual(button.value, "bind")) {
        this.onBindPopup(item, $index);
      }

      if (_isEqual(button.value, "qrcode")) {
        this.$refs.BUQRef.open(item, "supplier");
      }
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
          name: ["转为临时供应商", "转为正式供应商"][+this.tabIndex],
          func: "onConvert",
          perm: "SUPPLIER_CONVERT",
        },
        {
          name: "编辑",
          func: "onJump",
          perm: "SUPPLIER_EDIT",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          perm: "SUPPLIER_DELETE",
        },
      ].filter(item => this.isPerm(item.perm));
    },

    // 获取列表项
    getTabsList() {
      return [
        {
          label: "供应商",
          perm: "SUPPLIER_LIST",
          type: 0,
        },
        {
          label: "临时供应商",
          perm: "SUPPLIER_TEMP",
          type: 1,
        },
      ].filter(item => this.isPerm(item.perm));
    },

    // 获取索引
    tabIndex() {
      return _get(this.getTabsList, `${this.tab}.type`);
    },

    // #ifdef MP
    getIndexEventList() {
      const event = this.isPerm("SUPPLIER_BIND") ? [{label: "二维码", value: "qrcode"}] : [];

      if (this.isPerm("SUPPLIER_BIND") || this.isPerm("SUPPLIER_UNBIND")) {
        event.push({label: "绑定", value: "bind"});
      }
      return event;
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-purchase-client">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <TopMenus :path="PageEnums.purchaseClient" />

    <view class="ko-purchase-client__content">
      <HistoryBar
        :values="getTabsList"
        label-key="label"
        v-model="tab"

        @change="onSearchToNameIndex('')"
        custom-class="ko-purchase-client__tabs"
      />

      <!-- #ifdef MP -->
      <view class="ko-purchase-client__wrap">
        <IndexList
          :data="list"
          :loading="loading"
          is-supplier
          @click="onJumpInfo"

          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"

          :show-more-button="!!actionList.length"
          @click-more="onActionClick"

          :events="getIndexEventList"
          @click-event="onClickEvent"
          show-bind-user-list
        />
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px; flex: 1; overflow: hidden">
        <KoTable
          :key="tableKey"
          :loading="loading"
          :columns="columns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpInfo"
          @next-load="onLower"
          :no-more="noMore || loading"
        >
          <template #operate="{item, index}">
            <view style="display: flex; align-items: center; justify-content: center;">
              <!--<button
                @click.stop="() => {}"
                open-type="share"
                :data-params="getBindingParams(node)"
                class="ko-basic-button__card"
              >
                邀请绑定
              </button>-->
              <button
                @click.stop="onBindPopup(item, index)"
                class="ko-basic-button__user"
                v-if="isPerm('SUPPLIER_BIND') || isPerm('SUPPLIER_UNBIND')"
              >
                绑定
              </button>
              <button
                class="ko-basic-button__user"
                @click.stop="onConvert(item, index)"
                v-if="isPerm('SUPPLIER_CONVERT')"
              >
                {{ ["转为临时供应商", "转为正式供应商"][+tabIndex] }}
              </button>
              <button
                v-if="isPerm('SUPPLIER_EDIT')"
                class="ko-basic-button__user"
                @click.stop="onJump(item, index)"
              >
                编辑
              </button>
              <button
                class="ko-basic-button__user"
                @click.stop="onRemove(item, index)"
                v-if="isPerm('SUPPLIER_DELETE')"
              >
                删除
              </button>
            </view>
          </template>

        </KoTable>
      </view>
      <!-- #endif -->
    </view>

    <PickerUser
      :visible.sync="visible"
      title="绑定/解绑供应商"
      is-confirm
      multiple
      @confirm="onConfirm"

      ref="SPURef"
      v-if="isPerm('SUPPLIER_UNBIND') || isPerm('SUPPLIER_BIND')"

      is-external-open
      not-created-request
      type="purchaseUserList"
    />

    <KoMovable
      v-if="isPerm('SUPPLIER_ADD')"
      @click="onTrigger('')"
    />

    <BindUserQrcode ref="BUQRef" />

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

<style lang="scss" scoped>
.ko-purchase-client {
  padding-top: 10px;

  width: 100%;
  height: calc(100vh - 56px);

  // #ifdef H5
  height: calc(100vh - 60px);
  // #endif

  &__wrap {
    flex: 1;
    position: relative;
  }

  // #ifdef H5
  ::v-deep .ko-history {
    width: 100%;
  }

  // #endif

  &__content {
    position: relative;
    box-sizing: border-box;
    height: calc(100% - 40px);
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
