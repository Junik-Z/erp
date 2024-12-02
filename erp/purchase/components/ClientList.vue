<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { getSupplierListApi, removeSupplierApi, unbindSupplierApi } from "@/api/erp/purchase";
import getCacheFile from "@/utils/fileCache";
import { _deepCopy, _isEqual } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";

export default {
  name: "ClientList",
  components: {KoTable, LoadMore, UniCol, UniRow, UniFab, BasicCard, UniListItem, UniList},
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
      getSupplierListApi()
        .then((res) => {
          console.log(res);
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onTrigger(event) {
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

    onUnbind(row) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要解绑 ${row.name} 供应商吗？`,
        success: (res) => {
          if (res.confirm) {
            unbindSupplierApi(row)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              });
          }
        },
      });
    },
  },
  computed: {
    getImageUrl() {
      return getCacheFile;
    },
  },
};
</script>

<template>
  <view class="ko-client">
    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <BasicCard>
            <view class="ko-client__info">
              <view class="ko-client__info--logo">
                <image class="ko-client__info--image" :src="getImageUrl(item.logo)" />
                <view class="ko-client__info--name">{{ item.name }}</view>
              </view>

              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button open-type="share" :data-params="item.id" class="ko-basic-button__card">邀请绑定微信</button>
                <button @click="onUnbind(item)" class="ko-basic-button__card">解绑微信</button>
                <button class="ko-basic-button__card" @click="onJump(item)">编辑</button>
                <button class="ko-basic-button__card" @click="onRemove(item)">删除</button>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>
      <LoadMore :loading="loading" />
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

    <UniFab
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      :content="content"
      direction="vertical"
      @trigger="onTrigger"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-client {
  width: 100%;

  .ko-basic-button__card {
    margin: 5px;
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
