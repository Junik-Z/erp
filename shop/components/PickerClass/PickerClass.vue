<script>
import { getProductClassApi } from "@/api/erp/product";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import DaTreeVue2 from "../../components/da-tree-vue2/index.vue";
import { _isEmpty, _isEqual } from "@/utils";

function findData(data, predicate) {
  // 如果当前数据是数组，递归查找每个元素
  if (Array.isArray(data)) {
    for (let item of data) {
      const result = findData(item, predicate);
      if (result) return result; // 如果找到，直接返回结果
    }
  } else if (typeof data === "object" && data !== null) {
    // 如果当前数据是对象，递归查找对象的每个属性值
    for (let key in data) {
      const result = findData(data[key], predicate);
      if (result) return result; // 如果找到，直接返回结果
    }
  }

  // 如果当前数据满足条件，返回当前数据
  if (predicate(data)) {
    return data;
  }

  // 如果没有找到，返回 null 或 undefined
  return null;
}

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

    isInput: Boolean,

    // 分享ID
    shareId: String
  },
  watch: {
    type: {
      handler() {
        if (this.watchType || !this.type) {
          this.getClassList();
        }
      },
      deep: true,
    },
    value: {
      handler() {
        if (this.isInput) {
          this.getCheckedItem();
        }
      },
      immediate: true,
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

      getProductClassApi({
        ...params,
        pageNum: 0,
        pageSize: 1000,
        ...(this.shareId ? {shareId: this.shareId || '', shareType: this.type} : {}),
      })
        .then(res => {
          this.classList = res.data;
          this.getCheckedItem();
        });
    },

    // 获取当前选中的数据
    getCheckedItem() {
      if (this.isInput && this.value && !_isEmpty(this.classList)) {
        const item = findData(this.classList, (row) => {
          return _isEqual(row.id, this.value);
        });

        this.checkedItem = {
          key: item.id,
          label: item.name,
        };
      }
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

    onCha() {
      this.onChange(null, {});
    },

    onAllClass() {
      this.$refs.DaTreeRef?.setCheckedKeys?.(this.checkedItem?.key, false);

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
      <block v-if="!isInput">
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
      </block>
      <block v-else>
        <view class="ko-picker-class__input">
          <uni-easyinput is-readonly :clearable="false" :value="checkedItem.label" placeholder="请选择" />
          <view class="ko-picker-class__input--mask" @click="onOpen"></view>
          <view class="ko-picker-class__input--operate">
            <button
              class="ko-picker-class__input--cha"
              @click.stop="onCha"
              v-if="!!(checkedItem.key || checkedItem.label)"
            >
              <i class="iconfont icon-cha"></i>
            </button>

            <view class="ko-picker-class__input--jiantou" :class="{'is-show': visible}">
              <i class="iconfont icon-jiantou"></i>
            </view>
          </view>
        </view>
      </block>
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
          :default-expand-all="false"
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

  &__input {
    width: 100%;
    position: relative;

    &--mask {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 66;
    }

    &--operate {
      position: absolute;
      right: 10px;
      top: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      z-index: 67;
    }

    &--cha .iconfont {
      font-size: 14px;
      color: rgb(184, 188, 197);
    }

    &--jiantou {
      margin-left: 10px;
      transition: transform .3s;
      color: rgb(184, 188, 197);

      &.is-show {
        transform: rotate(180deg);
      }

      .iconfont {
        font-size: 18px;
      }
    }
  }

  // #ifdef H5

  // #endif
}
</style>
