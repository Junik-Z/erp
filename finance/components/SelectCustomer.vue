<script>
import { _deepCopy, _get, _isEmpty, _isEqual, _pick, getRect } from "@/utils";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getCustomerListApi, getSupplierListApi } from "@/api/erp/finance";
import IndexList from "@/components/IndexList/IndexList.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "SelectCustomer",
  components: {BasicPopup, IndexList},
  mixins: [mixins],
  props: {
    sLoading: Boolean,
  },
  data() {
    return {
      current: 0,
      list: [],
      queryList: {
        pageSize: 20,
        pageNum: 0,
        nameIndex: "",
        name: "",
      },

      noMore: false,
      loading: false,

      visible: false,

      checked: {},

      objValue: {},

      openVisible: false,

      backup: {},

      wrapHeight: 0,
    };
  },
  methods: {
    open(obj) {
      this.objValue = _deepCopy(obj);
      getRect(".ko-select-customer__s-input", this)
        .then(res => {
          this.wrapHeight = res.height;
          this.openVisible = true;
          console.log(res);
        });
    },
    // 获取用户
    getList(reset) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
        this.tableKey = +new Date();
      }

      this.loading = true;
      const Func = {0: getCustomerListApi, 1: getSupplierListApi}[this.getCurrent];

      Func(this.queryList)
        .then((res) => {
          const list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));

          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;

          setTimeout(() => {
            this.$refs.ILRef?.setList?.();
          }, 500);
        });
    },

    // 下一页数据
    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.noRefresh = false;
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    // 选中用户数据
    onClickItem(row) {
      if (_isEqual(this.checked.value, row.value)) {
        this.checked = {};
        this.objValue.supplierId = "";

      } else {
        this.checked = _deepCopy(row);
        this.objValue.supplierId = row.value;
      }

      this.visible = false;
    },

    // 开启弹窗
    onClick() {
      this.visible = true;
      this.getList(true);
    },

    // 选择下单用户
    getReportTrend(value) {
      this.objValue.purchaserId = value;
    },

    // 重置操作
    onReset() {
      this.objValue = {};
      this.checked = {};
      this.openVisible = false;

      this.$emit("reset");
    },

    close() {
      // this.objValue = {};
      // this.checked = {};
      this.openVisible = false;
    },

    // 处理搜索
    onSubmit() {
      this.$emit("submit", _pick(_deepCopy(this.objValue), ["supplierId", "purchaserId"]));
    },

    // 切换客户/供应商
    onChangeType() {
      this.$refs.ILRef && (this.$refs.ILRef.touchmoveIndex = -1);
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.getList(true);
    },
  },
  computed: {
    getTabsList() {
      return [
        {
          label: "客户",
          func: 0,
        },
        {
          label: "供应商",
          func: 1,
        },
      ];
    },

    getCurrent() {
      return _get(this.getTabsList, `${this.current}.func`);
    },

    getShowLabel() {
      return this.checked?.label || "";
    },

    getIndexChecked() {
      return this.checked?.value ? [this.checked?.value] : [];
    },
  },
};
</script>

<template>
  <view
    class="ko-select-customer"
    :class="{open: openVisible}"
    :style="{'--w-r-height': wrapHeight + 'px'}"
  >
    <view class="ko-select-customer__s-input--wrap">
      <view class="ko-select-customer__s-input">
        <view class="ko-select-customer__s-input--item">
          <label class="ko-basic-label">客户/供应商：</label>
          <view style="flex: 1;">
            <uni-easyinput
              suffix-icon="down"
              :styles="{disableColor: 'transparent'}"
              :value="getShowLabel"
              is-readonly
              placeholder="请选择客户/供应商"
              @click.stop="onClick"
            />
          </view>
        </view>
        <view class="ko-select-customer__s-input--item">
          <label class="ko-basic-label">下单用户：</label>
          <view style="flex: 1;">
            <PickerUser
              style="width: 100%"
              is-input
              title="选择下单用户"
              v-model="objValue.purchaserId"
              type="reportUser"
              @input="getReportTrend"
            />
          </view>
        </view>

        <view class="ko-select-customer__btn">
          <button class="ko-basic-button__card" @click.stop="onReset">重置</button>
          <button
            :loading="loading || sLoading"
            :disabled="loading || sLoading"
            class="ko-basic-button__card"
            @click.stop="onSubmit"
          >
            搜索
          </button>
        </view>
      </view>
    </view>

    <BasicPopup :visible.sync="visible" type="bottom" title="选择客户/供应商">
      <view class="ko-s-c__popup">
        <view class="ko-s-c__popup--hb">
          <HistoryBar
            v-if="getTabsList.length"
            :values="getTabsList"
            v-model="current"
            label-key="label"
            @change="onChangeType"
          />

          <uni-search-bar
            v-model="queryList.name"
            placeholder="请输入"
            @confirm="getList(true)"
            @cancel="queryList.name = ''; getList(true)"
            clear-button="none"
            no-t-b-padding
          />
        </view>

        <view class="ko-s-c__popup__content">
          <IndexList
            ref="ILRef"
            :data="list"
            @click="onClickItem"
            :is-supplier="!!getCurrent"
            :loading="loading"
            is-checked
            :value="getIndexChecked"
            :safe-area-inset-bottom="false"

            @lower="onLower"
            :no-more="noMore"
            @search="onSearchToNameIndex"
          />
        </view>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-select-customer {
  // #ifdef H5
  max-width: 899px;
  margin: 0 auto 10px;
  // #endif

  &.open {
    .ko-select-customer__s-input--wrap {
      height: calc(var(--w-r-height) + 10px);
    }
  }

  &__s-input {
    &--wrap {
      height: 0;
      overflow: hidden;
      transition: height .3s;

    }

    &--item {
      display: flex;
      align-items: center;
      margin: 10px 0;

      .ko-basic-label {
        width: 100px;
        text-align: right;
      }
    }

    font-size: 12px;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px;

    .ko-basic-button__card {
      width: 100px;
    }
  }
}

.ko-s-c {
  &__popup {
    height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &__content {
      position: relative;
      flex: 1;
    }

    ::v-deep .uni-searchbar {
      padding: 0 10px;
    }

    // #ifdef H5
    &--hb {
      padding: 10px 20% 0;
    }

    // #endif
  }
}
</style>
