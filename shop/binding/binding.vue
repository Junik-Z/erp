<script>
import { _get, _isEmpty, _isEqual, CustomToast } from "@/utils";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import InventoryList from "../components/InventoryList/InventoryList.vue";
import { PageEnums } from "@/utils/config";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import {
  checkDuplicateByShareApi,
  getProductExtApi,
  getProductFieldApi,
  getShareProductApi,
  receiveShareProductApi,
} from "@/api/erp/product";
import mixins from "@/mixins/mixins";

export default {
  name: "binding",
  components: {UvActionSheet, UniCol, UniRow, UniSection, InventoryList, HistoryBar},
  mixins: [mixins],
  onLoad(option) {
    this.option = _isEmpty(option) ? uni.getStorageSync("__APP_QUERY__") : option;

    this.getProductExt();
    this.getList();
  },
  watch: {
    GET_SHOP_NAME: {
      handler() {
        uni.setNavigationBarTitle({title: this.GET_SHOP_NAME});
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      tab: 0,

      MyFieldList: [],

      list: [],
      noMore: false,
      FieldList: [],
      columnTable: [
        {
          label: "",
          key: "",
          isCheck: true,
          span: 2,
        },
        {
          label: "名称",
          key: "name",
          isField: true,
          span: 12,
        },
        {
          label: "采购",
          key: "purchasePrice",
          isPrice: true,
          span: 5,
        },
        {
          label: "销售",
          key: "salePrice",
          isPrice: true,
          span: 5,
        },
      ],
      checked: [],

      loading: false,

      queryList: {
        pageSize: 36,
        pageNum: 0,
      },

      repeat: {
        list: [],
        loading: false,
        checked: [],
        noMore: false,
        queryList: {
          pageSize: 36,
          pageNum: 0,
        },
      },

      option: {},

      sLoading: false,
      FieldNode: {},
    };
  },
  methods: {
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;

      getShareProductApi({
        tenantId: decodeURIComponent(this.option.form_scene),
        shareId: decodeURIComponent(this.option.PRODUCT_SHARE_ID),
        ...this.queryList,
      })
        .then((res) => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 获取对方企业的所有扩张字段
    getProductExt() {
      getProductExtApi({
        tenantId: decodeURIComponent(this.option.form_scene),
        shareId: decodeURIComponent(this.option.PRODUCT_SHARE_ID),
        pageSize: 1000,
      }).then(res => {
        // console.log(res.data);
        this.FieldList = res.data;
        this.getFieldList();
      });
    },

    onResetList(reset) {
      if (reset) {
        this.repeat.queryList.pageNum = 0;
        this.repeat.list = [];
      }

      this.repeat.loading = true;
      checkDuplicateByShareApi({
        ...this.repeat.queryList,
        productList: this.checked.map((productId) => ({productId})),
        tenantId: decodeURIComponent(this.option.form_scene),
        shareId: decodeURIComponent(this.option.PRODUCT_SHARE_ID),
      })
        .then(res => {
          this.repeat.list = this.onMergeArrays(this.repeat.list, res.data);
          this.repeat.noMore = _isEmpty(res.data) || res.data.length < this.repeat.queryList.pageSize;
        })
        .finally(() => {
          this.repeat.loading = false;
        });
    },

    RequestNextPage() {
      if (this.tab === 0) {
        if (this.noMore) return false;
        this.queryList.pageNum += 1;
        this.getList();
      } else {
        if (this.repeat.noMore) return false;
        this.repeat.queryList.pageNum += 1;
        this.onResetList();
      }
    },

    onSubmit() {

      if (this.isPerm("SHARE_RECEIVE_SHARE_PRODUCT")) {
        const extend = {};
        this.FieldList.forEach((item) => {
          if (_isEmpty(item._right_)) {
            extend[item.fieldCode] = item.fieldName;
          } else {
            extend[_get(item, "_right_.fieldCode")] = item.fieldCode;
          }
        });

        const params = {
          productList: this.repeat?.checked?.map((productId) => ({productId})) || [],
          tenantId: decodeURIComponent(this.option.form_scene),
          shareId: decodeURIComponent(this.option.PRODUCT_SHARE_ID),
          extend,
        };

        this.sLoading = true;
        receiveShareProductApi(params)
          .then(() => {
            CustomToast({
              title: "操作成功",
              success: () => {
                uni.reLaunch({
                  url: PageEnums.home,
                });
              },
            });
          })
          .finally(() => {
            this.sLoading = false;
          });
      } else {
        uni.showModal({
          title: "温馨提示",
          content: "保存失败，您没有保存的权限，请联系管理员授权。",
        });
      }

    },

    onNext() {
      if (this.tab >= 2) {
        this.onSubmit();
      } else {
        this.tab += 1;

        if (this.tab === 1) this.onResetList(true);
      }
    },
    onPrev() {
      if (this.tab <= 0) {
        uni.reLaunch({
          url: PageEnums.home,
        });
      } else {
        this.tab -= 1;
      }
    },

    onChecked(item) {
      if (this.checked.includes(item.id)) {
        this.checked = this.checked.filter(id => !_isEqual(item.id, id));
      } else {
        this.checked.push(item.id);
      }
    },

    onRepeatChecked(item) {
      if (this.repeat.checked.includes(item.id)) {
        this.repeat.checked = this.repeat.checked.filter(id => !_isEqual(item.id, id));
      } else {
        this.repeat.checked.push(item.id);
      }
    },

    onSelect(item) {
      const node = this.FieldNode;

      this.FieldList = this.FieldList.map(v => {
        if (v.id === node.id) {
          this.$set(v, "_right_", item);
        }
        return v;
      });
    },

    // 获取本企业的扩张字段
    getFieldList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0}).then(res => {
        this.MyFieldList = res.data;
        this.FieldList = this.FieldList.map(v => {
          const node = res.data?.find(j => j.fieldCode === v.fieldCode);
          if (!_isEmpty(node)) {
            v._right_ = node;
          }
          return v;
        });
      });
    },

    onPicked(node) {
      this.FieldNode = node;
      this.$refs.UASRef.open();
    },
  },
  computed: {
    getActionsList() {
      return this.MyFieldList?.map((item) => ({...item, name: item.fieldName})) || [];
    },
    getRightName() {
      return (item) => {
        return _get(item, "_right_.fieldName");
      };
    },
    isShow() {
      return (item) => !_isEqual(_get(item, "_right_.fieldCode"), item.fieldCode);
    },
  },
};
</script>

