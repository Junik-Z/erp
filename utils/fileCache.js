import { getImgUrl } from "@/api/user";
// #ifdef MP
const fn = uni.getFileSystemManager();
// #endif

function downloadImage(img, key) {
  uni.downloadFile({
    url: img,
    success: (res) => {
      if (res.statusCode === 200) {
        fn.saveFile({
          tempFilePath: res.tempFilePath,
          success(src) {
            uni.setStorageSync(key, src.savedFilePath);
          },
          fail(error) {
            console.log("本地存储错误", error);
            if (error.errMsg.concat("file size limit")) {
              cleanImage();
            }
          },
        });
      }
    },
    fail(error) {
      console.log("下载图片错误", error);
    },
  });
}

function cleanImage() {
  uni.clearStorageSync();

  fn.getSavedFileList({
    success(res) {
      if (res.fileList) {
        for (let s of res.fileList) {
          fn.removeSavedFile({
            filePath: s.filePath,
            success(res) {
              console.log("删除" + s.filePath);
            },
            fail(error) {
              console.log(error);
            },
          });
        }
      }
    },
    fail(error) {
      console.log(error);
    },
  });
}

function getNameKey(name = "") {
  const n = name?.split(".")?.[0];
  return n?.split("/")?.join("_");
}

function getCacheFile(url) {
  if (!url) {
    url = "/files/down/static/match.png";
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/")) {
    return url;
  }

  const img = getImgUrl(url);
  const key = getNameKey(url);

  // #ifdef MP
  const cache = uni.getStorageSync(key);

  if (cache) {
    try {
      fn.accessSync(cache);
      return "data:image/png;base64," + fn.readFileSync(cache, "base64");
    } catch (e) {
      uni.removeStorageSync(key);
      if (e.errNo === 1300202) {
        cleanImage();
      }
    }
  }
  setTimeout(() => {
    downloadImage(img, key);
  }, 2000);
  // #endif

  return img;
}


export default getCacheFile;
