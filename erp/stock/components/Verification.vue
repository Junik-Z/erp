<script>
import { getCheckListApi, refreshStockApi } from "@/api/erp/stock";
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "Verification",
  components: {UniList, UniCol, BasicCard, UniRow, LoadMore, PickerClass},
  mixins: [mixins],
  data() {
    return {
      list: [],
      queryList: {
        classId: "",
      },
      loading: false,
    };
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

    <UniList>
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
  padding-bottom: 50px;

  &__class {
    padding: 10px;
  }

  &__wrap {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
    //padding: 10px;
    //column-count: 2; /* 定义列的数量 */
    //column-gap: 10px; /* 定义列与列之间的间隙 */

    &--item {
      margin: 5px;
      width: calc(50% - 10px);
      //break-inside: avoid-column; /* 避免在元素内部断行 */
      //margin-bottom: 10px; /* 定义元素之间的间隙 */
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: $uni-base-color;

    &--wrap {
      //display: flex;
      //align-items: center;
      overflow: hidden;
    }

    &--image {
      width: 100%;
      height: 120px;
      border-radius: 8px;
    }

    &--name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;

      @include basic-text-ellipsis(1)
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
