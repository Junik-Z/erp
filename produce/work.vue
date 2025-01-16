<script>
import UniDatetimePicker from "./components/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy, _get, _set, CustomToast } from "@/utils";
import { addedProduceApi, getProduceDetailApi, updateProduceApi } from "@/api/erp/produce";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import mixins from "@/mixins/mixins";
import dayjs from "@/utils/dayjs";
import UvSteps from "./components/uv-steps/components/uv-steps/uv-steps.vue";
import UvStepsItem from "./components/uv-steps/components/uv-steps-item/uv-steps-item.vue";
import GridTable from "./components/GridTable/GridTable.vue";
import KoRadioGroup from "./components/RadioGroup.vue";
import CustomTable from "@/produce/pages/CustomTable.vue";
import CraftProcesses from "./pages/CraftProcesses.vue";
import BinPacking from "./pages/BinPacking.vue";

export default {
  name: "Work",
  components: {
    BinPacking,
    CustomTable,
    KoRadioGroup,
    UvStepsItem,
    UvSteps,
    PickerProduct,
    UniEasyinput,
    UniSection,
    UniForms,
    UniFormsItem,
    UniDatetimePicker,
    GridTable,
    CraftProcesses,
  },
  mixins: [mixins],
  data() {
    return {
      form: {
        produceType: "internal", // internal: 默认；customized: 自定义生产;
        "planFinishDate": "",
        "totalRawMaterialAmount": null,
        "totalAmount": null,
        "totalProfit": null,
        "remark": "",
        // 材料明细
        "materialDetails": [],
        // 定制生产
        "customizedMaterials": [],
        // 产品明细
        "productDetails": [],
        // 生产工艺
        "craftProcesses": [],
        // 定制板材
        "customizedBoards": [],
      },
      rules: {
        planFinishDate: {
          rules: [
            {
              required: true,
              errorMessage: "请选择计划完成时间",
            },
          ],
        },
        materialDetails: {
          rules: [
            {
              required: true,
              errorMessage: "请选择生产所需物料",
            },
          ],
        },
        productDetails: {
          rules: [
            {
              required: true,
              errorMessage: "请选择生产产品",
            },
          ],
        },
      },
      loading: false,
      option: {},
      current: 0,
      type: "common", // common: "常规生产", packing: "板材定制", xlsx: "表格定制生产",
      typeOptions: [
        {
          label: "常规生产",
          value: "internal",
        },
        {
          label: "定制生产",
          value: "customized",
        },
        {
          label: "板材定制",
          value: "packing",
        },
      ],

      customizedMaterials: "", // 定制生产数据

      isCustomized: false,
    };
  },
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    this.type = option.ADDED_TYPE || "common";

    if (this.isEdit) this.getInfo();
  },
  methods: {
    // 获取详情
    getInfo() {
      getProduceDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;
          this.customizedMaterials = _get(params, "customizedMaterials.0.customTable") || "";
          this.form = params;
          console.log(params);
        });
    },
    // 提交
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func = this.isEdit ? updateProduceApi : addedProduceApi;
          const params = _deepCopy(this.form);

          const customTable = _deepCopy(this.customizedMaterials);

          _set(params, "customizedMaterials.0",
            {
              sequence: 1,
              ...(_get(params, "customizedMaterials.0") || {}),
              customTable: customTable,
            },
          );

          params.planFinishDate = dayjs(params.planFinishDate).format("YYYY-MM-DD 23:59:59");

          this.loading = true;
          Func(params)
            .then((res) => {
              uni.setStorageSync("TENP_ORDER_INFO", res.data);
              CustomToast({
                title: `${this.isEdit ? "编辑" : "新增"}成功`,
                success() {
                  uni.navigateBack({});
                },
              });
            })
            .finally(() => {
              this.loading = false;
            })
          ;
        }
      });
    },

    // 下一步
    onNext() {
      if (this.current === 2) {
        this.onSubmit();
      } else {
        if (this.isCustomized) {
          uni.showModal({
            title: "温馨提示",
            content: "您还有材料未进行排版计算，继续下一步将丢失未计算数据，是否继续？",
            confirmText: "下一步",
            success: (res) => {
              if (res.confirm) {
                this.current += 1;
                this.isCustomized = false;
              }
            },
          });
        } else {
          this.current += 1;
        }
      }
    },
    onPrev() {
      if (this.current === 0) {
        uni.navigateBack({});
      } else {
        this.current -= 1;
      }
    },
  },
  computed: {
    getStartDate() {
      return +new Date();
    },
    getTotalAmount() {
      return (this.form.totalProductAmount || 0) - (this.form.totalRawMaterialAmount || 0);
    },
  },
};
</script>

