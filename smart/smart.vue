<script>
import { getAskApi } from "@/api/ai";
import Dayjs from "@/utils/dayjs";
import { _generateUUID, _isEqual, _isString } from "@/utils";
import mixins from "@/mixins/mixins";
import UserMsg from "./components/UserMsg.vue";
import AiMsg from "./components/AiMsg.vue";
import { AudioVM } from "./utils/Audio";

const ShopImage = "data:image/png;base64,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";

export default {
  name: "Smart",
  components: {
    UserMsg,
    AiMsg,
  },
  mixins: [mixins],
  data() {
    return {
      msgList: [
        /* {
          "label": "怎么修改订单",
          "type": "user",
          "time": "2025-03-12 18:38:09",
          "__id__": "3c0e786a-3c4c-4b4c-9cbd-4480608064ee",
          "status": 200,
        },
        {
          "label": "要修改订单，请按照以下步骤进行操作：\n\n1. **确认当前状态**：首先确认订单当前的状态，例如是否已经发货、部分发货或未发货。\n2. **联系相关部门**：根据订单的状态，联系相应的部门或人员。如果是未发货的订单，可以联系销售部或客服；如果是已发货但尚未到达收货地址的订单，可能需要联系物流部门。\n3. **提供修改信息**：明确您希望对订单进行哪些修改，例如更改收货地址、调整商品数量或取消部分商品等。\n4. **提交修改请求**：通过公司内部系统或电话等方式向相关部门提交修改请求，并提供必要的订单号和详细信息。\n\n为了更好地指导您完成操作，请提供以下具体信息：\n\n- **订单号**：您希望修改的订单的具体编号。\n- **当前状态**：该订单目前处于什么状态（例如：待确认、已发货、部分发货等）。\n- **具体修改内容**：您需要对订单进行哪些方面的修改，比如数量、收货地址、商品信息等。\n\n基于这些信息，我可以帮助您模拟一个具体的操作流程。如果没有具体的订单号或当前状态，请提供一些示例情况以便我们进一步讨论。\n\n如果您已经有上述信息，请直接告诉我，我将为您生成相应的操作步骤。",
          "type": "ai",
          "time": "2025-03-12 18:38:22",
          "__id__": "8fdcb362-324d-4793-b353-b5a352234a63",
          "loading": false,
          "status": 200,
        },*/
      ],

      basicList: [
        {
          label: "怎么下单",
        },
        {
          label: "怎么修改订单",
        },
      ],
      loading: false,

      msg: "",

      scrollTop: 0,
    };
  },
  methods: {
    // 请求对话
    getAiAsk(question) {
      if (!question) return false;
      const __id__ = _generateUUID();

      this.scrollTop += this.scrollTop;

      this.msgList.push(
        {
          label: question,
          type: "user",
          time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
          __id__: _generateUUID(),
          status: 200,
        },
        {
          label: "",
          type: "ai",
          time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
          __id__,
          loading: true,
        },
      );

      const lastAiIndex = this.msgList.findIndex(item => _isEqual(item.__id__, __id__));
      const node = this.msgList[lastAiIndex];

      this.loading = true;

      getAskApi({question})
        .then(res => {
          if (_isString(res)) {
            this.$set(
              this.msgList,
              lastAiIndex,
              {
                ...node,
                time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
                label: res,
                status: 200,
                loading: false,
              },
            );
          } else {
            this.$set(
              this.msgList,
              lastAiIndex,
              {
                ...node,
                time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
                label: "服务繁忙，请稍后再试。",
                status: 500,
                loading: false,
              },
            );
          }
        })
        .catch(() => {
          this.$set(
            this.msgList,
            lastAiIndex,
            {
              ...node,
              time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
              label: "服务繁忙，请稍后再试。",
              status: 500,
              loading: false,
            },
          );

          this.loading = false;
        })
        .finally(() => {
          this.$set(node, "loading", false);
        });

      this.msg = "";
    },

    // 处理文字变化
    onChange() {
      this.scrollTop += 1;
    },

    // 文本输入完毕时触发
    onComplete() {
      this.loading = false;
    },

    // 直接跳转到底部
    onToEnd() {
      this.scrollTop += (this.scrollTop || 999);
    },
  },
  computed: {
    getShopImage() {
      return ShopImage;
    },
  },
  mounted() {
    this.AVM = AudioVM.getInst();
  },
};
</script>

