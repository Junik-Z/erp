<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import { getBusinessesListApi } from "@/api/admin";
import { _deepCopy, _isEmpty } from "@/utils";

export default {
  name: "BusinessAdvertising",
  components: {UniCol, UniRow, BasicCard, UvAvatar, BasicPopup},
  mixins: [mixins],
  props: {
    visible: Boolean,
  },
  data() {
    return {
      merchantsList: [],
    };
  },
  watch: {
    visible: {
      handler() {
        this.visible && this.getMerchantsList();
      },
    },
  },
  methods: {
    // 获取商户列表
    getMerchantsList() {
      if (_isEmpty(uni.$__merchants_list__)) {
        this.loading = true;
        getBusinessesListApi()
          .then(res => {
            this.merchantsList = res.data;
            uni.$__merchants_list__ = res.data;
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.merchantsList = _deepCopy(uni.$__merchants_list__);
      }
    },

    onMerchants(item) {
      this.onLogout({
        scene: item.name,
        PAGE_TYPE: "reselect",
      })
        .finally(() => {
          this.$emit("update:visible", false);
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
  <BasicPopup :visible.sync="modelVisible">
    <view class="ko-merchants">
      <BasicCard :spacing="10" v-for="item of merchantsList" :key="item.id">
        <button @click.stop="onMerchants(item)">
          <UniRow :gutter="18">
            <UniCol :span="24">
              <view style="display: flex; justify-content: center; align-items: center;">
                <UvAvatar
                  :src="getImageUrl(item.logo)"
                  :size="84"
                  random-bg-color
                  :text="item.remark || GET_SHOP_NAME"
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
    <template #hint>
      <view style="padding: 10px 20px 0; font-size: 14px; color: #e9e9eb;">
        众多商户已加盟，您还在等什么？快来加入我们！
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-merchants {
  width: 90vw;
  height: 60vh;
  padding: 16px;
}
</style>
