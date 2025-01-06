<script>
import UniDatetimePicker from "./components/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy, showToast } from "@/utils";
import { addedProduceApi, getProduceDetailApi, updateProduceApi } from "@/api/erp/produce";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import mixins from "@/mixins/mixins";
import dayjs from "@/utils/dayjs";
import UvSteps from "./components/uv-steps/components/uv-steps/uv-steps.vue";
import UvStepsItem from "./components/uv-steps/components/uv-steps-item/uv-steps-item.vue";
import GridTable from "./components/GridTable/GridTable.vue";
import UniEcCanvas from './components/uni-ec-canvas/uni-ec-canvas.vue'


export default {
  name: "client",
  components: {
    UvStepsItem,
    UvSteps,
    PickerProduct,
    UniEasyinput,
    UniSection,
    UniForms,
    UniFormsItem,
    UniDatetimePicker,
    GridTable,
    UniEcCanvas
  },
  mixins: [mixins],
  data() {
    return {

      form: {
        "planFinishDate": "",
        "totalRawMaterialAmount": 0,
        "totalProductAmount": 0,
        "totalAmount": 0,
        "remark": "",
        "materialDetails": [],
        "productDetails": [],
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

      tableData: {
        thead: [
          {
            name: "序号",
          },
          {
            name: "姓名",
          },
          {
            name: "年龄",
          },
          {
            name: "专业",
          },
        ],
        tbody: [
          {value: "1", color: "red", bgColor: "#ace", align: "left"},
          {value: "张牧之"},
          {value: "25"},
          {value: ""},
          {value: "2"},
          {value: "赵坤明"},
          {value: "33"},
          {value: "打篮球,三分贼强~", gridArea: "2/4/4/4"},
          {value: "3"},
          {value: "张牧之"},
          {value: "25"},
          {value: ""},
          {value: "4"},
          {value: "赵坤明"},
          {value: "33"},
          {value: "踢足球，倒挂金钩！", gridArea: "4/4/6/4", isFlex: true},
        ],
      },
    };
  },
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;

    if (this.isEdit) this.getInfo();
  },
  methods: {
    getInfo() {
      getProduceDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;
          this.form = params;
          console.log(params);
        });
    },
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func = this.isEdit ? updateProduceApi : addedProduceApi;
          const params = _deepCopy(this.form);

          params.totalAmount = this.getTotalAmount;
          params.planFinishDate = dayjs(params.planFinishDate).format("YYYY-MM-DD 23:59:59");

          this.loading = true;
          Func(params)
            .then(() => {
              showToast({
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
        <UvStepsItem title="基础信息" />
        <UvStepsItem title="2" error />
        <UvStepsItem title="3" />
      </UvSteps>
    </view>

    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
      :rules="rules"
    >
      <block v-if="current === 0">
        <view style="padding: 10px;">
          <UniFormsItem v-if="form.orderCode" label="订单编号：" name="orderCode">
            <UniEasyinput disabled :value="form.orderCode" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="计划完成时间：" name="planFinishDate" required>
            <UniDatetimePicker
              v-model="form.planFinishDate"
              placeholder="请选择"
              type="date"
              :start="getStartDate"
            />
          </UniFormsItem>

          <UniFormsItem label="定制生产：" name="planFinishDate">
            <radio color="#256eff" />
          </UniFormsItem>
        </view>
      </block>

      <block v-else>
        <UniSection title="所需物料" type="line">
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

      <GridTable :table-data="tableData" align="center" />

    </UniForms>

    <view style="width: 100vw; height: 40vh">
      <UniEcCanvas />
    </view>

    <button
      class="ko-basic-button"
      style="margin: 0 40px 10px;"
      :loading="loading"
      :disabled="loading"
      @click="onSubmit"
    >
      保存
    </button>

  </view>
</template>

<style scoped lang="scss">
.ko-work {
  padding-bottom: env(safe-area-inset-bottom);

  /* #ifdef H5 */
  .ko-basic-button {
    margin: 0 auto !important;
  }

  /* #endif */

  &__steps {
    padding: 10px;
  }
}
</style>
