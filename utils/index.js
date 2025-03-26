import dayjs from "./dayjs";
import LodashSet from "./lodash/set";

export const weekHan = ["日", "一", "二", "三", "四", "五", "六"];

export const basicTimeValueFormat = "HH:mm";

/**
 * @description 获取近7天的日期
 */
export function getLast7Days() {
  let days = [];

  for (let i = 0; i < 7; i++) {
    const td = dayjs().add(i, "d");
    const value = td.format("YYYY-MM-DD");
    const label = `${(i === 0 ? "今天" : i === 1 ? "明天" : `周${weekHan[td.day()]}`)} ${td.format("MM-DD")}`;
    const w = td.day();
    const obj = {
      value, label, week: w === 0 ? 7 : w, date: td.date(),
    };
    days.push(obj);
  }

  return days;
}

/**
 * @description 获取预约时间
 */
export function getAppointmentTime() {
  let time = [];
  let start = dayjs().hour(9).minute(0).second(0);
  let end = dayjs().hour(23).minute(0).second(0);

  while (start.isBefore(end)) {
    const value = start.format("HH:mm");
    time.push({
      label: value, value: start.format(basicTimeValueFormat), seconds: convertTimeToSeconds(value),
    });
    start = start.add(1, "h"); // 增加30分钟
  }
  return time;
}

// 获取元素信息
export function getRect(selector, VM = this) {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .in(VM)
      .select(selector)
      .boundingClientRect(resolve)
      .exec();
  });
}

// 获取元素信息
export function getAllRect(selector, VM = this) {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .in(VM)
      .selectAll(selector)
      .boundingClientRect(resolve)
      .exec();
  });
}

// 分转元
export function transferYuan(points = 0) {
  const p = points / 100;
  return _round(isNaN(p) ? points : p, 2);
}

// 分转元
export function absYuan(points = 0) {
  return Math.abs(transferYuan(isNaN(points) ? 0 : points));
}

// 元转分
export function yuanToPoints(yuan = 0) {
  const y = yuan * 100;
  return isNaN(y) ? yuan : _round(y, 0);
}

// 分钟转秒钟
export function minutesToSeconds(minutes) {
  const m = minutes * 60;
  return isNaN(m) ? minutes : m;
}

// 秒转时间
export function convertSeconds(seconds) {
  let hours = 0;
  let minutes = 0;

  if (seconds >= 3600) {
    // 转换为小时和分钟
    hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    minutes = Math.floor(seconds / 60);
  } else {
    // 转换为分钟
    minutes = Math.floor(seconds / 60);
  }

  return hours > 0 ? `${hours}小时${minutes > 0 ? minutes + "分钟" : ""}` : `${minutes}分钟`;
}

// 时间转成秒钟
export function convertTimeToSeconds(time) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return (hours * 60 * 60) + (minutes * 60) + (isNaN(seconds) ? 0 : seconds);
}

