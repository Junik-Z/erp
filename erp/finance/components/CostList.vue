<script>
import QiunDataCharts from "@/erp/components/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { _deepCopy, _get, _isEmpty, _isEqual } from "@/utils";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { addedCostApi, getCategoryListApi, getCostListApi, statisticsCostApi, updateCostApi } from "@/api/erp/finance";
import UniDataSelect from "@/erp/components/uni-data-select/components/uni-data-select/uni-data-select.vue";
import mixins from "@/mixins/mixins";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { deleteProductClassApi } from "@/api/erp/product";
import FilePicker from "@/components/FilePicker/FilePicker.vue";

import dayjs from "@/utils/dayjs";
import PickerUser from "@/components/PickerUser/PickerUser.vue";

export default {
  name: "ViewVersion",
  components: {
    PickerUser,
    FilePicker,
    UniEasyinput,
    BasicPopup,
    UniFormsItem,
    UniForms,
    UniFab,
    UvAvatar,
    UniDataSelect,
    KoTable,
    LoadMore,
    UniSegmentedControl,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
    QiunDataCharts,
    UvCountTo,
  },
  mixins: [mixins],
  data() {
    const _this = this;

    return {
      categoryList: [],
      current: 0,
      loading: false,
      list: [],

      queryList: {},

      visible: false,

      form: {
        name: "",
        totalAmount: "",
        voucher: "",
        remark: "",
        personId: "", // 人员ID
      },
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "请填写款项名称",
            },
          ],
          validateTrigger: "submit",
        },
      },
      isEdit: false,

      costList: [],


      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "凭证",
          prop: "voucher",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "customer.logo")),
                  size: 64,
                  shape: "square",
                  text: _get(row, "customer.name") || _this.GET_SHOP_NAME,
                },
              })],
            );
          },
        },
        {
          label: "款项名称",
          prop: "name",
        },
        {
          label: "总金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 260,
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  methods: {
    onJump() {
      uni.navigateTo({
        url: "/erp/finance/classify",
      });
    },

    // 获取分类
    getCategoryList() {
      return getCategoryListApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.categoryList = [
            ...res.data?.map(item => ({text: item.name, value: item.id})),
          ];

          console.log(res.data);

          return res.data;
        });
    },

    async getList() {
      if (_isEmpty(this.categoryList)) {
        await this.getCategoryList();
      }

      this.getCost();

      this.loading = true;

      getCostListApi({...this.queryList, classId: this.getClassId})
        .then(res => {
          console.log(res.data);
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getCost() {
      statisticsCostApi({
        startTime: dayjs().subtract(1, "M").format("YYYY-MM-DD HH:mm:ss"),
        endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
        .then(res => {
          this.costList = res.data;
          console.log(res.data);
        });
    },

    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const EVENT = this.isEdit ? updateCostApi : addedCostApi;

          const params = _deepCopy(this.form);
          params.totalAmount = this.toFen(params.totalAmount);
          params.classId = params.classId || this.getClassId;

          EVENT(params)
            .then(() => {
              uni.showToast({
                title: `${this.isEdit ? "修改" : "新增"}成功`,
              });
              this.visible = false;

              this.getList();
            });
        } else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },

    onAdded() {
      this.visible = true;
      this.isEdit = false;
      this.$nextTick(() => {
        // #ifdef MP
        this.$refs.FormRef.clearValidate();
        // #endif
        this.form = _deepCopy(this.$options.data().form);
      });
    },
    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 款项吗？`,
        success: (res) => {
          if (res.confirm) {
            deleteProductClassApi(node)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              });
          }
        },
      });
    },
    onEdit(row) {
      const node = _deepCopy(row);
      node.totalAmount = this.toYuan(node.totalAmount);
      this.isEdit = true;
      this.visible = true;
      this.$nextTick(() => {
        // #ifdef MP
        this.$refs.FormRef.clearValidate();
        // #endif
        this.form = {...node};
      });

    },
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif

    getClassId() {
      return _get(this.categoryList, `${this.current}.value`);
    },
  },
};
</script>

<template>
  <view class="ko-cost">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item) of costList" :key="item.id" :span="item.span || 12">
          <view class="ko-basic-count">
            <view class="ko-basic-count__label">{{ item.name }}</view>
            <view class="ko-basic-count__info">
              <UvCountTo
                :start-val="0"
                :end-val="toYuan(item.amount)"
                color="#2979ff"
                separator=","
                bold
              />
              <text class="ko-basic-count__info--unit">元</text>
            </view>
          </view>
        </UniCol>
      </UniRow>
    </view>

    <view class="ko-cost__class">
      <view class="ko-cost__class--wrap">
        <UniSegmentedControl
          style-type="text"
          :values="categoryList"
          label-key="text"
          :current.sync="current"
          @clickItem="getList()"
        />
      </view>
      <button @click="onJump" v-if="isPerm('Finance_Write')">
        <i style="font-size: 20px;" class="iconfont icon-fenjifenleiguanli" />
      </button>
    </view>

    <view class="ko-cost__row">
      <UniList>
        <!-- #ifdef MP -->
        <UniListItem v-for="item of list" :key="item.id">
          <template #body>
            <BasicCard>
              <view class="ko-cost__info">
                <UniRow :gutter="10">
                  <UniCol :span="24" v-if="item.voucher">
                    <image class="ko-cost__voucher" mode="aspectFill" :src="getImageUrl(item.voucher)" />
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">款项名称：</label>
                    <text>{{ item.name }}</text>
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">金额：</label>
                    <text class="ko-basic-money"> {{ toYuan(item.totalAmount) }}元</text>
                  </UniCol>
                  <UniCol :span="24">
                    <label class="ko-basic-label">备注：</label>
                    <text>{{ item.remark || "-" }}</text>
                  </UniCol>
                </UniRow>
                <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
                      v-if="isPerm('Finance_Write')">
                  <button class="ko-basic-button__card" @click.stop="onEdit(item)">修改</button>
                  <button class="ko-basic-button__card" @click.stop="onRemove(item)">删除</button>
                </view>
              </view>
            </BasicCard>
          </template>
        </UniListItem>
        <LoadMore :loading="loading" />
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px;">
          <KoTable
            :loading="loading"
            :columns="getColumns"
            :data="list"
            empty-text="暂无数据"
            stripe
          >
            <template #operate="{item}">
              <view style="display: flex; align-items: center; justify-content: center;"
                    v-if="isPerm('Finance_Write')">
                <button class="ko-basic-button__card" @click.stop="onEdit(item)">修改</button>
                <button class="ko-basic-button__card" @click.stop="onRemove(item)">删除</button>
              </view>
            </template>
          </KoTable>
        </view>
        <!-- #endif -->
      </UniList>
    </view>

    <UniFab
      v-if="isPerm('Finance_Write')"
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      direction="vertical"
      @fab-click="onAdded()"
    />

    <BasicPopup :visible.sync="visible">
      <view class="ko-cost__popup">
        <UniForms
          ref="FormRef"
          label-width="100px"
          :model="form"
          :rules="rules"
          label-align="right"
        >
          <UniFormsItem label="款项名称：" required name="name">
            <UniEasyinput v-model="form.name" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="金额：" required name="totalAmount">
            <UniEasyinput type="digit" v-model="form.totalAmount" placeholder="请输入" />
            <text style="margin-left: 10px;">元</text>
          </UniFormsItem>
          <UniFormsItem
            v-if="getClassId === 'freight'" label="物流商："
            required
            name="personId"
            :rules="[{required: true, errorMessage: '请选择物流商'}]"
          >
            <PickerUser
              style="width: 100%;"
              v-model="form.personId"
              is-input
              type="logistics"
              placeholder="请选择物流商"
            />
          </UniFormsItem>
          <UniFormsItem label="凭证：" name="voucher">
            <FilePicker v-model="form.voucher" />
          </UniFormsItem>
          <UniFormsItem label="备注：">
            <UniEasyinput type="textarea" v-model="form.remark" placeholder="请输入" />
          </UniFormsItem>
        </UniForms>
      </view>
      <template #footer>
        <button class="ko-basic-button" style="margin: 0 40px 10px;" @click="onSubmit">保存</button>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-cost {
  margin-top: 10px;

  &__class {
    display: flex;
    align-items: center;
    padding: 10px;
    height: 60px;

    border-bottom: .5px solid $uni-border-3;

    &--wrap {
      padding: 0 10px;
      flex: 1;
      overflow: hidden;

      /* #ifdef H5 */
      width: 1366px;
      margin: 0 auto;
      flex: none;
      /* #endif */

      /deep/ .uni-select__input-text {
        text-align: center !important;
      }
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: $uni-shadow-base;
    padding: 10px 0;
  }

  &__row {
    margin-top: 16px;
  }

  &__voucher {
    height: 120px;
    width: 100%;
  }

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }

  .ko-basic-button__card {
    margin: 5px;
  }

  &__popup {
    // #ifdef MP
    width: 90vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
