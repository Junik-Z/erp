<script>
import { getAskApi } from "@/api/ai";
import Dayjs from "@/utils/dayjs";
import { _generateUUID, _isEqual, _isString } from "@/utils";
import mixins from "@/mixins/mixins";
import UserMsg from "./components/UserMsg.vue";
import AiMsg from "./components/AiMsg.vue";

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
          <view style="font-size: 12px; color: #8f939c; margin-bottom: 5px;">有什么想咨询的，都可以跟我说</view>
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

    .ko-basic-table--cell {
      justify-content: flex-start;
      padding: 6px;
    }

    &--button {
      padding: 4px 10px;
      border-radius: 15px;
      border: 1px solid #c7c9ce;
      width: 100%;

      font-size: 12px;
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
      border-radius: 6px;
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
