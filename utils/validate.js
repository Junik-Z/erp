/**
 * @description 自定义校验电话号码
 */
export function validatePhone(label) {
  return {
    rules: [
      {
        required: true,
        errorMessage: "请输入手机号码",
      },
      {
        required: true,
        format: "string",
        validateFunction: function (rule, value, data, callback) {
          const regexMobile = /^1[3-9]\d{9}$/;
          if (!regexMobile.test(value)) {
            return callback("手机号码不合法");
          }
          callback();
        },
      },
    ],
    ...(label ? {label} : {}),
  };
}
