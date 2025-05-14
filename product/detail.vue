<script>
import { getDetailApi, getProductFieldApi } from "@/api/erp/product";
import UvParse from "./components/uv-parse/uv-parse.vue";
import { _get, transferYuan } from "@/utils";
import mixins from "@/mixins/mixins";
import { CONFIG, PageEnums } from "@/utils/config";

export default {
  name: "detail",
  onLoad(option) {
    console.log(option);
    this.getFieldList();
    this.option = option;

    this.getInfo();
  },
  components: {UvParse},
  data() {
    return {
      fieldList: {},
      option: {},

      info: {},
    };
  },
  mixins: [mixins],
  methods: {
    getFieldList() {
      getProductFieldApi({pageSize: 100, pageNum: 0})
        .then(res => {
          this.fieldList = res.data;
        });
    },
    getInfo() {
      this.loading = true;
      getDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;
          params.purchasePrice = transferYuan(params.purchasePrice);
          params.salePrice = transferYuan(params.salePrice);
          params.carousel = params.carousel ? params.carousel.split(",") : [];

          params.description = params.description?.replace?.(/<img([^>]*)src="(.*?)"([^>]*)>/gi, (match, p1, p2, p3) => {
            const p = p2?.replace(CONFIG.BASE_URL, "") || "";
            return `<img${p1}src="${this.getImageUrl(p)}"${p3}>`;
          });

          this.info = params;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 返回上一级
    onBlack() {
      uni.navigateBack({
        fail() {
          uni.reLaunch({
            url: PageEnums.home,
          });
        },
      });
    },
  },
  computed: {
    getFieldCode() {
      return key => _get(this.info, `extend.${key}`);
    },
  },
};
</script>

<template>
  <view class="ko-detail" :style="[menuButtonRectStyle]">
    <!-- #ifdef MP -->
    <Notice is-custom />
    <!-- #endif -->
    <button class="ko-top-black" @click="onBlack">
      <uni-icons size="24" color="#000" type="left" />
    </button>

    <view class="ko-detail__swiper">
      <swiper
        class="ko-detail__swiper--wrap"
        autoplay
        :duration="500"
        :interval="3000"
        indicator-dots
      >
        <swiper-item
          class="ko-detail__swiper--item"
          v-for="item of info.carousel"
          :key="item"
        >
          <image
            class="ko-detail__swiper--image"
            :src="getImageUrl(item)"
            mode="widthFix"
            lazy-load
          />
        </swiper-item>
      </swiper>

      <view class="ko-detail__swiper--no-more" v-if="!(info.carousel || []).length">该商品未上传相关展示图片</view>
    </view>

    <view class="ko-detail__top">
      <view class="ko-detail__name">{{ info.name || "" }}</view>

      <view class="ko-detail__amount">
        <view style="display: flex; align-items: flex-end;">
          <view class="money">¥ {{ info.salePrice || "" }}</view>
          <view class="line" v-if="false">¥23.9</view>
        </view>
      </view>

      <view class="ko-detail__field" style="--ko-basic-table-grid-col: 50% 50%;">
        <view class="ko-basic-table ko-basic-table__not-border">
          <view class="ko-basic-table--cell" v-for="item of fieldList" :key="item.id">
            <view>{{ item.fieldName }}：</view>
            <view
              :style="[getFieldCode(item.fieldCode) ? {} : {color: '#c7c9ce'}]"
            >
              {{ getFieldCode(item.fieldCode) || "-" }}
            </view>
          </view>
        </view>
      </view>

      <view class="ko-detail__added" v-if="false">
        <button class="btn">-</button>
        <text class="count">0</text>
        <button class="btn">+</button>
      </view>
    </view>

    <view class="ko-detail__wrap">
      <view class="ko-detail__wrap--title">产品详情</view>

      <UvParse :content="info.description" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-top-black {
  position: fixed;
  top: var(--m-top);
  height: var(--m-height);
  left: 10px;
  z-index: 999;
  padding: 0;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.ko-detail {
  --primary-color: #3B82F6;
  --secondary-color: #60A5FA;
  --accent-color: #2563EB;
  --text-color: #1F2937;
  --light-gray: #F3F4F6;
  --border-color: #E5E7EB;
  --gradient-start: #3B82F6;
  --gradient-end: #2DD4BF;
  --card-bg: rgba(255, 255, 255, 0.9);
  --shadow-color: rgba(0, 0, 0, 0.08);

  --added-btn-size: 32px;

  background: #FAFAFA;

  min-height: 100vh;

  padding-bottom: 70px;

  &__swiper {
    padding-bottom: 20px;
    position: relative;

    &--no-more {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #c7c9ce;
    }

    &--wrap {
      height: 328px;
    }

    &--item {
      border-radius: 0 0 10px 10px;
      overflow: hidden;
    }

    &--image {
      width: 100vw;
    }
  }

  &__top {
    position: relative;
    background-color: rgba(255, 255, 255, .9);
    z-index: 1;
    box-shadow: 0 10px 30px var(--shadow-color);
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px;
  }

  &__name {
    color: #333;
    font-size: 16px;
    font-weight: bold;
  }

  &__amount {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 15px var(--shadow-color);
    margin: 10px 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(45, 212, 191, 0.1));
    padding: 10px;
    border-radius: 10px;


    .money {
      font-size: 16px;
      font-weight: bold;
      color: var(--accent-color);
      text-shadow: rgba(0, 0, 0, 0.1) 0 2px 4px;
    }

    .line {
      font-size: 12px;
      color: rgb(107, 114, 128);
      margin-left: 10px;
      text-decoration: line-through;
    }
  }

  &__added {
    padding-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .count {
      width: 50px;
      text-align: center;
      font-size: calc(var(--added-btn-size) * 0.6);
    }

    .btn {
      width: var(--added-btn-size);
      height: var(--added-btn-size);
      background: #DBEAFE;
      border-radius: 50%;
      font-size: calc(var(--added-btn-size) * 0.7);
      margin: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 2px;
      box-shadow: 0 0 #0000, 0 0 #0000, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      color: rgba(37, 99, 235, 1);
    }
  }

  &__field {
    .ko-basic-table .ko-basic-table--cell {
      justify-content: flex-start;
      font-size: 14px;
    }
  }

  &__wrap {
    margin-top: 20px;

    background-color: rgba(255, 255, 255, .9);
    z-index: 1;
    box-shadow: 0 10px 30px var(--shadow-color);
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px;

    font-size: 14px;

    &--title {
      padding-bottom: 10px;
      color: #333;
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
