import { Volume } from "./Volume.js";
import { getRecordService } from "@/api/ai";

class AudioVM {
  // 播放中
  playing = false;
  // 录音
  micFlag = false;

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

    console.log("初始化了", this.RM);

    this.initAC();
    this.onMonitor();

    // setTimeout(() => this.startRecord(), 5000);
  }

  static getInst() {
    if (!this.inst) {
      this.inst = new AudioVM();
    }
    return this.inst;
  }

  // 初始化播放器
  initAC() {
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
        console.log("end");
        if (this.pauseStatus) {
          this.micFlag = true; //恢复录音
        }
        this.pauseStatus = false;
        // this.closeService(); //关闭人
      }, 1000);

    });
  }

  // 开始监听
  onMonitor() {
    this.RM.onFrameRecorded((res) => {
      // console.log("获取到的声音数据", res);
      this.Volume.devWebmDecode(res.frameBuffer, (v) => {
        const n = 5;
        let t = v * 0.05;
        const h = (Math.max(0, t * n));
        const n1 = 1;
        const h1 = Math.max(0.2, 1 - t * n1);
        // this.updateWaveView({h, h1});
      });
    });
    // 监听停止
    this.RM.onStop((res) => {
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
  }

  // 更新试图
  updateWaveView(data) {
    console.log(data);
  }

  // 发起请求答案
  updateAudioAndPlay(buffer) {
    if (this.playing || this.loading) return;
    this.loading = true;

    getRecordService(buffer)
      .then(res => {
        console.log(res);
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
      console.error(e);
      this.playing = false;
    }
  }

  // 开始录音
  startRecord() {
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
  }

  pauseRecord() {
    console.log("录音结束");
    // #ifdef MP
    this.RM.stop();
    // #endif

    // #ifdef H5 || APP
    this.micFlag = false;
    // #endif
  }

}

export { AudioVM };
