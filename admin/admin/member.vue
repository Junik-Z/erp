<script>
import Basic from "@/mixins/mixins";
import { getBusinessesUserListApi, setBusinessUserRoleApi } from "@/api/admin";
import { _deepCopy, _get, _isEmpty, _omit } from "@/utils";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import KoList from "@/components/List/List.vue";

export default {
  name: "member",
  components: {
    KoList,
    UvAvatar,
    UniForms,
    BasicPopup,
    UniFormsItem,
    FilePicker,
    UniEasyinput,
    UniSearchBar,
    UniCol,
    UniRow,
    BasicCard,
  },
  mixins: [Basic],
  data() {
    const _this = this;
    return {
      list: [],
      option: {},
      loading: false,

      visible: false,

      queryList: {
        pageSize: 30,
        pageNum: 0,
      },
      noMore: false,

      form: {},
      rules: {},
      sLoading: false,

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "头像",
          prop: "avatar",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "avatar")),
                  size: 64,
                  text: _get(row, "nickName"),
                  shape: "square",
                },
              })],
            );
          },
        },
        {
          label: "名称",
          prop: "nickName",
        },
        {
          label: "用户状态",
          prop: "userStatus",
          render: (h, {row}) => {
            return h("div", [_this.USER_SUS_ENUMS(row.userStatus)]);
          },
        },
        {
          label: "创建日期",
          prop: "createTime",
        },
        {
          label: "是否为商户",
          prop: "role",
          render: (h, {row}) => {
            return h("div", [row.selected ? "是" : "否"]);
          },
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
  onLoad(option) {
    this.option = {...this.option, ...option};
    this.getList();
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

      this.loading = false;
      const params = _omit(_deepCopy(this.option), ["id"]);

      getBusinessesUserListApi({...params, ...this.queryList})
        .then((res) => {
          this.list = this.onMergeArrays(this.list, res.data, "userId");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
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
          this.getList(true);
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
    isInBusiness() {
      return (role) => (role || []).includes("BUSINESS");
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
      @cancel="getList()"
    />

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 10px;" v-for="(item, index) of list" :key="index">
          <BasicCard>
            <i
              v-if="item.selected"
              class="iconfont icon-shanghuguanli"
            />

            <view class="ko-member__item">
              <view class="ko-member__item--info">
                <UvAvatar
                  class="ko-basic-box-shadow"
                  :src="getImageUrl(item.avatar)"
                  :size="72"
                  :text="item.nickName || GET_SHOP_NAME"
                  random-bg-color
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
                        {{ USER_SUS_ENUMS(item.userStatus) }}
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
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px; flex: 1; overflow: hidden;">
      <KoTable
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @next-load="RequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              class="ko-basic-button__card"
              @click.stop="setUserRole(item)"
              :loading="item.__loading__"
              :disabled="item.__loading__"
            >
              设为商户
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

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
  // #ifdef MP
  padding-bottom: 50px;
  // #endif

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

  // #ifdef H5
  /deep/ .uni-searchbar {
    width: 1024px;
    margin: 0 auto;
  }

  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;

  // #endif

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
