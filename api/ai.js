import request from "@/request";

/**
 * @description 请求智能相关东西
 */
export function getAskApi(data) {
  return request({
    url: "/ai/ask",
    method: "get",
    data,
  }, false, true);
}

/**
 * @description 获取声音列表
 */
export function getVoicesListApi(data) {
  return request({
    url: "/ai/voices",
    method: "get",
    data,
  }, false, true);
}

/**
 * @description 根据语音获取音频数据
 */
export function getRecordService(data) {
  return request({
    url: "/ai/record",
    method: "post",
    data,
    responseType: "arraybuffer",
    header: {
      "Content-Type": "application/octet-stream",
    },
  }, false, false, true);
}
