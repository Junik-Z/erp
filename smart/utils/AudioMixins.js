import { Volume } from "@/smart/utils/Volume";
import { getAskApi, getRecordService } from "@/api/ai";
import { _generateUUID, _isArrayBuffer, _isEqual, _isString } from "@/utils";
import Dayjs from "@/utils/dayjs";

export default {
  data() {
    return {
      // 播放中
      playing: false,
      // 是否禁用录音
      micFlag: false,
      askLoading: false,

      msgList: [
        /*  {
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
         }, */
      ],

      msg: "",

      styles: {},

      // 开始触摸的位置
      sClientY: 0,
      // 是否需要取消
      isCancel: false,
    };
  },
  methods: {
    // 初始化录音权限
    initRecording() {
      // 获取全局录音实例
      this.RM = uni.getRecorderManager();
      // 获取文件操作实例
      this.FM = uni.getFileSystemManager();
      this.Volume = Volume.getInst(this.RM);
      // 获取播放器实例
      this.AC = uni.createInnerAudioContext({useWebAudioImplement: true});

      // 初始化播放器
      this.AC.autoplay = true;
      this.AC.onError((res) => {
        this.playing = false;
        this.micFlag = true; //恢复录音
        console.log("播放错误");
      });
      // 播放结束
      this.AC.onEnded((res) => {
        this.endplay && clearTimeout(this.endplay);
        this.endplay = setTimeout(() => {
          this.playing = false;
        }, 1000);
      });

      // 开始监听音频流
      this.RM.onFrameRecorded((res) => {
        this.Volume.devWebmDecode(res.frameBuffer, (v) => {
          const n = 5;
          let t = v * 0.05;
          const h = (Math.max(0, t * n));

          const n1 = 1;
          const h1 = Math.max(0.2, 1 - t * n1);

          const s = Math.min(Math.max(2, h * 100), 100);

          this.updateWaveView({h, h1, v, s});
        });
      });
      // 监听停止
      this.RM.onStop((res) => {
        if (this.isCancel) return false;

        this.FM.readFile({
          filePath: res.tempFilePath,
          success: (data) => {
            if (data.data) {
              this.updateAudioAndPlay(data.data);
            }
          },
          fail(res) {
            console.error("读录音失败", res.errMsg);
          },
        });
      });
    },

    // 更新试图
    updateWaveView(data) {
      console.log(data);
      this.styles = {
        "--vol-size": (data?.s || 2) + "%",
      };
    },

    // 发起请求答案
    updateAudioAndPlay(buffer) {
      if (this.playing || this.askLoading) return;
      this.askLoading = true;

      if (uni.$__SOCKET_TASK__) {
        uni.$__SOCKET_TASK__.send({
          data: buffer,
          success: (res) => {
            console.log(res);
          },
          complete: () => {
            this.WSTIME = setTimeout(() => {
              this.askLoading = false;
            }, (1000 * 30));
          },
        });
        return false;
      }

      getRecordService(buffer)
        .then(res => {
          if (res.statusCode !== 200) return false;
          const type = res.header["Content-Type"] || res.header["content-type"];
          if (!type || type.indexOf("application/json") >= 0) {
            console.warn("获取声音失败");
            return false;
          }
          if (res.data) {
            this.payRes(res);
          }
        })
        .finally(() => {
          this.askLoading = false;
        });
    },

    // 播放音频
    payRes(res) {
      try {
        const buffer = res.data;
        if (!buffer || buffer.byteLength === 0 || buffer.length === 0) return false;
        // this.AC.stop();

        this.playing = true;

        // #ifdef H5
        this.AC.src = URL.createObjectURL(new Blob([buffer], {
          type: "audio/mp3",
        }));
        // #endif

        // #ifdef MP-WEIXIN
        const filePath = `${wx.env.USER_DATA_PATH}/q${Date.parse(new Date())}.wav`;

        this.FM.writeFile({
          filePath,
          data: buffer,
          encoding: "binary",
          success: (e) => {
            console.log(e, filePath);
            this.AC.src = filePath;
          },
          fail: (error) => {
            this.playing = false;
            console.error("文件保存失败", error);
          },
        });
        // #endif

      } catch (e) {
        console.error("音频播放失败", e);
        this.playing = false;
      }
    },

    // 开始录音
    startRecord(event) {
      if (this.askLoading || this.playing) return false;

      this.sClientY = event.touches[0].clientY; // 记录初始 Y 坐标
      this.isCancel = false;

      // #ifdef MP
      wx.vibrateShort({type: "medium"});

      this.RM.start({
        sampleRate: 16000,
        encodeBitRate: 24000,
        numberOfChannels: 1,
        format: "pcm",
        frameSize: 1,
      });
      // #endif

      // #ifdef H5 || APP
      this.micFlag = true;
      // #endif
    },

    // 暂停录音
    pauseRecord() {
      setTimeout(() => {
        this.updateWaveView({h: 0, h1: 0, v: 0, s: 2});
        this.isCancel = false;
      }, 1000);

      // #ifdef MP
      this.RM.stop();
      // #endif

      // #ifdef H5 || APP
      this.micFlag = false;
      // #endif
    },

    // 暂停播放
    pausePlay() {
      this.AC.pause();
      this.playing = false;
    },

    // 处理移动了
    moveRecord(event) {
      const currentY = event.touches[0].clientY;
      const moveDistance = this.sClientY - currentY; // 计算垂直滑动距离
      // 若滑动距离超过阈值（如 50px），则标记为取消
      if (moveDistance > 50) {
        this.isCancel = true;
      }
    },

    // socket 消息
    askWebSocketMsg(res) {
      this.WSTIME && clearTimeout(this.WSTIME);
      this.askLoading = false;

      if (_isEqual(res.askEnum, "ChatMessage")) {


        if (this.aTId) {
          const lastAiIndex = this.msgList.findIndex(item => _isEqual(item.__id__, this.aTId));
          const node = this.msgList[lastAiIndex];

          if (_isString(res.data)) {
            this.$set(
              this.msgList,
              lastAiIndex,
              {
                ...node,
                time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
                label: res.data,
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

          this.aTId = null;
        } else {
          this.rid = _generateUUID();
          console.log(res.data);
          this.msgList.push({
            label: res.data,
            type: "ai",
            time: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
            __id__: this.rid,
            loading: false,
          });
        }

      }

      if (_isArrayBuffer(res.data)) {
        console.log("播放了", res);
        this.payRes(res);
      }
    },

    // 发送文字消息
    aiTextAsk(question) {
      if (!question) return false;
      this.scrollTop += this.scrollTop;

      this.aTId = _generateUUID();
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
          __id__: this.aTId,
          loading: true,
        },
      );

      const lastAiIndex = this.msgList.findIndex(item => _isEqual(item.__id__, this.aTId));
      const node = this.msgList[lastAiIndex];

      if (uni.$__SOCKET_TASK__) {
        this.askLoading = true;
        uni.$__SOCKET_TASK__.send({
          data: JSON.stringify({askEnum: "ChatMessage", data: question}),
          success: (res) => {
            console.log(res);
          },
          complete: () => {
            this.WSTIME = setTimeout(() => {
              this.askLoading = false;
              this.$set(node, "loading", false);
            }, (1000 * 20));
          },
        });
      } else {
        this.askLoading = true;

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
            this.askLoading = false;
          })
          .finally(() => {
            this.$set(node, "loading", false);
          });
      }

      this.msg = "";
    },

    // 使用语音
    toVoice() {
      this.isMsg = false;
      this.initRecording();
    },

    // 使用文字交流
    toWord() {
      this.isMsg = true;
      this.onDestroy();
    },

    // 销毁没用的实例
    onDestroy() {
      if (!!this.AC) {
        this.AC.stop();
        this.AC.destroy();
      }
    },
  },
  beforeDestroy() {
    this.onDestroy();

    uni.$off("$__web_socket_message__");
  },
  mounted() {
    // this.initRecording();
    uni.$emit("$__init_web_socket__");
    uni.$on("$__web_socket_message__", this.askWebSocketMsg);
  },
};
