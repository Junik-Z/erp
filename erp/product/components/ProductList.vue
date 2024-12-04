<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import { deleteProductApi, getProductFieldApi, getProductListApi } from "@/api/erp/product";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniCard from "@/uni_modules/uni-card/components/uni-card/uni-card.vue";
import { _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import UniDataPicker from "@/uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.vue";
import PickerClass from "@/components/PickerClass/PickerClass.vue";

export default {
  name: "ProductList",
  mixins: [mixins],
  components: {
    PickerClass,
    UniDataPicker,
    UniCard,
    LoadMore,
    UniFab,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
    QiunDataCharts,
    UniGridItem,
    UniGrid,
  },
  data: () => ({
    list: [],
    loading: false,

    fieldList: [],
    className: [],
    classList: [],

    queryList: {
      classId: "",
    },
  }),
  created() {
    this.getSelectList();
  },
  methods: {
    getList() {
      this.loading = true;
      getProductListApi(this.queryList)
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getSelectList() {
      Promise.all([getProductFieldApi()])
        .then(res => {
          [this.fieldList] = res.map(item => item.data || []);
        });
    },

    onFabClick(item) {
      let query = "";

      if (!_isEmpty(item)) {
        query = `?id=${item.id}`;
      }

      uni.navigateTo({
        url: `/erp/product/added${query}`,
      });
    },

    onRemove(row) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 产品吗？`,
        success: (res) => {
          if (res.confirm) {
            this.$set(row, "__remove_loading__", true);
            deleteProductApi(row)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              });
          }
        },
      });
    },

    // 选中分类
    onChangeClass(event) {
      this.className = event.detail.value?.map(item => item.text) || [];
      this.getList();
    },

    onAllClass() {
      this.queryList.classId = "";
      this.className = [];
      this.getList();
    },
  },
  computed: {
    getFieldValue() {
      return (item, child) => {
        return _get(item, `extend.${child.fieldCode}`) || "-";
      };
    },
  },
};
</script>

<template>
  <view class="ko-product">
    <view class="ko-product__class">
      <PickerClass v-model="queryList.classId" @change="getList" />
    </view>

    <UniList>
      <view class="ko-product__wrap">
        <view class="ko-product__wrap--item" v-for="(item, index) in list" :key="index">
          <BasicCard>
            <view class="ko-product__info">
              <view class="ko-product__info--wrap">
                <image
                  v-if="item.images"
                  class="ko-product__info--image"
                  :src="getImageUrl(item.images)"
                  mode="aspectFill"
                />
                <view style="flex: 1; margin-top: 8px;">
                  <UniRow gutter="10">
                    <UniCol :span="24">
                      <view class="ko-product__info--name">{{ item.name }}</view>
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">产品分类：</label>{{ item.className || "-" }}
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">入库价格：</label>
                      <text class="ko-basic-money">¥ {{ toYuan(item.purchasePrice) }}元</text>
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">销售价格：</label>
                      <text class="ko-basic-money">¥ {{ toYuan(item.salePrice) }}元</text>
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">预警库存：</label>
                      {{ item.stockWarning }}
                    </UniCol>
                    <UniCol :span="24" v-for="child of fieldList" :key="child.id">
                      <label class="ko-basic-label">{{ child.fieldName }}：</label>
                      {{ getFieldValue(item, child) }}
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">产品介绍：</label>
                      {{ item.description || "-" }}
                    </UniCol>
                    <UniCol :span="24">
                      <label class="ko-basic-label">备注：</label>
                      {{ item.remark || "-" }}
                    </UniCol>
                  </UniRow>
                </view>
              </view>
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button class="ko-basic-button__card" @click="onFabClick(item)">编辑</button>
                <button
                  class="ko-basic-button__card"
                  @click="onRemove(item)"
                  :loading="item.__remove_loading__"
                >
                  删除
                </button>
              </view>
            </view>
          </BasicCard>
        </view>
      </view>
      <LoadMore :loading="loading" />
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
      direction="vertical"
      @fabClick="onFabClick"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-product {
  margin-top: 10px;
  padding-bottom: 40px;

  &__class {
    padding: 0 10px 15px;
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
