<script>
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import {
  CNC_PERM_TREE,
  FINANCE_PERM_TREE,
  FINANCE_REPORTS_PERM_TREE,
  LOGISTICS_PERM_TREE,
  PRODUCE_PERM_TREE,
  PRODUCT_PERM_TREE,
  PURCHASE_PERM_TREE,
  SALE_PERM_TREE,
  STOCK_PERM_TREE,
} from "@/admin/merchants/define";
import { _deepCopy, _get, _isEqual, _xor, CustomToast } from "@/utils";
import { getRolePermListApi, setUserRoleApi } from "@/api/admin";
import mixins from "@/mixins/mixins";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";

const TREE_DATA = {
  stock: STOCK_PERM_TREE,
  sale: SALE_PERM_TREE,
  purchase: PURCHASE_PERM_TREE,
  produce: PRODUCE_PERM_TREE,
  finance: FINANCE_PERM_TREE,
  logistics: LOGISTICS_PERM_TREE,
  product: PRODUCT_PERM_TREE,
  cnc: CNC_PERM_TREE,
  finance_reports: FINANCE_REPORTS_PERM_TREE,
};

const User = uni.getStorageSync("__USER_INFO__");

export default {
  name: "authorization",
  components: {UniFormsItem, UniForms, PickerUser, BasicCard},
  mixins: [mixins],
  onLoad(option) {
    this.option = option;
    this.isCustom = _isEqual(option.isCustom, "true");

    if (this.isCustom) {
      this.userId = this.GET_USER_INFO.userId || User.userId;
      this.onChangeUser();
    }
  },
  data() {
    return {
      roomTreeData: [],
      option: {},

      userId: "",
      // 当前用户拥有的所有权限
      checked: [],

      // 备份用户的权限
      backup: [],

      sLoading: false,
      // 是否是定制
      isCustom: false,
    };
  },
  methods: {
    // 更新用户了, 获取选中用户的所有权限；
    onChangeUser() {
      if (this.userId) {
        uni.showLoading({
          title: "加载中...",
          mask: true,
        });
        getRolePermListApi({userId: this.userId})
          .then(res => {
            this.checked = _deepCopy(res.data);
            this.backup = _deepCopy(res.data);
          })
          .finally(() => {
            uni.hideLoading();
          });
      }
    },

    // 点击全选节点
    onClickTitle(item) {
      const isCheck = this.getParentChecked(item);
      const isInd = this.getParentIndeterminate(item);

      const child = (item?.children || []).map(v => v.perm);

      if (isCheck) {
        this.checked = this.checked.filter(v => !child.includes(v));
      } else if (isInd) {
        child.forEach(perm => {
          if (!this.checked.includes(perm)) {
            this.checked.push(perm);
          }
        });
      } else {
        this.checked.push(...child);
      }
    },

    // 点击单个权限的时候
    onClickChild(child) {
      const perm = child.perm;
      if (this.checked.includes(perm)) {
        this.checked = this.checked.filter(v => v !== perm);
      } else {
        this.checked.push(perm);
      }
    },

    // 当数据改变后点击选择用户时触发
    onDisabledClick() {
      uni.showModal({
        title: "温馨提示",
        content: "用户权限还未保存，请先保存。",
        showCancel: false,
      });
    },

    // 保存权限
    onSubmit() {
      this.sLoading = true;
      setUserRoleApi({
        userId: this.userId,
        role: this.checked,
      })
        .then(() => {
          CustomToast({title: "授权成功"});
          this.onChangeUser();
        })
        .finally(() => {
          this.sLoading = false;
        });
    },
  },
  computed: {
    getTreeList() {
      if (!this.option.model_key) return [];

      return (_get(TREE_DATA, this.option.model_key) || [])
        .map(item => {
          item.children = item.children.flatMap(child => {
            // 判断生效的商户
            if (child?.mixinKeys) {
              if (child?.mixinKeys.some(v => this[v])) {
                return [child];
              } else {
                return [];
              }
            } else {
              return [child];
            }
          });
          return item;
        });
    },

    // 获取请求用户列表
    getUserListQuery() {
      return {role: this.option.role};
    },

    // 判断一级是否全部选中
    getParentChecked() {
      return (item) => {
        if (item && !((item.children || [])?.length)) return false;
        return (item?.children || []).every(v => this.checked.includes(v.perm));
      };
    },

    // 判断一级是否有选中的
    getParentIndeterminate() {
      return (item) => {
        if (item && !((item.children || [])?.length)) return false;
        return (item?.children || []).some(v => this.checked.includes(v.perm));
      };
    },

    // 获取节点是否被选中
    getChecked() {
      return (child) => (this.checked || [])?.includes(child.perm);
    },

    // 判断是否已经更改了
    isChange() {
      const is = _xor(_deepCopy(this.checked), _deepCopy(this.backup));
      return is.length > 0;
    },

    // 获取表格的数据
    getTableStyle() {
      let col = "auto auto";

      // #ifdef H5
      col = "25% 25% 25% 25%";
      // #endif

      return {
        "--ko-basic-table-grid-col": col,
      };
    },
  },
};
</script>

