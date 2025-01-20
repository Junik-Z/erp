<script>
import { _deepCopy, _isEmpty, _isEqual, CustomToast } from "@/utils";
import FastProduce from "./FastProduce.vue";
import FastMixins from "./FastMixins";

export default {
  name: "FastPopup",
  components: {FastProduce},
  mixins: [FastMixins],
  data() {
    return {
      visible: false,
      type: "quick",
      title: "",

      params: {},
      isNew: false,

      from: {
        name: "",
      },

      loading: false,
    };
  },
  methods: {
    open(type, isNew = false, data = {}) {
      const T = {quick: "生产", craft: "工艺"}[type];
      this.title = isNew ? `新增快捷${T}` : `选择快捷${T}`;
      this.type = type;
      this.isNew = isNew;
      this.params = _deepCopy(data);
      this.from = {name: ""};
      this.visible = true;
    },

    // 应用快捷生产/工艺
    onApplyFast(arg) {
      this.$emit("apply-fast", arg, this.type);
    },

    // 新增
    onSubmit() {
      if (!this.from.name) {
        CustomToast({
          title: "请输入名称",
          icon: "none",
        });
        return false;
      }

      const params = this.params;

      if (_isEqual(this.type, "quick") && (_isEmpty(params.materialDetails) || _isEmpty(params.productDetails))) {
        CustomToast({
          title: "请先选择材料和产品",
          icon: "none",
        });
        return false;
      }

      if (_isEqual(this.type, "craft") && (_isEmpty(params.processDetails))) {
        CustomToast({
          title: "请先填写工艺过程",
          icon: "none",
        });
        return false;
      }

      const Func = {quick: this.addedQuick, craft: this.addedCraft}[this.type];
      const name = {quick: "produceName", craft: "processName"}[this.type];
      params[name] = this.from.name;

      this.loading = true;
      Func(params)
        .then(() => {
          CustomToast({
            title: "添加成功",
          });
        })
        .finally(() => {
          this.loading = false;
          this.visible = false;
        });


    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" :title="title" :type="isNew ? 'center' : 'bottom'">
    <view class="ko-fast-popup" :class="{'is-new': isNew}">
      <FastProduce :type="type" @apply-fast="onApplyFast" v-if="!isNew" />
      <view v-else class="ko-fast-popup__new">
        <uni-forms label-align="right" :model="from">
          <uni-forms-item label="名称：" name="name">
            <uni-easyinput v-model.trim="from.name" placeholder="请输入" />
          </uni-forms-item>
        </uni-forms>
      </view>
    </view>
    <template #footer v-if="isNew">
      <view style="display: flex; align-items: center; justify-content: center; padding: 0 20px 16px;">
        <button
          @click="onSubmit"
          class="ko-basic-button__card"
          style="width: 130px;"
          :loading="loading"
          :disabled="loading"
        >
          保存
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-fast-popup {
  height: 80vh;

  &.is-new {
    height: auto;
  }

  &__new {
    // #ifndef H5
    width: 96vw;
    // #endif
    padding: 10px;
  }
}
</style>
