<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import KoList from "@/components/List/List.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { _get, _groupBy } from "@/utils";
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
      return _groupBy(this.list || [], (item) => item.className);
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
  },
};
</script>

<template>
  <view class="ko-inventory-list">
    <view class="ko-inventory-list__header ko-basic-box-shadow">
      <UniRow :gutter="10">
        <UniCol v-for="item of columns" :key="item.key" :span="item.span">
          <view class="ko-inventory-list__header--item">{{ item.label }}</view>
        </UniCol>
      </UniRow>
    </view>

    <view class="ko-inventory-list__content">
      <KoList
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        @lower="onLower"
      >
        <view class="ko-inventory-list__wrap">
          <view v-for="(item, key) of groupList" :key="key">
            <UniSection :title="key" type="line">
              <BasicCard>
                <view
                  class="ko-inventory-list__item"
                  v-for="child of item"
                  :key="child.id"
                  @click.stop="onViewImage(child)"
                >
                  <UniRow :gutter="6">
                    <UniCol style="height: 100%;" v-for="col of columns" :key="col.key" :span="col.span">
                      <view
                        class="ko-inventory-list__cell"
                        :class="[col.class || '', getCellClass(col, child)]"
                      >
                        <block v-if="col.isCheck">
                          <view class="ko-inventory-list__cell--checked" @click.stop="onChecked(child)">
                            <checkbox :checked="isSelection(child)" />
                          </view>
                        </block>
                        <block v-else>
                          <view v-if="col.isPrice">{{ toYuan(GET_FUNC(child, col.key)) }}</view>
                          <view v-else>{{ GET_FUNC(child, col.key) }}</view>
                          <view
                            style="width: 100%; font-size: 10px; color: #8f939c; padding: 2px 4px 0"
                            v-if="fieldList && fieldList.length && col.isField"
                          >
                            {{ getFieldListText(child) }}
                          </view>
                        </block>
                      </view>
                    </UniCol>
                  </UniRow>
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

  &__item {
    font-size: 12px;

    &:nth-child(odd) {
      background: rgba(248, 248, 248, 0.99);
    }
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

  ::v-deep .uni-col {
    height: 100% !important;
  }
}
</style>
