<script>
import KoList from "@/components/List/List.vue";
import { CONFIG, MSG_TYPE_ENUMS } from "@/utils/config";
import {
  bindCustomerMessageApi,
  bindSupplierMessageApi,
  getMessageListApi,
  readMessageApi,
  removeMessageApi,
} from "@/api/user";
import { _deepCopy, _isEmpty, _isEqual, CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";
import BasicCard from "@/components/BasicCard/BasicCard.vue";

import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import { bindSupplierApi } from "@/api/erp/purchase";
import { bindCustomerApi } from "@/api/erp/sale";
import reLogin from "@/mixins/re-login";
import KoMovable from "@/components/Movable/index.vue";
import SendMsg from "../components/SendMsg.vue";

export default {
  name: "List",
  components: {
    KoMovable,
    KoList,
    BasicCard,
    BasicPopup,
    PickerUser,

    SendMsg,
  },
  data() {
    return {
      loading: false,
      noMore: false,

      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },

      visible: false,
      title: "",

      node: {},
      nodeIndex: null,

      pType: "client",

      showNewUsers: false,
    };
  },
  mixins: [mixins, reLogin],
  onShow() {
    this.getList(true);
  },
  onLoad(option) {
    console.log("消息列表的参数：", option);
    this.list = [];

    uni.$on("$__web_socket_message__", () => this.getList(true));

    uni.$on("$__update_msg_list__", () => this.getList(true));
  },
  methods: {
    reRequest() {
      this.getList(true);
    },

    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }
      getMessageListApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 点击消息列表
    onClickItem(item, index) {
      if (!item.isRead && !["InternalStaffNoticeSender"].includes(item.type)) {
        readMessageApi({id: item.id})
          .then(() => {
            this.$set(this.list[index], "isRead", true);
          });
      }

      uni.$emit("$__web_socket_mark_read__", item.id);

      this.showNewUsers = ["NewUserNotice"].includes(item.type);

      // if (["InternalStaffNoticeSender"].includes(item.type)) return false;

      this.node = _deepCopy(item);
      this.nodeIndex = index;

      this.visible = true;
      this.title = this.getMessageType(item.type);
    },

    // 点击消息项的某个按钮
    onClickRight(event, item, index) {
      if (_isEqual(event.content.text, "删除")) {
        this.onRemove(item, index);
      }
    },

    // 删除消息
    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此消息吗？",
        success: (resp) => {
          if (resp.confirm) {
            removeMessageApi({id: item.id})
              .then(() => {
                CustomToast({title: "删除成功"});
                this.list.splice(index, 1);
              });
          }
        },
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

    // 发送系统消息
    onTrigger() {
      this.$refs.SMRef.open([], "", true);
    },

    // 滚动到底部了
    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
  },
  computed: {
    getMessageType() {
      return (type) => {
        return MSG_TYPE_ENUMS[type];
      };
    },

    getPTitle() {
      return {client: "请选中客户", supplier: "请选择供应商"}[this.pType];
    },

    getIconsType() {
      return (item) => {
        // NewUserNotice: 新用户, InternalStaffNoticeReceiver: 内部员工接收, InternalStaffNoticeSender: 内部员工发送；
        const obj = item.isRead ? {
          NewUserNotice: "personadd",
          InternalStaffNoticeSender: "paperplane",
          InternalStaffNoticeReceiver: "mail-open",
        } : {
          NewUserNotice: "personadd-filled",
          InternalStaffNoticeSender: "paperplane-filled",
          InternalStaffNoticeReceiver: "email-filled",
        };

        return obj?.[item.type];
      };
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
  onUnload() {
    console.log("数据销毁了");
    uni.$off("$__get_config_info_success__", this.reRequest);
    uni.$off("$__web_socket_message__", this.getList);
    uni.$off("$__update_msg_list__", this.getList);
  },
};
</script>

<template>
  <view class="ko-message">
    <KoList
      no-more-text="没有更多消息了"
      no-data-text="暂无任何消息"
      :loading="loading"
      :no-more="noMore"
      :no-data="!list.length"
      @lower="onLower"
      @load-next="onLower"
    >
      <view class="ko-message__list">
        <block v-for="(item, index) of list" :key="item.id">
          <view class="ko-message__item--wrap">
            <BasicCard @click.stop="onClickItem(item, index)">
              <view class="ko-message__item" :class="{'is-read': item.isRead}">
                <uni-icons
                  :type="getIconsType(item)"
                  size="30"
                  :color="item.isRead ? '#e9e9eb' : '#3a3a3a'"
                />

                <view class="ko-message__item--info">
                  <view class="ko-message__item--info--title">{{ getMessageType(item.type) }}</view>
                  <view class="ko-message__item--info--content">{{ item.content }}</view>
                  <view class="ko-ws-notify__footer">
                    <view class="ko-ws-notify__time">{{ item.createTime }}</view>

                    <view class="ko-ws-notify__user">
                      <view
                        v-if="isEqual(item.type, 'InternalStaffNoticeSender')"
                        class="ko-ws-notify__form"
                      >
                        <text style="white-space: nowrap; margin-top: 2px;">发给：</text>
                        <view class="ko-ws-notify__form--wrap">
                          <view
                            v-for="child of getToUser(item)"
                            :key="child.userId"
                            class="ko-ws-notify__form--user"
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
                        class="ko-ws-notify__form"
                        v-if="isEqual(item.type, 'InternalStaffNoticeReceiver')"
                      >
                        <uni-icons v-if="false" type="paperplane-filled" size="12px" color="#8f939c" />
                        来自：
                        <text style="color: #8f939c;">{{ GET_FUNC(item, "sender.nickName") || "" }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </BasicCard>

            <button
              v-if="(item.isRead || ['InternalStaffNoticeSender'].includes(item.type)) && isPerm('DELETE_MESSAGE')"
              class="ko-message__item--remove"
              @click.stop="onRemove(item, index)"
            >
              <uni-icons type="close" size="32" color="#333" />
            </button>
          </view>
        </block>
      </view>
    </KoList>

    <view class="ko-message__tis">
      注意：系统将自动清除一月前的消息
    </view>

    <BasicPopup no-footer-padding :visible.sync="visible" :title="title" :no-footer="!showNewUsers">
      <view class="ko-message__popup">
        <view class="ko-ws-notify__content">
          {{ node.content }}
        </view>

        <view class="ko-ws-notify__footer">
          <view class="ko-ws-notify__time">{{ node.createTime }}</view>

          <view class="ko-ws-notify__user">
            <view
              v-if="isEqual(node.type, 'InternalStaffNoticeSender')"
              class="ko-ws-notify__form"
            >
              <text style="white-space: nowrap; margin-top: 2px;">发给：</text>
              <view class="ko-ws-notify__form--wrap">
                <view
                  v-for="child of getToUser(node)"
                  :key="child.userId"
                  class="ko-ws-notify__form--user"
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
              class="ko-ws-notify__form"
              v-if="isEqual(node.type, 'InternalStaffNoticeReceiver')"
            >
              <uni-icons v-if="false" type="paperplane-filled" size="12px" color="#8f939c" />
              来自：
              <text style="color: #8f939c;">{{ GET_FUNC(node, "sender.nickName") || "" }}</text>
            </view>
          </view>
        </view>
      </view>

      <template #footer v-if="showNewUsers">
        <view class="ko-message__popup--footer" style="--ko-basic-table-grid-col: auto auto;">
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

    <PickerUser
      ref="PURef"
      :type="pType"
      :title="getPTitle"

      is-external-open
      not-created-request
      is-confirm

      @confirm="onConfirm"
    />

    <KoMovable @click="onTrigger" v-if="isPerm('SEND_INTERNAL_MESSAGE')">
      <view style="font-size: 10px; line-height: 1.1;">
        <uni-icons type="paperplane-filled" color="#fff" />
        <view style="margin-bottom: 8px;">系统消息</view>
      </view>
    </KoMovable>

    <SendMsg ref="SMRef" />
  </view>
</template>

<style scoped lang="scss">
.ko-message {
  &__list {
    padding: 10px 0;

    // #ifdef H5
    width: 1024px;
    margin: 0 auto;
    // #endif

    ::v-deep .uni-swipe_button-group {
      top: 5px;
      bottom: 5px;
    }

    ::v-deep .uni-swipe_button {
      border-radius: 6px;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    overflow: hidden;

    &--wrap {
      padding: 10px;
      position: relative;
    }

    &--remove {
      position: absolute;
      top: 0;
      right: 6px;
      height: 32px;
      width: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // #ifdef H5
    &--remove {
      right: 0;
    }

    // #endif

    &.is-read {
      .ko-message__item--info {
        color: #8f939c;
      }
    }

    &--info {
      padding-left: 10px;
      //padding-right: 10px;
      flex: 1;
      color: #3a3a3a;

      &--title {
        font-size: 14px;
        font-weight: bold;
      }

      &--content {
        padding-top: 8px;
        font-size: 12px;
      }

      &--time {
        font-size: 10px;
        margin-top: 3px;
        white-space: nowrap;
      }
    }
  }

  &__popup {
    padding: 10px 10px 0;

    // #ifdef MP
    width: 90vw;
    // #endif

    // #ifndef MP
    width: 600px;

    .ko-ws-notify__content {
      height: 360px;
    }

    // #endif

    &--footer {
      .ko-basic-button__card {
        padding: 8px 16px;
        width: 120px;
      }
    }
  }

  &__tis {
    font-size: 10px;
    color: #f29e99;
    text-align: center;
    position: fixed;
    bottom: 26px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99;
    background: rgba(255, 255, 255, .6);
    padding: 6px 10px;
    border-radius: 6px;
  }
}
</style>
