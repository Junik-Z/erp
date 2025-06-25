<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import KoList from "@/components/List/List.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { _deepCopy, _get, _groupBy, _keys } from "@/utils";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";

export default {
  name: "InventoryList",
  components: {UniCol, UniRow, UniSection, KoList, BasicCard},
  mixins: [mixins],
  props: {
    loading: Boolean,
    noMore: Boolean,
    list: [Array],
    columns: [Array],
    fieldList: Array,
    isStock: Boolean,
    value: Array,

    // 选中显示叉叉
    fork: Boolean,
  },

  data() {
    return {};
  },
  methods: {
    onLower() {
      this.$emit("lower");
    },
    onViewImage(node) {
      const image = this.getImageUrl(node.images);
      if (image) {
        uni.previewImage({
          urls: [image],
        });
      }
    },
    onChecked(node) {
      this.$emit("check", node, ...arguments);
    },
  },
  computed: {
    groupList() {
      const list = _groupBy(_deepCopy(this.list) || [], (item) => item.className || '');
      return _keys(list).map(key => ({
        key: key || "",
        children: list[key],
      }));
    },

    getFieldListText() {
      return (item) => {
        return this.fieldList?.flatMap(v => {
          const label = _get(item, `extend.${v.fieldCode}`);
          if (label) return [label];
          else return [];
        })?.join(" | ") || "";
      };
    },

    getCellClass() {
      return (col, item) => {
        return col.isClass && item.quantity <= item.stockWarning ? "ko-basic-money" : "";
      };
    },

    isSelection() {
      return (node) => {
        const checked = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        return checked.indexOf(node.id) > -1;
      };
    },

    // 获取样式
    getRootStyle() {
      return {
        "--ko-basic-table-grid-col": (this.columns || [])?.map((col) => col.width || "auto").join(" "),
      };
    },
  },
};
</script>

<template>
  <view class="ko-inventory-list">
    <!-- <view class="ko-inventory-list__header ko-basic-box-shadow">
       <UniRow :gutter="10">
         <UniCol v-for="item of columns" :key="item.key" :span="item.span">
           <view class="ko-inventory-list__header&#45;&#45;item">{{ item.label }}</view>
         </UniCol>
       </UniRow>
     </view>-->

    <view class="ko-inventory-list__content" :style="[getRootStyle]">
      <KoList
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        @lower="onLower"
      >
        <view class="ko-inventory-list__wrap">
          <view v-for="(item, key) of groupList" :key="key">
            <UniSection :title="item.key" type="line">
              <BasicCard :padding-size="0">
                <view class="ko-basic-table">
                  <view
                    class="ko-basic-table--th"
                    v-for="col of columns"
                    :key="col.key"
                  >
                    {{ col.label }}
                  </view>

                  <block
                    v-for="child of item.children"
                    :key="child.id"
                  >
                    <view
                      v-for="col of columns"
                      :key="col.key"
                      class="ko-basic-table--cell"
                      :class="[col.class || '', getCellClass(col, child)]"
                    >
                      <block v-if="col.isCheck">
                        <view
                          class="ko-inventory-list__cell--checked"
                          @click.stop="onChecked(child)"
                          :class="{'is-fork': fork}"
                        >
                          <checkbox v-if="!fork" :checked="isSelection(child)" />

                          <uni-icons
                            color="#E43C33"
                            v-if="isSelection(child) && fork"
                            type="closeempty"
                            size="20px"
                          />
                        </view>
                      </block>

                      <view
                        v-else
                        class="ko-inventory-list__cell"
                        @click.stop="onViewImage(child, col)"
                      >
                        <view v-if="col.isPrice">{{ toYuan(GET_FUNC(child, col.key)) }}</view>
                        <view v-else>{{ GET_FUNC(child, col.key) }}</view>
                        <view
                          style="width: 100%; font-size: 10px; color: #8f939c; padding: 2px 4px 0"
                          v-if="fieldList && fieldList.length && col.isField"
                        >
                          {{ getFieldListText(child) }}
                        </view>
                      </view>
                    </view>
                  </block>
                </view>
              </BasicCard>
            </UniSection>
          </view>
        </view>
      </KoList>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-inventory-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &__header {
    padding: 0 16px;
    margin-bottom: 10px;
    font-size: 14px;

    &--item {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
    }
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }

  &__cell {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    &--checked {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 3px;

      &.is-fork {
        border: 1px solid #D1D1D1;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin: 0 6px;
        padding: 0;
      }

      &:before {
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 99;
      }
    }
  }
}
</style>
