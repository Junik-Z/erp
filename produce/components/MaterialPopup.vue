<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getProduceDetailApi, updateProduceApi } from "@/api/erp/produce";
import KoMovable from "@/components/Movable/index.vue";
import PickerProduct from "../components/PickerProduct/PickerProduct.vue";
import { _deepCopy, _isEmpty, CustomToast } from "@/utils";
import { requestUploadMaterialFileApi } from "@/request";
import mixins from "@/mixins/mixins";
import FilePicker from './FilePicker/FilePicker.vue'

function mergeProductArrays(arr1, arr2) {
  const mergedMap = new Map();

  // 处理第一个数组
  arr1.forEach(item => {
    if (item && item.productId !== undefined) {
      mergedMap.set(item.productId, {...item});
    }
  });

  // 合并第二个数组
  arr2.forEach(item => {
    if (item && item.productId !== undefined) {
      const existingItem = mergedMap.get(item.productId);
      if (existingItem) {
        // 累加 productQuantity
        existingItem.productQuantity += item.productQuantity || 0;
      } else {
        // 保留新数据
        mergedMap.set(item.productId, {...item});
      }
    }
  });

  // 返回合并后的数组
  return Array.from(mergedMap.values());
}

export default {
  name: "MaterialPopup",
  components: {KoMovable, BasicPopup, PickerProduct, FilePicker},
  data() {
    return {
      visible: false,
      node: {},
      form: {},

      loading: false,
      eLoading: false,

      wVisible: false,

      list: [],

      value: "",

    };
  },
  mixins: [mixins],
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

    // 处理导入物料
    onImport(list) {
      const item = list?.[0] || {};

      if (_isEmpty(item)) {
        CustomToast({title: "请选择物料表", icon: "none"});
        return false;
      }

      uni.showLoading({
        title: "文件解析中...",
        mask: true,
      });
      this.eLoading = true;
      requestUploadMaterialFileApi(item)
        .then(res => {
          const data = res.data;
          this.list = data;
          if (_isEmpty(res.data)) {
            CustomToast({title: "未识别到产品", icon: "error"});
            this.rUpload();
          } else {
            CustomToast({title: `已识别${data?.length}件产品`});
            this.wVisible = true;
          }
        })
        .finally(() => {
          this.eLoading = false;
          uni.hideLoading();
        });

    },

    // 识别到的物料
    onOk() {
      // 原始数据
      const List = _deepCopy(this.form.materialDetails) || [];
      const N = _deepCopy(this.list)?.map(item => ({
        images: item.images,
        classId: item.classId,
        name: item.name,
        productId: item.id,
        productQuantity: item.quantity,
        price: item.purchasePrice,
      })) || [];
      this.form.materialDetails = mergeProductArrays(List, N);
      this.wVisible = false;
      this.rUpload();
    },

    rUpload() {
      this.$refs.FPRef && this.$refs.FPRef.clearFiles();
    },
  },
};
</script>

<template>
  <view style="height: 0; width: 0;">
    <BasicPopup :visible.sync="visible" title="所需物料">
      <view class="ko-material-popup">
        <view class="ko-material-popup__button">
          <FilePicker
            ref="FPRef"
            mode="list"
            file-mediatype="all"
            file-extname="xls,xlsx"
            is-external-upload
            @upload="onImport"
            :disabled="eLoading"
            :limit="1"
          >
            <button
              class="ko-basic-button__card"
              :disabled="eLoading"
              :loading="eLoading"
              style="display: flex; align-items: center; padding: 4px 16px;"
            >
              <view style="display: flex; align-items: center;">
                <uni-icons type="cloud-upload-filled" color="#fff" />
                <text style="margin-left: 8px;">导入物料</text>
              </view>
            </button>
          </FilePicker>
        </view>

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

    <BasicPopup @close="rUpload" :visible.sync="wVisible" title="识别到的产品">
      <view class="ko-wl-popup" style="--ko-basic-table-grid-col: 50px auto auto auto 60px 50px;">
        <view class="ko-basic-table">
          <view class="ko-basic-table--cell">序号</view>
          <view class="ko-basic-table--cell">名称</view>
          <view class="ko-basic-table--cell">单价</view>
          <view class="ko-basic-table--cell">数量</view>
          <view class="ko-basic-table--cell">图片</view>
          <view class="ko-basic-table--cell">操作</view>

          <block v-for="(item, index) of  list" :key="index">
            <view class="ko-basic-table--cell">{{ index + 1 }}</view>
            <view class="ko-basic-table--cell">{{ item.name }}</view>
            <view class="ko-basic-table--cell">{{ toYuan(item.purchasePrice) }}</view>
            <view class="ko-basic-table--cell">{{ item.quantity }}</view>
            <view class="ko-basic-table--cell">
              <button
                v-if="item.images"
                class="ko-basic-button__link"
                @click.stop="lookImage(getImageUrl(item.images))"
              >
                查看
              </button>
            </view>
            <view class="ko-basic-table--cell">
              <button class="ko-basic-button__card" @click.stop="list.splice(index, 1)">移除</button>
            </view>
          </block>
        </view>

        <view v-if="!list.length" style="text-align: center; font-size: 12px; color: #c7c9ce;">没有数据了</view>
      </view>

      <template #footer>
        <view class="ko-material-popup__footer">
          <button
            class="ko-basic-button__card"
            @click="onOk"
          >
            添加
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
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


  &__button {
    display: flex;
    justify-content: flex-end;
    padding: 10px 20px 0;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;

    .ko-basic-button__card {
      width: 120px;
    }
  }
}

.ko-wl-popup {
  // #ifdef MP
  width: 90vw;

  // #endif

  // #ifndef MP
  width: 500px;
  // #endif

  padding: 10px;

  max-height: 60vh;
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
