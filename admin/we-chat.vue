<script>
import { _deepCopy, _isEmpty, _isEqual, CustomToast } from "@/utils";
import { getWxUsersApi, setUserTagApi } from "@/api/user";
import TopMenus from "@/admin/components/TopMenus.vue";
import mixins from "@/mixins/mixins";
import { WX_USER_TAG_ENUMS } from "@/utils/config";

let pType = "bottom";

// #ifdef H5
pType = "center";
// #endif

export default {
  name: "we-chat",
  computed: {
    WX_USER_TAG_ENUMS() {
      return WX_USER_TAG_ENUMS;
    },
  },
  components: {TopMenus},
  data() {
    return {
      list: [],
      loading: false,
      noMore: false,

      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      visible: false,

      pType,

      form: {
        tags: [],
        userId: "",
      },

      sLoading: false,
    };
  },
  mixins: [mixins],
  onLoad() {
    this.getList(true);
  },
  methods: {
    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.loading = true;
      getWxUsersApi(this.queryList)
        .then(res => {
          const list = (res.data || []).map(item => ({
            ...item,
            value: item.userId,
            label: item.nickName,
            logo: item.avatar,
          }));

          this.list = this.onMergeArrays(this.list, list, "userId");
          this.noMore = _isEmpty(list) || list.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 下一页
    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList(false);
    },

    // 索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    // input 搜索
    onSearchBar() {
      this.$refs.ILRef && (this.$refs.ILRef.touchmoveIndex = -1);
      this.getList(true);
    },

    // 取消
    onCancel() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.getList(true);
        });
      });
    },

    // 选择标签
    onTagChange(event) {
      this.form.tags = event.detail.value;
    },

    // 设置标签
    onSetTag({item}) {
      this.form.tags = item.tags?.split(",");
      this.form.userId = item.value;
      this.visible = true;
    },

    // 设置标签
    onSubmit() {
      const params = _deepCopy(this.form);
      params.tags = params.tags.join(",");
      this.sLoading = true;
      setUserTagApi(params)
        .then(() => {
          CustomToast({title: "设置成功", icon: "none"});
          this.list = this.list.map(item => {
            if (_isEqual(item.userId, params.userId)) item.tags = params.tags;
            return item;
          });
          this.visible = false;
        })
        .finally(() => {
          this.sLoading = false;
        });
    },
  },
};
</script>

<template>
  <view class="ko-we-chat">
    <view class="ko-we-chat__wrap">
      <TopMenus :path="PageEnums.WeChat" />

      <view style="width: 100%">
        <uni-search-bar
          v-model="queryList.nickName"
          placeholder="请输入"
          @confirm="onSearchBar"
          @cancel="onCancel"
          clear-button="none"
        />
      </view>
      <view class="ko-we-chat__staff">
        <IndexList
          ref="ILRef"
          :data="list"
          :loading="loading"
          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"
          :events="[{label: '设置标签', func: 'setTag'}]"
          @click-event="onSetTag"
          is-we-chat
        />
      </view>
    </view>

    <BasicPopup :visible.sync="visible" title="设置标签" :type="pType">
      <view class="ko-we-chat__popup">
        <checkbox-group @change="onTagChange">
          <view class="ko-we-chat__popup--checkbox">
            <label class="ko-we-chat__popup--item" v-for="(label, value) of WX_USER_TAG_ENUMS">
              <checkbox
                :value="value"
                :checked="form.tags.includes(value)"
                color="#2A79FF"
                style="transform:scale(0.7)"
              />
              {{ label }}
            </label>
          </view>
        </checkbox-group>
      </view>

      <template #footer>
        <view class="ko-we-chat__popup--footer">
          <button
            class="ko-basic-button__card"
            @click="onSubmit"
          >
            提交
          </button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-we-chat {
  &__wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding-top: 10px;
  }

  &__staff {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  &__popup {
    width: 100vw;
    padding: 10px;

    &--footer {
      display: flex;
      align-items: center;
      justify-content: center;

      .ko-basic-button__card {
        width: 120px;
      }
    }

    &--checkbox {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    &--item {
      width: 33%;
      margin: 5px 0;
      font-size: 12px;
    }
  }

  // #ifdef H5
  &__wrap {
    width: 1024px;
    height: calc(100vh - 60px);
    margin: 0 auto;
  }

  &__popup {
    width: 500px;
  }

  // #endif
}
</style>
