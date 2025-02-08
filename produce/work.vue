<script>
import UniDatetimePicker from "./components/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _isNotUnNil, _isObject, _keys, _pick, CustomToast, _set } from "@/utils";
import {
  addedProduceApi,
  addedSaleProduceApi,
  getProduceDetailApi,
  getProduceOrderDetailApi,
  updateCraftProcessApi,
  updateProduceApi,
  updateSaleProduceApi,
} from "@/api/erp/produce";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import mixins from "@/mixins/mixins";
import dayjs from "@/utils/dayjs";
import UvSteps from "./components/uv-steps/components/uv-steps/uv-steps.vue";
import UvStepsItem from "./components/uv-steps/components/uv-steps-item/uv-steps-item.vue";
import GridTable from "./components/GridTable/GridTable.vue";
import KoRadioGroup from "./components/RadioGroup.vue";
import CustomTable from "./pages/CustomTable.vue";
import CraftProcesses from "./pages/CraftProcesses.vue";
import BinPacking from "./pages/BinPacking.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import FastPopup from "./components/FastProduce/FastPopup.vue";
import KoMovable from "@/components/Movable/index.vue";
import { getMyInfoApi } from "@/api/user";
import BinCount from "./components/BinCount.vue";

export default {
  name: "Work",
  components: {
    BinCount,
    KoMovable,
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
    PickerUser,
    FastPopup,
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
        // 生产流程
        "craftProcesses": [],
        // 定制板材
        "customizedBoards": [
          /* {
            "rid": "f13cdb02-0d75-4e23-9aff-3d85d41ebc98",
            "drillWidth": 6,
            "edgeWidth": 1.2,
            "color": "黑色",
            "boards": [
              {
                "rid": "3e9ca1b5-4346-4858-b198-b7b16de9c01e",
                "width": 0,
                "height": 0,
                "packers": [
                  {
                    "rid": "f13cdb02-0d75-4e23-9aff-3d85d41ebc98",
                    "drillWidth": 6,
                    "edgeWidth": 1.2,
                    "width": 1220,
                    "height": 2440,
                    "color": "黑色",
                  },
                  {
                    "name": "余料1",
                    "rid": "a2edf408-33cb-4592-9852-c2dd1a6de914",
                    "width": 1000,
                    "height": 600,
                    "x": null,
                    "y": null,
                    "quantity": 2,
                    "weight": 9,
                    "color": "绿色",
                  },
                ],
                "items": [
                  {
                    "name": "柜面1",
                    "rid": "100d5e05-e67d-4a16-bf72-a7e35b2ae504",
                    "width": 500,
                    "height": 600,
                    "x": 0,
                    "y": 0,
                    "radius": [0, 0, 0, 0],
                    "edges": [1, 1, 1, 1],
                    "weight": 9,
                    "texture": true,
                    "rotate": false,
                    "quantity": 2,
                    "color": "绿色",
                  },
                  {
                    "name": "柜面1",
                    "rid": "7a61a157-eb94-461b-883d-0be3424f28d7",
                    "width": 500,
                    "height": 600,
                    "x": 0,
                    "y": 0,
                    "radius": [0, 0, 0, 0],
                    "edges": [0, 0, 0, 0],
                    "weight": 9,
                    "texture": true,
                    "rotate": false,
                    "quantity": 2,
                    "color": "绿色",
                  },
                ],
              },
            ],
            "boardRecord": [
              {
                "width": 1006,
                "height": 606,
                "weight": 9,
                "color": "绿色",
                "items": [
                  {
                    "rid": "7a61a157-eb94-461b-883d-0be3424f28d7",
                    "width": 506,
                    "height": 606,
                    "color": "绿色",
                    "x": 0,
                    "y": 0,
                  },
                ],
              },
              {
                "width": 1006,
                "height": 606,
                "weight": 9,
                "color": "绿色",
                "items": [
                  {
                    "rid": "7a61a157-eb94-461b-883d-0be3424f28d7",
                    "width": 506,
                    "height": 606,
                    "color": "绿色",
                    "x": 0,
                    "y": 0,
                  },
                ],
              },
              {
                "width": 1226,
                "height": 2446,
                "weight": 9,
                "color": "绿色",
                "items": [
                  {
                    "rid": "100d5e05-e67d-4a16-bf72-a7e35b2ae504",
                    "width": 503,
                    "height": 603,
                    "color": "绿色",
                    "x": 0,
                    "y": 0,
                  },
                  {
                    "rid": "100d5e05-e67d-4a16-bf72-a7e35b2ae504",
                    "width": 503,
                    "height": 603,
                    "color": "绿色",
                    "x": 503,
                    "y": 0,
                  },
                ],
              },
            ],
          }, */
        ],
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
        /* productDetails: {
          rules: [
            {
              required: true,
              errorMessage: "请选择生产产品",
            },
          ],
        }, */
      },
      loading: false,
      option: {},

      current: 0,
      type: "common", // common: "常规生产", packing: "板材定制", xlsx: "表格定制生产",

      customizedMaterials: "", // 定制生产数据
      isCustomized: false,
      isSale: false, // 是否是销售过来
      isTechnology: false, // 单独修改工艺

      TimeVM: null,

      clientTabs: ["客户", "其它客户"],
      clientType: 0,
    };
  },
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    this.isSale = _isEqual(option.FORM, "SALE");
    this.isTechnology = _isEqual(option.isTechnology, "true");

    this.fastId = option?.fastId;

    if (this.fastId) {
      this.$nextTick(() => {
        const info = this.$refs.FPRef.getDetails({id: this.fastId}, "quick");
        info
          .then(res => {
            this.form = {...this.form, ..._pick(res.data, _keys(this.form))};
          });
      });
    }

    if (this.isSale) {
      this.form.produceType = "customized";
      uni.setNavigationBarTitle({title: "定制工单"});
    }

    if (this.isTechnology) {
      this.current = 1;
    }

    if (option.ADDED_TYPE) {
      this.type = option.ADDED_TYPE;
    }

    if (this.isEdit) this.getInfo();

    this.onKeepAlive();
  },
  methods: {
    // 获取详情
    getInfo() {
      const Func = this.isSale ? getProduceOrderDetailApi : getProduceDetailApi;

      Func({[this.isSale ? "orderCode" : "id"]: this.option.id})
        .then(res => {
          const params = res.data;

          if (_isNotUnNil(params.totalAmount)) {
            params.totalAmount = this.toYuan(params.totalAmount);
          }

          this.customizedMaterials = _get(params, "customizedMaterials.0.customTable") || "";

          this.type = !_isEmpty(params.customizedMaterials) ? "xlsx" : !_isEmpty(params.customizedBoards) ? "packing" : "common";

          /*  if (!_isEmpty(params.customizedBoards)) {
             setTimeout(() => {
               this.$refs.BPRef.setTakeValue(params.customizedBoards[0]);
             }, 200);
           } */

          this.form = params;
        });
    },
    // 提交
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func =
            this.isTechnology ? updateCraftProcessApi :
              (this.isSale ?
                this.isEdit ? updateSaleProduceApi : addedSaleProduceApi
                : this.isEdit ? updateProduceApi : addedProduceApi);

          const params = _deepCopy(this.form);

          if (_isEqual(this.type, "xlsx")) {
            _set(params, "customizedMaterials.0",
              {
                sequence: 1,
                ...(_get(params, "customizedMaterials.0") || {}),
                customTable: this.customizedMaterials,
              },
            );
          }

          if (_isNotUnNil(params.totalAmount)) {
            params.totalAmount = this.toFen(params.totalAmount);
          }

          if (params.planFinishDate) {
            params.planFinishDate = params.planFinishDate ? dayjs(params.planFinishDate).format("YYYY-MM-DD 23:59:59") : null;
          }

          this.loading = true;
          Func(params)
            .then((res) => {
              uni.setStorageSync("TENP_ORDER_INFO", _isObject(res.data) ? res.data : this.form);
              CustomToast({
                title: `${this.isEdit ? "编辑" : "新增"}成功`,
                success() {
                  uni.navigateBack({});
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

    // 更新表格数据
    onUpdateXlsx(data) {
      // console.log("数据更新了", data);
      this.customizedMaterials = data;
      /*  if (_isEqual(this.type, "xlsx") && this.$refs.CTRef) {
         const params = _deepCopy(this.form);
         const customTable = this.$refs.CTRef.getList() || "[]";

         _set(params, "customizedMaterials.0",
           {
             sequence: 1,
             ...(_get(params, "customizedMaterials.0") || {}),
             customTable: customTable,
           },
         );

         this.customizedMaterials = customTable;

         console.log(customTable);

         this.form = params;
       } */
    },

    // 下一步
    onNext() {
      if (this.current === this.getStepsList.length - 1 || this.isTechnology) {
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
    // 上一步
    onPrev() {
      if (this.current === 0) {
        uni.navigateBack({});
      } else {
        this.current -= 1;
      }
    },

    // 板材计算后的结果
    onChangeCustomized(obj) {
      this.form.customizedBoards[0] = obj;
    },

    // 选择快捷流程
    onSelectCraft(type) {
      this.$refs.FPRef.open(type);
    },

    // 快捷生产
    onApplyFast(data, type) {
      console.log(data, type);
      if (_isEqual(type, "quick")) {
        this.form = {...this.form, ..._pick(data, _keys(this.form))};
      }

      if (_isEqual(type, "craft")) {
        this.$set(this.form, "craftProcesses", _deepCopy(data.processDetails));
      }

      this.$refs.FPRef.close();
    },

    // 另存为快捷工艺
    onSubmitCraft() {
      this.$refs.FPRef.open("craft", true, {processDetails: this.form.craftProcesses});
    },

    // 另存为快捷生产
    onSubmitQuick() {
      this.$refs.FPRef.open("quick", true, this.form);
    },

    // 选中客户回填电话及地址
    onSupplierId(val) {
      const node = this.$refs.UserRef.getUserInfo(val) || {};
      this.form.orderAddress = node.address;
      this.form.orderPhone = _get(node, "contacts.0.phone");
    },

    // 开启快捷生产
    onFast() {
      this.$refs.FPRef.open("quick");
    },

    // 点击了
    onSetSteps(index) {
      this.current = index;
    },

    // 处理保活
    onKeepAlive() {
      this.TimeVM = setTimeout(() => {
        getMyInfoApi();
      }, 10 * 60 * 1000);
    },

    // 处理 tab 切换
    onTabItem() {
      if (this.clientType === 0) {
        this.form.otherSupplier = "";
        this.form.otherSupplierPhone = "";
      }

      if (this.clientType === 1) {
        this.form.supplierId = "";
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

    // 获取步骤
    getStepsList() {
      return [
        {
          label: "工单类型",
          value: "type",
        },
        {
          label: "生产流程",
          value: "crafts",
        },
        {
          label: "其它信息",
          value: "other",
        },
      ].filter(item => this.isSale ? !_isEqual(item.value, "crafts") : item.value);
    },
    getCurrentValue() {
      return _get(this.getStepsList, this.current + ".value");
    },
  },
  onUnload() {
    clearTimeout(this.TimeVM);
  },
};
</script>

<template>
  <view class="ko-work ko-basic-added-form">
    <view class="ko-work__steps" v-if="getStepsList.length > 1 && !isTechnology">
      <UvSteps :current="current">
        <UvStepsItem
          @click-step="onSetSteps(index)"
          v-for="(item, index) of getStepsList"
          :title="item.label"
          :key="item.value"
        />
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
        <block v-if="isEqual(getCurrentValue, 'type')">
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

            <KoMovable
              :y-axis="-60"
              @click="onFast('')"
            >
              <view style="line-height: 1.3">
                <view style="font-size: 12px;">
                  快捷
                </view>
                <view style="font-size: 12px;">
                  生产
                </view>
              </view>
            </KoMovable>
          </UniSection>

          <block v-if="isEqual(type, 'xlsx')">
            <CustomTable :value="customizedMaterials" ref="CTRef" @change="onUpdateXlsx" />
          </block>

          <block v-if="isEqual(type, 'packing')">
            <BinPacking
              :is-customized.sync="isCustomized"
              @change="onChangeCustomized"
              ref="BPRef"
              :value="form.customizedBoards[0]"
            />
          </block>
        </block>

        <block v-if="isEqual(getCurrentValue, 'crafts')">
          <CraftProcesses v-model="form.craftProcesses" @select="onSelectCraft" />
        </block>

        <block v-if="isEqual(getCurrentValue, 'other')">
          <view style="margin: 0 10px 10px;">
            <uni-segmented-control
              :current.sync="clientType"
              :values="clientTabs"
              style-type="text"
              @clickItem="onTabItem"
            />
          </view>

          <uni-forms-item v-if="clientType === 0" label="客户：" name="supplierId">
            <PickerUser
              style="width: 100%;"
              is-input
              title="选择客户"
              v-model="form.supplierId"
              type="client"
              ref="UserRef"
              @input="onSupplierId"
            />
          </uni-forms-item>

          <UniFormsItem v-if="clientType === 1" label="姓名" name="otherSupplier">
            <UniEasyinput
              v-model="form.otherSupplier"
              style="width: 100%;"
              placeholder="请输入"
            />
          </UniFormsItem>

          <UniFormsItem label="计划完成时间：" name="planFinishDate">
            <UniDatetimePicker
              v-model="form.planFinishDate"
              placeholder="请选择"
              type="date"
              :start="getStartDate"
            />
          </UniFormsItem>

          <uni-forms-item label="联系电话：" name="orderPhone">
            <uni-easyinput v-model="form.orderPhone" placeholder="请输入" />
          </uni-forms-item>

          <uni-forms-item label="配送地址：" name="orderAddress">
            <uni-easyinput v-model="form.orderAddress" placeholder="请输入" />
          </uni-forms-item>

          <UniSection title="生产产品" type="line">
            <view style="padding: 10px;">
              <UniFormsItem label-width="0" name="productDetails">
                <view style="width: 100%;">
                  <PickerProduct
                    v-model="form.productDetails"
                    :total.sync="form.totalAmount"
                    is-work
                    hide-prices
                  />
                </view>
              </UniFormsItem>
            </view>
          </UniSection>

          <UniSection title="工单总价" type="line">
            <view style="padding: 10px;">
              <block v-if="isEqual(type, 'packing')">
                <BinCount :value="form.customizedBoards[0]" />
              </block>

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

          <UniSection title="其它费用" type="line">
            <view style="padding: 10px;">
              <FeesList v-model="form.fees" is-form />
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

    <view class="ko-work__footer">
      <block v-if="!isTechnology">
        <button
          class="ko-basic-button__card"
          @click="onPrev"
          v-if="current !== 0"
        >
          {{ current === 0 ? "取消" : "上一步" }}
        </button>
        <button
          class="ko-basic-button__card"
          v-if="isEqual(getCurrentValue, 'crafts')"
          @click.stop="onSubmitCraft"
        >
          存为快捷工艺
        </button>
        <button
          class="ko-basic-button__card"
          v-if="isEqual(getCurrentValue, 'type') && isEqual(type, 'common')"
          @click.stop="onSubmitQuick"
        >
          存为快捷生产
        </button>
      </block>
      <button
        class="ko-basic-button__card"
        :loading="loading"
        :disabled="loading"
        @click="onNext"
      >
        {{ current === (getStepsList.length - 1) || isTechnology ? "提交" : "下一步" }}
      </button>
    </view>

    <FastPopup ref="FPRef" @apply-fast="onApplyFast" />
  </view>
</template>

<style scoped lang="scss">
.ko-work {
  padding-bottom: calc(env(safe-area-inset-bottom) + 60px);

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

    /* position: fixed;
     bottom: 0;
     left: 0;
     right: 0;
     z-index: 10;*/


    //background: #fff;

    //height: 70px;

    margin-top: 70px;

    border-top: 1px solid #e9e9eb;
    padding-top: 14px;
    padding-left: 40px;
    padding-right: 40px;

    .ko-basic-button__card {
      width: 100px;
    }
  }
}
</style>