<template>
  <view class="ko-binding">
    <HistoryBar
      v-model="tab"
      :values="['绑定产品', '对应扩展字段', '检查重复产品']"
      v-if="false"
    />

    <view
      class="ko-binding__header ko-basic-box-shadow"
      style="padding-top: 10px; font-size: 18px"
      v-if="false"
    >
      {{ GET_SHOP_NAME }}
    </view>
    <view
      class="ko-binding__header ko-basic-box-shadow"
      :class="{'ko-basic-money': [0, 1].includes(tab)}"
    >
      {{ ["请勾选您不需要的产品", "以下产品重复了，请勾选不需要的产品", "请关联相应的扩展信息"][tab] }}
    </view>

    <view class="ko-binding__wrap">
      <block v-if="tab == 0">
        <InventoryList
          :list="list"
          :no-more="noMore"
          :no-data="!list.length"
          :columns="columnTable"
          @lower="RequestNextPage"
          :field-list="FieldList"
          @check="onChecked"
          :value="checked"
          :loading="loading"
        />
      </block>

      <block v-if="tab == 1">
        <InventoryList
          :list="repeat.list"
          :no-more="repeat.noMore"
          :no-data="!repeat.list.length"
          :columns="columnTable"
          @lower="RequestNextPage"
          :field-list="FieldList"
          @check="onRepeatChecked"
          :value="repeat.checked"
          :loading="repeat.loading"
        />
      </block>

      <block v-if="tab == 2">
        <UniSection title="关联相应的扩展" type="line">
          <view class="ko-binding__field">
            <block v-for="(item, i) of FieldList" :key="item.id">
              <UniRow :gutter="10">
                <UniCol :span="8">
                  <view class="ko-binding__field--added">{{ item.fieldName }}</view>
                </UniCol>
                <UniCol :span="2">
                  <view class="ko-binding__field--added">—</view>
                </UniCol>
                <UniCol :span="14">
                  <view class="ko-binding__field--added" style="justify-content: flex-end;">
                    <text style="flex: 1; text-align: center; padding-right: 10px;">{{ getRightName(item) }}</text>

                    <block v-if="isShow(item)">
                      <button
                        class="ko-basic-button__card"
                        @click.stop="onPicked(item)"
                      >
                        选择
                      </button>
                      <button
                        class="ko-basic-button__card"
                        @click.stop="FieldList.splice(i, 1)"
                      >
                        移除
                      </button>
                    </block>
                  </view>
                </UniCol>
              </UniRow>
            </block>
          </view>
        </UniSection>
      </block>

    </view>

    <view class="ko-binding__footer ko-basic-box-shadow">
      <button class="ko-basic-button__card" @click="onPrev">
        {{ tab <= 0 ? "取消" : "上一步" }}
      </button>
      <button class="ko-basic-button__card" @click="onNext" :loading="sLoading" :disabled="sLoading">
        {{ tab >= 2 ? "提交" : "下一步" }}
      </button>
    </view>

    <UvActionSheet
      ref="UASRef"
      :actions='getActionsList'
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-binding {
  height: 100vh;
  padding: 10px 0 0;
  display: flex;
  flex-direction: column;

  &__header {
    font-size: 14px;
    padding: 5px 10px;
    margin-bottom: 10px;
    text-align: center;
  }

  &__wrap {
    padding: 10px;
    flex: 1;
    overflow: hidden;
  }

  &__field {
    padding: 10px 20px;

    &--checked {
      padding: 10px;
      position: relative;

      &:before {
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 9;
      }
    }

    &--added {
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-around;
    align-items: center;

    padding: 10px 30px 30px;
    background: #fff;

    .ko-basic-button__card {
      padding: 10px 15px;
      width: 100px;
    }
  }
}
</style>
