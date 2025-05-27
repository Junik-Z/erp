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
            let p = p2?.replace(CONFIG.BASE_URL, "") || "";
            p = p?.replace(/^(\/)?api/, "") || "";
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
            @click.stop="lookImage(getImageUrl(item))"
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

      <UvParse
        :content="info.description"
        :lazyLoad="true"
        loading-img="data:image/png;base64,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"
      />
      <!-- loading-img="data:image/svg+xml;utf8,<svg width=&quot;120px&quot; height=&quot;120px&quot; viewBox=&quot;0 0 50 50&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><path fill=&quot;%23c7c9ce&quot; d=&quot;M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z&quot;><animateTransform attributeType=&quot;xml&quot; attributeName=&quot;transform&quot; type=&quot;rotate&quot; from=&quot;0 25 25&quot; to=&quot;360 25 25&quot; dur=&quot;0.6s&quot; repeatCount=&quot;indefinite&quot;/></path></svg>" -->
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
      height: 422rpx;
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