<template>
  <view class="ko-admin-authorization ko-basic-added-form">
    <uni-forms label-width="100">
      <uni-forms-item label="授权用户：" v-if="!isCustom">
        <view style="width: 100%;">
          <PickerUser
            @check-node="onChangeUser"
            type="perm"
            is-input
            v-model="userId"

            :disabled="isChange"

            @disabled-click="onDisabledClick"

            :query="getUserListQuery"

            not-created-request
            is-selected
          />
        </view>
      </uni-forms-item>

      <view class="ko-admin-authorization__wrap">
        <view class="ko-admin-authorization__wrap--label">授权功能：</view>

        <BasicCard :spacing="10" v-for="(item, index) of getTreeList" :key="index">
          <view class="ko-admin-authorization__item" :style="[getTableStyle]">
            <view class="ko-admin-authorization__item--title" @click="onClickTitle(item)">
              <block v-if="!!userId">
                <view
                  class="ko-checkbox--icon checkbox-checked"
                  v-if="getParentChecked(item)"
                />
                <view
                  class="ko-checkbox--icon checkbox-indeterminate"
                  v-else-if="getParentIndeterminate(item)"
                />
                <view
                  class="ko-checkbox--icon checkbox-outline"
                  v-else
                />
              </block>

              <label style="font-weight: bold;">{{ item.label }}</label>
            </view>

            <view class="ko-admin-authorization__item--wrap ko-basic-table ko-basic-table__not-border">
              <button
                class="ko-admin-authorization__item--cell ko-basic-table--cell"
                :class="{'is-check': getChecked(child)}"
                v-for="(child, c) of item.children"
                :key="c"
                @click="onClickChild(child)"
              >
                <block v-if="!!userId">
                  <view
                    class="ko-checkbox--icon checkbox-checked"
                    v-if="getChecked(child)"
                  />
                  <view
                    class="ko-checkbox--icon checkbox-outline"
                    v-else
                  />
                </block>
                <view
                  style="font-size: 13px; line-height: 1.2"
                  :style="[child.color ? {color: child.color} : {}]"
                >
                  {{ child.label }}
                  <text style="font-size: 8px">
                    ({{ ["目录", "按钮", "页面"][child.type - 1] || "" }})
                  </text>
                </view>
              </button>
            </view>

          </view>
        </BasicCard>
      </view>
    </uni-forms>

    <view class="ko-basic-footer" v-if="!!userId">
      <view style="display: flex; align-items: center; justify-content: center;">
        <button
          class="ko-basic-button__card"
          style="width: 120px;"
          @click="onSubmit"
          :disabled="sLoading || !isChange"
          :loading="sLoading"
        >
          保存
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.ko-admin-authorization {
  // #ifdef MP
  padding: 10px;
  // #endif

  // #ifdef H5
  padding: 20px;
  // #endif

  padding-bottom: 90px;

  &__wrap {
    &--label {
      text-align: left;
      font-size: 14px;
      color: #606266;
      height: 36px;
      padding: 0 12px 0 0;
      vertical-align: middle;
      flex-shrink: 0;
      box-sizing: border-box;
    }
  }

  &__item {
    font-size: 14px;

    &--title {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e9e9eb;
      padding-bottom: 10px;
    }

    &--wrap {
      padding-top: 10px;
    }

    &--cell {
      text-align: left;
      justify-content: flex-start;
      align-items: center;

      height: 32px;

      &.is-check {
        color: $ko-primary-color;
      }
    }
  }
}
</style>
