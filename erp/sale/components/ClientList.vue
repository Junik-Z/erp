<script>
import { _deepCopy, _get, _isEmpty, _isEqual, _isString, _xor } from "@/utils";
import BasicMixins from "@/mixins/mixins";
import {
  bindCustomerApi,
  convertTempCustomerApi,
  getCustomerInfoApi,
  getCustomerListApi,
  getTempCustomerListApi,
  removeCustomerApi,
  unbindCustomerApi,
} from "@/api/erp/sale";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

export default {
  name: "ClientList",
  components: {
    UniEasyinput,
    HistoryBar,
    KoMovable,
    UvActionSheet,
    IndexList,
    PickerUser,
    UvAvatar,
  },
  mixins: [BasicMixins],
  data() {
    const _this = this;
    return {
      content: [
        // #ifdef MP
        /* {
          text: "分享",
          iconfont: "icon-icon-test",
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
          iconfont: "icon-tianjia",
          path: "/erp/sale/client",
        },
      ],

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
      const Fn = [getCustomerListApi, getTempCustomerListApi][+this.tab];

      Fn({...this.queryList, ...(+this.tab === 0 ? {type: "OFFICIAL"} : {})})
        .then((res) => {
          console.log("客户列表", res.data);
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

    onJump(row) {
      this.noRefresh = true;
      uni.navigateTo({url: `/erp/sale/client?id=${row.id}`});
    },

    onRemove(row, index) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 客户吗？`,
        success: (res) => {
          if (res.confirm) {
            removeCustomerApi(node)
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
      uni.showModal({
        title: "温馨提示",
        content: `您确定要解绑客户吗？`,
        success: (res) => {
          if (res.confirm) {

            Promise.all(
              user.map(userId => unbindCustomerApi({
                customerId: this.node.id,
                userId,
              })),
            )
              .then(() => {
                uni.showToast({
                  title: "解绑成功",
                });
                // this.getList(true);
                const use = _deepCopy(this.list[this.nodeIndex].users)?.filter(v => {
                  return !user.includes(v.userId);
                });
                this.$set(this.list[this.nodeIndex], "users", use);
              });
          }
        },
      });
    },

    // 绑定
    onBind(user = []) {
      Promise.all(
        user.map(userId => bindCustomerApi({
          customerId: this.node.id,
          userId,
        })),
      )
        .then(() => {
          uni.showToast({
            title: "绑定成功",
          });
          this.$set(this.list[this.nodeIndex], "users", [...this.list[this.nodeIndex]?.users || [], ...user.map(userId => ({userId}))]);
        });
    },

    onBindPopup(item, isBind, index) {
      this.bindUserList = _deepCopy(item)?.users?.map(v => v.userId) || [];
      this.isBind = isBind;
      this.node = item;
      this.nodeIndex = index;
      this.visible = true;
    },

    onConfirm(checked) {
      const users = _xor(this.bindUserList, checked);
      !_isEmpty(users) && this[this.isBind ? "onBind" : "onUnbind"](users);
      this.visible = false;
    },

    onTrigger(event) {
      if ("uni") {
        this.noRefresh = true;
        uni.navigateTo({url: "/erp/sale/client"});
        return false;
      }
      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJumpInfo(item) {
      this.noRefresh = true;
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=sale`,
      });
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      if (item.openType) return false;
      this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    // 客户转换
    onConvert(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要将 ${item.name} 转为 ${["临时", "正式"][+this.tab]}客户吗？`,
        success: (res) => {
          if (res.confirm) {

            convertTempCustomerApi(item)
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

      getCustomerInfoApi({id})
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
      // const node = _deepCopy(this.node);
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
          name: ["转为临时客户", "转为正式客户"][+this.tab],
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
        :values="['客户', '临时客户']"
        v-model="tab"
        @change="onSearchToNameIndex('')"
        custom-class="ko-client__tabs"
      />

      <!-- #ifdef MP -->
      <view class="ko-client__wrap">
        <IndexList
          :data="list"
          :loading="loading"
          @click="onJumpInfo"
          button-perm="Sales_Write"

          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"
        >
          <template #default="{node, index}">
            <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 4px">
              <!--<button
                    @click.stop="() => {}"
                    open-type="share"
                    :data-params="getBindingParams(node)"
                    class="ko-basic-button__card"
                  >
                    邀请绑定
                  </button>
                  -->
              <button @click.stop="onBindPopup(node, true, index)" class="ko-basic-button__user">绑定客户</button>
              <button @click.stop="onBindPopup(node, false, index)" class="ko-basic-button__user">解绑客户</button>

              <button
                class="ko-basic-button__user"
                @click.stop="onActionClick(node, index)"
              >
                更多
              </button>
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
      <view style="padding: 10px; flex: 1; overflow: hidden">
        <KoTable
          :key="tableKey"
          :loading="loading"
          :columns="getColumns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpInfo($event)"
          @next-load="onLower"
          :no-more="noMore || loading"
        >
          <template #operate="{item, index}" v-if="isPerm('Sales_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button @click.stop="onBindPopup(item, true, index)" class="ko-basic-button__user">绑定客户</button>
              <button @click.stop="onBindPopup(item, false, index)" class="ko-basic-button__user">解绑客户</button>
              <button class="ko-basic-button__user" @click.stop="onConvert(item, index)">
                {{ ["转为临时客户", "转为正式客户"][+tab] }}
              </button>
              <button class="ko-basic-button__user" @click.stop="onJump(item, index)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(item, index)">删除</button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </view>

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
  height: calc(100vh - 56px);

  // #ifdef H5
  height: calc(100vh - 56px - 60px);
  // #endif

  &__wrap {
    flex: 1;
    position: relative;
  }

  // #ifdef H5
  /deep/ .ko-history {
    width: 100%;
  }

  // #endif

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
