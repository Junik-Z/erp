<script>
import { _deepCopy, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import KoList from "@/components/List/List.vue";

export default {
  name: "StepList",
  components: {KoList},
  data() {
    return {};
  },
  props: {
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  mixins: [mixins],
  methods: {},
  computed: {
    GroupList() {
      return _deepCopy(this.list) || [];
    },

    // 获取当前状态
    getCurrentStatus() {
      const list = this.GroupList || [];
      const i = list.findIndex(v => !_isEqual(v.status, "FINISHED"));

      if (i > -1) {
        const n = list[i];
        return n.name || "";
      }

      return "";
    },
  },
};
</script>

<template>
  <view class="ko-step-list">
    <view class="ko-step-list__wrap">
      <view
        :class="{'is-success': isEqual(item.status, 'FINISHED')}"
        class="ko-step-list__item"
        v-for="(item, index) of GroupList"
        :key="index"
      >
        <view class="ko-step-list__item--icon">
          <uni-icons color="#007AFF" v-if="isEqual(item.status, 'FINISHED')" type="checkbox" size="18" />
          <text v-else class="icon"></text>
        </view>
        <view>{{ item.name }}</view>
      </view>
    </view>
    <view class="ko-step-list__status" v-if="getCurrentStatus">
      <view class="ko-step-list__status--wrap">
        <uni-icons style="margin-right: 4px" size="18" color="#1D4ED8" type="info" />

        <view style="display: flex;justify-content: center;align-items: center;">
          当前状态：
          <text class="tis">{{ getCurrentStatus }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-step-list {

  &__wrap {
    padding: 10px;
  }

  &__item {
    position: relative;
    padding: 10px 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    color: #b2b6bd;

    &.is-success {
      color: #007AFF;
      font-weight: bold;
    }

    &--icon {
      width: 50px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 8px;
        height: 8px;
        display: inline-block;
        background: #b2b6bd;
        border-radius: 50%;
      }
    }

    &::before {
      content: "";
      height: 1px;
      background: #F1F1F1;
      position: absolute;
      bottom: 0;
      right: 0;
      left: 50px;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;

    &--wrap {
      background: rgb(239 246 255 / 1);
      font-size: 12px;
      padding: 8px 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;

      .tis {
        font-weight: bold;
      }
    }
  }
}
</style>
