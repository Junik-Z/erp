<script>
import KoList from "@/components/List/List.vue";
import mixins from "@/mixins/mixins";
import { getCraftListApi, getQuickListApi, removeCraftApi, removeQuickApi } from "@/api/erp/produce";
import { CONFIG } from "@/utils/config";
import { _isEmpty, CustomToast } from "@/utils";
import FastMixins from "./FastMixins";

export default {
  name: "FastProduce",
  components: {KoList},
  mixins: [mixins, FastMixins],
  data() {
    return {
      loading: false,
      noMore: false,
      list: [],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },
    };
  },

  props: {
    // 请求类型
    type: {
      type: String,
      default: "quick", // craft: 工艺
    },
  },

  watch: {
    type: {
      handler() {
        this.getList(true);
      },
    },
  },

  created() {
    this.getList(true);
  },

  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 获取列表
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }
      this.loading = true;

      const Func = {
        quick: getQuickListApi,
        craft: getCraftListApi,
      }[this.type];

      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 处理删除
    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除吗？",
        success: (res) => {
          if (res.confirm) {
            const Func = {
              quick: removeQuickApi,
              craft: removeCraftApi,
            }[this.type];

            this.$set(this.list[index], "__r_loading__", true);

            Func(item)
              .then(() => {
                CustomToast({
                  title: "删除成功",
                });
                this.list.splice(index, 1);
              })
              .finally(() => {

                this.$set(this.list[index], "__r_loading__", false);
              });

          }
        },
      });

    },

    onApply(item) {
      this.getDetails(item, this.type)
        .then(res => {
          console.log(res.data);
          this.$emit("apply-fast", res.data);
        });
    },
  },
};
</script>

<template>
  <view class="ko-fast">
    <!-- #ifdef MP -->
    <view class="ko-fast__wrap">
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length" @lower="onRequestNextPage">
        <view style="padding: 5px 10px" v-for="(item, index) of list" :key="item.id">
          <BasicCard :spacing="10">
            <uni-row :gutter="10">
              <uni-col :span="24">
                <label class="ko-basic-label">名称：</label>
                <text>{{ item.processName }}</text>
              </uni-col>
              <uni-col :span="24">
                <view style="display: flex; align-items: center; justify-content: flex-end;">
                  <button
                    @click.stop="onRemove(item, index)"
                    :loading="item.__r_loading__"
                    :disabled="item.__r_loading__"
                    class="ko-basic-button__card"
                  >
                    删除
                  </button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onApply(item, index)"
                  >
                    应用
                  </button>
                </view>
              </uni-col>
            </uni-row>
          </BasicCard>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="ko-fast__wrap">
      <KoTable
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onRowClick"
        @next-load="onRequestNextPage"
        :no-more="noMore || loading"

        :no-refresh="noRefresh"
      >
        <template #operate="{item, index}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              class="ko-basic-button__card"
              @click.stop="onRemove(item, index)"
            >
              删除
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

  </view>
</template>

<style scoped lang="scss">
.ko-fast {
  height: 100%;

  &__wrap {
    height: 100%;
    overflow: hidden;

    font-size: 14px;
    color: #8f939c;
  }
}
</style>
