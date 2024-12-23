<script>
// #ifdef H5
import { Cascader } from "@/uni_modules/element-ui/element.min";
// #endif
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniDataPicker from "@/uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.vue";
import {
  addedProductApi,
  editProductApi,
  getDetailApi,
  getProductClassApi,
  getProductFieldApi,
} from "@/api/erp/product";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { _deepCopy, _get, _isEmpty, showToast, transferYuan, yuanToPoints } from "@/utils";

export default {
  name: "Added",
  components: {
    FilePicker,
    UniDataPicker,
    UniEasyinput,
    UniFormsItem,
    UniForms,
    UniSection,
    // #ifdef H5
    Cascader,
    // #endif
  },
  data: () => ({
    form: {
      "name": "",
      "classId": "",
      "levelIds": "",
      "images": "",
      "description": "",
      "purchasePrice": "",
      "salePrice": "",
      "stockWarning": "",
      "remark": "",
      "extend": {},
    },
    classList: [],
    option: {},
    loading: false,
    isEdit: false,

    rules: {
      name: {
        rules: [
          {
            required: true,
            errorMessage: "请输入产品名称",
          },
        ],
        validateTrigger: "submit",
      },
      classId: {
        rules: [
          {
            required: true,
            errorMessage: "请选择分类",
          },
        ],
        validateTrigger: "submit",
      },
      purchasePrice: {
        rules: [
          {
            required: true,
            errorMessage: "请输入采购价格",
          },
        ],
        validateTrigger: "submit",
      },
      salePrice: {
        rules: [
          {
            required: true,
            errorMessage: "请输入销售价格",
          },
        ],
        validateTrigger: "submit",
      },
    },
    fieldList: [],
  }),
  onLoad(option) {
    this.getClassList();
    this.getFieldList();

    this.option = option;
    this.isEdit = !_isEmpty(option.id);

    if (this.isEdit) this.getInfo();

    // #ifdef MP
    this.$refs.FormRef.setRules(this.rules);
    // #endif
  },
  methods: {
    getClassList() {
      getProductClassApi()
        .then(res => {
          this.classList = res.data;
        });
    },
    getFieldList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          console.log(res.data);
          this.fieldList = res.data;
        });
    },

    getInfo() {
      this.loading = true;
      getDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;

          params.purchasePrice = transferYuan(params.purchasePrice);
          params.salePrice = transferYuan(params.salePrice);

          this.form = params;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onSubmit() {
      this.$refs.FormRef.validate(verify => {
        if (!verify) {
          const params = _deepCopy(this.form);

          params.purchasePrice = yuanToPoints(params.purchasePrice);
          params.salePrice = yuanToPoints(params.salePrice);

          this.loading = true;

          const Func = this.isEdit ? editProductApi : addedProductApi;

          Func(params)
            .then(res => {
              console.log(res);
              showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
                success() {
                  uni.navigateBack();
                },
              });
            })
            .finally(() => {
              this.loading = false;
            });

        } else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },
  },
};
</script>

<template>
  <view class="ko-order ko-basic-added-form">
    <UniForms
      :model-value="form"
      label-width="90px"
      label-align="right"
      :rules="rules"
      ref="FormRef"
    >
      <UniSection title="基础信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="产品分类：" name="classId" required>
            <UniDataPicker
              style="width: 100%;"
              placeholder="请选择"
              :localdata="classList"
              v-model="form.classId"
              :map="{text: 'name',value: 'id',}"
            />
            <!-- #ifdef H5 -->
            <Cascader
              :options="classList"
              :props="{

              }"
            >
              <template slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </Cascader>
            <!-- #endif -->
          </UniFormsItem>
          <UniFormsItem label="产品名称：" name="name" required>
            <UniEasyinput v-model.trim="form.name" style="width: 100%;" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="入库价格：" name="purchasePrice" required>
            <UniEasyinput type="digit" v-model="form.purchasePrice" style="width: 100%;" placeholder="请输入" />
            <view style="padding: 10px;">元</view>
          </UniFormsItem>
          <UniFormsItem label="销售价格：" name="salePrice" required>
            <UniEasyinput type="digit" v-model="form.salePrice" style="width: 100%;" placeholder="请输入" />
            <view style="padding: 10px;">元</view>
          </UniFormsItem>
          <UniFormsItem label="预警数量：" name="stockWarning">
            <view style="width: 100%;">
              <UniEasyinput type="digit" v-model="form.stockWarning" style="width: 100%;" placeholder="请输入" />
              <view style="font-size: 12px; color: #c7c9ce;">注: 当产品库存少于此数量时会触预警。</view>
            </view>
          </UniFormsItem>
          <UniFormsItem label="产品图片：">
            <FilePicker
              v-model="form.images"
              :image-styles="{
                width: '100px',
                height: '100px',
              }"
            />
          </UniFormsItem>
        </view>
      </UniSection>
      <UniSection title="其它字段" type="line">
        <view style="padding: 10px;">
          <UniFormsItem
            v-for="(item, index) of fieldList"
            :key="index"
            :label="`${item.fieldName}：`"
            :name="`extend.${item.fieldCode}`"
          >
            <UniEasyinput
              v-model="form.extend[item.fieldCode]"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>
        </view>
      </UniSection>
      <UniSection title="其它信息" type="line">
        <view style="padding: 10px;">
          <UniFormsItem label="产品描述：" name="description">
            <UniEasyinput
              type="textarea"
              v-model="form.description"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>
          <UniFormsItem label="备注：" name="remark">
            <UniEasyinput
              type="textarea"
              v-model="form.remark"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>
        </view>
      </UniSection>
    </UniForms>

    <view class="ko-order__footer">
      <button
        class="ko-basic-button"
        @click="onSubmit"
        :loading="loading"
        :disabled="loading"
      >
        保存
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-order {
  &__item {
    display: flex;
    flex-direction: row;

    view {
      width: calc(50% - 10px);
    }
  }

  &__footer {
    padding: 10px 50px 50px;

    /* #ifdef H5 */
    display: flex;
    align-items: center;
    justify-content: center;

    .ko-basic-button {
      width: 280px;
    }

    /* #endif */
  }

  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
