<script>
import KoList from "@/components/List/List.vue";
import { CONFIG } from "@/utils/config";
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

const M_TYPE = {
  NewUserNotice: "新用户提醒",
};

export default {
  name: "List",
  components: {
    KoList,
    BasicCard,
    BasicPopup,
    PickerUser,
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
    };
  },
  mixins: [mixins],
  onLoad() {
    this.getList(true);
  },
  methods: {
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
      if (!item.isRead) {
        readMessageApi({id: item.id})
          .then(() => {
            this.$set(this.list[index], "isRead", true);
          });
      }

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
  },
  computed: {
    getMessageType() {
      return (type) => {
        return M_TYPE[type];
      };
    },

    getPTitle() {
      return {client: "请选中客户", supplier: "请选择供应商"}[this.pType];
    },
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
    >
      <view class="ko-message__list">
        <block v-for="(item, index) of list" :key="item.id">
          <view class="ko-message__item--wrap">
            <BasicCard @click.stop="onClickItem(item, index)">
              <view class="ko-message__item" :class="{'is-read': item.isRead}">
                <uni-icons
                  :type="item.isRead ? 'chatboxes' : 'chatboxes-filled'"
                  size="30"
                  :color="item.isRead ? '#e9e9eb' : '#3a3a3a'"
                />

                <view class="ko-message__item--info">
                  <view class="ko-message__item--info--title">{{ getMessageType(item.type) }}</view>
                  <view class="ko-message__item--info--content">{{ item.content }}</view>
                  <view class="ko-message__item--info--time">{{ item.createTime }}</view>
                </view>

                <button v-if="item.isRead && isPerm('DELETE_MESSAGE')" class="ko-basic-button__card"
                        @click.stop="onRemove(item, index)">删除
                </button>
              </view>
            </BasicCard>
          </view>
        </block>
      </view>
    </KoList>

    <BasicPopup no-footer-padding :visible.sync="visible" :title="title">
      <view class="ko-message__popup">
        <view class="ko-message__popup--content">
          <view class="ko-message__popup--content--time">{{ node.createTime }}</view>
          {{ node.content }}
        </view>
      </view>

      <template #footer>
        <view class="ko-message__popup--footer ko-basic-box-shadow" style="--ko-basic-table-grid-col: auto auto;">
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
  </view>
</template>

<style lang="scss">
.ko-message {
  &__list {
    padding: 10px 0;

    // #ifdef H5
    width: 1024px;
    margin: 0 auto;
    // #endif

    /deep/ .uni-swipe_button-group {
      top: 5px;
      bottom: 5px;
    }

    /deep/ .uni-swipe_button {
      border-radius: 6px;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    overflow: hidden;

    &--wrap {
      padding: 5px 10px;
    }

    &.is-read {
      .ko-message__item--info {
        color: #8f939c;
      }
    }

    &--info {
      padding-left: 10px;
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
      }
    }
  }

  &__popup {
    padding: 10px;

    // #ifdef MP
    width: 98vw;
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
      padding: 10px 10px 20px;

      .ko-basic-button__card {
        padding: 8px 16px;
        width: 120px;
      }
    }
  }
}
</style>
