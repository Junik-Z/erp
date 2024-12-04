/**
 * @description 获取图片的 Base64 数据
 * @param file
 */
export function getImageBase64(file) {
  return new Promise((resolve, reject) => {
    // #ifdef MP
    const fs = uni.getFileSystemManager();
    fs.readFile({
      filePath: file, encoding: "base64", success: (e) => {
        resolve("data:image/png;base64," + e.data);
      }, fail: (e) => {
        console.error(e);
        reject("转换失败");
      },
    });
    // #endif

    // #ifdef H5
    uni.getImageInfo({
      src: file, success: res => {
        let w, h;
        if (res.width > res.height) {
          w = res.width > 1024 ? 1024 : res.width;
          h = w / res.width * res.height;
        } else {
          h = res.height > 1024 ? 1024 : res.height;
          w = h / res.height * res.width;
        }
        const canvas = new OffscreenCanvas(w, h);
        const ctx = canvas.getContext("2d");
        const image = new Image();
        image.src = res.path;
        image.onload = function (e) {
          ctx.drawImage(image, 0, 0, w, h);
          canvas.convertToBlob().then((blob) => {
            const fr = new FileReader();
            fr.onload = function (e) {
              const base = e.target.result;
              resolve(base);
            };
            fr.readAsDataURL(blob, {
              type: "image/png",
            });
          });

        };
        image.onerror = function (e) {
          console.error(e);
          reject("转换失败");
        };

      }, fail: (err) => {
        console.log(err);
        reject("转换失败");
      },
    });
    // #endif

    // #ifdef APP
    plus.io.resolveLocalFileSystemURL(file, function (entry) {
      entry?.file(function (file) {
        const reader = new plus.io.FileReader();
        reader.onloadend = function (e) {
          const base = e.target.result;
          resolve(base);
        };
        reader.onerror = function (e) {
          console.error(e);
          reject("转换失败");
        };
        reader.readAsDataURL(file);
      });
    });
    // #endif
  });
}
