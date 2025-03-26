<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getProduceDetailApi, updateProduceApi } from "@/api/erp/produce";
import KoMovable from "@/components/Movable/index.vue";
import PickerProduct from "../components/PickerProduct/PickerProduct.vue";
import { CustomToast } from "@/utils";

export default {
  name: "MaterialPopup",
  components: {KoMovable, BasicPopup, PickerProduct},
  data() {
    return {
      visible: false,
      node: {},
      form: {},

      loading: false,
    };
  },
  watch: {
    visible: {
      handler() {
        if (!this.visible) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    open(item) {
      this.node = item;
      this.visible = true;

      this.getInfo();
    },

    getInfo() {
      getProduceDetailApi({id: this.node.id})
        .then(res => {
          this.form = res.data;
        });
    },

    // 提交修改
    onSubmit() {
      this.loading = true;
      updateProduceApi(this.form)
        .then(() => {
          CustomToast({title: `添加成功`});
          this.visible = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="visible" title="所需物料">
    <view class="ko-material-popup">
      <view style="padding: 10px;">
        <PickerProduct
          v-model="form.materialDetails"
          type="purchase"
          is-work
          hide-prices
        />
      </view>
    </view>

    <template #footer>
      <view class="ko-material-popup__footer">
        <button
          class="ko-basic-button__card"
          @click="onSubmit"
          :loading="loading"
          :disabled="loading"
        >
          确定
        </button>
      </view>
    </template>
  </BasicPopup>
</template>

<style lang="scss">
.ko-material-popup {
  // #ifdef MP
  width: 98vw;
  // #endif

  // #ifndef MP
  width: 800px;
  // #endif

  height: 60vh;
  overflow-y: auto;

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;

    .ko-basic-button__card {
      width: 120px;
    }
  }
}
</style>
