<script>
import { getCheckListApi, refreshStockApi } from "@/api/erp/stock";
import mixins from "@/mixins/mixins";
import { getProductFieldApi } from "@/api/erp/product";
import { _isEmpty } from "@/utils";
import InventoryList from "@/erp/components/InventoryList/InventoryList.vue";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import PickerClass from "@/components/PickerClass/PickerClass.vue";

export default {
  name: "Verification",
  components: {PickerClass, UniSearchBar, InventoryList},
  mixins: [mixins],
  data() {
    return {
      list: [],
      queryList: {
        classId: "",
        pageSize: 20,
        pageNum: 0,
        name: "",
      },
      noMore: false,
      loading: false,

      FieldList: [],
      tableKey: +new Date().getTime(),

      noRefresh: false,
    };
  },
  created() {
    this.getFieldList();
  },
  methods: {
    getList(reset = false) {
      if (reset && !this.noRefresh) {
        this.list = [];
        this.queryList.pageNum = 0;
        this.tableKey = +new Date().getTime();
      }

      this.loading = true;
      getCheckListApi(this.queryList)
        .then((res) => {
          this.list = this.onMergeArrays(this.list, res.data, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;
        });
    },

    getFieldList() {
      getProductFieldApi({pageSize: 10000, pageNum: 0})
        .then(res => {
          uni.$__FIELD_LIST__ = res.data;
          this.FieldList = res.data;
        });
    },
    onRefresh(item, index) {
      this.$set(item, "__r_loading__", true);
      refreshStockApi({id: item.id})
        .then((res) => {
          uni.showToast({title: "刷新成功"});
          this.$set(this.list[index], "quantity", res.data || 0);
        })
        .finally(() => {
          this.$set(item, "__r_loading__", false);

        });
    },
    onJump(item) {
      this.noRefresh = true;
      uni.navigateTo({
        url: "/erp/stock/check" + `?id=${item.id}`,
      });
    },

    onJudge() {
      this.noRefresh = true;
      uni.navigateTo({
        url: "/shop/list/list?judge=true",
      });
    },

    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    onCancel() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.getList(true);
        });
      });
    },

    // #ifdef H5
    onRequestNextPage() {
      console.log("到底了");
      this.onLower();
    },
    // #endif
  },
  computed: {
    // #ifdef H5
    columnsList() {
      return [
        {
          label: "产品名称",
          prop: "name",
        },
        {
          label: "分类",
          prop: "className",
        },
        ...(this.FieldList.map(item => ({
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
        }))),
        /* {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        }, */
        {
          label: "入库数量",
          prop: "inQuantity",
        },
        {
          label: "出库数量",
          prop: "outQuantity",
        },
        {
          label: "库存数量",
          prop: "quantity",
          render: (h, {row}) => {
            return h("label", {class: row.quantity <= row.stockWarning ? "ko-basic-money" : ""}, [row.quantity]);
          },
        },
        {
          label: "操作",
          slot: "operate",
        },
      ];
    },
    // #endif

    // #ifdef MP
    columnTable() {
      return [
        {
          label: "名称",
          key: "name",
          span: 24 - 9,
          isField: true,
        },
        {
          label: "入库",
          key: "inQuantity",
          span: 3,
        },
        {
          label: "出库",
          key: "outQuantity",
          span: 3,
        },
        {
          label: "库存",
          key: "quantity",
          span: 3,
          isClass: true,
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
      <view style="flex: 1;">
        <UniSearchBar
          @confirm="getList(true)"
          @cancel="onCancel"
          v-model="queryList.name"
          placeholder="产品名称"
          clear-button="none"
        />
      </view>

      <PickerClass v-model="queryList.classId" @change="getList(true)" />

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
      <InventoryList
        :list="list"
        :no-more="noMore"
        :loading="loading"
        :no-data="!list.length"
        :columns="columnTable"
        @lower="onLower"
        :field-list="FieldList"
      />
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px; height: 100%; overflow: hidden;">
        <KoTable
          :key="tableKey"
          :loading="loading"
          :columns="columnsList"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJump"
          @next-load="onRequestNextPage"
          :no-more="noMore || loading"
        >
          <template #operate="{item, index}" v-if="isPerm('Stock_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button
                class="ko-basic-button__card"
                @click.stop="onRefresh(item, index)"
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

  // #ifdef MP
  height: calc(100vh - 60px);
  // #endif

  // #ifdef H5
  height: calc(100vh - 60px - 56px);
  // #endif

  display: flex;
  flex-direction: column;


  &__class {
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    /* #ifdef H5 */
    width: 900px;
    margin: 0 auto;

    .ko-picker-class {
      flex: 1;
    }

    /* #endif */
  }

  &__wrap {
    flex: 1;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
