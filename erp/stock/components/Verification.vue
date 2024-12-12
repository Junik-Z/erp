<script>
import { getCheckListApi, refreshStockApi } from "@/api/erp/stock";
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import mixins from "@/mixins/mixins";
import IndexUser from "@/components/IndexList/IndexList.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import { getProductFieldApi } from "@/api/erp/product";

export default {
  name: "Verification",
  components: {ProductCard, IndexUser, UniList, UniCol, BasicCard, UniRow, LoadMore, PickerClass},
  mixins: [mixins],
  data() {
    return {
      list: [],
      queryList: {
        classId: "",
        ...{pageSize: 1000000, pageNum: 0},
      },
      loading: false,
    };
  },
  created() {
    this.getFieldList();
  },
  methods: {
    getList() {
      this.loading = true;
      getCheckListApi(this.queryList)
        .then((res) => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getFieldList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          uni.$__FIELD_LIST__ = res.data;
        });
    },

    onRefresh(item) {
      this.$set(item, "__r_loading__", true);
      refreshStockApi({id: item.id})
        .then(() => {
          uni.showToast({title: "刷新成功"});
          this.getList();
        })
        .finally(() => {
          this.$set(item, "__r_loading__", false);

        });
    },

    onJump(item) {
      uni.navigateTo({
        url: "/erp/stock/check" + `?id=${item.id}`,
      });
    },
  },
};
</script>

<template>
  <view class="ko-verification">
    <view class="ko-verification__class">
      <PickerClass v-model="queryList.classId" @change="getList" />
    </view>

    <view class="ko-verification__wrap">
      <IndexUser :options="list" is-product :loading="loading">
        <template #cell="{node}">
          <ProductCard @click="onJump(node)" :node="node" is-verification :span="24" perm="Stock_Write">
            <template #footer="{item}">
              <view class="ko-verification__item">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onRefresh(item)"
                  :loading="item.__r_loading__"
                  :disabled="item.__r_loading__"
                >
                  刷新库存
                </button>
              </view>
            </template>
          </ProductCard>
        </template>
      </IndexUser>
    </view>


    <UniList v-if="false">
      <view class="ko-verification__wrap">
        <view class="ko-verification__wrap--item" v-for="(item, index) in list" :key="index">
          <BasicCard @click="onJump(item)">
            <view class="ko-verification__info">
              <view class="ko-verification__info--wrap">
                <image
                  v-if="item.images"
                  class="ko-verification__info--image"
                  :src="getImageUrl(item.images)"
                  mode="aspectFill"
                />
                <view style="flex: 1; margin-top: 8px;">
                  <UniRow gutter="10">
                    <UniCol :span="24">
                      <view class="ko-verification__info--name">{{ item.name }}</view>
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">产品分类：</label>{{ item.className || "-" }}
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">库存数量：</label>{{ item.quantity || "0" }}
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">库存预警数量：</label>{{ item.stockWarning || "0" }}
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">备注：</label>
                      {{ item.remark || "-" }}
                    </UniCol>
                  </UniRow>
                </view>
              </view>
              <view
                v-if="isRefreshStock"
                style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
              >
                <button
                  class="ko-basic-button__card"
                  @click.stop="onRefresh(item)"
                  :loading="item.__r_loading__"
                  :disabled="item.__r_loading__"
                >
                  刷新库存
                </button>
              </view>
            </view>
          </BasicCard>
        </view>
      </view>
      <LoadMore :loading="loading" />
    </UniList>

  </view>
</template>

<style scoped lang="scss">
.ko-verification {
  height: calc(100vh - 60px);

  display: flex;
  flex-direction: column;

  &__class {
    padding: 10px;
  }

  &__wrap {
    flex: 1;
    position: relative;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
