import { _isEnv } from "@/utils";

let devWebMInfo = {};

function NOOP() {
}

class Volume {
  static devWebCtx = null;

  constructor(vm) {
    this.mg = vm;
    this.init();
  }

  init() {
    this.devWebCtx = uni.createWebAudioContext();
  }

  static getInst(mg) {
    if (!this.inst) {
      this.inst = new Volume(mg);
    }
    return this.inst;
  }

  reset() {
    devWebMInfo = {};
  }

  onRecFn(pcm, success) {
    let sum = 0;
    for (let i = 0; i < pcm.length; i++) {
      sum += Math.abs(pcm[i]);
    }

    const size = pcm.length;
    const n = this.getPowerLevel(sum, size);
    success(n);
  }

  devWebmDecode(aBuf, success = NOOP) {
    const This = this;
    let inBytes = null;
    const scope = devWebMInfo;

    if (_isEnv()) {
      inBytes = new Uint8Array(aBuf);
    } else {
      This.onRecFn(new Int16Array(aBuf), success);
      return;
    }

    if (!scope.pos) {
      scope.pos = [0];
      scope.tracks = {};
      scope.bytes = [];
    }
    const tracks = scope.tracks,
      position = [scope.pos[0]];
    const endPos = function () {
      scope.pos[0] = position[0];
    };

    const sBL = scope.bytes.length;
    const bytes = new Uint8Array(sBL + inBytes.length);
    bytes.set(scope.bytes);
    bytes.set(inBytes, sBL);
    scope.bytes = bytes;

    //检测到不是webm，当做pcm直接返回
    const returnPCM = function () {
      scope.bytes = [];
      This.onRecFn(new Int16Array(bytes), success);
    };

    if (scope.isNotWebM) {
      returnPCM();
      return;
    }

    if (!scope._ht) {
      let headPos0 = 0;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] == 0x1A && bytes[i + 1] == 0x45 && bytes[i + 2] == 0xDF && bytes[i + 3] == 0xA3) {
          headPos0 = i;
          position[0] = i + 4;
          break;
        }
      }
      if (!position[0]) {
        if (bytes.length > 5 * 1024) {
          console.warn("未识别到WebM数据，开发工具可能已支持PCM");
          scope.isNotWebM = true;
          returnPCM();
        }
        return;
      }
      readMatroskaBlock(bytes, position);
      if (!BytesEq(readMatroskaVInt(bytes, position), [0x18, 0x53, 0x80, 0x67])) {
        return;
      }
      readMatroskaVInt(bytes, position);
      while (position[0] < bytes.length) {
        let eid0 = readMatroskaVInt(bytes, position);
        let bytes0 = readMatroskaBlock(bytes, position);
        let pos0 = [0],
          audioIdx = 0;
        if (!bytes0) return;
        if (BytesEq(eid0, [0x16, 0x54, 0xAE, 0x6B])) {
          scope._ht = bytes.slice(headPos0, position[0]);
          console.warn("WebM Tracks", tracks);
          endPos();
          break;
        }
      }
    }

    let datas = [],
      dataLen = 0;
    while (position[0] < bytes.length) {
      let p0 = position[0];
      let eid1 = readMatroskaVInt(bytes, position);
      let p1 = position[0];
      let bytes1 = readMatroskaBlock(bytes, position);
      if (!bytes1) break;
      if (BytesEq(eid1, [0xA3])) {
        let arr = bytes.slice(p0, position[0]);
        dataLen += arr.length;
        datas.push(arr);
      }
      endPos();
    }

    if (!dataLen) {
      return;
    }
    let more = new Uint8Array(bytes.length - scope.pos[0]);
    more.set(bytes.subarray(scope.pos[0]));
    scope.bytes = more;
    scope.pos[0] = 0;

    let add = [0x1F, 0x43, 0xB6, 0x75, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]; // Cluster
    add.push(0xE7, 0x81, 0x00);
    dataLen += add.length;
    datas.splice(0, 0, add);

    dataLen += scope._ht.length;
    datas.splice(0, 0, scope._ht);

    let u8arr = new Uint8Array(dataLen); //已获取的音频数据
    for (let i = 0, i2 = 0; i < datas.length; i++) {
      u8arr.set(datas[i], i2);
      i2 += datas[i].length;
    }

    This.devWebCtx
      .decodeAudioData(
        u8arr.buffer,
        function (raw) {
          const src = raw.getChannelData(0);
          const pcm = new Int16Array(src.length);
          for (let i = 0; i < src.length; i++) {
            let s = Math.max(-1, Math.min(1, src[i]));
            s = s < 0 ? s * 0x8000 : s * 0x7FFF;
            pcm[i] = s;
          }
          This.onRecFn(pcm, success);
        },
        function () {
          console.warn("WebM解码失败");
        },
      );
  }

  getPowerLevel(pcmAbsSum, pcmLength) {
    /* 计算音量 https://blog.csdn.net/jody1989/article/details/73480259 */
    const power = (pcmAbsSum / pcmLength) || 0;

    let level;
    if (power < 1251) { //1250的结果10%，更小的音量采用线性取值
      level = Math.round(power / 1250 * 10);
    } else {
      level = Math.round(Math.min(100, Math.max(0, (1 + Math.log(power / 10000) / Math.log(10)) * 100)));
    }

    return level;
  }
}

//两个字节数组内容是否相同
function BytesEq(bytes1, bytes2) {
  if (!bytes1 || bytes1.length != bytes2.length) return false;
  if (bytes1.length == 1) return bytes1[0] == bytes2[0];
  for (let i = 0; i < bytes1.length; i++) {
    if (bytes1[i] != bytes2[i]) return false;
  }
  return true;
}

//读取一个可变长数值字节数组
function readMatroskaVInt(arr, pos, trim) {
  let i = pos[0];
  if (i >= arr.length) return;
  let b0 = arr[i],
    b2 = ("0000000" + b0.toString(2)).substr(-8);
  let m = /^(0*1)(\d*)$/.exec(b2);
  if (!m) return;
  let len = m[1].length,
    val = [];
  if (i + len > arr.length) return;
  for (let i2 = 0; i2 < len; i2++) {
    val[i2] = arr[i];
    i++;
  }
  if (trim) val[0] = parseInt(m[2] || "0", 2);
  pos[0] = i;
  return val;
}

//字节数组BE转成int数字
function BytesInt(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    let n = bytes[i];
    s += (n < 16 ? "0" : "") + n.toString(16);
  }
  return parseInt(s, 16) || 0;
}

function readMatroskaBlock(arr, pos) {
  const lenVal = readMatroskaVInt(arr, pos, 1);
  if (!lenVal) return;
  let len = BytesInt(lenVal);
  let i = pos[0],
    val = [];
  if (len < 0x7FFFFFFF) {
    if (i + len > arr.length) return;
    for (let i2 = 0; i2 < len; i2++) {
      val[i2] = arr[i];
      i++;
    }
  }
  pos[0] = i;
  return val;
}

export { Volume };
