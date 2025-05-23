<script>
import BasicPopup from "../../components/BasicPopup/BasicPopup.vue";
import UvForm from "../../uni_modules/uv-form/components/uv-form/uv-form.vue";
import UvFormItem from "../../uni_modules/uv-form/components/uv-form-item/uv-form-item.vue";
import UvInput from "../../uni_modules/uv-input/components/uv-input/uv-input.vue";
import FilePicker from "../../components/FilePicker/FilePicker.vue";
import { _deepCopy, _generateUUID, _get, _isEmpty, _isEqual } from "../../utils";
import BasicCard from "../../components/BasicCard/BasicCard.vue";
import UniIcons from "../../uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import StandardItem from "./StandardItem.vue";
import mixins from "../../mixins/mixins";

let type = "bottom";

// #ifdef H5
type = "center";
// #endif

export default {
  name: "Standard",
  components: {StandardItem, UniIcons, BasicCard, FilePicker, UvInput, UvFormItem, UvForm, BasicPopup},
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    readonly: Boolean,
  },
  watch: {
    value(val) {
      this.list = val;
    },
  },
  data() {
    return {
      list: [
        /* {
          id: "12312", // id
          name: "规格", // 分类名称
          parentId: "", // 父级ID
          levelIds: "1", // 层级id
          longName: "", // 长名称
          children: [
            {
              id: "1231ss2", // id
              name: "3x3", // 分类名称
              parentId: "12312", // 父级ID
              levelIds: "2", // 层级id
              subProducts: [
                {
                  images: "/files/down/static/produce1.png",
                  name: "3x3x9",
                  purchasePrice: 1000, // 入库价格
                  salePrice: 3000, // 销售价格
                  stockWarning: 2, // 库存预警
                },
                {
                  images: "/files/down/static/produce1.png",
                  name: "3x3x19",
                  purchasePrice: 1100, // 入库价格
                  salePrice: 3000, // 销售价格
                  stockWarning: 2, // 库存预警
                },
              ], // 子产品
            },
          ], // 子类
          subProducts: [
            {
              images: "/files/down/static/produce1.png",
              name: "3x5x4",
              purchasePrice: 1000, // 入库价格
              salePrice: 3000, // 销售价格
              stockWarning: 2, // 库存预警
            },
          ], // 子产品
        }, */
      ],

      // 子产品
      form: {
        images: "",
        name: "",
        purchasePrice: "", // 入库价格
        salePrice: "", // 销售价格
        stockWarning: "", // 库存预警
      },
      // 分类
      cForm: {
        id: "", // id
        name: "", // 分类名称
        parentId: "", // 父级ID
        levelIds: "", // 层级id
        longName: "", // 长名称
        children: [], // 子类
        subProducts: [], // 子产品
      },

      // 弹窗
      visible: false,

      // 子分类
      cRules: {
        name: [
          {
            type: "string",
            required: true,
            message: "请填写子类名称",
            trigger: ["blur", "change"],
          },
          {
            min: 1,
            max: 18,
            message: "子类名称长度在1-8个字符之间",
          },
        ],
      },
      // 子产品
      rules: {
        name: {
          type: "string",
          required: true,
          message: "请填写产品名称",
          trigger: ["blur", "change"],
        },
        purchasePrice: {
          type: "number",
          required: true,
          message: "请输入采购价格",
          trigger: ["blur", "change"],
        },
        salePrice: {
          type: "number",
          required: true,
          message: "请输入销售价格",
          trigger: ["blur", "change"],
        },
      },

      // 选中的节点
      node: null,

      // 列表的参数
      cParam: null,
      // 列表的类型
      cType: null,

      type,
    };
  },
  mixins: [mixins],
  methods: {
    onSubmit() {
      // 添加子分类
      if (this.isClassify) {
        this.$refs.CFRef.validate()
          .then(this.onClassify);
      } else {
        this.$refs.FRef.validate()
          .then(this.onProducts);
      }
    },

    // 处理类
    onClassify() {
      const cForm = _deepCopy(this.cForm);
      const cType = _deepCopy(this.cType);
      const cParam = _deepCopy(this.cParam);

      if (_isEqual(cType, "rCAdd")) {
        this.list.push(cForm);
      }
      if (_isEqual(cType, "rCEdit")) {
        this.$set(this.list, cParam.rIndex, cForm);
      }
      // 添加下级
      if (_isEqual(cType, "rCNext")) {
        if (!this.list[cParam.rIndex].children) {
          this.this.list[cParam.rIndex].children = [];
        }
        this.list[cParam.rIndex].children.push(cForm);
      }
      // 编辑下级
      if (_isEqual(cType, "cCEdit")) {
        this.$set(this.list[cParam.rIndex].children, cParam.cIndex, cForm);
      }

      this.emitInput();
      this.visible = false;
    },

    // 添加产品
    onProducts() {
      const form = _deepCopy(this.form);
      const c = _deepCopy(this.cType);
      const cP = _deepCopy(this.cParam);

      form.purchasePrice = this.toFen(form.purchasePrice || 0);
      form.salePrice = this.toFen(form.salePrice || 0);

      if (_isEqual(c, "rPAdd")) {
        if (!this.list[cP.rIndex].subProducts) {
          this.list[cP.rIndex].subProducts = [];
        }
        this.list[cP.rIndex].subProducts.push(form);
      }

      if (_isEqual(c, "cPAdd")) {
        if (!this.list[cP.rIndex].children[cP.cIndex].subProducts) {
          this.this.list[cP.rIndex].children[cP.cIndex].subProducts = [];
        }
        this.list[cP.rIndex].children[cP.cIndex].subProducts.push(form);
      }

      if (_isEqual(c, "rPEdit")) {
        this.$set(this.list[cP.rIndex].subProducts, cP.rPIndex, form);
      }

      if (_isEqual(c, "cPEdit")) {
        this.$set(this.list[cP.rIndex].children[cP.cIndex].subProducts, cP.cPIndex, form);
      }

      this.emitInput();
      this.visible = false;
    },

    // 添加子类
    onAClassify(item) {
      this.visible = true;
      this.cForm = _deepCopy(this.$options.data().cForm);
      this.cForm.id = _generateUUID();

      // 添加首级类
      if (_isEqual(this.cType, "rCAdd")) {
        this.cForm.parentId = "0";
        this.cForm.levelIds = 1;
      }

      // 添加子级
      if (_isEqual(this.cType, "rCNext")) {
        this.cForm.parentId = item.id;
        this.cForm.levelIds = 2;
      }

      setTimeout(() => {
        if (this.$refs.CFRef) {
          this.$refs.CFRef.resetFields();
          this.$refs.CFRef.clearValidate();
        }
      }, 100);
    },
    // 编辑子类
    onEClassify(item) {
      this.visible = true;
      setTimeout(() => {
        this.$nextTick(() => {
          if (this.$refs.CFRef) {
            this.$refs.CFRef.resetFields();
            this.$refs.CFRef.clearValidate();
          }
          this.cForm = _deepCopy(item);
        });
      }, 100);
    },
    // 删除类
    onCRemove() {
      const cType = _deepCopy(this.cType);
      const cParam = _deepCopy(this.cParam);

      if (_isEqual(cType, "rCRemove")) {
        if (_isEmpty(cParam.rNode.children) && _isEmpty(cParam.rNode.subProducts)) {
          this.list.splice(cParam.cIndex, 1);
        } else {
          uni.showModal({
            title: "温馨提示",
            content: "该级下含有子级或子产品，确定要删除吗？",
            success: (res) => {
              if (res.confirm) {
                this.list.splice(cParam.cIndex, 1);
              }
            },
          });
        }
      }

      if (_isEqual(cType, "cCRemove")) {
        const child = _get(this.list, `${cParam.rIndex}.children.${cParam.cIndex}`);
        if (_isEmpty(child.children) && _isEmpty(child.subProducts)) {
          this.list[cParam.rIndex].children.splice(cParam.cIndex, 1);
        } else {
          uni.showModal({
            title: "温馨提示",
            content: "该级下含有子级或子产品，确定要删除吗？",
            success: (res) => {
              if (res.confirm) {
                this.list[cParam.rIndex].children.splice(cParam.cIndex, 1);
              }
            },
          });
        }
      }

      this.emitInput();
    },

    // 添加产品
    onAProducts() {
      this.visible = true;
      this.form = _deepCopy(this.$options.data().form);

      setTimeout(() => {
        if (this.$refs.FRef) {
          this.$refs.FRef.resetFields();
          this.$refs.FRef.clearValidate();
        }
      }, 100);
    },

    // 处理编辑产品
    onEditProducts(item) {
      this.visible = true;
      const p = _deepCopy(item);
      p.purchasePrice = this.toYuan(p.purchasePrice || 0);
      p.salePrice = this.toYuan(p.salePrice || 0);

      this.form = p;

      setTimeout(() => {
        if (this.$refs.FRef) {
          this.$refs.FRef.resetFields();
          this.$refs.FRef.clearValidate();
        }
      }, 100);
    },

    // 删除产品
    onPProducts() {
      const cType = _deepCopy(this.cType);
      const cParam = _deepCopy(this.cParam);

      if (_isEqual(cType, "rPRemove")) {
        this.list[cParam.rIndex].subProducts.splice(cParam.rPIndex, 1);
      }

      if (_isEqual(cType, "cPRemove")) {
        this.list[cParam.rIndex].children[cParam.cIndex].subProducts.splice(cParam.cPIndex, 1);
      }

      this.emitInput();
    },

    /**
     * @description 处理规格按钮
     *
     * rCAdd: 添加一级类
     * rCEdit: 编辑一级类,
     * rCNext: 添加下一级类，
     * rCRemove: 删除一级类,
     *
     * cPAdd: 添加子类的产品,
     * cCEdit: 编辑子类，
     * cCRemove: 删除子类,
     *
     * rPAdd: 添加首级产品,
     * cPEdit: 编辑子类下的产品
     * cPRemove: 删除子类下的产品
     * rPEdit: 编辑一级类下的产品
     * rPRemove: 删除一级类下的产品
     */
    onClickBtn(type, param) {
      this.cParam = param;
      this.cType = type;
      switch (type) {
        case "rCEdit":
        case "cCEdit":
          this.onEClassify(param.cNode || param.rNode);
          break;
        case "rCNext":
          this.onAClassify(param.rNode);
          break;
        case "rCRemove":
        case "cCRemove":
          this.onCRemove();
          break;
        case "rPAdd":
        case "cPAdd":
          this.onAProducts();
          break;
        case "cPEdit":
        case "rPEdit":
          this.onEditProducts(param.cPNode || param.rPNode);
          break;
        case "rPRemove":
        case "cPRemove":
          this.onPProducts();
          break;

      }
    },

    emitInput() {
      this.$emit("input", this.list);
    },
  },
  computed: {
    // 类处理
    isClassify() {
      return [
        "rCAdd",
        "rCEdit",
        "rCNext",
        "rCRemove",
        "cCEdit",
        "cCRemove",
      ].includes(this.cType);
    },

    // 编辑处理
    isEdit() {
      return ["rCEdit", "cCEdit", "cPEdit", "rPEdit"].includes(this.cType);
    },
  },
};
</script>

