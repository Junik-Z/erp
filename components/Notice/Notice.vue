<script>
import { _deepCopy, _isEmpty, _isEqual, addUnit, CustomToast } from "@/utils";
import { MSG_TYPE_ENUMS } from "@/utils/config";
import { bindCustomerMessageApi, bindSupplierMessageApi, readMessageApi } from "@/api/user";
import { bindSupplierApi } from "@/api/erp/purchase";
import { bindCustomerApi } from "@/api/erp/sale";
import mixins from "@/mixins/mixins";

export default {
  name: "Notice",
  components: {},
  props: {
    path: String,
    isCustom: Boolean,
  },
  data() {
    return {
      isClose: "",
      // 药丸的高度
      boundingTop: 0,
      currentPath: "",

      list: [],

      node: {},
      nodeIndex: null,

      showNewUsers: false,
      visible: false,
      vTitle: "",
    };
  },
  mounted() {
    uni.$on("$__web_socket_notice__", this.onSocketMessage);
    uni.$on("$__web_socket_mark_read__", this.onMarkReadById);
  },
  async created() {
    this.getCurrentPage();

    // #ifdef MP
    const Bounding = await uni.getMenuButtonBoundingClientRect();
    this.boundingTop = Bounding.top + Bounding.height;
    // #endif
  },
  mixins: [mixins],
  methods: {
    // 获取当前页面
    getCurrentPage() {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      this.currentPath = `/${page.route}`;

      // #ifdef APP-PLUS
      const currentWebview = page.$getAppWebview();
      console.log(currentWebview.id);//获得当前webview的id
      console.log(currentWebview.isVisible());//查询当前webview是否可见
      // #endif
    },
    // 来的消息
    onSocketMessage(res) {
      const {data} = res;
      if (_isEmpty(data)) return false;
      this.$refs.UPRef && this.$refs.UPRef.open();

      const id = data.id;
      this.list.unshift({...data, __show__: false});
      setTimeout(() => {
        this.list = this.list.map(item => {
          if (_isEqual(item.id, id)) return ({...item, __show__: true});
          return item;
        });
      }, 160);
    },
    // 消息提示
    open() {
      this.$refs.UPRef.open();
    },

    // 标记已读
    async onMarkRead(node, index) {
      if (!node.isRead && !["InternalStaffNoticeSender"].includes(node.type)) {
        await readMessageApi({id: node.id});
      }

      uni.$emit("$__update_msg_count__");

      this.node = _deepCopy(node);
      this.nodeIndex = index;

      this.vTitle = this.getMessageType(node.type);
      this.visible = true;
      this.showNewUsers = ["NewUserNotice"].includes(node.type);
    },

    // 标记并删除已读
    onMarkReadById(id) {
      this.list = this.list.filter(v => !_isEqual(v.id, id));

      this.$nextTick(() => {
        if (!this.list.length) this.$refs.UPRef.close();
      });
    },

    // 创建绑定客户
    onBindCustomer() {
      bindCustomerMessageApi({userId: this.node.data})
        .then(() => {
          CustomToast({title: "操作成功"});
          this.list.splice(this.nodeIndex, 1);
        })
        .finally(() => {
          this.visible = false;
        });
    },

    // 创建绑定供应商
    onBindSupplier() {
      bindSupplierMessageApi({userId: this.node.data})
        .then(() => {
          CustomToast({title: "操作成功"});
          this.list.splice(this.nodeIndex, 1);
        })
        .finally(() => {
          this.visible = false;
        });
    },

    // 处理绑定
    onPBind(type) {
      this.pType = type;

      this.$refs.PURef.open({});
    },

    // 确定绑定
    onConfirm(check) {
      const id = check[0] || "";
      if (id) {
        if (_isEqual(this.pType, "supplier")) {
          bindSupplierApi({
            supplierId: id,
            userId: this.node.data,
          })
            .then(() => {
              CustomToast({title: "绑定成功"});
              this.list.splice(this.nodeIndex, 1);
              this.visible = false;
            })
            .finally(() => {
              this.$refs.PURef.close();
            });
        }

        if (_isEqual(this.pType, "client")) {
          bindCustomerApi({
            customerId: id,
            userId: this.node.data,
          })
            .then(() => {
              CustomToast({title: "绑定成功"});
              this.list.splice(this.nodeIndex, 1);
              this.visible = false;
            })
            .finally(() => {
              this.$refs.PURef.close();
            });
        }
      } else {
        this.$refs.PURef.close();
      }
    },

    // 关闭弹窗
    onClose() {
      this.onMarkReadById(this.node.id);
    },
  },
  computed: {
    getMessageType() {
      return (type) => {
        return MSG_TYPE_ENUMS[type];
      };
    },

    rootStyle() {
      return {
        "--ko-notice-top": addUnit(this.boundingTop),
      };
    },
    title() {
      return (item) => MSG_TYPE_ENUMS[item.type];
    },

    // 获取接收用户
    getToUser() {
      return (item) => {
        return item?.receivers?.map((v, index) => {
          const isRead = item.receiverReadStatus?.[index];

          return {
            ...v,
            isRead,
          };
        });
      };
    },
  },
  beforeDestroy() {
    uni.$off("$__web_socket_notice__");
    uni.$off("$__web_socket_mark_read__");
  },
};
</script>

