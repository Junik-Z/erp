<script>
import { getDetailApi, getProductFieldApi } from "@/api/erp/product";
import UvParse from "./components/uv-parse/uv-parse.vue";
import { _get, transferYuan } from "@/utils";
import mixins from "@/mixins/mixins";

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

      strings: `
      <div class="product-detail" style="padding: 10px; background: #fff;">
  <h1 style="color: #ff4e00; font-size: 24px;">【限时特惠】AI智能降噪耳机 Pro</h1>
  <p style="font-size: 16px; color: #666;">🔊 40dB深度降噪 | 30小时续航 | Hi-Res音质认证</p>

  <!-- 主图轮播 -->
  <div class="swiper">
    <img src="https://example.com/headphone_main.jpg" alt="耳机主图" style="width: 100%; border-radius: 8px;">
  </div>

  <!-- 价格与促销 -->
  <div style="margin: 15px 0;">
    <span style="font-size: 28px; color: #f44336;">¥599</span>
    <span style="text-decoration: line-through; color: #999; margin-left: 10px;">¥899</span>
    <span style="background: #fff8e1; padding: 3px 8px; border-radius: 4px; margin-left: 10px;">省¥300</span>
  </div>

  <!-- 商品亮点 -->
  <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #333; border-left: 4px solid #ff4e00; padding-left: 8px;">核心卖点</h3>
    <ul style="padding-left: 20px;">
      <li>🎵 定制化声学系统，支持LDAC高清音频解码</li>
      <li>🔋 快充10分钟，播放5小时</li>
      <li>🌍 IPX5防水等级，运动出汗无忧</li>
    </ul>
  </div>

  <!-- 图文详情 -->
  <div class="detail-content">
    <h3 style="color: #333;">产品详情</h3>
    <img src="https://example.com/headphone_detail_1.jpg" alt="耳机细节图" style="width: 100%; margin: 10px 0;">
    <p style="line-height: 1.8;">采用<strong>双层振膜技术</strong>，低频下潜更深，高频解析力提升20%。耳罩部分使用<u>蛋白皮材质</u>，长时间佩戴不压耳。</p>

    <h3 style="color: #333; margin-top: 20px;">技术参数</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 0; color: #777;">蓝牙版本</td>
        <td style="text-align: right;">5.2</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 0; color: #777;">重量</td>
        <td style="text-align: right;">248g</td>
      </tr>
    </table>
  </div>
</div>`,

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

          this.info = params;
        })
        .finally(() => {
          this.loading = false;
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
  <view class="ko-detail">
    <view class="ko-detail__swiper">
      <swiper class="ko-detail__swiper--wrap" autoplay="true" duration="1000" interval="3000">
        <swiper-item class="ko-detail__swiper--item" v-for="item of info.carousel" :key="item">
          <image
            class="ko-detail__swiper--image"
            :src="getImageUrl(item)"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>
    </view>

    <view class="ko-detail__top">
      <view class="ko-detail__name">{{ info.name }}</view>

      <view class="ko-detail__amount">
        <view style="display: flex; align-items: flex-end;">
          <view class="money">¥ {{ info.salePrice }}</view>
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

    &--wrap {
      height: 228px;
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
    color: #3C84F6;
    font-size: 18px;
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
      color: #4086F6;
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>
