<script>
// #ifdef H5
import KoTable from "@/erp/components/KoTable/KoTable.vue";
// #endif
import UvCountTo from "../components/uv-count-to/uv-count-to.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { _deepCopy, _get, _isEmpty, _isEqual } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { addedCostApi, getCategoryListApi, getCostListApi, statisticsCostApi, updateCostApi } from "@/api/erp/finance";
import mixins from "@/mixins/mixins";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { deleteProductClassApi } from "@/api/erp/product";
import FilePicker from "@/components/FilePicker/FilePicker.vue";

import dayjs from "@/utils/dayjs";
import PickerUser from "@/components/PickerUser/PickerUser.vue";

import ClassifyList from "../classify.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";

export default {
  name: "ViewVersion",
  components: {
    KoList,
    KoMovable,
    // #ifdef H5
    KoTable,
    // #endif
    PickerUser,
    FilePicker,
    UniEasyinput,
    BasicPopup,
    UniFormsItem,
    UniForms,
    UvAvatar,
    LoadMore,
    UniSegmentedControl,
    BasicCard,
    UniCol,
    UniRow,
    UvCountTo,
    ClassifyList,
  },
  mixins: [mixins],
  data() {
    const _this = this;

    return {
      categoryList: [],
      current: 0,
      loading: false,
      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },

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

      noMore: false,

      costList: [],

      visibleClassify: false,


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
                 size: 42,
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

      tableKey: +new Date(),
    };
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    onJump() {
      if (this) {
        this.visibleClassify = true;

        return false;
      }

      uni.navigateTo({
        url: "/erp/finance/classify",
      });
    },

    // 获取分类
    getCategoryList() {
      return getCategoryListApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.categoryList = [
            ...res.data?.map(item => ({
              text: item.name,
              value: item.id,
            })),
          ];

          return res.data;
        });
    },

    async getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date().getTime();
      }

      if (_isEmpty(this.categoryList)) {
        await this.getCategoryList();
      }

      this.getCost();

      this.loading = true;

      // #ifdef H5
      const top = _deepCopy(this.$refs.WrapRef.scrollTop);
      // #endif

      getCostListApi({...this.queryList, classId: this.getClassId})
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;

          // #ifdef H5
          this.$nextTick(() => {
            this.$refs.WrapRef.scrollTop = top;
          });
          // #endif
        });
    },

    getCost() {
      if (this.isPerm("COST_STATISTICS")) {
        return statisticsCostApi({
          startTime: dayjs().subtract(1, "M").format("YYYY-MM-DD HH:mm:ss"),
          endTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        })
          .then(res => {
            this.costList = res.data.map(v => ({
              ...v,
              // #ifdef H5
              span: 6,
              // #endif
            }));
          });
      }
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

              this.getList(true);
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
                this.getList(true);
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

    async onClose() {
      await this.getCategoryList();
      await this.getList(true);
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
  <!-- #ifdef H5 -->
  <view
    class="ko-cost"
    v-infinite-scroll="onRequestNextPage"
    infinite-scroll-immediate
    :infinite-scroll-delay="200"
    :infinite-scroll-disabled="noMore"
    :infinite-scroll-distance="200"
    ref="WrapRef"
  >
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="ko-cost">
      <!-- #endif -->
      <view class="ko-basic-count__wrap" v-if="isPerm('COST_STATISTICS')">
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
            @clickItem="getList(true)"
          />
        </view>
        <button @click="onJump">
          <i style="font-size: 20px;" class="iconfont icon-fenjifenleiguanli" />
        </button>
      </view>

      <view class="ko-cost__row">
        <!-- #ifdef MP -->
        <view>
          <KoList :loading="loading" :no-data="!list.length" :no-more="noMore">
            <view style="padding: 5px 10px;" v-for="item of list" :key="item.id">
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
                  <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onEdit(item)"
                      v-if="isPerm('COST_UPDATE')"
                    >
                      修改
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onRemove(item)"
                      v-if="isPerm('COST_DELETE')"
                    >
                      删除
                    </button>
                  </view>
                </view>
              </BasicCard>
            </view>
          </KoList>
        </view>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px; height: 100%; overflow: hidden;">
          <KoTable
            :loading="loading"
            :columns="getColumns"
            :data="list"
            empty-text="暂无数据"
            stripe
            @next-load="onRequestNextPage"
            no-more
          >
            <template #operate="{item}">
              <view style="display: flex; align-items: center; justify-content: center;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onEdit(item)"
                  v-if="isPerm('COST_UPDATE')"
                >
                  修改
                </button>
                <button
                  v-if="isPerm('COST_DELETE')"
                  class="ko-basic-button__card"
                  @click.stop="onRemove(item)"
                >
                  删除
                </button>
              </view>
            </template>
          </KoTable>
        </view>
        <!-- #endif -->
      </view>

      <KoMovable
        v-if="isPerm('COST_ADD')"
        @click="onAdded('')"
      />

      <BasicPopup :visible.sync="visibleClassify" @close="onClose">
        <view class="ko-cost__class-props">
          <ClassifyList />
        </view>
      </BasicPopup>

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
              v-if="getClassId === 'freight'"
              label="物流商："
              required
              name="personId"
              :rules="[{required: true, errorMessage: '请选择物流商'}]"
            >
              <view style="width: 100%;">
                <block v-if="isPerm('LOGISTICS_LIST')">
                  <PickerUser
                    style="width: 100%;"
                    v-model="form.personId"
                    is-input
                    type="logistics"
                    placeholder="请选择物流商"
                  />
                </block>

                <view v-if="!isPerm('LOGISTICS_LIST')" style="font-size: 10px;color: #e43d33; margin-top: 5px;">
                  您没有获取物流信息权限，请联系管理员授权。
                </view>
              </view>
            </UniFormsItem>
            <UniFormsItem
              v-if="getClassId === 'wages'"
              label="员工："
              required
              name="personId"
              :rules="[{required: true, errorMessage: '请选择员工'}]"
            >
              <view style="width: 100%">
                <block v-if="isPerm('STAFF_LIST')">
                  <PickerUser
                    style="width: 100%;"
                    v-model="form.personId"
                    is-input
                    type="staff"
                    placeholder="请选择员工"
                  />
                </block>
                <view v-if="!isPerm('STAFF_LIST')" style="font-size: 10px;color: #e43d33; margin-top: 5px;">
                  您没有获取员工信息权限，请联系管理员授权。
                </view>
              </view>

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
          <view style="display: flex;align-items: center;justify-content: center;">
            <button class="ko-basic-button__card" style="width: 120px;" @click="onSubmit">保存</button>
          </view>
        </template>
      </BasicPopup>
      <!-- #ifdef H5 -->
    </view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
  </view>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-cost {
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 30px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 56px - 60px - 10px);
  overflow-y: auto;
  // #endif

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

      ::v-deep .uni-select__input-text {
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

  &__popup {
    // #ifdef MP
    width: 90vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  &__class-props {
    // #ifdef MP
    width: 98vw;
    height: 80vh;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
