<script>
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy } from "@/utils";
import { updateMyInfoApi, uploadBase64Api } from "@/api/user";
import { getImageBase64 } from "@/utils/processingFiles";
import LongPressButton from "@/components/LongPressButton/LongPressButton.vue";

export default {
  name: "user",
  components: {LongPressButton, UniEasyinput, UniFormsItem, UniForms, BasicPopup, UvAvatar},
  mixins: [mixins],
  data() {
    return {
      visible: false,

      form: {
        nickName: "",
        avatar: "",
      },

      loading: false,
      logoutLoading: false,
    };
  },
  onLoad() {
    this.form = _deepCopy(this.GET_USER_INFO) || _deepCopy(this.$options.data().form);
    uni.$on("$__update_user_info__", (data) => {
      this.form = _deepCopy(data);
    });
  },
  methods: {
    onUpdateInfo() {
      this.form = _deepCopy(this.GET_USER_INFO);
      this.visible = true;
    },
    getAvatarUrl(event) {
      const {avatarUrl} = event.detail;

      if (avatarUrl) {
        getImageBase64(avatarUrl)
          .then((data) => {
            this.$set(this.form, "avatar", data);
          });
      }
    },
    onNickName(event) {
      event && this.$set(this.form, "nickName", event?.detail?.value);
    },
    async onSubmit() {
      this.loading = true;
      const params = _deepCopy(this.form);

      if (params?.avatar?.startsWith?.("data:image/png;base64,")) {
        //保存文件
        params.avatar = await uploadBase64Api({base64: params.avatar}).then(res => res.data);
      }

      await updateMyInfoApi(params)
        .then(async () => {
          uni.showToast({title: "信息更新成功"});
          uni.$emit("$__get_all_info__");
          this.visible = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onClickLogout(isScene) {
      this.logoutLoading = true;
      this.onLogout({}, isScene).finally(() => (this.logoutLoading = false));
    },
  },
};
</script>

<template>
  <view class="ko-user">
    <view class="ko-user__info" @click="onUpdateInfo">
      <UvAvatar
        :key="GET_USER_INFO.avatar"
        :size="120"
        :src="getImageUrl(GET_USER_INFO.avatar)"
        :text="GET_USER_INFO.nickName || GET_SHOP_NAME"
        random-bg-color
      />
      <view class="ko-user__info--name">
        {{ GET_USER_INFO.nickName || "-" }}

        <button class="ko-basic-button__card" @click="onUpdateInfo">
          <i class="iconfont icon-shuaxin"></i>
        </button>

      </view>
    </view>

    <view class="ko-user__logout">
      <LongPressButton
        label="重新登录"
        :loading="logoutLoading"
        @click="onClickLogout(false)"
        @long="onClickLogout(true)"
      />
    </view>

    <BasicPopup :visible.sync="visible">
      <view class="ko-user__popup">
        <UniForms label-width="70px" label-align="right">
          <UniFormsItem label-width="0">
            <view class="ko-user__popup--avatar">
              <button
                @chooseavatar="getAvatarUrl"
                :disabled="loading"
                style="background-color: transparent;"
                open-type="chooseAvatar"
              >
                <UvAvatar :size="120" :src="getImageUrl(form.avatar)" />
              </button>
            </view>
          </UniFormsItem>
          <UniFormsItem label="昵称" name="nickName">
            <input
              class="ko-user__popup--nickName"
              v-model="form.nickName"
              placeholder="请输入昵称"
              type="nickname"
              name="nickName"
              @change="onNickName"
            />
          </UniFormsItem>
        </UniForms>
      </view>
      <template #footer>
        <button
          style="margin: 0 20px 20px;"
          class="ko-basic-button"
          @click.stop="onSubmit"
          :loading="loading"
          :disabled="loading"
        >
          提交
        </button>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-user {
  padding-top: 10vh;

  &__info {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &--name {
      text-align: center;
      margin-top: 20px;
      padding: 0 20px;
      position: relative;
      width: 100%;

      .ko-basic-button__card {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  &__popup {
    height: 70vh;
    width: 98vw;
    padding: 0 20px;

    &--avatar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      width: 100%;
    }

    &--nickName {
      border: 1px solid #dcdcdc;
      padding: 8px 10px;
      width: 100%;
      border-radius: 6px;

    }
  }

  &__logout {
    padding: 20vh 50px 50px;
  }
}
</style>
