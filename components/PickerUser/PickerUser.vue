<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getUserListApi } from "@/api/admin";
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _isBoolean, _isEmpty, _isEqual, _isString } from "@/utils";
import { getCustomerListApi } from "@/api/erp/sale";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { getSupplierListApi } from "@/api/erp/purchase";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import IndexList from "../IndexList/IndexList.vue";
import { getLogisticsListApi } from "@/api/erp/logistics";
import { getNotBindInfoApi, getStaffListApi } from "@/api/erp/product";

export default {
  name: "PickerUser",
  components: {
    IndexList,
    UniSearchBar,
    UniSection,
    UniEasyinput,
    BasicPopup,
    UvAvatar,
    BasicCard,
  },
  data() {
    return {
      list: [],
      checked: [],
      modelVisible: false,
      checkNode: null,

      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      noMore: false,
    };
  },
  mixins: [mixins],
  props: {
    title: {
      type: String,
      default: "请选择",
    },
    value: {
      type: [String, Array],
      default: "",
    },
    multiple: Boolean,
    isConfirm: Boolean,
    visible: Boolean,
    disabled: [Array, Boolean],
    // 定义可选的值
    checkedList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 隐藏 Business 商户
    hideBusiness: Boolean,

    type: {
      type: String,
      default: "default", // client: 选择客户, supplier: 供应商, logistics: 物流商, staff: 员工, noBindStaff: 没有被绑定的员工
    },
    isInput: Boolean,
    placeholder: {
      type: String,
      default: "请选择",
    },

    // 外部列表
    isLongList: Boolean,
    // 外部的列表
    options: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  created() {
    if (this.isInput && !this.isLongList) {
      this.getList(true);
    }
  },
  methods: {
    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.loading = true;
      const Func = {
        default: getUserListApi,
        // 获取销售客户
        client: getCustomerListApi,
        // 供应商
        supplier: getSupplierListApi,
        // 物流商
        logistics: getLogisticsListApi,
        // 员工
        staff: getStaffListApi,
        // 没有被绑定系统的员工
        noBindStaff: getNotBindInfoApi,
      }[this.type];

      const vKey = {default: "userId", "noBindStaff": "userId"}[this.type] || "id";
      const lKey = {default: "nickName", "noBindStaff": "nickName"}[this.type] || "name";
      const logoKey = {default: "avatar", "noBindStaff": "avatar"}[this.type] || "logo";

      Func(this.queryList)
        .then(res => {
          const list = (res.data).map(item => ({
            ...item,
            value: _get(item, vKey),
            label: _get(item, lKey),
            logo: _get(item, logoKey),
          }));

          this.list = this.onMergeArrays(this.list, list, vKey);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.checkNode = this.getUserInfo(this.value);
        });
    },
    onSelect(item) {
      if (this.getDisabled(item)) {
        return false;
      }

      if (this.isInput && !this.multiple) {
        this.checked = this.isChecked(item) ? [] : [item.value];

        if (!this.isConfirm) {
          this.checkNode = _deepCopy(this.getUserInfo(this.checked[0]));
          this.$emit("input", this.checked[0]);
          this.modelVisible = false;

          this.$emit("check-node", this.checkNode);
        }
        return false;
      }

      if (this.multiple) {
        if (this.isChecked(item)) {
          this.checked = this.checked.filter(id => !_isEqual(item.value, id));
        } else {
          this.checked.push(item.value);
        }
      } else {
        this.checked = this.isChecked(item) ? [] : [item.value];
      }
    },
    getUserInfo(id) {
      return _deepCopy((this.list || []).find(v => _isEqual(v.value, id)) || {});
    },
    onConfirm() {
      this.$emit("confirm", this.checked);

      if (this.isInput) {
        const value = this.multiple ? this.checked : this.checked[0];
        this.$emit("input", value);
        this.checkNode = this.multiple ? this.checked.map(this.getUserInfo) : this.getUserInfo(this.checked[0]);
        this.modelVisible = false;
        this.$emit("check-node", this.checkNode);
      }
    },
    onClick() {
      if (_isBoolean(this.disabled) && this.disabled) return false;
      this.modelVisible = true;
    },


    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
    },
  },
  watch: {
    value: {
      handler() {
        if (this.isInput) {
          setTimeout(() => {
            if (this.isLongList) {
              this.list = _deepCopy(this.options);
            }
            this.checkNode = this.multiple ? this.value?.map?.(this.getUserInfo) : this.getUserInfo(this.value);
          }, 500);
        }
      },
      immediate: true,
      deep: true,
    },
    visible: {
      handler() {
        this.modelVisible = _deepCopy(this.visible);
      },
    },
    modelVisible: {
      handler() {
        if (this.modelVisible && !this.isLongList) {
          this.getList(true);
        }

        if (this.isInput && _isString(this.value)) {
          this.checkNode = this.multiple ? this.value?.map?.(this.getUserInfo) : this.getUserInfo(this.value);
        }

        if (this.modelVisible) {
          this.checked = _deepCopy(Array.isArray(this.value) ? this.value : this.value ? [this.value] : []);
        } else {
          this.checked = [];
        }

        this.$emit("update:visible", this.modelVisible);
      },
    },

    options: {
      handler() {
        if (this.isLongList) {
          this.list = _deepCopy(this.options);
        }
      },
      deep: true,
    },
  },
  computed: {
    isChecked() {
      return (item) => this.checked.indexOf(item.value) > -1;
    },

    // 是否禁用
    getDisabled() {
      return (item) => {
        if (!_isEmpty(this.checkedList)) {
          return this.checkedList?.indexOf(item.value) < 0;
        }

        const isArr = Array.isArray(this.disabled);

        if (isArr) {
          return this.disabled.indexOf(item.value) > -1;
        }

        return this.disabled;
      };
    },

    getShowLabel() {
      return this.multiple
        ? (Array.isArray(this?.checkNode) ? this?.checkNode : [])?.map(v => v.label)?.join("、")
        : this.checkNode?.label;
    },
  },
};
</script>

