<script>
// #ifdef H5
import FilePreview from "./pages/FilePreview.vue";
// #endif
import UniDatetimePicker from "./components/uni-datetime-picker/uni-datetime-picker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import {
  _deepCopy,
  _get,
  _isEmpty,
  _isEqual,
  _isNotUnNil,
  _isObject,
  _keys,
  _pick,
  _set,
  _sum,
  CustomToast,
} from "@/utils";
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
import UvSteps from "./components/uv-steps/uv-steps/uv-steps.vue";
import UvStepsItem from "./components/uv-steps/uv-steps-item/uv-steps-item.vue";
import KoRadioGroup from "./components/RadioGroup.vue";
import CustomFiles from "./pages/CustomFiles.vue";
import CraftProcesses from "./pages/CraftProcesses.vue";
import BinPacking from "./pages/BinPacking.vue";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import FastPopup from "./components/FastProduce/FastPopup.vue";
import KoMovable from "@/components/Movable/index.vue";
import { getMyInfoApi } from "@/api/user";
import BinCount from "./components/BinCount.vue";
import { addedPurchaseCustomizedApi, getPurchaseInfoApi, updatePurchaseCustomizedApi } from "@/api/erp/purchase";
import { getBindInfoApi, getSaleCheckShareIdApi, getShareOrderApi } from "@/api/erp/sale";
import FeesList from "./components/FeesList/FeesList.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import PickerAddress from "./components/PickerAddress.vue";
import { PageEnums } from "@/utils/config";