// 秒钟转成时间
export function convertSecondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  const secondsAsInt = Math.floor(seconds);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}${secondsAsInt ? ":" + secondsAsInt.toString().padStart(2, "0") : ""}`;
}

export function addUnit(val) {
  if (!val || _isString(val)) return val;
  return `${val}px`;
}

// 判断是否是开发者工具
export function isDevTools() {
  const deviceInfo = uni.getDeviceInfo();
  return deviceInfo.platform === "devtools";
}

// 获取文件名后缀
export function getFileExtension(filename) {
  // 检查是否有文件名
  if (!filename) return "";

  // 找到最后一个点的位置
  const lastDotIndex = filename.lastIndexOf(".");

  // 如果没有点或点是文件名的最后一个字符，则没有扩展名
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) return "";

  // 返回最后一个点之后的子字符串作为扩展名
  return filename.substring(lastDotIndex + 1);
}

export function dealBigMoney(n) {
  let fraction = ["角", "分"];
  let digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  let unit = [["元", "万", "亿"], ["", "拾", "佰", "仟"]];
  let head = n < 0 ? "欠" : "";
  n = Math.abs(n);

  let s = "";

  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, "");
  }
  s = s || "整";
  n = Math.floor(n);

  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = "";
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s;
  }
  return head + s.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整");
}

// 通用 toast
export function CustomToast(opt) {
  uni.showToast({
    duration: 2000,
    ...opt,
    success() {
    },
  });

  if (opt.success && _isFunction(opt.success)) {
    const vm = setTimeout(() => {
      opt.success();
      clearTimeout(vm);
    }, (opt.duration || 1500));
  }
}

/**
 * @description 深拷贝
 */
export function _deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  let copy = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = _deepCopy(obj[key]);
    }
  }
  return copy;
}

export function _pick(object, keys) {
  if (!object || typeof object !== "object") {
    return {};
  }

  const picked = {};
  const keysArray = Array.isArray(keys) ? keys : [keys];

  keysArray.forEach(key => {
    if (key in object) {
      picked[key] = object[key];
    }
  });

  return picked;
}

export function _get(obj, path, defaultValue = undefined) {
  if (obj == null) return defaultValue;
  if (typeof path === "string") path = path.split(".");
  let result = obj;
  for (let i = 0; i < path?.length; i++) {
    if (result == null || !(path[i] in result)) {
      return defaultValue;
    }
    result = result[path[i]];
  }
  return result;
}

export const _set = LodashSet;

export function _chunk(array, size) {
  if (size < 1) {
    return [];
  }
  let result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function _flattenDeep(array) {
  return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(_flattenDeep(val)) : acc.concat(val), []);
}

export function _isEmpty(value) {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  if (Array.isArray(value) || typeof value === "string") {
    return value.length === 0;
  }

  if (typeof value === "object") {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  return false;
}

export function _isEqual(value, other) {
  // 处理null和undefined的情况
  if (value === other) return true;
  if (typeof value !== "object" || typeof other !== "object" || value == null || other == null) {
    return value === other;
  }
  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) return false;
    for (let i = 0; i < value.length; i++) {
      if (!_isEqual(value[i], other[i])) return false;
    }
    return true;
  }
  if (typeof value === "object" && typeof other === "object") {
    const keysA = Object.keys(value);
    const keysB = Object.keys(other);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (!keysB.includes(key) || !_isEqual(value[key], other[key])) return false;
    }
    return true;
  }
  return false;
}

export function _hasOverlap(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  return arr2.some(item => set1.has(item));
}

export function _isString(value) {
  return typeof value === "string" || (value instanceof String);
}

export function _sum(array, iteratee) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array as the first argument.");
  }

  let result = 0;
  if (typeof iteratee === "function") {
    return array.reduce((sum, value, index, array) => {
      return sum + iteratee(value, index, array);
    }, 0);
  } else {
    return array.reduce((sum, value) => {
      if (typeof value === "number" && !isNaN(value)) {
        return sum + value;
      }
      return sum;
    }, 0);
  }
}

export function _groupBy(array, iteratee) {
  // 检查输入是否为数组
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array as the first argument.");
  }

  // 初始化结果对象
  const result = {};

  // 遍历数组
  array.forEach(item => {
    // 如果提供了迭代函数，则使用该函数的返回值作为键
    // 否则，使用原始元素作为键
    const key = typeof iteratee === "function" ? iteratee(item) : item;

    // 如果结果对象中没有该键，则初始化一个空数组
    if (!result.hasOwnProperty(key)) {
      result[key] = [];
    }

    // 将当前元素添加到对应键的数组中
    result[key].push(item);
  });

  return result;
}

export function _orderBy(array, ...iteratees) {
  // 检查输入是否为数组
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array as the first argument.");
  }

  // 如果没有提供迭代函数，则返回原始数组的副本
  if (iteratees.length === 0) {
    return array.slice();
  }

  // 使用数组的 sort 方法进行排序
  return array.slice().sort((a, b) => {
    for (let i = 0; i < iteratees.length; i++) {
      const [iteratee, order] = iteratees[i] instanceof Array ? iteratees[i] : [iteratees[i], "asc"];
      let resultA = iteratee(a);
      let resultB = iteratee(b);

      // 处理升序和降序
      if (order === "asc") {
        if (resultA < resultB) {
          return -1;
        }
        if (resultA > resultB) {
          return 1;
        }
      } else if (order === "desc") {
        if (resultA > resultB) {
          return -1;
        }
        if (resultA < resultB) {
          return 1;
        }
      }
      // 如果两个结果相等，则继续下一个迭代函数
    }
    // 如果所有迭代函数的结果都相等，则认为这两个元素相等
    return 0;
  });
}

export function _sortBy(array, ...iteratees) {
  // 如果没有提供迭代函数，则直接返回原始数组
  if (!iteratees.length) return array;

  // 使用数组的 sort 方法和自定义比较函数
  return array.sort((a, b) => {
    // 遍历所有的迭代函数
    for (let i = 0; i < iteratees.length; i++) {
      // 调用迭代函数并获取比较值
      const result = iteratees[i](a) - iteratees[i](b);
      // 如果结果不为 0，则根据结果排序
      if (result !== 0) return result;
    }
    // 如果所有迭代函数的结果都为 0，则认为两个元素相等
    return 0;
  });
}

export function _omit(obj, keys) {
  // 确保输入是一个对象
  if (typeof obj !== "object" || obj === null) {
    return {};
  }

  // 确保键是一个数组或者类数组对象
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  // 创建一个新对象，包含所有键值对，除了要排除的键
  const result = {};
  Object.keys(obj).forEach(key => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  });

  return result;
}

export function _merge(target, ...sources) {
  // 遍历所有源对象
  sources.forEach(source => {
    // 获取源对象的所有键
    Object.keys(source).forEach(key => {
      // 如果目标对象和源对象在这个键上都是对象，则递归合并
      if (_isObject(target[key]) && _isObject(source[key])) {
        _merge(target[key], source[key]);
      } else {
        // 否则，用源对象的值覆盖目标对象的值
        target[key] = source[key];
      }
    });
  });
  return target;
}

export function _isObject(item) {
  return (item && typeof item === "object" && !Array.isArray(item));
}

export function _isFunction(value) {
  return Object.prototype.toString.call(value) === "[object Function]";
}

export function _keys(obj) {
  const result = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result.push(key);
    }
  }
  return result;
}

// 对比两个数组中是否有一样的值
export function _haveCommonElements(arr1, arr2) {
  return (arr2 || []).some(value => (arr1 || []).includes(value));
}

// 是否是开发者工具
export function _isEnv() {
  // #ifdef H5
  return _isEqual(process.env.NODE_ENV, "development");
  // #endif
  return _isEqual(uni.getDeviceInfo()?.platform, "devtools");
}

export function _xor(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  return Array.from(new Set([...set1].filter(x => !set2.has(x)).concat([...set2].filter(x => !set1.has(x)))));
}

export function _maxBy(array, iteratee) {
  if (!array || !iteratee || _isEmpty(array)) return undefined;

  return array?.reduce((obj1, obj2) => {
    return iteratee(obj1) > iteratee(obj2) ? obj1 : obj2;
  });
}

export function _round(number, precision = 0) {
  if (precision === 0) {
    return Math.round(number);
  }
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

export function _uniqWith(array, comparator) {
  const result = [];
  const seen = new WeakMap();

  array.forEach((item) => {
    // 如果没有提供比较器函数，则使用严格相等性检查
    const key = comparator ? comparator(item) : item;

    if (!seen.has(key)) {
      seen.set(key, true);
      result.push(item);
    }
  });

  return result;
}

export function _uniqBy(arr, iteratee) {
  const seen = new Map();
  return arr.filter((item) => {
    const key = typeof iteratee === "function" ? iteratee(item) : item[iteratee];
    if (!seen.has(key)) {
      seen.set(key, true);
      return true;
    }
    return false;
  });
}

export function _uniq(arr) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (!result.includes(arr[i])) {
      result.push(arr[i]);
    }
  }
  return result;
}

export function _isUndefined(str) {
  return typeof str === "undefined";
}

export function _isNull(str) {
  return Object.is(str, null);
}

// 不是 undefined 并且不是 null 返回 true
export function _isNotUnNil(str) {
  return !_isUndefined(str) && !_isNull(str);
}

export function _is(val, type) {
  return toString.call(val) === `[object ${type}]`;
}

export function _isBoolean(val) {
  return _is(val, "Boolean");
}

// 开发模式
export function _isDev() {
  return process.env?.NODE_ENV === "development";
}

export function _isNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

export function _debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function _generateUniqueId() {
  return `id_${+new Date()}_${Math.random().toString(50).substr(2, 9)}`;
}

export function _generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // 随机数
    const v = c === "x" ? r : (r & 0x3) | 0x8; // 确保符合 UUID 格式
    return v.toString(16);
  });
}

export function _toFinite(value) {
  if (value === Infinity) {
    return Number.MAX_VALUE; // 最大正数
  }
  if (value === -Infinity) {
    return -Number.MAX_VALUE; // 最大负数
  }
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value; // 处理 NaN
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed; // 处理可解析的字符串
  }
  if (value === null || value === undefined || value === false || value === true) {
    return +value || 0; // 转换布尔值和 null
  }
  const finiteValue = Number(value);
  return isNaN(finiteValue) ? 0 : finiteValue; // 处理其他情况
}

export function _reverse(array) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array");
  }

  let start = 0;
  let end = array.length - 1;

  while (start < end) {
    // 交换 start 和 end 的值
    let temp = array[start];
    array[start] = array[end];
    array[end] = temp;

    start++;
    end--;
  }

  return array;
}

/**
 * @description 获取定制表格的cell样式
 */
export function xlsxCellStyle(node, rIndex, cIndex, config, isChild = false) {
  const mc = _get(node, "mc");
  const textDecoration = [];
  const rowLen = _get(config, "rowlen") || {};
  const columnlen = _get(config, "columnlen") || {};

  if (_get(node, "un")) textDecoration.push("underline");
  if (_get(node, "cl")) textDecoration.push("line-through");

  let style = {
    color: _get(node, "fc") || "",
    background: _get(node, "bg") || "",
    fontWeight: ["normal", "bold"][_get(node, "bl")],
    fontStyle: ["normal", "italic"][_get(node, "it")],
    fontFamily: _get(node, "ff") || "Times New Roman",// ["Times New Roman", "Arial", "Tahoma", "Verdana", "微软雅黑", "宋体", "黑体（ST Heiti）", "楷体（ST Kaiti）", "仿宋（ST FangSong）", "新宋体（ST Song）", "华文新魏", "华文行楷", "华文隶书"][_get(node, "ff")],

    fontSize: (_get(node, "fs") || 10) + "pt",

    "justify-content": ["center", "flex-start", "flex-end"][_get(node, "ht")] || "left",
    "align-items": ["center", "flex-start", "flex-end"][_get(node, "vt")] || "center",

    // textAlign: ["center", "left", "right"][_get(node, "ht")] || "center",
    // verticalAlign: ["center", "top", "bottom"][_get(node, "vt")] || "middle",

    "textDecoration": textDecoration.join(" "),

    ...({
      0: {
        "white-space": "nowrap", /* 防止自动换行 */
        overflow: "hidden", /* 隐藏超出部分 */
        "text-overflow": "ellipsis", /* 显示省略号 */
      },
      1: {
        "white-space": "nowrap", /* 防止自动换行 */
        overflow: "visible", /* 允许内容溢出 */
      },
      2: {
        "white-space": "normal", /* 允许内容自动换行 */
        "word-wrap": "break-word", /* 在单词内换行 */
      },
    }[_get(node, "tb")]),


    padding: "2px",
    width: (columnlen?.[cIndex] || 72) + "px",
  };

  const height = rowLen[rIndex] || 19;

  if (height) {
    style.height = `${height + 4}px`;
  }

  if (_isObject(node) && _isObject(mc)) {
    const cs = _get(mc, "cs") || 0;
    const rs = _get(mc, "rs") || 0;

    if (!(cs || rs)) {
      style.display = "none";
    } else {
      style["grid-area"] = `${rIndex + 1}/${cIndex + 1}/span ${rs}/span ${cs}`;
      style.height = "auto";
      style.width = "auto";
    }
  }

  // 判断是否是多个子级
  if (_get(node, "ct.s")) {
    style = _pick(style, ["grid-area", "width", "height", "padding", "justify-content", "align-items", "display"]);
  }

  if (isChild) {
    style.width = "auto";
    style.height = "auto";
  }

  return style;
}

// #ifdef H5
// 动态添加 js
export function loadScript(url, callback) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.className = "__script__";
  script.src = url;

  script.onload = () => {
    console.log("Script loaded successfully");
    if (callback) {
      callback();
    }
  };

  script.onerror = () => {
    console.error("Script failed to load");
  };

  document.head.appendChild(script);
}

// 动态添加 css
export function loadCss(url, callback) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.className = "__script__";

  link.onload = () => {
    if (callback) {
      callback();
    }
  };

  link.onerror = () => {
    console.error("Script failed to load");
  };

  document.head.appendChild(link);
}

// #endif


// 判断是不是相片
export function isImageType(suffix) {
  if (!suffix) return false;
  return ["JPEG", "JPG", "PNG", "GIF", "BMP", "SVG", "HEIf", "HEIC", "RAW", "WEBP"].includes(suffix.toUpperCase());
}


// 判断是不是PDF
export function isPdfType(suffix) {
  if (!suffix) return false;
  return ["PDF"].includes(suffix.toUpperCase());
}

// 判断是不是Word
export function isWordType(suffix) {
  if (!suffix) return false;
  return ["DOCX", "DOC", "DOT", "DOTX"].includes(suffix.toUpperCase());
}

// 判断是不是 XLS
export function isExcelType(suffix) {
  if (!suffix) return false;
  return ["XLS", "XLSX"].includes(suffix.toUpperCase());
}

// 判断是不是 CDA 文件
export function isCDAType(suffix) {
  if (!suffix) return false;
  return ["DWG", "DXF", "DWT", "BAK"].includes(suffix.toUpperCase());
}