<template>
  <view class="ko-standard">
    <view class="ko-standard__wrap" v-if="list.length">
      <StandardItem
        v-for="(item, index) of list"
        :key="index"
        :node="item"
        :index="index"
        @click-btn="onClickBtn"
        :readonly="readonly"
      />
    </view>

    <button
      class="ko-basic-button__card ko-standard__added"
      @click="cType = 'rCAdd';onAClassify()"
      v-if="!readonly"
    >
      添加
    </button>

    <BasicPopup
      :visible.sync="visible"
      :title="(isEdit ? '编辑' : '添加') + (isClassify ? '' : '产品')"
      :type="type"
    >
      <view class="ko-standard__popup">
        <UvForm
          label-position="left"
          label-width="54px"
          label-align="right"
          :model="cForm"
          :rules="cRules"
          ref="CFRef"
          v-if="isClassify"
        >
          <UvFormItem label="名称：" prop="name" required>
            <UvInput placeholder="请输入名称" v-model="cForm.name" />
          </UvFormItem>
        </UvForm>

        <UvForm
          label-position="left"
          label-width="80px"
          label-align="right"
          :model="form"
          :rules="rules"
          ref="FRef"
          v-else
        >
          <UvFormItem label="产品名称：" prop="name" required>
            <UvInput placeholder="请输入产品名称" v-model="form.name" />
          </UvFormItem>
          <UvFormItem label="销售价格：" prop="salePrice" required>
            <UvInput placeholder="请输入销售价格" type="digit" v-model="form.salePrice" />
          </UvFormItem>
          <UvFormItem label="入库价格：" prop="purchasePrice" required>
            <UvInput placeholder="请输入入库价格" type="digit" v-model="form.purchasePrice" />
          </UvFormItem>
          <UvFormItem label="预警数量：" prop="stockWarning">
            <view style="width: 100%;">
              <UvInput placeholder="请输入预警数量" type="digit" v-model="form.stockWarning" />
              <view style="font-size: 12px; color: #c7c9ce;">注: 当产品库存少于此数量时会触预警。</view>
            </view>
          </UvFormItem>
          <UvFormItem label="产品图片：" prop="images">
            <view>
              <FilePicker
                v-model="form.images"
                :image-styles="{
                width: '100px',
                height: '100px',
              }"
              />
              <view style="font-size: 12px; color: #c7c9ce; margin-top: 6px;">推荐图片尺寸：1:1</view>
            </view>
          </UvFormItem>
        </UvForm>
      </view>

      <template #footer>
        <view class="ko-standard__popup--footer">
          <button class="ko-basic-button__card" @click="onSubmit">保存</button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-standard {
  padding: 0 10px;

  &__wrap {
    padding: 10px 0;
  }

  &__popup {
    width: 100vw;
    height: 70vh;
    padding: 16px 16px 0;

    &--footer {
      display: flex;
      align-items: center;
      justify-content: center;

      .ko-basic-button__card {
        width: 120px;
      }
    }
  }
}

// #ifdef H5
.ko-standard {
  &__added {
    width: 120px;
  }

  &__popup {
    width: 500px;
    height: auto;
    padding: 20px;
  }

  &--footer {
    padding-bottom: 30px;
  }
}

// #endif
</style>
