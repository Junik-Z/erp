<script>
import KoList from "@/components/List/List.vue";
import UvImage from "@/uni_modules/uv-image/components/uv-image/uv-image.vue";
import { _deepCopy, _get, _isEmpty, CustomToast } from "@/utils";
import KoMovable from "@/components/Movable/index.vue";
import { addBusinessClassifyApi, businessClassifyApi, deleteBusinessClassifyApi } from "@/api/user";
import mixins from "@/mixins/mixins";
import FilePicker from "@/components/FilePicker/FilePicker.vue";

export default {
  name: "ClassifyList",
  components: {KoMovable, KoList, FilePicker},
  mixins: [mixins],
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

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "Icon",
          prop: "classifyIcon",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvImage, {
                props: {
                  src: this.getImageUrl(_get(row, "classifyIcon")),
                  shape: "square",
                  width: "38px",
                  height: "38px",
                  radius: "6px",
                },
              })],
            );
          },
        },
        {
          label: "名称",
          prop: "classifyName",
        },
        {
          label: "备注",
          prop: "classifyDesc",
        },
        {
          label: "操作",
          slot: "operate",
        },
      ],
      // #endif

      sLoading: false,
      isEdit: false,

      form: {
        classifyName: "",
        classifyIcon: "",
        classifyDesc: "",
      },

      rules: {
        classifyName: {
          type: "string",
          required: true,
          message: "请输入分类名称",
          trigger: ["blur", "change"],
        },
      },
    };
  },
  methods: {
    // 获取下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 获取列表数据
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }
      this.loading = true;
      businessClassifyApi(this.queryList)
        .then((res) => {
          const data = res.data;
          this.list = this.onMergeArrays(this.list, data);
          this.noMore = _isEmpty(data) || data.length < this.queryList.pageSize;

          console.log(data);
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 添加分类
    onTrigger(item) {
      this.visible = true;
      this.isEdit = false;
      this.form = _deepCopy(this.$options.data().form);

      if (item) {
        this.form = _deepCopy(item);
        this.isEdit = true;
      }
    },

    // 删除商户
    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除该商户分类吗？",
        success: (res) => {
          if (res.confirm) {
            deleteBusinessClassifyApi({id: item.id})
              .then(() => {
                CustomToast({title: "删除成功"});
                this.list.splice(index, 1);
              });
          }
        },
      });
    },

    // 提交
    onSubmit() {
      this.$refs.FRef.validate()
        .then(() => {
          this.sLoading = true;
          addBusinessClassifyApi(this.form)
            .then(() => {
              this.getList(true);
            })
            .finally(() => {
              this.visible = false;
              this.sLoading = false;
            });
        });
    },

    // 修改
    onJump() {
    },
  },
  mounted() {
    this.getList(true);
  },
};
</script>

<template>
  <view class="ko-classify">
    <!-- #ifdef MP -->
    <view style="height: 100%;">
      <KoList
        :data="list"
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        @next-load="RequestNextPage"
        @lower="RequestNextPage"
      >
        <view style="padding: 5px 10px;" v-for="(item, index) of list" :key="item.id">
          <BasicCard>
            <view class="ko-classify__item">
              <view class="ko-classify__item--info">
                <uv-image
                  class="ko-classify__item--info--image ko-basic-box-shadow"
                  :src="getImageUrl(item.classifyIcon)"
                  width="64px"
                  height="64px"
                  radius="6px"
                />

                <view style="padding-left: 16px; flex: 1; font-size: 14px">
                  <view>
                    {{ item.classifyName }}
                  </view>

                  <view style="font-size: 12px; color: #c7c9ce;margin-top: 8px;">
                    {{ item.classifyDesc }}
                  </view>
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
                  @click.stop="onRemove(item, index)"
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
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJump"
        @next-load="RequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item, index}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              class="ko-basic-button__card"
              @click.stop="onTrigger(item)"
            >
              编辑
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onRemove(item, index)"
            >
              删除
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable @click="onTrigger('')" />

    <BasicPopup :visible.sync="visible" :title="`${isEdit ? '编辑' : '新增'}商户分类`">
      <view class="ko-classify__popup">
        <uv-form :model="form" :rules="rules" :label-width="60" ref="FRef">
          <uv-form-item label="Icon：">
            <FilePicker
              v-model="form.classifyIcon"
              :image-styles="{border: {radius: '6px'}, width: 84, height: 84}"
            />
          </uv-form-item>
          <uv-form-item label="名称：" required>
            <uv-input placeholder="请输入" v-model="form.classifyName" />
          </uv-form-item>
          <uv-form-item label="备注：">
            <uv-textarea placeholder="请输入" v-model="form.classifyDesc" />
          </uv-form-item>
        </uv-form>
      </view>

      <template #footer>
        <view style="display: flex; align-items: center; justify-content: center;">
          <button
            class="ko-basic-button__card"
            style="width: 120px"
            @click="onSubmit"
            :loading="sLoading"
            :disabled="sLoading"
          >
            提交
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-classify {
  // #ifdef MP
  height: 100%;
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
  }

  // #ifdef H5
  height: calc(100vh - 54px);

  &__popup {
    width: 600px;
  }

  // #endif
}
</style>
