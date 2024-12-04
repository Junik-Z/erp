<script>
import Basic from "@/mixins/mixins";
import { getBusinessesUserListApi, setBusinessUserRoleApi } from "@/api/admin";
import { _deepCopy, _omit } from "@/utils";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";

export default {
  name: "member",
  components: {
    UniForms,
    BasicPopup,
    UniFormsItem,
    FilePicker,
    UniEasyinput,
    UniSearchBar, UniCol, UniRow, UniListItem, LoadMore, BasicCard, UniList,
  },
  mixins: [Basic],
  data: () => ({
    list: [],
    option: {},
    loading: false,

    visible: false,

    form: {},
    rules: {},
    sLoading: false,
  }),
  onLoad(option) {
    this.option = {...this.option, ...option};
    this.getList();
  },
  methods: {
    getList() {
      this.loading = false;
      const params = _omit(_deepCopy(this.option), ["id"]);

      getBusinessesUserListApi(params)
        .then((res) => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    setUserRole(item) {
      this.$set(item, "__loading__", true);
      setBusinessUserRoleApi({userId: item.userId, businessName: this.option.businessName})
        .then(() => {
          uni.showToast({title: "设置成功"});
          this.getList();
        })
        .finally(() => {
          this.$set(item, "__loading__", false);
        });

      // this.visible = true;
      // this.form = _deepCopy(row);
      // this.$refs.FormRef.clearValidate();
    },

    onSubmit() {
    },
  },
  computed: {
    isBusiness() {
      return (role) => (role || []).includes("Business");
    },
  },
};
</script>

<template>
  <view class="ko-member">
    <UniSearchBar
      placeholder="请输入员工名称"
      v-model="option.nickName"
      @confirm="getList()"
    />

    <UniList>
      <UniListItem v-for="(item, index) of list" :key="index">
        <template #body>
          <BasicCard>
            <i
              v-if="isBusiness(item.role)"
              class="iconfont icon-shanghuguanli"
            />

            <view class="ko-member__item">
              <view class="ko-member__item--info">
                <image
                  class="ko-member__item--info--image ko-basic-box-shadow"
                  :src="getImageUrl(item.avatar)"
                />

                <view style="flex: 1; position: relative">
                  <UniRow>
                    <UniCol :span="24">
                      <view class="ko-member__item--info--name">
                        <label class="ko-basic-label">名称：</label>
                        {{ item.nickName || "-" }}
                      </view>
                    </UniCol>
                    <UniCol :span="24">
                      <view class="ko-member__item--info--name">
                        <label class="ko-basic-label">状态：</label>
                        {{ USER_SUS_ENUMS(item.role) }}
                      </view>
                    </UniCol>
                  </UniRow>
                </view>
              </view>

              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="setUserRole(item)"
                  :loading="item.__loading__"
                  :disabled="item.__loading__"
                >
                  设为商户
                </button>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>

      <LoadMore :loading="loading" />
    </UniList>

    <BasicPopup :visible.sync="visible">
      <view class="ko-member__popup">
        <UniForms
          label-width="90px"
          ref="FormRef"
          :rules="rules"
          :model="form"
        >
          <UniFormsItem name="logo" label-width="0">
            <view style="width: 100%; display: flex; justify-content: center; align-items: center;">
              <FilePicker
                :value="getImageUrl(form.avatar)"
                readonly
                :image-styles="{border: {radius: '50%'}, width: 160, height: 160}"
              />
            </view>
          </UniFormsItem>
          <UniFormsItem label="用户名称：" name="nickName">
            <UniEasyinput
              disabled
              style="width: 100%;"
              placeholder="请输入"
              v-model="form.nickName"
            />
          </UniFormsItem>
          <UniFormsItem label="用户角色：" name="role">
            <UniDataCheckbox
              style="width: 100%;"
              placeholder="请输入"
              v-model="form.role"
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
          保存
        </button>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-member {
  .iconfont.icon-shanghuguanli {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9;
    color: #f3a73f;
    font-size: 18px;
  }

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
        padding-left: 10px;
        font-size: 18px;
        margin-bottom: 6px;
      }
    }

    .ko-basic-button__card {
      margin: 0 5px;
    }
  }

  &__popup {
    width: 90vw;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
