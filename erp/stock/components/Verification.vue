<script>
import { getCheckListApi, refreshStockApi } from "@/api/erp/stock";
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import mixins from "@/mixins/mixins";
import IndexList from "@/components/IndexList/IndexList.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import { getProductFieldApi } from "@/api/erp/product";

export default {
  name: "Verification",
  components: {ProductCard, IndexList, UniList, UniCol, BasicCard, UniRow, LoadMore, PickerClass},
  mixins: [mixins],
  data() {
    return {
      list: [],
      queryList: {
        classId: "",
        ...{pageSize: 1000000, pageNum: 0},
      },
      loading: false,

      /* #ifdef H5 */
      FieldList: [],
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "产品名称",
          prop: "name",
        },
        {
          label: "分类",
          prop: "className",
        },
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
        {
          label: "操作",
          slot: "operate",
        },
      ],
      // #endif
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
          this.FieldList = res.data;
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

    onJudge() {
      uni.navigateTo({
        url: "/shop/list/list?judge=true",
      });
    },
  },
  computed: {
    // #ifdef H5
    columnsList() {
      return [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "产品名称",
          prop: "name",
        },
        {
          label: "分类",
          prop: "className",
        },
        {
          label: "数量",
          prop: "quantity",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.quantity]);
          },
        },
        {
          label: "预警数量",
          prop: "stockWarning",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.stockWarning]);
          },
        },
        ...(this.FieldList.map(item => ({
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
        }))),
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
        {
          label: "操作",
          slot: "operate",
        },
      ];
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-verification">
    <view class="ko-verification__class">
      <PickerClass v-model="queryList.classId" @change="getList" />
      <button
        class="ko-basic-button__card"
        v-if="isBusiness || isAdmin || isPerm('Stock_Taking')"
        @click.stop="onJudge"
        style="margin-left: 8px"
      >
        库存盘点
      </button>
    </view>

    <view class="ko-verification__wrap">
      <!-- #ifdef MP -->
      <IndexList :options="list" is-product :loading="loading">
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
      </IndexList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="columnsList"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJump"
        >
          <template #operate="{item}" v-if="isPerm('Stock_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
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
        </KoTable>
      </view>
      <!-- #endif -->

    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-verification {
  height: calc(100vh - 60px);

  display: flex;
  flex-direction: column;

  &__class {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    /* #ifdef H5 */
    width: 1366px;
    margin: 0 auto;

    .ko-picker-class {
      flex: 1;
    }

    /* #endif */
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
