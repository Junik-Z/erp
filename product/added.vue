<script>
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import {
  addedProductApi,
  checkDuplicateApi,
  editProductApi,
  getDetailApi,
  getProductClassApi,
  getProductFieldApi,
} from "@/api/erp/product";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { _deepCopy, _get, _isEmpty, CustomToast, transferYuan, yuanToPoints } from "@/utils";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import KoList from "@/components/List/List.vue";
import PickerClass from "./components/PickerClass/PickerClass.vue";
import GoodsDesc from "./components/GoodsDesc.vue";

export default {
  name: "Added",
  components: {
    KoList,
    UniCol,
    UniRow,
    BasicCard,
    BasicPopup,
    FilePicker,
    UniEasyinput,
    UniFormsItem,
    UniForms,
    UniSection,

    PickerClass,
    GoodsDesc,
  },
  data() {
    return {
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
        carousel: [],
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

      // 重复产品列表
      DuplicateProducts: [],
      queryList: {
        pageSize: 1000,
        pageNum: 0,
      },

      submitQuery: {},
      visible: false,

      noMore: false,
      sLoading: false,
    };
  },
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
          params.carousel = params.carousel ? (params.carousel).split(",") : [];

          this.form = params;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onSubmit() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.loading = true;
      const Func = this.isEdit ? editProductApi : addedProductApi;

      Func(this.submitQuery)
        .then(res => {
          console.log(res);
          uni.setStorageSync("TENP_ORDER_INFO", res.data);
          CustomToast({
            title: `${this.isEdit ? "修改" : "新增"}成功`,
            success() {
              uni.navigateBack();
            },
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 检查是否有同名
    getCheckDuplicate() {
      this.sLoading = true;
      checkDuplicateApi({...this.submitQuery, ...this.queryList})
        .then(res => {
          this.DuplicateProducts = [...this.DuplicateProducts, ...res.data];
          this.noMore = res.data?.length < this.queryList.pageSize;

          this.queryList.pageNum += 1;

          if (_isEmpty(this.DuplicateProducts)) {
            this.onSubmit();
          } else {
            this.visible = true;
          }
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    onPreprocessing() {
      this.$refs.FormRef.validate(verify => {
        if (!verify) {
          const params = _deepCopy(this.form);
          params.purchasePrice = yuanToPoints(params.purchasePrice);
          params.salePrice = yuanToPoints(params.salePrice);
          params.carousel = (params.carousel || []).join(",");

          this.submitQuery = params;

          this.getCheckDuplicate();
        } else {
          uni.showToast({
            title: _get(verify, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },

    // 商品详情
    toDesc(type) {
    },
  },
};
</script>

<template>
  <view class="ko-order ko-basic-added-form">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->

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
            <view style="flex: 1;width: 100%">
              <PickerClass v-model="form.classId" is-input />
            </view>
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
            <view>
              <FilePicker
                v-model="form.images"
                :image-styles="{width: '100px',height: '100px',}"
              />
              <view style="font-size: 12px; color: #c7c9ce; margin-top: 6px;">推荐图片尺寸：1:1</view>
            </view>
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
      <UniSection title="产品详情" type="line">
        <view style="padding: 10px;">
          <!--<UniFormsItem label="Banner：" name="description">
            <FilePicker
              v-model="form.carousel"
              :limit="9"
              file-extname="png,jpg,jpeg,gif"
              show-update-list
              return-type="array"
              :image-styles="{
                width: '100px',
                height: '100px',
              }"
            />
          </UniFormsItem>-->
          <UniFormsItem label="产品描述：" name="description">
            <GoodsDesc
              v-model="form.description"
              :carousel.sync="form.carousel"
              :sub-classes.sync="form.subClasses"
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
        @click="onPreprocessing"
        :loading="loading || sLoading"
        :disabled="loading || sLoading"
      >
        保存
      </button>
    </view>

    <BasicPopup :visible.sync="visible" title="产品名称重复">
      <view class="ko-order__popup">
        <KoList
          @lower="getCheckDuplicate"
          :loading="sLoading"
          :no-more="noMore"
          :no-data="!DuplicateProducts.length"
        >
          <view>
            <BasicCard :spacing="10" v-for="item of DuplicateProducts" :key="item.id">
              <UniRow :gutter="10">
                <UniCol :span="12">
                  <label class="ko-basic-label">名称：</label>
                  <text>{{ item.name }}</text>
                </UniCol>
                <UniCol :span="12">
                  <label class="ko-basic-label">分类：</label>
                  <text>{{ item.className }}</text>
                </UniCol>
              </UniRow>
            </BasicCard>
          </view>
        </KoList>
      </view>
      <template #footer>
        <view class="ko-order__popup--button">
          <button class="ko-basic-button__card" @click="visible = false">修改</button>
          <button class="ko-basic-button__card" @click="onSubmit()">继续保存</button>
        </view>
      </template>
    </BasicPopup>
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
    // #ifdef MP
    width: 90vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    font-size: 12px;

    height: 70vh;

    &--button {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }
}
</style>
