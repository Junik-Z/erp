<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import { addedCategoryApi, getCategoryListApi, removeCategoryApi, updateCategoryApi } from "@/api/erp/finance";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import { _deepCopy, _get, _isEqual } from "@/utils";

export default {
  name: "classify",
  components: {
    KoTable,
    LoadMore,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    UniFab,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
  },
  data() {
    const _this = this;
    return {
      visible: false,
      loading: false,
      list: [],

      isEdit: false,

      form: {
        name: "",
        description: "",
      },
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "请填写分类名称",
            },
          ],
          validateTrigger: "submit",
        },
      },

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "客户Logo",
          prop: "logo",
          width: 100,
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {props: {src: _this.getImageUrl(row.logo), size: 64}})],
            );
          },
        },
        {
          label: "昵称",
          prop: "name",
        },
        {
          label: "联系电话",
          prop: "phone",
        },
        {
          label: "地址",
          prop: "address",
        },
        {
          label: "发票抬头",
          prop: "invoiceTitle",
        },
        {
          label: "纳税人识别号",
          prop: "taxNumber",
        },
        {
          label: "开票类型",
          prop: "invoiceType",
        },
        {
          label: "税率",
          prop: "taxRate",
        },
        {
          label: "开户行",
          prop: "bank",
        },
        {
          label: "银行账号",
          prop: "bankAccount",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 260,
          render(h, {row}) {
            return h("div", [
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onUnbind.bind(_this, row)},
                },
                "解绑微信",
              ),
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onJump.bind(_this, row)},
                }
                , "修改"),
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onRemove.bind(_this, row)},
                }
                , "删除"),
            ]);
          },
        },
      ],
      // #endif
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getCategoryListApi()
        .then(res => {
          console.log(res.data);
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onSubmit() {
      this.$refs.FormRef.validate(valid => {
        if (!valid) {
          const EVENT = this.isEdit ? updateCategoryApi : addedCategoryApi;

          EVENT(this.form)
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
        this.$refs.FormRef.clearValidate();
        this.form = _deepCopy(this.$options.data().form);
      });
    },
    onRemove(row) {
      const node = _deepCopy(row);
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 分类吗？`,
        success: (res) => {
          if (res.confirm) {
            removeCategoryApi(node)
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
      this.isEdit = true;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
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
  },
};
</script>

<template>
  <view class="ko-classify">
    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <BasicCard>
            <view class="ko-classify__info">
              <view class="ko-classify__info--name">{{ item.name }}</view>
              <UniRow>
                <UniCol :span="24">
                  <label class="ko-basic-label">备注：</label>
                  <text>{{ item.description }}</text>
                </UniCol>
              </UniRow>
              <view style="display: flex; align-items: center; justify-content: flex-end;">
                <button class="ko-basic-button__card" @click.stop="onEdit(item)">编辑</button>
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
        />
      </view>
      <!-- #endif -->
    </UniList>

    <UniFab
      horizontal="right"
      direction="vertical"
      @fabClick="onAdded()"
    />

    <BasicPopup :visible.sync="visible">
      <view class="ko-classify__popup">
        <UniForms ref="FormRef" label-width="100px" :model="form" :rules="rules">
          <UniFormsItem label="分类名称：" required name="name">
            <UniEasyinput v-model="form.name" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="备注：" name="description">
            <UniEasyinput placeholder="请输入" type="textarea" v-model="form.description" />
          </UniFormsItem>
        </UniForms>
      </view>
      <template #footer>
        <button class="ko-basic-button" style="margin: 0 40px 10px;" @click.stop="onSubmit()">保存</button>
      </template>
    </BasicPopup>

  </view>
</template>

<style scoped lang="scss">
.ko-classify {
  width: 100%;

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
      //text-align: center;
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
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }

  .ko-basic-button__card {
    margin: 5px;
  }
}
</style>
