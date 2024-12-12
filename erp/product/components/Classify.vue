<script>
import DaTreeVue2 from "@/components/da-tree-vue2/index.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import {
  addedProductClassApi,
  deleteProductClassApi,
  editProductClassApi,
  getProductClassApi,
  upDownPurchaseClassApi,
  upDownSaleClassApi,
} from "@/api/erp/product";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";

export default {
  name: "Classify",
  components: {UvActionSheet, LoadMore, UniFab, UniForms, BasicPopup, UniFormsItem, UniEasyinput, DaTreeVue2},
  mixins: [mixins],
  data: () => ({
    roomTreeData: [],
    visible: false,
    pattern: {
      color: "#7A7E83",
      backgroundColor: "#fff",
      selectedColor: "#007AFF",
      buttonColor: "#007AFF",
      iconColor: "#fff",
    },
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
  }),
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
        this.$refs.FormRef.clearValidate();
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
        this.$refs.FormRef.clearValidate();
        this.form = {...node};
      });

    },

    upDownSale(row) {
      row.saleOff = !row.saleOff;
      uni.showModal({
        title: "温馨提示",
        content: `您确定要 ${row.saleOff ? "下架" : "上架"} 该分类到销售吗？`,
        success: (res) => {
          if (res.confirm) {
            upDownSaleClassApi(row)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              });
          }
        },
      });
    },
    upDownPurchase(row) {
      row.purchaseOff = !row.purchaseOff;
      uni.showModal({
        title: "温馨提示",
        content: `您确定要 ${row.purchaseOff ? "下架" : "上架"} 该分类到采购吗？`,
        success: (res) => {
          if (res.confirm) {
            upDownPurchaseClassApi(row)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              });
          }
        },
      });
    },

    onSelect(item) {
      this[item.func](_get(_deepCopy(this.actionItem), "originItem"));
    },

    onOpenAction(row) {
      console.log(row);
      this.actionItem = _deepCopy(row);
      this.$refs.UASRef.open();
    },
  },
  computed: {
    getActionsList() {
      return () => {
        const item = _deepCopy(this.actionItem);
        const {saleOff, purchaseOff} = _get(item, "originItem") || {};
        return [
          {
            name: saleOff ? "上架销售" : "下架销售",
            func: "upDownSale",
          },
          {
            name: purchaseOff ? "上架采购" : "下架采购",
            func: "upDownPurchase",
          },
          {
            name: "添加子级",
            func: "onAdded",
            disabled: item.level > 6,
          },
          {
            name: "编辑",
            func: "onEdit",
          },
          {
            name: "删除",
            color: "#e43d33",
            func: "onRemove",
          },
        ];
      };
    },
  },
};
</script>

<template>
  <view class="ko-classify">
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
        :is-operate="isPerm('Product_Write')"
        @action-click="onOpenAction"
      >
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
      </DaTreeVue2>
      <LoadMore :loading="loading" />
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
        <button class="ko-basic-button" style="margin: 0 40px 10px;" @click="onSubmit">保存</button>
      </template>
    </BasicPopup>

    <UniFab
      v-if="isPerm('Product_Write')"
      ref="FabRef"
      :pattern="pattern"
      horizontal="right"
      direction="vertical"
      @fabClick="onAdded()"
    />

    <UvActionSheet
      ref="UASRef"
      :actions='getActionsList()'
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-classify {
  margin-top: 10px;
  padding-bottom: 80px;

  &__row {
    padding: 10px;
  }

  &__off {
    display: flex;
    align-items: center;
    margin-right: 16px;

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
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
