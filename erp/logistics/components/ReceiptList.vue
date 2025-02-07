<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _xor } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import BasicMixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import IndexList from "@/components/IndexList/IndexList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import { bindLogisticsApi, getLogisticsListApi, removeLogisticsApi, unbindLogisticsApi } from "@/api/erp/logistics";
import KoMovable from "@/components/Movable/index.vue";

export default {
  name: "ClientList",
  components: {
    KoMovable,
    UvActionSheet,
    IndexList,
    PickerUser,
    UvAvatar,
    LoadMore,
    UniCol,
    UniRow,
    BasicCard,
  },
  mixins: [BasicMixins],
  data() {
    const _this = this;
    return {
      list: [],
      loading: false,
      visible: false,

      bindUserList: [],
      isBind: false,
      item: {},

      noMore: false,
      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      actionItem: {},

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "物流商Logo",
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
    };
  },
  methods: {
    getList() {
      this.loading = true;
      getLogisticsListApi(this.queryList)
        .then((res) => {
          console.log("客户列表", res.data);
          const list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));

          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onJump(row) {
      uni.navigateTo({url: `/erp/logistics/client?id=${row.id}`});
    },

    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 物流商吗？`,
        success: (res) => {
          if (res.confirm) {
            removeLogisticsApi(node)
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
        content: `您确定要解绑物流商吗？`,
        success: (res) => {
          if (res.confirm) {

            Promise.all(
              user.map(userId => unbindLogisticsApi({
                logisticsId: this.item.id,
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
        user.map(userId => bindLogisticsApi({
          logisticsId: this.item.id,
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
        uni.navigateTo({url: "/erp/logistics/client"});
        return false;
      }

      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    onJumpInfo(item) {
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=logistics`,
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

    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
      this.tableKey = +new Date();
    },
    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.list = [];
      this.queryList.pageNum = 0;
      this.queryList.nameIndex = key;
      this.getList();
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
            PAGE_TYPE: "BINDING_CLIENT_BY_LOGISTICS",
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
          name: "绑定物流商",
          func: "onBindPopup",
          arg: [true],
        },
        {
          name: "解绑物流商",
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
    <view class="ko-client__wrap">
      <!-- #ifdef MP -->
      <IndexList
        :data="list"
        :loading="loading"
        @click="onJumpInfo"
        button-perm="Delivery_Write"
        is-receipt-list

        @lower="onLower"
        :no-more="noMore"
        @search="onSearchToNameIndex"
      >
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
            <button @click.stop="onBindPopup(node, true)" class="ko-basic-button__user">绑定物流商</button>
            <button @click.stop="onBindPopup(node, false)" class="ko-basic-button__user">解绑物流商</button>

            <button
              class="ko-basic-button__user"
              @click.stop="onActionClick(node)"
            >
              更多
            </button>
          </view>
        </template>
      </IndexList>
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
      <view style="padding: 10px; height: 100%; overflow: hidden">
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
          <template #operate="{item}" v-if="isPerm('Delivery_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <!--<button
                @click.stop="() => {}"
                open-type="share"
                :data-params="getBindingParams(node)"
                class="ko-basic-button__card"
              >
                邀请绑定
              </button>-->
              <button @click.stop="onBindPopup(item, true)" class="ko-basic-button__user">绑定物流商</button>
              <button @click.stop="onBindPopup(item, false)" class="ko-basic-button__user">解绑物流商</button>
              <button class="ko-basic-button__user" @click.stop="onJump(item)">编辑</button>
              <button class="ko-basic-button__user" @click.stop="onRemove(item)">删除</button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </view>

    <PickerUser
      v-if="isPerm('Delivery_Write')"
      :visible.sync="visible"
      :title="isBind ? '选择绑定物流商' : '解绑物流商'"
      is-confirm
      :value="bindUserList"
      :disabled="isBind ? bindUserList : []"
      :checked-list="isBind ? [] : bindUserList"
      multiple
      @confirm="onConfirm"
    />

    <KoMovable
      v-if="isPerm('Delivery_Write')"
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
    position: relative;
    height: calc(100vh - 66px);

    // #ifdef H5
    height: calc(100vh - 56px - 60px);
    // #endif
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
