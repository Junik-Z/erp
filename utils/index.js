import dayjs from "./dayjs";

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
  return isNaN(p) ? points : p;
}

// 元转分
export function yuanToPoints(yuan = 0) {
  const y = yuan * 100;
  return isNaN(y) ? yuan : y;
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
  return `${val}rpx`;
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
export function showToast(opt) {
  uni.showToast({
    ...opt, success() {
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
  for (let i = 0; i < path.length; i++) {
    if (result == null || !(path[i] in result)) {
      return defaultValue;
    }
    result = result[path[i]];
  }
  return result;
}

export function _set(obj, path, value, customizer) {
  if (obj == null) return obj;
  if (typeof path === "string") path = path.split(".");
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current[key] == null) {
      current[key] = Array.isArray(path[i + 1]) ? [] : {};
    }
    current = current[key];
  }
  const lastKey = path[path.length - 1];
  if (customizer) {
    customizer(current, lastKey, value);
  } else {
    current[lastKey] = value;
  }
  return obj;
}

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

export function hasOverlap(arr1, arr2) {
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
  return _isEqual(uni.getDeviceInfo()?.platform, "devtools");
}

export function _xor(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  return Array.from(new Set([...set1].filter(x => !set2.has(x)).concat([...set2].filter(x => !set1.has(x)))));
}

export function _maxBy(array, iteratee) {
  if (!array || !iteratee) return undefined;
  return array.reduce((obj1, obj2) => {
    return iteratee(obj1) > iteratee(obj2) ? obj1 : obj2;
  });
}


/**
 财通
 智链
 业达
 企管家
 智链财
 财易通
 企易宝

 荣创达
 */