<template>
  <view class="ko-work ko-basic-added-form">
    <view class="ko-work__steps">
      <UvSteps :current="current">
        <UvStepsItem title="工单类型" />
        <UvStepsItem title="生产工艺" />
        <UvStepsItem title="其它信息" />
      </UvSteps>
    </view>

    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
      :rules="rules"
    >
      <view style="padding: 10px;">
        <block v-if="current === 0">
          <UniSection title="所需物料" type="line" v-if="isEqual(type, 'common')">
            <view style="padding: 10px;">
              <UniFormsItem label-width="0" name="materialDetails">
                <view style="width: 100%;">
                  <PickerProduct
                    v-model="form.materialDetails"
                    :total.sync="form.totalRawMaterialAmount"
                    type="purchase"
                    hide-prices
                  />
                </view>
              </UniFormsItem>
            </view>
          </UniSection>

          <block v-if="isEqual(type, 'xlsx')">
            <CustomTable v-model="customizedMaterials" />
          </block>

          <block v-if="isEqual(type, 'packing')">
            <BinPacking :is-customized.sync="isCustomized" v-model="form.customizedBoards[0]" />
          </block>
        </block>

        <block v-if="current === 1">
          <CraftProcesses v-model="form.craftProcesses" />
        </block>

        <block v-if="current === 2">
          <UniFormsItem label="计划完成时间：" name="planFinishDate">
            <UniDatetimePicker
              v-model="form.planFinishDate"
              placeholder="请选择"
              type="date"
              :start="getStartDate"
            />
          </UniFormsItem>

          <UniSection title="生产产品" type="line">
            <view style="padding: 10px;">
              <UniFormsItem label-width="0" name="productDetails">
                <view style="width: 100%;">
                  <PickerProduct
                    v-model="form.productDetails"
                    :total.sync="form.totalProductAmount"
                    hide-prices
                  />
                </view>
              </UniFormsItem>
            </view>
          </UniSection>

          <UniSection title="生产总价" type="line">
            <view style="padding: 10px;">
              <UniFormsItem label-width="0" name="totalAmount">
                <view style="width: 100%;">
                  <uni-easyinput type="digit" v-model="form.totalAmount" placeholder="请输入" />
                </view>
              </UniFormsItem>
            </view>
          </UniSection>

          <UniSection title="预计创造价值" type="line" v-if="false">
            <view style="padding: 10px;">
              <UniFormsItem label-width="30px" name="materialDetails">
                <view>
                  <view class="ko-basic-money"> {{ toYuan(getTotalAmount) }}元</view>
                  <view style="margin-top: 10px;" class="ko-basic-money">{{ toBigMoney(toYuan(getTotalAmount)) }}</view>
                </view>
              </UniFormsItem>
            </view>
          </UniSection>

          <UniSection title="其它信息" type="line">
            <view style="padding: 10px;">
              <UniFormsItem label="备注：" name="remark">
                <UniEasyinput v-model="form.remark" type="textarea" placeholder="备注(选填)" />
              </UniFormsItem>
            </view>
          </UniSection>
        </block>
      </view>
    </UniForms>

    <view class="ko-work__footer ko-basic-box-shadow__top">
      <button
        class="ko-basic-button__card"
        @click="onPrev"
      >
        {{ current === 0 ? "取消" : "上一步" }}
      </button>
      <button
        class="ko-basic-button__card"
        :loading="loading"
        :disabled="loading"
        @click="onNext"
      >
        {{ current === 2 ? "提交" : "下一步" }}
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-work {
  padding-bottom: calc(env(safe-area-inset-bottom) + 70px);

  /* #ifdef H5 */
  .ko-basic-button {
    margin: 0 auto !important;
  }

  /* #endif */

  &__steps {
    padding: 10px;
  }

  &__footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-around;

    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background: #fff;

    height: 70px;
    padding-top: 20rpx;
    padding-left: 40px;
    padding-right: 40rpx;

    .ko-basic-button__card {
      width: 100px;
    }
  }
}
</style>
