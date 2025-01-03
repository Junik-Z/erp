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

      /* #ifdef H5 */
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
    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.loading = true;
      getCheckListApi(this.queryList)
        .then((res) => {
          this.list = this.onMergeArrays(this.list, res.data, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getFieldList() {
      getProductFieldApi({pageSize: 10000, pageNum: 0})
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
          :clear-button="false"
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
  // #ifdef MP
  height: calc(100vh - 60px);
  // #endif

  display: flex;
  flex-direction: column;

  &__class {
    padding: 0 10px;
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
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