<template>
  <view style="height: 0;">
    <uv-popup
      ref="UPRef"
      mode="top"
      :overlay="false"
      :close-on-click-overlay="false"
      bg-color="transparent"
    >
      <view class="ko-notice" :style="[rootStyle]" :class="{'is-custom': isCustom}">
        <view style="margin-bottom: 10px;" v-for="(item, index) of list" :key="item.id">
          <uv-transition mode="slide-top" timing-function="ease-in" :show="item.__show__">
            <BasicCard bg-color="#fff" @click="onMarkRead(item, index)">
              <view class="ko-notice__item">
                <view class="ko-notice__item--title">{{ title(item) }}</view>
                <view class="ko-notice__item--content"> {{ item.content }}</view>
              </view>
            </BasicCard>
          </uv-transition>
        </view>
      </view>
    </uv-popup>

    <BasicPopup @close="onClose" no-footer-padding :visible.sync="visible" :title="vTitle" :no-footer="!showNewUsers">
      <view class="ko-notice__popup">
        <view class="ko-notice__popup--content">
          <view class="ko-notice__popup--content--time" v-if="node.createTime">{{ node.createTime }}</view>
          {{ node.content }}
        </view>

        <view style="display: flex; align-items: center; justify-content: flex-end;">
          <view
            v-if="isEqual(node.type, 'InternalStaffNoticeSender')"
            class="ko-notice__form"
          >
            <text style="white-space: nowrap; margin-top: 2px;">发给：</text>
            <view class="ko-notice__form--wrap">
              <view
                v-for="child of getToUser(node)"
                :key="child.userId"
                class="ko-notice__form--user"
                :class="{'is-read': child.isRead}"
              >
                <uni-icons
                  :type="child.isRead ? 'mail-open-filled' : 'email-filled'"
                  size="16px"
                  :color="child.isRead ? '#333' : '#c7c9ce'"
                />
                <text style="margin-left: 2px;">{{ child.nickName }}</text>
              </view>
            </view>
          </view>

          <view
            class="ko-notice__form--wrap"
            v-if="isEqual(node.type, 'InternalStaffNoticeReceiver')"
          >
            <uni-icons v-if="false" type="paperplane-filled" size="12px" color="#8f939c" />
            来自：
            <text style="color: #8f939c;">{{ GET_FUNC(node, "sender.nickName") || "" }}</text>
          </view>
        </view>
      </view>

      <template #footer v-if="showNewUsers">
        <view class="ko-notice__popup--footer" style="--ko-basic-table-grid-col: auto auto;">
          <view class="ko-basic-table ko-basic-table__not-border">
            <view
              class="ko-basic-table--cell"
              v-if="isPerm('CREATE_BIND_CUSTOMER')"
            >
              <button
                class="ko-basic-button__card"
                @click.stop="onBindCustomer"
              >
                创建绑定客户
              </button>
            </view>
            <view
              class="ko-basic-table--cell"
              v-if="isPerm('CREATE_BIND_SUPPLIER')"
            >
              <button
                class="ko-basic-button__card"
                @click.stop="onBindSupplier"
              >
                创建绑定供应商
              </button>
            </view>
            <view class="ko-basic-table--cell" v-if="isPerm('CUSTOMER_LIST') && isPerm('CUSTOMER_BIND')">
              <button class="ko-basic-button__card" @click.stop="onPBind('client')">绑定客户</button>
            </view>
            <view class="ko-basic-table--cell" v-if="isPerm('SUPPLIER_LIST') && isPerm('SUPPLIER_BIND')">
              <button class="ko-basic-button__card" @click.stop="onPBind('supplier')">绑定供应商</button>
            </view>
          </view>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-notice {
  padding: 10px 10px 50px;
  background: transparent;
  max-height: 90vh;
  overflow-y: auto;

  &.is-custom {
    padding-top: calc(var(--ko-notice-top) + 10px);
    max-height: calc(90vh + var(--ko-notice-top) + 10px);
  }

  &__item {
    color: #333;

    &--title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    &--content {
      font-size: 12px;
    }
  }

  &__popup {
    padding: 10px;

    // #ifdef MP
    width: 90vw;
    // #endif

    &--content {
      font-size: 12px;
      height: 260px;
      overflow-y: auto;

      // #ifdef H5
      width: 600px;
      // #endif

      &--time {
        font-size: 10px;
        color: #8f939c;
        margin-bottom: 10px;
        text-align: center;
      }
    }

    &--footer {

      .ko-basic-button__card {
        padding: 8px 16px;
        width: 120px;
      }
    }
  }

  &__form {
    display: flex;
    align-items: flex-start;
    font-size: 11px;
    line-height: 1.2;
    margin-left: 20px;

    &--wrap {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      font-size: 11px;
      line-height: 1.2;
    }

    &--user {
      display: flex;
      align-items: center;
      margin-right: 10px;
      color: #c7c9ce;

      &.is-read {
        color: #333;
      }
    }
  }
}
</style>
