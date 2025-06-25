<script>
import { addedBusinessesApi, getBusinessesListApi, getBusinessesQRCodeApi, updateBusinessNameApi } from "@/api/admin";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import mixins from "@/mixins/mixins";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import KoMovable from "@/components/Movable/index.vue";
import KoList from "@/components/List/List.vue";
import { businessClassifyApi } from "@/api/user";
import KoPicker from "@/components/KoPicker.vue";

export default {
  name: "Merchants",
  mixins: [mixins],
  components: {
    KoList,
    KoMovable,
    UniCol,
    UniRow,
    UvAvatar,
    FilePicker,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    LoadMore,
    BasicCard,
    KoPicker,
  },
  data() {
    return {
      loading: false,
      list: [],

      queryList: {
        pageSize: 20,
        pageNum: 0,
      },
      noMore: false,

      visible: false,
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "请输入商户名称",
            },
            {
              required: true,
              format: "string",
              validateFunction(r, v, d, c) {
                const regex = /^[a-z]{5,20}$/;
                if (!regex.test(v)) {
                  return c("商户名称必须是全小英文字母，不得少于5个字符、大于20个字符");
                }
                return true;
              },
            },
          ],
          validateTrigger: "submit",
        },
      },
      form: {
        name: "",
        logo: "",
        remark: "",
        classifyId: "",
      },

      sLoading: false,

      showCode: false,

      qrCode: "",

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "商户Logo",
          prop: "logo",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: this.getImageUrl(_get(row, "logo")),
                  size: 38,
                  text: _get(row, "name"),
                  shape: "square",
                },
              })],
            );
          },
        },
        {
          label: "商户名称",
          prop: "name",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          slot: "operate",
        },
      ],
      // #endif

      isEdit: false,
      classifyList: [],
    };
  },
  mounted() {
    this.getList(true);

    this.getClassifyList();

    // #ifdef MP
    this.$refs.FormRef.setRules(this.rules);
    // #endif
  },
  methods: {
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }
      this.loading = true;
      getBusinessesListApi(this.queryList)
        .then((res) => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onTrigger(item) {
      this.visible = true;
      this.isEdit = false;
      this.form = _deepCopy(this.$options.data().form);

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif

      if (item) {
        this.form = _deepCopy(item);
        this.isEdit = true;
      }
    },

    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          let params = _deepCopy(this.form);

          const Func = this.isEdit ? updateBusinessNameApi : addedBusinessesApi;

          if (this.isEdit) {
            // params = _pick(params, ["logo", "remark", "id"]);
          }

          this.sLoading = true;

          Func({...params})
            .then(() => {
              uni.showToast({
                title: this.isEdit ? "修改成功" : "开户成功",
              });
              this.getList(true);
              this.visible = false;
            })
            .finally(() => {
              this.sLoading = false;
            });
        } else {
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
    },

    generateCode(item) {
      this.$set(item, "__qrcode_loading__", true);
      this.qrCode = "";
      getBusinessesQRCodeApi({businessName: item.name})
        .then(res => {
          this.showCode = true;
          this.qrCode = res.data;
        })
        .finally(() => {
          this.$set(item, "__qrcode_loading__", false);
        });
    },

    onJump(item) {
      uni.navigateTo({url: `/admin/admin/member?id=${item.id}&businessName=${item.name}`});
    },

    getClassifyList() {
      businessClassifyApi({pageNum: 0, pageSize: 100})
        .then((res) => {
          this.classifyList = res.data;
        });
    },
  },
};
</script>

