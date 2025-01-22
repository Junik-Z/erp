import request from "@/request";

/**
 * @description 我的考勤列表
 */
export function getAttendanceListApi(data) {
  return request({
    url: "/attendance/records",
    method: "get",
    data,
  });
}

/**
 * @description 获取考勤配置
 */
export function getAttendanceSettingApi(data) {
  return request({
    url: "/attendance/setting",
    method: "get",
    data,
  });
}

/**
 * @description 获取所有人员记录
 */
export function getAllRecordsListApi(data) {
  return request({
    url: "/attendance/all-records",
    method: "get",
    data,
  });
}

/**
 * @description 打卡
 */
export function checkinApi(data) {
  return request({
    url: "/attendance/checkin",
    method: "post",
    data,
  }, false);
}

/**
 * @description 设置打卡时间
 */
export function settingApi(data) {
  return request({
    url: "/attendance/setting",
    method: "post",
    data,
  });
}

/**
 * @description 二维码密钥
 */
export function showQRCodeApi(data) {
  return request({
    url: "/attendance/showQRCode",
    method: "get",
    data,
  });
}
