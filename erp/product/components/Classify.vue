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
} from "@/api/erp/product";
import { _deepCopy, _isEmpty } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";

export default {
  name: "Classify",
  components: {LoadMore, UniFab, UniForms, BasicPopup, UniFormsItem, UniEasyinput, DaTreeVue2},
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
          this.form = {...this.form, parentId: row.key};
        }
      });
    },
    onRemove(row) {
      const node = _deepCopy(row.originItem);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.label} 分类吗？`,
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
      const node = _deepCopy(row.originItem);
      this.isEdit = true;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
        this.form = {...node};
      });

    },
  },
  computed: {},
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
        @added="onAdded"
        @remove="onRemove"
        @edit="onEdit"
        not-checked
        :max-level="6"
        is-operate
      />
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
      ref="FabRef"
      :pattern="pattern"
      horizontal="right"
      direction="vertical"
      @fabClick="onAdded()"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-classify {
  margin-top: 10px;

  &__row {
    padding: 10px;
  }

  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