<template>
  <view class="ko-smart">
    <scroll-view
      scroll-y="true"
      class="ko-smart__scroll"
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view class="ko-smart__scroll--wrap">
        <view class="ko-smart__basic ko-basic-box-shadow">
          <view class="ko-smart__basic--image" style="width: 160px;">
            <image style="width: 100%;" :src="getShopImage" mode="widthFix" />
          </view>

          <view
            style="font-size: 14px; color: #8f939c; margin-bottom: 20px; padding-left: 160px;"
          >
            有什么想咨询的，都可以跟我说
          </view>

          <view
            class="ko-basic-table ko-basic-table__not-border"
            style="grid-template-columns: auto auto;"
          >
            <view class="ko-basic-table--cell" v-for="item of basicList" :key="item.label">
              <button
                class="ko-smart__basic--button ko-basic-box-shadow"
                @click="getAiAsk(item.label)"
              >
                {{ item.label }}
              </button>
            </view>
          </view>
        </view>

        <view class="ko-smart__chat">
          <block v-for="item of msgList" :key="item.__id__">
            <view v-if="isEqual(item.type, 'user')">
              <UserMsg :item="item" />
            </view>
            <view v-if="isEqual(item.type, 'ai')">
              <AiMsg
                :item="item"
                @change="onChange"
                @complete="onComplete"
                @to-end="onToEnd"
              />
            </view>
            <view style="height: 10px;"></view>
          </block>
        </view>
      </view>
    </scroll-view>

    <view class="ko-basic-footer">
      <view class="ko-smart__submit">
        <input
          v-model="msg"
          placeholder="输入你想问的问题吧"
          class="ko-smart__submit--input"
          confirm-type="send"
          @confirm="getAiAsk(msg)"
          cursor-spacing="20"
          maxlength="-1"
          :disabled="loading"
        >
        <button
          :disabled="loading"
          :loading="loading"
          class="ko-smart__submit--button ko-basic-button__card"
          @click="getAiAsk(msg)"
        >
          <uni-icons type="paperplane" :color="loading ? '#C7C7C7' : '#fff'" />
          <text style="margin-left: 4px;">发送</text>
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-smart {
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(to top right, #e0f7fa, #e1bee7), linear-gradient(to top left, #BED6FF, #E2E9FF);
  background-blend-mode: multiply; /* 混合模式 */

  &__scroll {
    flex: 1;
    height: 100%;

    &--wrap {
      padding: 10px 10px 20px;
    }
  }

  // 通用问题
  &__basic {
    padding: 10px;
    margin-bottom: 10px;
    font-size: 12px;
    background: #fff;
    border-radius: 6px;

    position: relative;
    margin-top: 120px;

    &--image {
      position: absolute;
      left: 20px;
      top: 0;
      transform: translateY(-66%);
    }

    .ko-basic-table--cell {
      justify-content: flex-start;
      padding: 6px;
    }

    &--button {
      padding: 8px 10px;
      border-radius: 15px;
      border: 1px solid #c7c9ce;
      width: 100%;

      font-size: 14px;
      line-height: 1.2;
    }
  }

  &__submit {
    display: flex;
    align-items: center;

    &--input {
      flex: 1;
      border: 1px solid #e9e9eb;
      font-size: 14px;
      padding: 8px 10px;
      border-radius: 30px;
    }

    &--button {
      margin-left: 10px;
      font-size: 14px;
      padding: 8px 16px;
      line-height: 1.2;
    }
  }
}
</style>
