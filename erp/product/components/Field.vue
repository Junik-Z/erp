<script>
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import {
  addedProductFieldApi,
  deleteProductFieldApi,
  editProductFieldApi,
  getProductFieldApi,
} from "@/api/erp/product";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import mixins from "@/mixins/mixins";
import KoMovable from "@/components/Movable/index.vue";
import KoList from "@/components/List/List.vue";

let pageSize = 20;

// #ifdef H5
pageSize = 50;
// #endif

export default {
  name: "Field",
  components: {
    KoList,
    KoMovable,
    UniRow,
    UniCol,
    BasicCard,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
  },
  mixins: [mixins],
  data() {
    return {
      list: [],
      visible: false,
      loading: false,

      queryList: {
        pageSize: pageSize,
        pageNum: 0,
      },
      noMore: false,

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

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "字段名称",
          prop: "fieldName",
        },
        {
          label: "字段编码",
          prop: "fieldCode",
        },
        {
          label: "操作",
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  created() {
    // this.getList();
    // #ifdef MP
    this.$nextTick(() => {
      this.$refs.FormRef.setRules(this.rules);
    });
    // #endif
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      getProductFieldApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;

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
        this.$refs?.FormRef?.clearValidate?.();
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
      <!-- #ifdef MP -->
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px;" v-for="(item, index) in list" :key="index">
          <BasicCard>
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
        </view>
      </KoList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="columns"
          :data="list"
          empty-text="暂无数据"
          stripe
        >
          <template #operate="{item}" v-if="isPerm('Product_Write')">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button class="ko-basic-button__card" @click="onEdit(item)">编辑</button>
              <button
                class="ko-basic-button__card"
                @click="onRemove(item)"
                :loading="item.__remove_loading__"
              >
                删除
              </button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
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
    <KoMovable
      v-if="isPerm('Product_Write')"
      @click="onAdded('')"
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
    // #ifdef MP
    width: 90vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
