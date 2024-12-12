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
import { _deepCopy } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";

export default {
  name: "Admin",
  mixins: [Basic],
  components: {
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
  data: () => ({
    pattern: {
      color: "#7A7E83",
      backgroundColor: "#fff",
      selectedColor: "#007AFF",
      buttonColor: "#007AFF",
      iconColor: "#fff",
    },
    loading: false,
    list: [],

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
  }),
  onShow() {
  },
  onLoad() {
    this.getList();
    this.$refs.FormRef.setRules(this.rules);
  },
  methods: {
    getList() {
      this.loading = true;
      getBusinessesListApi()
        .then((res) => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onTrigger() {
      this.visible = true;
      this.form = _deepCopy(this.$options.data().form);
      this.$refs.FormRef.clearValidate();
    },

    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const params = _deepCopy(this.form);

          this.sLoading = true;

          addedBusinessesApi(params)
            .then(() => {
              uni.showToast({
                title: "开户成功",
              });
              this.getList();
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
    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <BasicCard @click="onJump(item)">
            <view class="ko-admin__item">
              <view class="ko-admin__item--info">
                <UvAvatar
                  class="ko-admin__item--info--image ko-basic-box-shadow"
                  :src="getImageUrl(item.logo)"
                  :text="item.name"
                  :size="72"
                  random-bg-color
                />

                <view style="padding-left: 16px; flex: 1;">
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
                        {{ item.remark || '-' }}
                      </view>
                    </UniCol>
                  </UniRow>
                </view>
              </view>

              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
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
        </template>
      </UniListItem>

      <LoadMore :loading="loading" />
    </UniList>

    <UniFab
      ref="FabRef"
      :pattern="pattern"
      horizontal="right"
      direction="vertical"
      @fab-click="onTrigger"
    />

    <BasicPopup :visible.sync="visible">
      <view class="ko-admin__popup">
        <UniForms
          label-width="100px"
          ref="FormRef"
          :rules="rules"
          :model="form"
        >
          <UniFormsItem name="logo" label-width="0">
            <view style="width: 100%; display: flex; justify-content: center; align-items: center;">
              <FilePicker
                v-model="form.logo"
                :image-styles="{border: {radius: '50%'}, width: 180, height: 180}"
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
    width: 98vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;

    &--qrcode {
      width: calc(98vw - 16px * 2);
      height: calc(98vw - 16px * 2);
      margin-bottom: 10px;

      &--image {
        height: 100%;
        width: 100%;
      }
    }
  }
}
</style>