<template>
  <view class="ko-admin">

    <!-- #ifdef MP -->
    <view style="height: 100%;">
      <KoList
        :data="list"
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        @load-next="RequestNextPage"
        @lower="RequestNextPage"
      >
        <view style="padding: 5px 10px;" v-for="item of list" :key="item.id">
          <BasicCard>
            <view class="ko-admin__item">
              <view class="ko-admin__item--info">
                <UvAvatar
                  class="ko-admin__item--info--image ko-basic-box-shadow"
                  :src="getImageUrl(item.logo)"
                  :text="item.name"
                  :size="72"
                  random-bg-color
                />

                <view style="padding-left: 16px; flex: 1;" @click="onJump(item)">
                  <UniRow :gutter="10">
                    <UniCol :span="24">
                      <view class="ko-admin__item--info--name">
                        <label class="ko-basic-label">名称：</label>
                        <text>{{ item.name || "-" }}</text>
                      </view>
                    </UniCol>
                    <UniCol :span="24">
                      <view>
                        <label class="ko-basic-label">备注：</label>
                        {{ item.remark || "-" }}
                      </view>
                    </UniCol>
                  </UniRow>
                </view>
              </view>

              <view
                style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
              >
                <button
                  class="ko-basic-button__card"
                  @click.stop="onTrigger(item)"
                >
                  编辑
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="generateCode(item)"
                  :loading="item.__qrcode_loading__"
                  :disabled="item.__qrcode_loading__"
                >
                  查看商户码
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
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJump"
        @load-next="RequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              class="ko-basic-button__card"
              @click.stop="onTrigger(item)"
            >
              编辑
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="generateCode(item)"
              :loading="item.__qrcode_loading__"
              :disabled="item.__qrcode_loading__"
            >
              查看商户码
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable @click="onTrigger('')" />

    <BasicPopup :visible.sync="visible">
      <view class="ko-admin__popup">
        <UniForms
          label-width="100px"
          ref="FormRef"
          :rules="rules"
          :model="form"
          label-align="right"
        >
          <UniFormsItem name="logo" label="Logo：">
            <view style="width: 100%;">
              <FilePicker
                v-model="form.logo"
                :image-styles="{border: {radius: '6px'}, width: 120, height: 120}"
              />
            </view>
          </UniFormsItem>
          <UniFormsItem label="名称：" name="name" required>
            <uv-input
              style="width: 100%;"
              placeholder="请输入"
              v-model.trim="form.name"
              :disabled="isEdit"
            />
          </UniFormsItem>
          <UniFormsItem label="备注：" name="remark">
            <uv-input
              style="width: 100%;"
              placeholder="请输入"
              v-model="form.remark"
            />
          </UniFormsItem>

          <UniFormsItem label="分类：" name="classifyId">
            <view style="width: 100%;">
              <KoPicker
                v-model="form.classifyId"
                placeholder="请选择"
                :options="classifyList"
                label-key="classifyName"
                value-key="id"
              />
            </view>
          </UniFormsItem>
        </UniForms>
      </view>

      <template #footer>
        <view style="display: flex; align-items: center; justify-content: center;">
          <button
            class="ko-basic-button__card"
            style="width: 120px;"
            @click="onSubmit"
            :loading="sLoading"
            :disabled="sLoading"
          >
            {{ isEdit ? "提交" : "确定开户" }}
          </button>
        </view>
      </template>
    </BasicPopup>

    <BasicPopup :visible.sync="showCode">
      <view class="ko-admin__popup">
        <view class="ko-admin__popup--qrcode" v-if="qrCode">
          <image
            class="ko-admin__popup--qrcode--image"
            :src="getImageUrl(qrCode)"
            mode="aspectFill"
            show-menu-by-longpress
            lazy-load
          />
        </view>

        <button
          class="ko-basic-button"
          style="margin: 0 40px 10px;"
          @click="showCode = false"
          v-if="false"
        >
          关闭
        </button>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-admin {
  // #ifdef MP
  height: 100%;
  //padding-bottom: 80px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 56px);
  // #endif

  &__item {
    &--info {
      display: flex;
      align-items: center;

      &--image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }

      &--name {
        text {
          font-size: 18px;
        }
      }
    }
  }

  &__popup {
    // #ifdef MP
    width: 98vw;
    // #endif
    padding: 16px;
    background: #fff;
    border-radius: 8px;

    &--qrcode {
      // #ifdef MP
      width: calc(98vw - 16px * 2);
      height: calc(98vw - 16px * 2);
      // #endif
      margin-bottom: 10px;

      &--image {
        height: 100%;
        width: 100%;
      }
    }
  }

  // #ifdef H5
  &__popup {
    width: 600px;

    &--qrcode {
      width: calc(600px - 16px * 2);
      height: calc(600px - 16px * 2);
    }

  }

  // #endif
}
</style>
