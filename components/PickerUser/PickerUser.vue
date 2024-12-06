<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { getUserListApi } from "@/api/admin";
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _isString, _keys, _omit } from "@/utils";
import { getCustomerListApi } from "@/api/erp/sale";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { getSupplierListApi } from "@/api/erp/purchase";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";

export default {
  name: "PickerUser",
  components: {UniSearchBar, UniSection, UniEasyinput, BasicPopup, UniListItem, UvAvatar, BasicCard, UniList},
  data() {
    return {
      list: [],
      checked: [],
      modelVisible: false,
      checkNode: {},
      norGroupList: [],

      groupObj: {},

      filterText: undefined,

      scrollViewId: "",
      winHeight: 0,
      itemHeight: 0,
      winOffsetY: 0,
      touchmove: false,
      touchmoveIndex: -1,
      touchmovable: true,
      loaded: false,
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

    type: {
      type: String,
      default: "default", // client: 选择客户, supplier: 供应商
    },
    isInput: Boolean,
    placeholder: {
      type: String,
      default: "请选择",
    },
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = {
        default: getUserListApi,
        // 获取销售客户
        client: getCustomerListApi,
        // 供应商
        supplier: getSupplierListApi,
      }[this.type];

      const vKey = {default: "userId", client: "id", supplier: "id"}[this.type];
      const lKey = {default: "nickName", client: "name", supplier: "name"}[this.type];
      const logoKey = {default: "avatar", client: "logo", supplier: "logo"}[this.type];

      Func()
        .then(res => {
          const list = (res.data)
            .map(item => {
              const label = _get(item, lKey);
              const __group__ = label?.charAt(0);
              return {
                ...item,
                value: _get(item, vKey),
                label,
                logo: _get(item, logoKey),
                __group__,
              };
            });
          this.norGroupList = _deepCopy(list);

          let obj = _groupBy(list, (v) => v.__group__);

          _keys(obj).forEach(key => {
            const list = obj[key];
            if (key === "undefined") {
              obj = _omit(obj, [key]);
              obj["#"] = list;
            }
          });

          this.groupObj = obj;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onSelect(item) {
      if (this.getDisabled(item)) {
        return false;
      }

      if (this.isInput) {
        this.checked = this.isChecked(item) ? [] : [item.value];

        if (!this.isConfirm) {
          this.checkNode = _deepCopy(this.getUserInfo(this.checked[0]));

          this.$emit("input", this.checked[0]);
          this.modelVisible = false;
        }
        return false;
      }

      if (this.multiple) {
        if (this.isChecked(item)) {
          this.checked = this.checked.filter(id => !_isEqual(item.value, id));
        } else {
          this.checked.push(item.value);
        }
      } else {
        this.checked = this.isChecked(item) ? [] : [item.value];
      }
    },
    getUserInfo(id) {
      return _deepCopy(this.norGroupList.find(v => _isEqual(v.value, id)) || {});
    },
    onConfirm() {
      this.$emit("confirm", this.checked);

      if (this.isInput) {
        this.$emit("input", this.checked[0]);
        this.label = this.getUserInfo(this.checked[0])?.label;
        this.modelVisible = false;
      }
    },
    onClick() {
      this.modelVisible = true;
    },


    // 服务索引列表
    touchStart(e) {
      this.touchmove = true;
      let pageY = this.isPC ? e.pageY : e.touches[0].pageY;
      let index = Math.floor((pageY - this.winOffsetY) / this.itemHeight);
      let item = this.lists[index];
      if (item) {
        this.scrollViewId = "ko-index-list-" + index;
        this.touchmoveIndex = index;
      }
    },
    touchMove(e) {
      // #ifndef APP-PLUS
      let pageY = this.isPC ? e.pageY : e.touches[0].pageY;
      let index = Math.floor((pageY - this.winOffsetY) / this.itemHeight);
      if (this.touchmoveIndex === index) {
        return false;
      }
      let item = this.lists[index];
      if (item) {
        this.scrollViewId = "ko-index-list-" + index;
        this.touchmoveIndex = index;
      }
      // #endif

      // #ifdef APP-PLUS
      throttleTouchMove.call(this, e);
      // #endif
    },
    touchEnd() {
      this.touchmove = false;
      // this.touchmoveIndex = -1
    },

    /**
     * 兼容 PC
     */

    mousedown(e) {
      if (!this.isPC) return;
      this.touchStart(e);
    },
    mousemove(e) {
      if (!this.isPC) return;
      this.touchMove(e);
    },
    mouseleave(e) {
      if (!this.isPC) return;
      this.touchEnd(e);
    },

    // #ifdef H5
    IsPC() {
      const userAgentInfo = navigator.userAgent;
      const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
      let flag = true;
      for (let v = 0; v < Agents.length - 1; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    // #endif
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
        this.modelVisible = _deepCopy(this.visible);

        if (this.isInput && _isString(this.value)) {
          this.checkNode = this.getUserInfo(this.value);
        }

        if (this.visible) {
          this.checked = _deepCopy(Array.isArray(this.value) ? this.value : this.value ? [this.value] : []);
        } else {
          this.checked = [];
        }
      },
    },
    modelVisible: {
      handler() {
        this.$emit("update:visible", this.modelVisible);
      },
    },
  },
  computed: {
    isBusiness() {
      return (role) => (role || []).indexOf("Business") > -1;
    },
    isChecked() {
      return (item) => this.checked.indexOf(item.value) > -1;
    },
    // 是否禁用
    getDisabled() {
      return (item) => {
        if (!_isEmpty(this.checkedList)) {
          return this.checkedList?.indexOf(item.value) < 0;
        }

        const isArr = Array.isArray(this.disabled);
        if (isArr) {
          return this.disabled.indexOf(item.value) > -1;
        }

        return this.disabled;
      };
    },

    getGroupKeyList() {
      return _keys(this.groupObj);
    },

    getGroupList() {
      return (key) => _get(this.groupObj, key);
    },

    getFilter() {
      return (node) => {
        return node?.label?.indexOf(this.filterText) > -1 || !this.filterText;
      };
    },
  },
};
</script>

<template>
  <view class="ko-picker-user">
    <UniEasyinput
      v-if="isInput"
      :placeholder="placeholder"
      disabled
      @click="onClick"
      suffix-icon="down"
      :styles="{disableColor: 'transparent'}"
      :value="checkNode.label"
    />

    <BasicPopup
      :visible.sync="modelVisible"
      :title="title"
      :type="isInput ? 'bottom' : 'center'"
    >
      <view class="ko-picker-user__popup" :class="{'is-input': isInput}">
        <UniSearchBar v-model="filterText" clear-button="auto" cancel-button="none" />

        <view class="ko-picker-user__list">
          <view class="ko-index-list" ref="ListRef" id="list">
            <scroll-view :scroll-into-view="scrollViewId" class="ko-index-list__scroll" scroll-y>
              <view
                v-for="(key, idx) in getGroupKeyList"
                :key="idx"
                :id="'ko-index-list-' + idx"
              >
                <UniSection :title="key" type="line">
                  <view
                    class="ko-index-list__item"
                    v-for="(item, index) in getGroupList(key)"
                    :key="index"
                    v-if="getFilter(item) && (hideBusiness ? !isBusiness(item.role) : true)"
                  >
                    <BasicCard style="width: 100%;">
                      <view class="ko-picker-user__info" @click="onSelect(item)">
                        <view style="margin-right: 10px;">
                          <checkbox :checked="isChecked(item)" :disabled="getDisabled(item)" />
                        </view>
                        <UvAvatar
                          :size="64"
                          :src="getImageUrl(item.logo)"
                          random-bg-color
                          :text="item.label || GET_SHOP_NAME"
                        />
                        <view class="ko-picker-user__info--name">{{ item.label || "-" }}</view>
                        <i v-if="isBusiness(item.role)" class="iconfont icon-shanghuguanli"></i>
                      </view>
                    </BasicCard>
                  </view>
                </UniSection>
              </view>
            </scroll-view>

            <view
              class="ko-index-list__menu"
              @touchstart="touchStart"
              @touchmove.stop.prevent="touchMove"
              @touchend="touchEnd"
              @mousedown.stop="mousedown"
              @mousemove.stop.prevent="mousemove"
              @mouseleave.stop="mouseleave"
            >
              <view
                v-for="(key, index) in getGroupKeyList"
                :key="index"
                class="ko-index-list__menu-item"
                :class="touchmoveIndex === index ? 'ko-index-list__menu--active' : ''"
              >
                <text
                  class="ko-index-list__menu-text"
                  :class="touchmoveIndex === index ? 'ko-index-list__menu-text--active' : ''"
                >
                  {{ key }}
                </text>
              </view>
            </view>

            <view v-if="touchmove && false" class="ko-index-list__alert-wrapper">
              <text class="ko-index-list__alert">{{ getGroupKeyList[touchmoveIndex] }}</text>
            </view>
          </view>
        </view>
      </view>

      <template #footer v-if="isConfirm">
        <button
          style="margin: 10px 40px 10px;"
          class="ko-basic-button"
          @click="onConfirm"
        >
          确认
        </button>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-picker-user {

  &__popup {
    height: 70vh;
    width: 100vw;

    &.is-input {
      height: 80vh;
    }
  }

  /deep/ input[disabled] {
    color: #333; /* 文本颜色 */
  }

  &__list {
    position: relative;
    height: calc(100% - 40px);
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

.ko-index-list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;

  &__scroll {
    flex: 1;
  }

  &__menu {
    width: 30px;
    padding-right: 10px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
  }

  &__menu-item {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex: 1;
    align-items: center;
    justify-content: center;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }

  &__menu-text {
    font-size: 16px;
    text-align: center;
    color: #aaa;
  }

  &__menu--active {
  }

  &__menu-text--active {
    border-radius: 16px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    background-color: #007aff;
    color: #fff;
  }

  &__alert-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  &__alert {
    width: 80px;
    height: 80px;
    border-radius: 80px;
    text-align: center;
    line-height: 80px;
    font-size: 35px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &__item {
    //padding: 10px 16px 10px 26px;
    //border-bottom: 0.5px solid #c7c9ce;

    padding-left: 16px;
    padding-right: 8px;

    font-size: 14px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
