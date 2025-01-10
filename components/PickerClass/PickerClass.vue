<script>
import { getProductClassApi } from "@/api/erp/product";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import DaTreeVue2 from "@/components/da-tree-vue2/index.vue";

export default {
  name: "PickerClass",
  components: {DaTreeVue2, BasicPopup},
  data() {
    return {
      classList: uni.$__product_class_list__ || [],
      visible: false,
      checkedItem: {},
    };
  },
  props: {
    value: String,
    title: {
      type: String,
      default: "产品分类",
    },
    type: String,
    watchType: Boolean,
  },
  watch: {
    type: {
      handler() {
        if (this.watchType) {
          this.getClassList();
        }
      },
      deep: true,
    },
  },
  created() {
    /* _isEmpty(uni.$__product_class_list__) &&  */
    !this.watchType && this.getClassList();
  },
  methods: {
    getClassList() {
      const params = {
        purchase: {purchaseOff: false},
        sale: {saleOff: false},
      }[this.type];

      getProductClassApi({...params, pageNum: 0, pageSize: 1000})
        .then(res => {
          this.classList = res.data;
          uni.$__product_class_list__ = res.data;
        });
    },

    onOpen() {
      this.visible = true;
    },

    onChange(key, item) {
      this.$emit("input", key);
      this.$emit("change", key);
      this.checkedItem = item;
      this.visible = false;
    },

    onAllClass() {
      this.$refs.DaTreeRef.setCheckedKeys(this.checkedItem?.key, false);

      this.checkedItem = {};
      this.$emit("input", "");
      this.$emit("change");
    },
  },
};
</script>

<template>
  <view class="ko-picker-class">
    <view class="ko-picker-class__wrap">
      <view class="ko-picker-class__name">
        <view class="ko-picker-class__name--wrap">
          {{ checkedItem.label || "" }}
        </view>

        <button
          class="ko-basic-button__card"
          v-if="checkedItem.label"
          @click="onAllClass"
        >
          <i class="iconfont icon-guanbi"></i>
        </button>
      </view>
      <button v-if="!checkedItem.label" class="ko-basic-button__card" @click="onOpen">分类</button>
    </view>

    <BasicPopup
      style="z-index: 99;"
      type="bottom"
      :visible.sync="visible"
      :title="title"
    >
      <view class="ko-picker-class__popup">
        <DaTreeVue2
          ref="DaTreeRef"
          :data="classList"
          labelField="name"
          valueField="id"
          defaultExpandAll
          @change="onChange"
          expand-checked
        />
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-picker-class {
  width: 100%;

  &__wrap {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__name {
    text-align: center;
    flex: 1;
    display: flex;
    align-items: center;

    &--wrap {
      flex: 1;
    }

    .ko-basic-button__card {
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 6px;
    }
  }

  &__popup {
    height: 80vh;
  }

  // #ifdef H5

  // #endif
}
</style>
