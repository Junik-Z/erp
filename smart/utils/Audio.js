import { Volume } from "./Volume.js";
import { getRecordService } from "@/api/ai";

class AudioVM {
  constructor() {
    this.init();
  }

  init() {
    // 获取全局录音实例
    this.RM = uni.getRecorderManager();
    // 获取文件操作实例
    this.FM = uni.getFileSystemManager();
    this.Volume = Volume.getInst(this.RM);

    // 获取播放器实例
    this.AC = uni.createInnerAudioContext({useWebAudioImplement: true});

    this.onMonitor();
  }

  getInst() {
    if (!this.inst) {
      this.inst = new AudioVM();
    }
    return this.inst;
  }

  // 开始监听
  onMonitor() {
    this.RM.onFrameRecorded((res) => {
      this.Volume.devWebmDecode(res.frameBuffer, (v) => {
        const n = 5;
        let t = v * 0.05;
        const h = (Math.max(0, t * n));
        const n1 = 1;
        const h1 = Math.max(0.2, 1 - t * n1);
        this.updateWaveView({h, h1});
      });
    });
    // 监听停止
    this.RM.onStop((res) => {
      this.FM.readFile({
        filePath: res.tempFilePath,
        success: (data) => {
          if (data.data) {
            that.updateAudioAndPlay(data.data);
          }
        },
        fail(res) {
          console.error("读录音失败", res.errMsg);
        },
      });
    });
  }

  // 更新试图
  updateWaveView() {
  }

  // 发起请求答案
  updateAudioAndPlay(buffer) {
    if (this.playing || this.loading) return;
    this.loading = true;

    getRecordService(buffer)
      .then(res => {
        if (res.statusCode !== 200) {
          return;
        }
        const type = res.header["Content-Type"] || res.header["content-type"];
        if (!type || type.indexOf("application/json") >= 0) {
          console.warn("获取声音失败");
          return;
        }
        if (res.data) {
          this.payRes(res);
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  // 播放音频
  payRes(res) {
    const that = this;
    try {
      const buffer = res.data;
      if (!buffer || buffer.byteLength === 0 || buffer.length === 0) return false;

      this.playing = true;

      // #ifdef H5
      const url = URL.createObjectURL(new Blob([buffer], {
        type: "audio/mp3",
      }));
      this.AC.src = url;
      // #endif

      // #ifdef MP-WEIXIN
      const filePath = `${wx.env.USER_DATA_PATH}/q${Date.parse(new Date())}.wav`;

      this.FM.writeFile({
        filePath,
        data: buffer,
        encoding: "binary",
        success(e) {
          this.AC.src = filePath;
        },
        fail(error) {
          that.playing = false;
          console.error("文件保存失败", error);
        },
      });

      // #endif

    } catch (e) {
      console.error(e);
      this.playing = false;
    }
  }

}

export { AudioVM };
