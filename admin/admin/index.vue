<script>
import { addedBusinessesApi, getBusinessesListApi, getBusinessesQRCodeApi } from "@/api/admin";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import Basic from "@/mixins/mixins";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import KoMovable from "@/components/Movable/index.vue";
import KoList from "@/components/List/List.vue";

export default {
  name: "Admin",
  mixins: [Basic],
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
    UniFab,
    LoadMore,
    BasicCard,
    UniListItem,
    UniList,
  },
  data() {
    return {
      loading: false,
      list: [],

      queryList: {
        pageSize: 30,
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
                  size: 64,
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

      tableKey: +new Date(),
    };
  },
  onShow() {
  },
  onLoad() {
    this.getList();
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
        this.tableKey = +new Date();
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

    onTrigger() {
      this.visible = true;
      this.form = _deepCopy(this.$options.data().form);
      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const params = _deepCopy(this.form);

          this.sLoading = true;

          addedBusinessesApi({...params})
            .then(() => {
              uni.showToast({
                title: "开户成功",
              });
              this.getList(true);
              this.visible = false;
            })
            .finally(() => {
              this.sLoading = false;
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
  },
};
</script>

<template>
  <view class="ko-admin">
    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
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
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJump"
        @next-load="RequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item}">
          <view style="display: flex; align-items: center; justify-content: center;">
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

    <KoMovable
      @click="onTrigger('')"
    />

    <BasicPopup :visible.sync="visible">
      <view class="ko-admin__popup">
        <UniForms
          label-width="100px"
          ref="FormRef"
          :rules="rules"
          :model="form"
        >
          <UniFormsItem name="logo" label="Logo：">
            <view style="width: 100%; display: flex; justify-content: center; align-items: center;">
              <FilePicker
                v-model="form.logo"
                :image-styles="{border: {radius: '6px'}, width: 180, height: 180}"
              />
            </view>
          </UniFormsItem>
          <UniFormsItem label="商户名称：" name="name" required>
            <UniEasyinput
              style="width: 100%;"
              placeholder="请输入"
              v-model.trim="form.name"
            />
          </UniFormsItem>
          <view style="height: 8px;"></view>
          <UniFormsItem label="备注：" name="remark">
            <UniEasyinput
              style="width: 100%;"
              placeholder="请输入"
              v-model="form.remark"
              type="textarea"
            />
          </UniFormsItem>

        </UniForms>

        <button
          class="ko-basic-button"
          style="margin: 0 40px 10px;"
          @click="onSubmit"
          :loading="sLoading"
          :disabled="sLoading"
        >
          确定开户
        </button>
      </view>
    </BasicPopup>

    <BasicPopup :visible.sync="showCode">
      <view class="ko-admin__popup">
        <view class="ko-admin__popup--qrcode" v-if="qrCode">
          <image
            class="ko-admin__popup--qrcode--image"
            :src="getImageUrl(qrCode)"
            mode="aspectFill"
            show-menu-by-longpress
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
  padding-bottom: 80px;
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
