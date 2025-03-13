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
