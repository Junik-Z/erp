<script>
import DaTreeVue2 from "./components/da-tree-vue2/index.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import {
  addedProductClassApi,
  deleteProductClassApi,
  editProductClassApi,
  getProductClassApi,
  upDownPurchaseClassApi,
  upDownSaleClassApi,
} from "@/api/erp/product";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import TopMenus from "./components/TopMenus.vue";

export default {
  name: "Classify",
  components: {
    TopMenus,
    KoMovable,
    UvActionSheet,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    DaTreeVue2,
  },
  mixins: [mixins],
  data() {
    return {
      roomTreeData: [],
      visible: false,
      loading: false,

      form: {
        name: "",
        parentId: "",
        remark: "",
      },
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "请填写分类名称",
            },
            // {
            //   required: true,
            //   minLength: 1,
            //   // maxLength: 30,
            //   errorMessage: "分类名称不能小于1个字符",
            // },
          ],
          validateTrigger: "submit",
        },
      },

      isEdit: false,
      actionItem: {},

      childrenField: "field_child",
    };
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
  },
  created() {
    // this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getProductClassApi()
        .then(res => {
          this.roomTreeData = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const EVENT = this.isEdit ? editProductClassApi : addedProductClassApi;

          EVENT(this.form)
            .then(() => {
              uni.showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
              });
              this.visible = false;

              this.getList();
            });
        } else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },
    onAdded(row) {
      this.visible = true;
      this.isEdit = false;
      this.$nextTick(() => {
        // #ifdef MP
        this.$refs.FormRef.clearValidate();
        // #endif

        this.form = _deepCopy(this.$options.data().form);

        if (!_isEmpty(row)) {
          this.form = {...this.form, parentId: row.id};
        }
      });
    },
    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${node.name} 分类吗？`,
        success: (res) => {
          if (res.confirm) {
            deleteProductClassApi(node)
              .then(() => {
                uni.showToast({title: "删除成功"});

                this.getList();
              });
          }
        },
      });
    },

    onEdit(row) {
      const node = _deepCopy(row);
      this.isEdit = true;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs?.FormRef?.clearValidate?.();
        this.form = {...node};
      });

    },

    upDownSale(row) {
      if (this.isPerm("PRODUCT_CLASS_UPDOWN_SALE")) {
        const node = _deepCopy(row);
        node.saleOff = !node.saleOff;
        uni.showModal({
          title: "温馨提示",
          content: `您确定要 ${node.saleOff ? "下架" : "上架"} 该分类到销售吗？`,
          success: (res) => {
            if (res.confirm) {
              upDownSaleClassApi(node)
                .then(() => {
                  uni.showToast({title: "操作成功"});
                  this.getList();
                });
            }
          },
        });
      }
    },
    upDownPurchase(row) {
      if (this.isPerm("PRODUCT_CLASS_UPDOWN_PURCHASE")) {
        const node = _deepCopy(row);
        node.purchaseOff = !node.purchaseOff;
        uni.showModal({
          title: "温馨提示",
          content: `您确定要 ${node.purchaseOff ? "下架" : "上架"} 该分类到采购吗？`,
          success: (res) => {
            if (res.confirm) {
              upDownPurchaseClassApi(node)
                .then(() => {
                  uni.showToast({title: "操作成功"});
                  this.getList();
                });
            }
          },
        });
      }
    },
    onSelect(item) {
      this[item.func](_get(_deepCopy(this.actionItem), "originItem"));
    },
    onOpenAction(row) {
      this.actionItem = _deepCopy(row);
      this.$refs.UASRef.open();
    },

    getApiData(node) {
      return new Promise(resolve => {
        resolve(node.originItem.children);
      });
    },

    // 判断是不是有子级
    getIsLeafFn(node) {
      return _isEmpty(node.children);
    },
  },
  computed: {
    getActionsList() {
      return () => {
        const node = _deepCopy(this.actionItem);
        const {saleOff, purchaseOff} = _get(node, "originItem") || {};

        return [
          {
            name: saleOff ? "上架销售" : "下架销售",
            func: "upDownSale",
            perm: "PRODUCT_CLASS_UPDOWN_SALE",
          },
          {
            name: purchaseOff ? "上架采购" : "下架采购",
            func: "upDownPurchase",
            perm: "PRODUCT_CLASS_UPDOWN_PURCHASE",
          },
          {
            name: "添加子级",
            func: "onAdded",
            disabled: node.level > 6,
            perm: "PRODUCT_CLASS_ADD",
          },
          {
            name: "编辑",
            func: "onEdit",
            perm: "PRODUCT_CLASS_EDIT",
          },
          {
            name: "删除",
            color: "#e43d33",
            func: "onRemove",
            perm: "PRODUCT_CLASS_DELETE",
          },
        ].filter(item => this.isPerm(item.perm));
      };
    },
  },
};
</script>

<template>
  <view class="ko-classify">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <TopMenus :path="PageEnums.productClassify" />

    <view class="ko-classify__row">
      <DaTreeVue2
        ref="DaTreeRef"
        :data="roomTreeData"
        labelField="name"
        valueField="id"
        defaultExpandAll
        :show-radio-icon="false"
        not-checked
        :max-level="6"
        load-mode
        :load-api="getApiData"
        :is-operate="true"
        @action-click="onOpenAction"
        :children-field="childrenField"
        :is-leaf-fn="getIsLeafFn"
      >
        <!-- #ifdef H5 -->
        <template #node="{node, item}">
          <div style="display: flex; align-items: center; justify-content: center;">
            <view class="ko-classify__off">
              <view
                @click.stop="upDownSale(node)"
                class="xiao"
                :class="{'is-active': node.saleOff}"
              >
                <text>销</text>
              </view>
              <view
                @click.stop="upDownPurchase(node)"
                class="cai"
                :class="{'is-active': node.purchaseOff}"
              >
                <text>采</text>
              </view>
            </view>

            <button
              class="ko-basic-button__card"
              v-if="item.level <= 10 && isPerm('PRODUCT_CLASS_ADD')"
              @click.stop="onAdded(node)"
            >
              添加子级
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onEdit(node)"
              v-if="isPerm('PRODUCT_CLASS_EDIT')"
            >
              编辑
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onRemove(node)"
              v-if="isPerm('PRODUCT_CLASS_DELETE')"
            >
              删除
            </button>
          </div>
        </template>
        <!-- #endif -->

        <!-- #ifdef MP -->
        <template #operate-node="{node}">
          <view class="ko-classify__off">
            <view class="xiao" :class="{'is-active': node.saleOff}">
              <text>销</text>
            </view>
            <view class="cai" :class="{'is-active': node.purchaseOff}">
              <text>采</text>
            </view>
          </view>
        </template>
        <!-- #endif -->
      </DaTreeVue2>

      <view v-if="loading" style="height: 160px; display: flex; justify-content: center; align-items: center;">
        <uv-loading-icon size="40" />
      </view>
    </view>

    <BasicPopup :visible.sync="visible">
      <view class="ko-classify__popup">
        <UniForms ref="FormRef" label-width="100px" :model="form" :rules="rules">
          <UniFormsItem label="分类名称：" required name="name">
            <UniEasyinput v-model="form.name" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="备注：">
            <UniEasyinput type="textarea" v-model="form.remark" placeholder="请输入" />
          </UniFormsItem>
        </UniForms>
      </view>
      <template #footer>
        <view style="display: flex; justify-content: center; align-items: center">
          <button class="ko-basic-button" style="width: 120px" @click="onSubmit">保存</button>
        </view>
      </template>
    </BasicPopup>

    <KoMovable
      v-if="isPerm('PRODUCT_CLASS_ADD')"
      @click="onAdded('')"
    />

    <!-- #ifdef MP -->
    <UvActionSheet
      ref="UASRef"
      :actions='getActionsList()'
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-classify {
  margin-top: 10px;
  padding-bottom: 80px;

  &__row {
    padding: 10px;

    /* #ifdef H5 */
    width: 900px;
    margin: 0 auto;
    /* #endif */

  }

  &__off {
    display: flex;
    align-items: center;
    margin-right: 10px;

    .xiao, .cai {
      background: #18bc37;
      border-radius: 50px;
      padding: 4px;
      font-size: 10px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;

      &.is-active {
        background: #c7c9ce;
      }
    }

    .xiao {
      margin-right: 6px;
    }
  }

  &__popup {
    // #ifdef MP
    width: 90vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