export default {
  name: "Work",
  components: {
    PickerAddress,
    BinCount,
    KoMovable,
    BinPacking,
    CustomFiles,
    KoRadioGroup,
    UvStepsItem,
    UvSteps,
    PickerProduct,
    UniEasyinput,
    UniSection,
    UniForms,
    UniFormsItem,
    UniDatetimePicker,
    CraftProcesses,
    PickerUser,
    FastPopup,
    FeesList,
    FilePicker,
    // #ifdef H5
    FilePreview,
    // #endif
  },
  mixins: [mixins],
  data() {
    return {
      form: {
        produceType: "internal", // internal: 默认；customized: 自定义生产;
        "planFinishDate": null,
        "totalRawMaterialAmount": null,
        "totalAmount": null,
        "totalProfit": null,
        // 材料明细
        "materialDetails": [],
        // 定制生产
        "customizedMaterials": [],
        // 产品明细
        "productDetails": [],
        // 生产流程
        "craftProcesses": [],
        // 定制板材
        "customizedBoards": [],
        "remark": "",
        orderAddress: "",
        supplierId: "",
        orderPhone: "",
        id: "",
        otherSupplier: "",
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

      isEdit: false,

      // 采购订单
      isPurchase: false,

      // 采购定制生成销售定制
      isGenerateSales: false,

      // 客户下单
      isClient: false,

      bindList: [],

      file: [],

      // 是否分享下单
      isShare: false,
      VmKey: +new Date(),

      customizedMoney: 0,

      pTotal: 0,

      // 添加分享的订单
      isShareOrder: false,
    };
  },
  async onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;
    // 销售定制单
    this.isSale = _isEqual(option.FORM, "SALE");

    // 客户下单
    this.isClient = _isEqual(option.isClient, "true");

    // 是否是来自分享页面
    this.isShare = _isEqual(option.PAGE_TYPE, "ADDED_PRODUCE_PACKING");

    // 采购定制单
    this.isPurchase = _isEqual(option.FORM, "PURCHASE");

    // 单独修改工艺
    this.isTechnology = _isEqual(option.isTechnology, "true");

    // 生成销售订单
    this.isGenerateSales = _isEqual(option.isGenerateSales, "true");

    // 分享的订单
    this.isShareOrder = _isEqual(option.PAGE_TYPE, "SHARE_ORDER") && this.isSale;

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

    if (this.isPurchase) {
      this.form.produceType = "customized";
      uni.setNavigationBarTitle({title: "定制采购"});
    }

    if (option.ADDED_TYPE) {
      this.type = option.ADDED_TYPE;
    }

    if (this.isEdit) this.getInfo();

    // 采购生成销售订单
    if (this.isGenerateSales) {
      this.form.produceType = "customized";
      this.isEdit = false;
      this.isPurchase = false;

      this.isSale = true;
      uni.setNavigationBarTitle({title: "定制工单"});
    }

    if (this.isClient) {
      this.clientType = 1;
      this.form.otherSupplier = this.GET_USER_INFO.nickName;
      this.getBindInfo();
    }

    // 处理分享页面
    if (this.isShare) {
      await this.onLogInAgain(this.option)
        .finally(() => {
          setTimeout(() => {
            this.form.otherSupplier = this.GET_USER_INFO.nickName;
            this.getBindInfo();
            this.VmKey = +new Date();
          }, 50);
        });

      if (this.option.SHARE_ID) {
        await getSaleCheckShareIdApi({id: decodeURIComponent(this.option.SHARE_ID)})
          .then(res => {
            this.form.id = decodeURIComponent(this.option.SHARE_ID);
            this.form.totalAmount = 1;

            console.log("分享ID逻辑", res.data);

            if (res.data) {
              uni.redirectTo({
                url: PageEnums.saleClientAddedBack,
                fail() {
                  uni.navigateBack();
                },
              });
            }
          });
      }
    }

    // 分享的订单
    if (this.isShareOrder) {
      await this.onLogInAgain({}, true)
        .finally(() => {
          setTimeout(() => {
            this.VmKey = +new Date();
          }, 50);
        });

      setTimeout(() => {
        if (this.option.SHARE_ID && this.isPerm("SHARE_RECEIVE_SHARE_ORDER")) {
          getShareOrderApi({shareId: decodeURIComponent(this.option.SHARE_ID)})
            .then(res => {
              const params = res.data;

              if (_isNotUnNil(params.totalAmount)) params.totalAmount = this.toYuan(params.totalAmount);
              this.customizedMaterials = _get(params, "customizedMaterials.0.customTable") || "";
              this.type = !_isEmpty(params.customizedMaterials) ? "xlsx" : !_isEmpty(params.customizedBoards) ? "packing" : "common";

              params.supplierId = "";
              params.id = "";

              this.form = params;
              console.log("分享ID逻辑", res.data);
            })
            .catch(() => {
              console.log("数据报错了");
              uni.redirectTo({
                url: PageEnums.saleClientAddedBack,
                fail() {
                  uni.navigateBack();
                },
              });
            });
        } else {
          console.log("哈哈哈");
          uni.redirectTo({
            url: PageEnums.saleClientAddedBack,
            fail() {
              uni.navigateBack();
            },
          });
        }
      }, 200);
    }

    this.onKeepAlive();
  },
  methods: {
    // 获取详情
    getInfo() {
      const Func = this.isPurchase ? getPurchaseInfoApi : this.isSale ? getProduceOrderDetailApi : getProduceDetailApi;

      Func({[this.isSale || this.isPurchase ? "orderCode" : "id"]: this.option.id})
        .then(res => {
          const params = res.data;

          if (_isNotUnNil(params.totalAmount)) {
            params.totalAmount = this.toYuan(params.totalAmount);
          }

          this.customizedMaterials = _get(params, "customizedMaterials.0.customTable") || "";

          this.type = !_isEmpty(params.customizedMaterials) ? "xlsx" : !_isEmpty(params.customizedBoards) ? "packing" : "common";

          if (this.isPurchase || this.isGenerateSales) {
            this.type = "xlsx";
          }

          /*  if (!_isEmpty(params.customizedBoards)) {
             setTimeout(() => {
               this.$refs.BPRef.setTakeValue(params.customizedBoards[0]);
             }, 200);
           } */


          if (this.isTechnology) {
            const I = this.getStepsList.findIndex(v => _isEqual(v.value, "crafts"));
            this.current = I < 0 ? 1 : I;
          }


          if (this.isClient) {
            params.otherSupplier = _get(params, "customer.name") || this.GET_USER_INFO.nickName;
          }

          this.form = params;
        });
    },
    // 提交
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func =
            this.isPurchase ?
              this.isEdit ? updatePurchaseCustomizedApi : addedPurchaseCustomizedApi
              : this.isTechnology ? updateCraftProcessApi :
                (this.isSale ?
                  this.isEdit ? updateSaleProduceApi : addedSaleProduceApi
                  : this.isEdit ? updateProduceApi : addedProduceApi);

          const params = _deepCopy(this.form);

          if (_isEqual(this.type, "xlsx") || _isEqual(this.getCurrentValue, "type")) {
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
              uni.setStorageSync("TENP_ORDER_INFO", this.isGenerateSales ? null : _isObject(res.data) ? res.data : this.form);

              CustomToast({
                title: `${this.isEdit ? "编辑" : "新增"}成功`,
                success: () => {
                  if (this.isShare) {
                    uni.redirectTo({
                      url: PageEnums.saleClientAddedBack,
                      fail() {
                        uni.navigateBack();
                      },
                    });
                  } else {
                    uni.navigateBack({});
                  }
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

    // 下一步
    onNext() {
      if (this.current === this.getStepsList.length - 1 || this.isTechnology) {
        this.onSubmit();
      } else {
        if (this.isCustomized && this.isPerm("CNC_CUSTOMIZED_BOARD_CALCULATE")) {
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
      if (_isEqual(type, "quick")) {
        this.form = {...this.form, ..._pick(data, _keys(this.form))};
      }

      if (_isEqual(type, "craft")) {
        this.$set(this.form, "craftProcesses", _deepCopy(data.processDetails));
      }

      if (_isEqual(type, "table")) {
        try {
          this.customizedMaterials = _deepCopy(data.customTable);

          this.$set(this.form.customizedMaterials, "0", {
            sequence: 1,
            ...(_get(this.form, "customizedMaterials.0") || {}),
            customTable: _deepCopy(data.processDetails),
          });
        } catch (e) {
        }
        // this.$set(this.form, "craftProcesses", _deepCopy(data.processDetails));
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

    // 另存为快捷生产
    onSubmitTable() {
      this.$refs.FPRef.open("table", true, {customTable: this.customizedMaterials || ""});
    },

    // 选中客户回填电话及地址
    onSupplierId(val) {
      const node = this.$refs.UserRef.getUserInfo(val) || {};
      this.form.orderAddress = node.address;
      this.form.orderPhone = _get(node, "contacts.0.phone");
    },

    // 开启快捷生产
    onFast(type) {
      this.$refs.FPRef.open(type);
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

    // 计算总金额
    countTotalAmount() {
      setTimeout(() => {
        const P = _sum((_get(this.form, "productDetails") || []).map(v => (v.price || 0) * (v.productQuantity || 0)));
        const C = _sum((_get(this.form, "customizedBoards.0.result") || []).map(v => (v.price || 0) * (v.quantity || 0)));
        const M = this.customizedMoney || 0;
        this.pTotal = P;

        this.form.totalAmount = this.toYuan(P + C + M);
      }, 10);
    },

    // 获取绑定的客户
    getBindInfo() {
      getBindInfoApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.bindList = res.data?.map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));
          if (this.bindList.length) {
            this.clientType = 0;
            const one = _get(res.data, "0") || {};
            this.form.supplierId = one.id;
            this.form.orderPhone = _get(one, "contacts.0.phone");
            this.form.orderAddress = _get(one, "address");
          } else {
            this.clientType = 1;
          }
        });
    },

    // 切换生产类型
    onProduceTypeChange(evt) {
      this.form.produceType = evt.detail.value;
    },
  },
  computed: {
    getStartDate() {
      return +new Date();
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
      ]
        .flatMap(item => {
          // 从销售或者采购进入页面时
          if ((this.isSale || this.isPurchase) && ["crafts"].includes(item.value)) return [];

          if (_isEqual(this.type, "xlsx")) {
            if (_isEqual(item.value, "type")) item.label = "自定义工单";
            return [item];
          } else {
            return [item];
          }
        });
    },

    // 当前选中的页面地址
    getCurrentValue() {
      return _get(this.getStepsList, this.current + ".value");
    },

    // 销售/生产产品的描述
    productText() {
      if (this.isSale) return "产品";
      if (this.isPurchase) return "采购产品";
      return "生产产品";
    },
  },
  onUnload() {
    clearTimeout(this.TimeVM);
  },
};
</script>

<template>
  <view class="ko-work ko-basic-added-form" :key="VmKey">
    <!-- #ifdef MP -->
    <view v-if="isShareOrder" class="ko-work__header ko-basic-box-shadow">
      <view class="ko-work__header--name">{{ GET_SHOP_NAME }}</view>
      <text style="font-size: 10px; color: #e43d33;">请核对商户，如有误请切换商户后重新点击分享连接</text>
    </view>
    <!-- #endif -->

    <view class="ko-work__steps" v-if="getStepsList.length > 1 && !isTechnology">
      <UvSteps :current="current" :key="getStepsList.length">
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
    >
      <view style="padding: 10px;">
        <block v-if="isEqual(getCurrentValue, 'type')">
          <!-- 所需物料 -->
          <UniSection
            title="所需物料"
            type="line"
            v-if="isEqual(type, 'common')"
          >
            <view style="padding: 10px;">
              <uni-forms-item label-width="0" name="materialDetails">
                <view style="width: 100%;">
                  <PickerProduct
                    v-model="form.materialDetails"
                    :total.sync="form.totalRawMaterialAmount"
                    type="purchase"
                    is-work
                    hide-total-prices

                    is-show-recent
                    :supplier-id="form.supplierId"
                    :order-address="form.orderAddress"
                  />
                </view>
              </uni-forms-item>
            </view>

            <KoMovable
              :y-axis="-60"
              v-if="isPerm('QUICK_PRODUCE_LIST')"
              @click="onFast('quick')"
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

          <!-- 文件预览 -->
          <block v-if="isEqual(type, 'xlsx')">
            <CustomFiles
              v-model="customizedMaterials"
              :money.sync="customizedMoney"
              @update:money="countTotalAmount"
              ref="CTRef"
            />

            <!-- #ifdef H5 -->
            <KoMovable
              :y-axis="-60"
              v-if="isPerm('QUICK_TABLE_LIST')"
              @click="onFast('table')"
            >
              <view style="line-height: 1.3">
                <view style="font-size: 12px;">
                  快捷
                </view>
                <view style="font-size: 12px;">
                  模版
                </view>
              </view>
            </KoMovable>
            <!-- #endif -->
          </block>

          <!-- 板材定制 -->
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
          <view style="padding: 10px 0 0;">
            <view
              style="margin: 0 10px 10px;"
              v-if="(isPerm(isPurchase ? 'SUPPLIER_LIST' : 'CUSTOMER_LIST') && !isClient) && !isShare"
            >
              <uni-segmented-control
                :current.sync="clientType"
                :values="isPurchase ? ['供应商', '其它供应商'] : clientTabs"
                style-type="text"
                @clickItem="onTabItem"
              />
            </view>

            <block v-if="clientType === 0 && isPerm(isPurchase ? 'SUPPLIER_LIST' : 'CUSTOMER_LIST')">
              <uni-forms-item :label="`${isPurchase ? '供应商' : '客户'}：`" name="supplierId">
                <PickerUser
                  style="width: 100%;"
                  is-input
                  :title="`选择${isPurchase ? '供应商' : '客户'}`"
                  v-model="form.supplierId"
                  :type="isPurchase ? 'supplier' : 'client'"
                  ref="UserRef"
                  @input="onSupplierId"

                  :is-long-list="isClient"
                  :options="bindList"

                  :placeholder-label="GET_FUNC(form, 'customer.name')"
                />
              </uni-forms-item>
            </block>

            <block v-if="clientType === 1 || !isPerm(isPurchase ? 'SUPPLIER_LIST' : 'CUSTOMER_LIST')">
              <uni-forms-item label="姓名：" name="otherSupplier" key="otherSupplier">
                <UniEasyinput
                  v-model="form.otherSupplier"
                  style="width: 100%;"
                  placeholder="请输入"
                />
              </uni-forms-item>
            </block>
          </view>

          <block v-if="!isPurchase && !isSale">
            <uni-forms-item
              label="计划完成时间："
              name="planFinishDate"
              :rules="[{required: true, errorMessage: '请选择计划完成时间'}]"
            >
              <UniDatetimePicker
                v-model="form.planFinishDate"
                placeholder="请选择"
                type="date"
                :start="getStartDate"
              />
            </uni-forms-item>
          </block>

          <uni-forms-item label="联系电话：" name="orderPhone">
            <uni-easyinput v-model="form.orderPhone" placeholder="请输入" />
          </uni-forms-item>

          <uni-forms-item label="配送地址：" name="orderAddress" key="orderAddress">
            <view style="display: flex; align-items: center; width: 100%">
              <view style="flex: 1; width: 100%">
                <UniEasyinput v-model="form.orderAddress" placeholder="请输入地址" />
              </view>
              <block v-if="form.supplierId && isPerm(isPurchase ? 'SUPPLIER_ADDRESS_LIST' : 'CUSTOMER_ADDRESS_LIST')">
                <PickerAddress
                  :supplierId="form.supplierId"
                  v-model="form.orderAddress"
                  :type="isPurchase ? 'purchase' : 'sale'"
                  @input="form.orderAddress = $event"
                />
              </block>
            </view>
          </uni-forms-item>

          <block v-if="!isPurchase && isSale && !isEdit">
            <uni-forms-item
              label="是否需要生产："
              name="produceType"
            >
              <radio-group @change="onProduceTypeChange">
                <view style="display: flex; align-items: center;">
                  <label>
                    <radio
                      :checked="isEqual(form.produceType, 'internal')"
                      value="internal"
                      color="#4177f6"
                    >
                      是
                    </radio>
                  </label>
                  <view style="width: 20px"></view>
                  <label>
                    <radio
                      :checked="isEqual(form.produceType, 'customized')"
                      value="customized"
                      color="#4177f6"
                    >
                      否
                    </radio>
                  </label>
                </view>
              </radio-group>
            </uni-forms-item>
          </block>

          <UniSection
            :title="productText"
            type="line" v-if="['common', 'xlsx'].includes(type)"
          >
            <view style="padding: 10px;">
              <uni-forms-item label-width="0" name="productDetails">
                <view style="width: 100%;">
                  <PickerProduct
                    v-model="form.productDetails"
                    @update:total="countTotalAmount"
                    :type="isPurchase ? 'purchase' : 'sale'"
                    :is-work="isPurchase"
                    :total.sync="pTotal"
                    hide-total-prices

                    is-show-recent
                    :supplier-id="form.supplierId"
                    :order-address="form.orderAddress"
                  />
                </view>

              </uni-forms-item>
            </view>
          </UniSection>

          <UniSection title="总价" type="line">
            <block v-if="isEqual(type, 'packing')">
              <BinCount v-model="form.customizedBoards[0]" @change-total="countTotalAmount" />
            </block>

            <block v-if="isEqual(type, 'xlsx')">
              <view style="display: flex; align-items: center; padding-left: 20px;">
                <view style="margin-right: 50px;">
                  <label class="ko-basic-label">文件总额：</label>
                  <text class="ko-basic-money">¥ {{ toYuan(customizedMoney) }}</text>
                </view>
                <view>
                  <label class="ko-basic-label">产品总额：</label>
                  <text class="ko-basic-money">¥ {{ toYuan(pTotal) }}</text>
                </view>
              </view>
            </block>

            <view style="padding: 10px;">
              <uni-forms-item
                label-width="90px"
                :label="isPurchase ? '总价：' : '实收总价：'"
                name="totalAmount"
              >
                <view style="width: 100%;">
                  <uni-easyinput type="digit" v-model="form.totalAmount" placeholder="请输入" />
                </view>
              </uni-forms-item>
            </view>
          </UniSection>

          <UniSection v-if="!isPurchase" title="其它费用" type="line">
            <view style="padding: 10px;">
              <FeesList v-model="form.fees" is-form />
            </view>
          </UniSection>

          <UniSection title="其它信息" type="line">
            <view style="padding: 10px;">
              <uni-forms-item label-width="60px" label="备注：" name="remark" key="remark">
                <UniEasyinput v-model="form.remark" type="textarea" placeholder="备注(选填)" />
              </uni-forms-item>
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
          v-if="isEqual(getCurrentValue, 'crafts') && isPerm('QUICK_CRAFT_ADD')"
          @click.stop="onSubmitCraft"
        >
          存为快捷工艺
        </button>
        <button
          class="ko-basic-button__card"
          v-if="isEqual(getCurrentValue, 'type') && isEqual(type, 'common') && isPerm('QUICK_PRODUCE_LIST')"
          @click.stop="onSubmitQuick"
        >
          存为快捷生产
        </button>
        <!-- #ifdef H5 -->
        <button
          class="ko-basic-button__card"
          v-if="isEqual(getCurrentValue, 'type') && isEqual(type, 'xlsx') && isPerm('QUICK_TABLE_ADD')"
          @click.stop="onSubmitTable"
        >
          存为快捷模版
        </button>
        <!-- #endif -->
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

<style lang="scss">
.ko-work {
  padding-bottom: calc(env(safe-area-inset-bottom) + 60px);

  &__header {
    padding: 10px;
    margin-bottom: 10px;
    text-align: center;

    &--name {
      font-weight: bold;
      font-size: 16px;
    }

  }

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
