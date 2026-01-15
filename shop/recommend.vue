<script>
import { getActivitySettingApi, getRecommendSettingApi, setActivityApi, setRecommendApi } from "@/api/admin";
import { CONFIG, PageEnums } from "@/utils/config";
import { _deepCopy, _get, _isEqual, _omit, CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";
import KoMovable from "@/components/Movable/index.vue";

let pType = "bottom";

// #ifdef H5
pType = "center";
// #endif

export default {
  name: "recommend",
  components: {KoMovable},
  /*  onLoad(option) {
     // activity: 活动商品；recommend: 推荐商品
     this.type = option.type;
     const title = {activity: "设置活动商品", recommend: "设置推荐商品"}[option.type];

     uni.setNavigationBarTitle({title});

     this.getInfo();
   }, */
  props: {
    type: {
      type: String,
      default: "activity",
    },
  },
  data() {
    return {
      // type: "",
      list: [],
      loading: false,

      visible: false,
      form: {
        productId: "",
        description: "",
        pName: "",
        images: [],
      },

      photoUrl: CONFIG.BASE_URL, //服务器图片域名或者ip
      api: "/files/base64", //上传图片接口地址
      name: "file",

      isEdit: false,

      rules: {
        productId: {
          type: "string",
          required: true,
          message: "请选择商品",
          trigger: ["blur", "change"],
        },
      },
      pType,

      takeOverName: "",
    };
  },
  mixins: [mixins],
  methods: {
    getInfo() {
      const Func = {activity: getActivitySettingApi, recommend: getRecommendSettingApi}[this.type];
      this.loading = true;
      Func()
        .then(res => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 设置描述
    saveContens({html}) {
      this.form.description = html;
    },

    // 开启新增商品
    onOpen() {
      this.visible = true;
      this.form = _deepCopy(this.$options.data().form);

      setTimeout(() => {
        if (this.$refs.FRef) {
          this.$refs.FRef.resetFields();
          this.$refs.FRef.clearValidate();
        }
      }, 80);
    },


    // 跳转到产品选择页面
    onJumpPickerProduct() {
      uni.navigateTo({
        url: PageEnums.pickerProduct,
        // #ifdef MP
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          on_take_over: (obj) => {
            this.getTakList(obj);
          },
        },
        // #endif
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("on_to_take_over", {
            isSelect: true, // 选择模式
            takeOverName: this.takeOverName,
            type: "null",
            showQuantity: false,
          });
        },
      });
    },

    // 选中的产品
    getTakList(item) {
      const node = _get(item, "checked.0");
      this.form.productId = node.productId;
      this.form.pName = node.name;
    },

    // 提交数据
    onSubmit() {
      this.$refs.FRef.validate()
        .then(async () => {
          let params = _deepCopy(this.form);
          params = _omit(params, ["pName"]);
          params.images = params.images?.join(",") || "";

          let list = _deepCopy(this.list) || [];

          if (list.some(v => _isEqual(v.productId, params.productId))) {
            list = list.map(v => {
              if (_isEqual(v.productId, params.productId)) return params;
              return v;
            });
          } else {
            list.push(params);
          }

          await this.updateList(list);
          await CustomToast({title: (this.isEdit ? "修改" : "新增") + "成功"});
        });
    },

    // 更新列表
    updateList(list) {
      this.sLoading = true;

      const Func = {activity: setActivityApi, recommend: setRecommendApi}[this.type];

      return Func(list)
        .then(() => {
          this.getInfo();

          this.visible = false;
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    // 编辑
    onEditor(item) {
      this.isEdit = true;
      this.visible = true;

      this.form = _deepCopy(this.$options.data().form);

      setTimeout(() => {
        if (this.$refs.FRef) {
          this.$refs.FRef.resetFields();
          this.$refs.FRef.clearValidate();

          this.$nextTick(() => {
            this.form.pName = _get(item, "product.name");
            this.form.productId = _get(item, "product.id");
            this.form.description = _get(item, "description");
            this.form.images = item.images ? item.images.split(",") : [];
          });
        }
      }, 80);
    },

    // 处理删除
    onRemove(item, index) {
      const list = _deepCopy(this.list);
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除该产品吗？",
        success: (res) => {
          if (res.confirm) {
            list.splice(index, 1);
            this.updateList(list)
              .then(() => {
                CustomToast({title: "删除成功"});
              });
          }
        },
      });

    },
  },
  computed: {
    getItemImages() {
      return (item) => {
        return item.images ? item.images.split(",").map(v => this.getImageUrl(v)) : [];
      };
    },
  },
  created() {
    // this.takeOverName = `$_on_tak_over_${this._uid}`;
    // uni.$on(this.takeOverName, this.getTakList);

    this.getInfo();
  },
  beforeDestroy() {
    // uni.$off(this.takeOverName, this.getTakList);
  },
};
</script>

<template>
  <view class="ko-recommend">
    <view class="ko-recommend__wrap">
      <BasicCard :padding-size="0" :spacing="16" v-for="(item, index) of list" :key="index">
        <view class="ko-recommend__item">
          <view style="min-height: 64px;" v-if="getItemImages(item) && getItemImages(item).length">
            <uv-image
              v-for="(url, j) of getItemImages(item)"
              :key="j"
              :src="url"
              lazy-load
              width="100%"
              height="auto"
              mode="widthFix"
              :icon-size="64"
            />
          </view>

          <view class="ko-recommend__item--name">
            {{ GET_FUNC(item, "product.name") }}
          </view>

          <view class="ko-recommend__item--desc">
            {{ GET_FUNC(item, "description") }}
          </view>

          <view class="ko-recommend__item--operate">
            <button class="ko-basic-button__card" @click="onEditor(item)">编辑</button>
            <button class="ko-basic-button__card" @click="onRemove(item, index)">删除</button>
          </view>
        </view>
      </BasicCard>

      <view
        v-if="!loading && !list.length"
        style="padding: 50px 0; font-size: 12px; text-align: center;color: #c7c9ce;"
      >
        暂无设置任何商品
      </view>

      <view v-if="loading" style="padding: 50px 0;">
        <uv-loading-icon :size="46" />
      </view>
    </view>

    <!--<view class="ko-recommend__added" v-if="list.length < 5">
      <button class="ko-basic-button__card" @click="onOpen">添加商品</button>
    </view>-->

    <BasicPopup
      :visible.sync="visible"
      :type="pType"
      :title="`${isEdit ? '修改' : '添加'}商品`"
    >
      <view class="ko-recommend__popup">
        <uv-form
          :model="form"
          ref="FRef"
          label-width="120px"
          label-position="top"
          :rules="rules"
        >
          <uv-form-item label="商品：" required prop="productId">
            <view style="display: flex; align-items: center;">
              <uv-input placeholder="选择产品" readonly :value="form.pName" />
              <button
                @click="onJumpPickerProduct"
                style="margin-left: 8px;"
                class="ko-basic-button__card"
              >
                选择
              </button>
            </view>
          </uv-form-item>
          <uv-form-item label="活动图片：" prop="images">
            <FilePicker
              v-model="form.images"
              :image-styles="{border: {radius: '6px'}, width: 84, height: 84}"
              :limit="9"
              file-extname="png,jpg,jpeg"
              show-update-list
              return-type="array"
            />
          </uv-form-item>
          <uv-form-item label="商品描述：" prop="description">
            <uv-textarea
              maxlength="1000"
              v-model="form.description"
              placeholder="请输入商品描述"
            />

            <!--<view style="height: 100vh;">
              &lt;!&ndash; #ifndef MP &ndash;&gt;
              <Tinymce v-model="form.description" />
              &lt;!&ndash; #endif &ndash;&gt;

              &lt;!&ndash; #ifdef MP &ndash;&gt;
              <PiaoyiEditor
                :values="form.description"
                :maxlength="999999999999999"
                :photoUrl="photoUrl"
                :api="api"
                :name="name"
                @changes="saveContens"
              />
              &lt;!&ndash; #endif &ndash;&gt;
            </view>-->
          </uv-form-item>
        </uv-form>
      </view>
      <template #footer>
        <view style="display: flex; align-items: center;justify-content: center;">
          <button
            class="ko-basic-button__card"
            style="width: 120px;"
            @click="onSubmit"
            :loading="sLoading"
            :disabled="sLoading"
          >
            提交
          </button>
        </view>
      </template>
    </BasicPopup>

    <KoMovable
      v-if="list.length < 5"
      @click="onOpen()"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-recommend {
  &__wrap {
    padding: 0;
  }

  &__item {
    &--name {
      padding: 10px;
      font-size: 18px;
      font-weight: bold;
    }

    &--operate {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 10px 10px;
    }

    &--desc {
      padding: 0 10px 10px;
      font-size: 12px;
      color: #8f939c;
    }
  }

  &__added {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 20px;
  }

  // #ifdef MP
  &__popup {
    width: 100vw;
    height: 76vh;
    padding: 0 10px 0 16px;
  }

  // #endif

  // #ifdef H5
  &__popup {
    width: 750px;
    height: 76vh;
    padding: 0 10px 0 16px;
  }

  // #endif
}
</style>
