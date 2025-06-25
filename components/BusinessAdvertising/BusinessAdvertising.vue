<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import { getBusinessesListApi } from "@/api/admin";
import KoList from "@/components/List/List.vue";
import { _isEmpty } from "@/utils";

export default {
  name: "BusinessAdvertising",
  components: {KoList, UniCol, UniRow, BasicCard, UvAvatar, BasicPopup},
  mixins: [mixins],
  props: {
    visible: Boolean,
    isQrCode: Boolean,
  },
  data() {
    return {
      list: [],
      loading: false,

      noMore: false,
      queryList: {
        pageNum: 0,
        pageSize: 5,
      },

      logoutLoading: false,
    };
  },
  watch: {
    visible: {
      handler() {
        this.visible && this.getList();
      },
    },
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 获取商户列表
    getList() {
      this.loading = true;
      getBusinessesListApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onMerchants(item) {
      this.logoutLoading = true;
      this.onLogout(
        {
          scene: item.name,
          PAGE_TYPE: "reselect",
        },
        this.isQrCode ? "/erp/qrcode/qrcode" : "",
      )
        .finally(() => {
          this.$emit("update:visible", false);
          this.logoutLoading = false;
        });
    },
  },
  computed: {
    modelVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="modelVisible" max-height="72vh">
    <view class="ko-merchants">
      <KoList
        @lower="onRequestNextPage"
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        no-more-text="期待您的加入"
      >
        <view style="padding: 16px">
          <BasicCard :spacing="10" v-for="item of list" :key="item.id">
            <button @click.stop="onMerchants(item)" :disabled="logoutLoading">
              <UniRow :gutter="10">
                <UniCol :span="24">
                  <view style="display: flex; justify-content: center; align-items: center;">
                    <UvAvatar
                      :src="getImageUrl(item.logo)"
                      :size="64"
                      random-bg-color
                      :text="item.remark || GET_SHOP_NAME"
                      not-view
                    />
                  </view>
                </UniCol>
                <UniCol :span="24">
                  <view style="display: flex; justify-content: center; align-items: center;">
                    <text>{{ item.remark || "-" }}</text>
                  </view>
                </UniCol>
                <UniCol :span="24" v-if="false">
                  <view style="display: flex; justify-content: center; align-items: center;">
                    <text>{{ item.name || "-" }}</text>
                  </view>
                </UniCol>
              </UniRow>
            </button>
          </BasicCard>
        </view>
      </KoList>
    </view>
    <template #hint>
      <view style="padding: 10px 20px 0; font-size: 14px; color: #e9e9eb; width: 70vw;">
        众多商户已加盟，您还在等什么？快来加入我们！
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-merchants {
  // #ifdef MP
  width: 70vw;
  // #endif
  height: 50vh;
  overflow: hidden;

  &__go-stores {
    position: absolute;
    top: 0;
    left: 0;
  }

  &__title {
    padding-left: 16px;
  }

  &__go-stores {
    width: 120px;
    height: 24px;
    font-size: 14px;
  }
}
</style>
