<script>
import DaTreeVue2 from "@/components/da-tree-vue2/index.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import {
  addedProductFieldApi,
  deleteProductFieldApi,
  editProductFieldApi,
  getProductFieldApi,
} from "@/api/erp/product";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "Field",
  components: {
    UniRow,
    UniCol,
    BasicCard,
    LoadMore,
    UniFab,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    DaTreeVue2,
  },
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
      fieldName: "",
      fieldCode: "",
    },

    rules: {
      fieldName: {
        rules: [
          {
            required: true,
            errorMessage: "请填写字段名称",
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
      fieldCode: {
        rules: [
          {
            required: true,
            errorMessage: "请输入字段编码",
          },
          {
            validateFunction(r, v, d, c) {
              return new Promise((resolve, reject) => {
                if (!(/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(v))) {
                  reject(new Error("字段编码必须是字母、_、数字任意组合，不能以数字开头"));
                  return false;
                }
                resolve();
              });
            },
          },
        ],
        validateTrigger: "submit",
      },
    },

    isEdit: false,
  }),
  created() {
    // this.getList();
    this.$nextTick(() => {
      this.$refs.FormRef.setRules(this.rules);
    });
  },
  methods: {
    getList() {
      this.loading = true;
      getProductFieldApi({pageSize: 1000000, pageNum: 0})
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
          const EVENT = this.isEdit ? editProductFieldApi : addedProductFieldApi;

          EVENT(this.form)
            .then(() => {
              uni.showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
              });
              this.visible = false;

              this.getList();
            });
        }else {
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
          this.form = {...this.form, parentId: row.key};
        }
      });
    },
    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.fieldName} 字段吗？`,
        success: (res) => {
          if (res.confirm) {
            deleteProductFieldApi(node)
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
  },
  computed: {},
};
</script>

<template>
  <view class="ko-field">
    <view class="ko-field__row">
      <BasicCard v-for="(item, index) in roomTreeData" :key="index" :spacing="10">
        <view class="ko-field__info">
          <UniRow>
            <UniCol :span="12">
              <label class="ko-basic-label">字段名称：</label>
              {{ item.fieldName }}
            </UniCol>
            <UniCol :span="12">
              <label class="ko-basic-label">字段编码：</label>
              {{ item.fieldCode }}
            </UniCol>
          </UniRow>

          <view
            v-if="isPerm('Product_Write')"
            style="display: flex; align-items: center; justify-content: flex-end; padding-top: 10px;"
          >
            <button class="ko-basic-button__card" @click="onEdit(item)">编辑</button>
            <button
              class="ko-basic-button__card"
              @click="onRemove(item)"
              :loading="item.__remove_loading__"
            >
              删除
            </button>
          </view>
        </view>
      </BasicCard>

      <LoadMore :loading="loading" />
    </view>

    <BasicPopup :visible.sync="visible">
      <view class="ko-field__popup">
        <UniForms ref="FormRef" label-width="100px" :model="form" :rules="rules">
          <UniFormsItem label="字段名称：" required name="fieldName">
            <UniEasyinput v-model="form.fieldName" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="字段编码：" required name="fieldCode">
            <UniEasyinput v-model="form.fieldCode" placeholder="请输入" />
          </UniFormsItem>
        </UniForms>

        <button class="ko-basic-button" style="margin: 30px 40px 10px;" @click="onSubmit">保存</button>
      </view>
    </BasicPopup>

    <UniFab
      v-if="isPerm('Product_Write')"
      ref="FabRef"
      :pattern="pattern"
      horizontal="right"
      direction="vertical"
      @fabClick="onAdded()"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-field {
  margin-top: 10px;
  padding-bottom: 80px;

  &__row {
    padding: 10px;
  }

  &__info {
    .ko-basic-button__card {
      margin: 0 5px;
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
