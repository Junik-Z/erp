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
          <uv-image
            class="ko-detail__swiper--image"
            :src="getImageUrl(item)"
            width="100vw"
            height="422rpx"
            mode="widthFix"
            icon-size="42px"
            lazy-load
            @click="lookImage(getImageUrl(item))"
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
