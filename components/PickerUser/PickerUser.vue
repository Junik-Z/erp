<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getRolePermUsersApi, getUserListApi } from "@/api/admin";
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _isBoolean, _isEmpty, _isEqual, _isString } from "@/utils";
import { getCustomerListApi, getCustomerUserListApi } from "@/api/erp/sale";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { getSupplierListApi, getSupplierUserListApi } from "@/api/erp/purchase";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import IndexList from "../IndexList/IndexList.vue";
import { getLogisticsListApi, getLogisticsUserListApi } from "@/api/erp/logistics";
import { getNotBindInfoApi, getStaffListApi, getStaffUserListApi } from "@/api/erp/product";
import { getReportsUserListApi } from "@/api/erp/finance";

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
        nickName: "",
      },

      noMore: false,

      // 备份原始已经选中的用户
      backupChecked: [],

      loading: false,
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
      // client: 选择客户,
      // supplier: 供应商,
      // logistics: 物流商, staff: 员工,
      // noBindStaff: 没有被绑定的员工，
      // perm: 权限设置成员列表,

      // saleUserList: 销售客户绑定用户列表;
      // purchaseUserList: 采购供应商用户列表
      // staffUserList: 员工列表
      // logisticsUserList: 物流商列表

      // reportUser: 财务报表用户列表
      default: "default",
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

    // 外部开启弹窗选择
    isExternalOpen: Boolean,

    // 额外的请求参数
    query: {
      type: Object,
      default() {
        return {};
      },
    },

    // 不需要在创建的时候请求
    notCreatedRequest: Boolean,

    // 只显示已经标记为选中的用户
    isSelected: Boolean,

    // 只显示标记为未选中的用户
    isNotSelected: Boolean,

    // 空数据显示占位
    placeholderLabel: String,
  },
  created() {
    if ((this.isInput && !this.isLongList && !this.isExternalOpen) && !this.notCreatedRequest) {
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
        // 获取指定菜单下所有成员及其授权情况
        perm: getRolePermUsersApi,

        // 销售客户用户列表
        saleUserList: getCustomerUserListApi,

        // 采购供应商用户列表
        purchaseUserList: getSupplierUserListApi,

        // 获取员工列表
        staffUserList: getStaffUserListApi,

        // 物流商列表
        logisticsUserList: getLogisticsUserListApi,

        // 财务报表用户
        reportUser: getReportsUserListApi,
      }[this.type];

      const vKey = {
        default: "userId",
        noBindStaff: "userId",
        perm: "userId",
        saleUserList: "userId",
        purchaseUserList: "userId",
        staffUserList: "userId",
        logisticsUserList: "userId",
        reportUser: "userId",
      }[this.type] || "id";
      const lKey = {
        default: "nickName",
        reportUser: "nickName",
        "noBindStaff": "nickName",
        perm: "nickName",
      }[this.type] || "name";
      const logoKey = {
        default: "avatar",
        reportUser: "avatar",
        "noBindStaff": "avatar",
        perm: "avatar",
      }[this.type] || "logo";

      Func({...this.queryList, [lKey]: this.queryList.nickName, ...this.query})
        .then(res => {
          const originalList = (res.data).map(item => ({
            ...item,
            value: item.id || item.userId || _get(item, vKey),
            label: item.name || item.nickName || _get(item, lKey),
            logo: item.logo || item.avatar || _get(item, logoKey),
          }));

          let list = _deepCopy(originalList);

          // 获取已经选中的用户列表
          if (this.isSelected && !this.isNotSelected) {
            list = _deepCopy(originalList).filter(v => v.selected);
          }

          // 获取标记为没有选中的数据
          if (this.isNotSelected && !this.isSelected) {
            list = _deepCopy(originalList).filter(v => !v.selected);
          }

          this.list = this.onMergeArrays(this.list, list, vKey);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;

          if (this.isAutoCheckType && !this.isSelected) {
            const checkList = list?.filter?.(v => v.selected);

            checkList.forEach(item => {
              if (!this.checked.includes(item.value)) {
                this.checked.push(item.value);
                this.backupChecked.push(_deepCopy(item.value));
              }
            });
          }
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          if (!this.isAutoCheckType) {
            this.checkNode = this.getUserInfo(this.value);
          }
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
      if (this.isAutoCheckType) {
        const backup = _deepCopy(this.backupChecked) || [];
        const check = _deepCopy(this.checked) || [];

        const remove = backup.filter(v => !check.includes(v));
        const add = check.filter(v => !backup.includes(v));

        console.log("移除的:", remove, "添加的:", add);

        this.$emit("confirm", {remove, add});
        return false;
      }

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
      if (_isBoolean(this.disabled) && this.disabled) {
        this.$emit("disabled-click");
        return false;
      }

      const queryList = _deepCopy(this.$options.data().queryList);
      this.queryList = {...queryList};

      this.$refs.ILRef && (this.$refs.ILRef.touchmoveIndex = -1);

      this.modelVisible = true;
    },

    // 外部打开弹窗
    open(query = {}) {
      const queryList = _deepCopy(this.$options.data().queryList);
      this.queryList = {...queryList, ...(query || {})};

      this.$refs.ILRef && (this.$refs.ILRef.touchmoveIndex = -1);

      this.backupChecked = [];
      this.checked = [];
      this.modelVisible = true;
    },

    close() {
      this.modelVisible = false;
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

    onCancel() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.getList(true);
        });
      });
    },

    onClose() {
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
        if (this.isExternalOpen || this.isAutoCheckType) {
          this.$emit("update:visible", this.modelVisible);

          // 设置详细的权限用户列表
          if (this.modelVisible) {
            this.getList(true);
          }

          return false;
        }

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

    // 显示label
    getShowLabel() {
      if (this.multiple) {
        const V = _isEmpty(this?.checkNode) && !!this.placeholderLabel;
        return V ? this.placeholderLabel : (Array.isArray(this?.checkNode) ? this?.checkNode : [])?.map(v => v.label)?.join("、");
      } else {
        const label = this.checkNode?.label;

        if (this.isInput) {
          return label || (this.value && this.placeholderLabel) || "";
        }

        return label;
      }
    },

    // 需要自动勾选的类型
    isAutoCheckType() {
      return ["perm", "saleUserList", "purchaseUserList", "logisticsUserList"].includes(this.type);
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
      :no-footer="!isConfirm"
      @close="onClose"
    >
      <view v-if="modelVisible" class="ko-picker-user__popup" :class="{'is-input': isInput}">
        <view>
          <uni-search-bar
            v-model="queryList.nickName"
            placeholder="请输入"
            @confirm="getList(true)"
            @cancel="onCancel"
            clear-button="none"
          />
        </view>

        <view style="flex: 1; position: relative; padding-top: 10px;">
          <IndexList
            ref="ILRef"
            @click="onSelect"
            :checked-list="checkedList"
            :data="list"
            :value="checked"
            is-checked
            :disabled="disabled"
            :is-receipt-list="type === 'logistics'"
            :safe-area-inset-bottom="false"
            :loading="loading"

            :is-staff="isEqual('staff', type)"

            @lower="onLower"
            :no-more="noMore"
            @search="onSearchToNameIndex"
          />
        </view>
      </view>

      <template #footer v-if="isConfirm">
        <view
          style="padding-bottom: 10px; display: flex;justify-content: center; align-items: center;"
        >
          <button
            class="ko-basic-button__card"
            @click="onConfirm"
            style="width: 120px;"
          >
            确认
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-picker-user {
  &__popup {
    height: 74vh;
    position: relative;
    display: flex;
    flex-direction: column;

    // #ifdef MP
    width: 100vw;
    // #endif

    // #ifdef H5
    width: 100%;
    min-width: 600px;
    // #endif

    &.is-input {
      height: 80vh;
    }
  }

  ::v-deep input[disabled] {
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
