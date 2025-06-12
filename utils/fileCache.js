import { getImgUrl } from "@/api/user";
import { CONFIG } from "@/utils/config";
import { NO_CLEAR_KEY } from "@/store";
// #ifdef MP
const fn = uni.getFileSystemManager();

// #endif

function downloadImage(img, key) {
  // #ifndef H5
  const Cookie = uni.getStorageSync("Cookie");
  // #endif

  // #ifdef H5
  const Token = uni.getStorageSync("AccessToken") || "";
  // #endif

  const scene = uni.getStorageSync("__APP_SCENE__") || "";

  uni.downloadFile({
    url: img,
    header: {
      // #ifndef H5
      ...(Cookie ? {Cookie} : {}),
      // #endif

      // #ifdef H5
      ...(Token ? {Authorization: Token} : {}),
      // #endif

      "X-MiniApp-Env": CONFIG.SystemVersion,
      "X-MiniApp-ID": CONFIG.APP_ID,
      "X-Tenant-ID": scene || "",
      "T-VERSION": CONFIG.T_VERSION,
    },
    success: (res) => {
      if (res.statusCode === 200) {
        fn.saveFile({
          tempFilePath: res.tempFilePath,
          success(src) {
            uni.setStorageSync(key, src.savedFilePath);
          },
          fail(error) {
            console.error("本地存储错误", error);
            if (error.errMsg.concat("file size limit")) {
              cleanImage();
            }
          },
        });
      }
    },
    fail(error) {
      console.error("下载图片错误", img, error);
    },
  });
}

function cleanImage() {
  const NoClear = uni.getStorageSync(NO_CLEAR_KEY);

  // #ifndef H5
  const Cookie = uni.getStorageSync("Cookie");
  // #endif

  // #ifdef H5
  const Token = uni.getStorageSync("AccessToken") || "";
  // #endif

  const scene = uni.getStorageSync("__APP_SCENE__") || "";

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

  uni.setStorageSync(NO_CLEAR_KEY, NoClear);
  // #ifndef H5
  uni.setStorageSync("Cookie", Cookie);
  // #endif

  // #ifdef H5
  uni.setStorageSync("AccessToken", Token);
  // #endif
  uni.setStorageSync("__APP_SCENE__", scene);
}

function getNameKey(name = "") {
  const n = name?.split(".")?.[0];
  return n?.split("/")?.join("_");
}

function getCacheFile(url) {
  if (!url) {
    url = "/files/down/static/match.png";
    return "";
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
