<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getUserListApi } from "@/api/admin";
import mixins from "@/mixins/mixins";
import { _deepCopy, _isEmpty, _isEqual } from "@/utils";

export default {
  name: "PickerUser",
  components: {BasicPopup, UniListItem, UvAvatar, BasicCard, UniList},
  data() {
    return {
      list: [],
      checked: [],
    };
  },
  mixins: [mixins],
  props: {
    title: {
      type: String,
      default: "请选择",
    },
    value: {
      type: [String, Array],
      default: "",
    },
    multiple: Boolean,
    isConfirm: Boolean,
    visible: Boolean,
    disabled: [Array, Boolean],
    // 定义可选的值
    checkedList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 隐藏 Business 商户
    hideBusiness: Boolean,
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getUserListApi()
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onSelect(item) {
      if (this.getDisabled(item)) {
        return false;
      }

      if (this.multiple) {
        if (this.isChecked(item)) {
          this.checked = this.checked.filter(id => !_isEqual(item.userId, id));
        } else {
          this.checked.push(item.userId);
        }
      } else {
        this.checked = this.isChecked(item) ? [] : [item.userId];
      }
    },
    getUserInfo(id) {
      return _deepCopy(this.list.find(v => _isEqual(v.userId, id)) || {});
    },
    onConfirm() {
      this.$emit("confirm", this.checked);
    },
  },

  watch: {
    /* value: {
       handler() {
         this.checked = _deepCopy(Array.isArray(this.value) ? this.value : this.value ? [this.value] : []);
       },
       immediate: true,
       deep: true,
     }, */

    visible: {
      handler() {
        if (this.visible) {
          this.checked = _deepCopy(Array.isArray(this.value) ? this.value : this.value ? [this.value] : []);
        } else {
          this.checked = [];
        }
      },
    },
  },

  computed: {
    getVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
    isBusiness() {
      return (role) => (role || []).indexOf("Business") > -1;
    },

    isChecked() {
      return (item) => this.checked.indexOf(item.userId) > -1;
    },

    // 是否禁用
    getDisabled() {
      return (item) => {
        if (!_isEmpty(this.checkedList)) {
          return this.checkedList?.indexOf(item.userId) < 0;
        }

        const isArr = Array.isArray(this.disabled);

        if (isArr) {
          return this.disabled.indexOf(item.userId) > -1;
        }
        return this.disabled;
      };
    },
  },
};
</script>

<template>
  <BasicPopup :visible.sync="getVisible" :title="title">
    <view class="ko-picker-user">
      <view class="ko-picker-user__list">
        <UniList>
          <UniListItem v-for="(item, index) of list" :key="index" v-if="hideBusiness ? !isBusiness(item.role) : true">
            <template #body>
              <BasicCard>
                <view class="ko-picker-user__info" @click="onSelect(item)">
                  <view style="margin-right: 10px;">
                    <checkbox :checked="isChecked(item)" :disabled="getDisabled(item)" />
                  </view>
                  <UvAvatar :size="64" :src="getImageUrl(item.avatar)" />
                  <view class="ko-picker-user__info--name">{{ item.nickName || "-" }}</view>

                  <i v-if="isBusiness(item.role)" class="iconfont icon-shanghuguanli"></i>
                </view>
              </BasicCard>
            </template>
          </UniListItem>
        </UniList>
      </view>
    </view>

    <template #footer v-if="isConfirm">
      <button style="margin: 10px 40px 10px;" class="ko-basic-button" @click="onConfirm">确认</button>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-picker-user {
  height: 70vh;
  width: 100vw;

  &__list {

  }

  &__info {
    display: flex;
    align-items: center;
    position: relative;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 9;
    }

    &--name {
      @include basic-text-ellipsis();
      flex: 1;
      padding-left: 10px;
    }

    .iconfont.icon-shanghuguanli {
      position: absolute;
      right: -6px;
      top: -10px;
      color: #f3a73f;
      font-size: 18px;
    }
  }
}
</style>