<template>
  <view class="ko-picker-user">
    <UniEasyinput
      v-if="isInput"
      :placeholder="placeholder"
      @click.stop="onClick"
      suffix-icon="down"
      :styles="{disableColor: 'transparent'}"
      :value="getShowLabel"
      is-readonly
    />

    <BasicPopup
      :visible.sync="modelVisible"
      :title="title"
      :type="isInput ? 'bottom' : 'center'"
    >
      <view v-if="modelVisible" class="ko-picker-user__popup" :class="{'is-input': isInput}">
        <IndexList
          @click="onSelect"
          :checked-list="checkedList"
          :data="list"
          :value="checked"
          is-checked
          :disabled="disabled"
          :is-receipt-list="type === 'logistics'"
          :safe-area-inset-bottom="false"

          :is-staff="isEqual('staff', type)"

          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"
        />
      </view>

      <template #footer v-if="isConfirm">
        <button
          style="margin: 10px 40px 10px;"
          class="ko-basic-button"
          @click="onConfirm"
        >
          确认
        </button>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-picker-user {
  &__popup {
    height: 70vh;
    // #ifdef MP
    width: 100vw;
    // #endif
    position: relative;

    &.is-input {
      height: 70vh;
    }

    // #ifdef H5
    width: 800px;
    // #endif

  }

  /deep/ input[disabled] {
    color: #333; /* 文本颜色 */
  }

  &__list {
    position: relative;
    height: calc(100% - 40px);
  }

  &__info {
    display: flex;
    align-items: center;
    position: relative;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 9;
    }

    &--name {
      @include basic-text-ellipsis();
      flex: 1;
      padding-left: 10px;
    }
  }
}
</style>
