<script>
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

// #ifdef MP
const fn = uni.getFileSystemManager();
// #endif

export default {
  name: "Draw",
  components: {UvLoadingIcon},
  props: {
    code: String,
    avatar: String,
  },
  data() {
    return {
      VM: null,
      image: "",
      error: false,
    };
  },
  watch: {},
  methods: {
    // 将图片存储到本地
    base64Save(base64File) { //base64File 需要加前缀
      let extName = base64File.match(/data\:\S+\/(\S+);/);

      if (extName) {
        //获取文件后缀
        extName = extName[1];
      }

      let fileName = Date.now() + "." + (extName || "png");

      return new Promise((resolve, reject) => {

        //写入文件的路径
        let filePath = uni.env.USER_DATA_PATH + "/" + fileName;

        fn.writeFile({
          filePath,
          data: base64File.replace(/^data:\S+\/\S+;base64,/, ""), //替换前缀为空
          encoding: "base64",
          success: () => {
            resolve(filePath);
          },
          fail() {
            reject("写入失败");
          },
        });
      });
    },

    // 加载图片
    onLoadImage(url) {
      return new Promise(resolve => {
        // #ifdef MP
        if (url.startsWith("http://") || url.startsWith("https://")) {
          uni.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                this.base64Save("data:image/png;base64," + fn.readFileSync(res.tempFilePath, "base64")).then(resolve);
              }
            },
            fail(error) {
              console.log("下载图片错误", error);
            },
          });
        } else {
          this.base64Save(url).then(resolve);
        }
        // #endif

        // #ifdef H5
        resolve(url);
        // #endif
      });
    },

    // 生产图片
    async drawQRCode() {
      if (!this.code || this.image) return false;
      uni.$__DRAW_TIME_VM__ && clearTimeout(uni.$__DRAW_TIME_VM__);

      uni.$__DRAW_TIME_VM__ = setTimeout(async () => {
        this.image = "";
        const vm = uni.createCanvasContext("qr_code", this);

        const qrSize = 300;
        const size = 136;
        const loc = qrSize / 2 - size / 2;

        // 清除画布
        vm.clearRect(0, 0, qrSize, qrSize);

        const code = await this.onLoadImage(this.code);
        vm.drawImage(code, 0, 0, qrSize, qrSize);

        if (this.avatar) {
          vm.beginPath();
          vm.arc(loc + size / 2, loc + size / 2, size / 2, 0, 2 * Math.PI);
          vm.closePath();
          vm.clip();

          vm.setFillStyle("#ffffff"); // 背景颜色，可自定义（如 #f5f5f5）
          vm.fill();

          const avatar = await this.onLoadImage(this.avatar);
          vm.drawImage(avatar, loc, loc, size, size);
        }

        vm.draw(false, (res) => {
          if (res.errMsg === "drawCanvas:ok") {
            this.error = false;
            console.log("绘制成功");
            setTimeout(() => {
              this.onToBasic64();
            }, 10);
          } else {
            console.error("绘制错误", res.errMsg);
          }
        });
      }, 50);
    },

    onToBasic64() {
      uni.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        destWidth: 600,
        destHeight: 600,
        fileType: "png",
        canvasId: "qr_code",
        quality: 1,
        success: (res) => {
          if (res.tempFilePath) {
            // #ifdef MP
            this.image = "data:image/png;base64," + fn.readFileSync(res.tempFilePath, "base64");
            // #endif

            // #ifdef H5
            this.image = res.tempFilePath;
            // #endif
          }
        },
        fail: (error) => {
          console.error("导出画布失败：", error);
          // #ifdef H5
          this.error = true;
          // #endif

          // #ifdef MP
          this.image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQEAAADICAYAAADofFQ1AAAAAXNSR0IArs4c6QAAEXBJREFUeF7tnY9xLa0Nxe/XQUpICSkhpaeElJASUkIGv8HB690FdCQhwbkzHr835o90JH4r4Nr3rw9fVIAKHK3AX0d7T+dXK/C3z+fz39VGnD4/IXB6Bqzz/++fz6d81VeBQQuE6//XWbr5zITA5gEO6t4/Pp9PqQJGXxUO7XdWEKPqddoRAkpCcpghBcrCLwDQfN0BooxPSAyqTAgMCqXcbOQpuFsSX8t/ZUkfh2u3FVdgeNkQep4TIDCy4EqQeu16P6+BHm33lhj/3uxJNlv+ey0ankN8Ph9PCLSLo7dQej/XXHBeCTc6z04AsCj/R3VE2x0DCCsIlODXk9/RBY0GbYf+OwFgVfnvkQdbAUITAnXhc9HL0nAnAEQt/2WRmeuV7iZDAwI7E38u/PLW//l8PuUr+ytz+e+hfcibDAQCDLhO2uwCAD4M8Hy43mS43BBJIMCyHw92HWEXAJxc/utlw/NItUo0qRZnIUDa64V8BwCwGtTLh5mRVHNnBgIEwEyY3tuqBlHPLNFI9SC4/c7DYZGU051U8mgUAiz3puPz2EElcHrmmI9UgHAHCvOJD5oAyqkRCBAAetkEBUvPjDAjtYAoRl3/H8bQJIaIrpl7EOAWQC/6BMCclgTEnF7iw+Y3CBAAsiDc9SIA9LS8qxhYQfzUdyrfniBAAOglbbnrLWUaXz4KsIL4o/Nw3t1BgNc+47+LPvJmDpO7XZ/1tN0sp91kDIHgDgLeVcDIQqpk62XlyFgjbXrz8Od7KrDjTUYXBFcIWACgGFGfhlyAey6eE7zKvM14PSOwhMDU4cQJWUQft1UgAyAe12MLAa0qoD75+dTfNufp2IQCkQDxrzu7tSHAp/9EdrDp8Qp4A+L2fKBCQONGgAA4PqcpgKIC9S9ztZ/NoDH8r3cVVgigWwECQCM8HIMK3CuArs921F/VQIUA8vsB3SsIRpYKUAEVBbRg8KMaqBD4J2AiqwBAPHalApMKaIDgx4O7QAAZlACYjCCbUwEFBZA1W6f/vikgBBQiwiGowAIFUBB8bwlQCNzeOy4QhFNSgRMVUDnLKxCQDsQDwRPTjj5HUgC92v96iCMQ4HlApHSgLacqIH2IF72+tgSEwKmpQ793UQCpBr4hIL0eZCWwSxrRj8wKIBD4WsOlEiAEMqcAbacC8jX8da5HCDCFqEB+BaTnAoRA/tjTAyrwpQAhwESgAocrIH3j0HclIKUIDwYPzzy6H0YB6RqGIcA3C4XJARrSfNRZEaP9LMT6F652/ktXhACXwLEKlMVeSuGZD0AtFWwBwk5QkN7wsRI4dunkdlyy8J883mVLK4XA9/sEoFIidz7R+mQKSA/Aem5mhoHKm4UIgV6K8OerFUASfdT2rCBAtIF/d4AHg6PpxXaIAlZP/yebRB/vjTgI9kX0IQRA8dndXgEkwRHrMlUFiEbwrxKzEkDSjH17CiDJ3Rt75OdZKgLpdr5oQAiMZALbLFFgNQCq0xlAIL0Z+H6II39ejJXAkvWx/aRRAFCEzpDjUgh8b3kQCHyXE9unJR30VECa1FY2Rj4fQG4GCAGrjOG4kAKRqoDWkajbAkIASjd2jqhAtCqgahR1W4BAk39yPOIKONwmJKE9pItYDSCaqX34CD93wCP9zpgjahUQuRqArweLczwYPGOBRfcS2dt6+RZxSyCFgOpnEbIS8ErBvedBylpPZaJtCaTV048bj1IJIBQmBDxTcN+5pMnsrQghcKM4IeCdhnvOlwUCkbYEyMNbtRKIRsY9l8j+XhEC8zFGtlA/1i26HSAE5oPHHj8VQJ5o3lpGqgQQCPyo4AkB7zTifFcFMkGg2B5lCyy9Gfjlw44QaP8GHSuV+NAhBGQxkkLgVzWzGwTuSiSCQJZkXr0yQSDSdkB6jvLrF6J2gsDbHinyb4J5Lbao8xACssgQAhfdRg5JCAJZsnn0kia0h23tHFFyCAHnlpXACABqIKME0Tt5o88n3d96+xUlf2Zy/qrRr+1x2Q6Ul5TEq/fbEjGiBNI7gSPPlwUCUW4GJHlf4//Lh8wQQIQgCGIhASlvPT0hBG7UXrWYEABwa+C5bMbnklaj4zNgLVfl+p3V0srp9nYDrQRWCKMBAIIAWxAWvaWJbWHL3Zirt76tTVJgbgEBi7JxBci8EjfTPBax1fI/Wo5IIXDrR6ZKwDJJogVZK3mzjaNZ5Wn6HuUsoPiErIPUEEAcH00GgmBUKdt20qeclVXR8gIB5e2WJkMl4AGAmkCR3hZqldTRx/WMd0+LiPmAQOC2ookOgRUJETHwvWTd7edIomtqEWkbUP1CtHmFgPRk1rpUWlUaEgSaS0k2FpLsshl/9op0G9BaJl2rjzldKwH1gRWiILVJYeqvIQgCLSXl46wCgfXDTa6I/N296SCwGgBtkKI+EZBEytTXEwRloRQAlO9RX9Lq+BFsESuBSACoiUAQrF0SHiDIUPkhZ2RpIBARAATBWgC0s1vAIMPTX+NQ8PFBFqkSiAwAgiAOCIolWjCIvPe/UxzxOzwEEOe80zNb4njr4zlfyZsKhZF5614/+r7/yRdknTxed0aoBBDHRgJv0YYgsFAVG7Psl8urfq+jtYd8kQ/8RrxHquWwEMgIgBosgmAkbdlGUwHpzcDroefKSiAzAAgCzdTmWKMKSCHw+sCqEJAuSOm1inS+UbE827Ei8FT73LlMrgeLnCgEyhiz76/eCQCsCM5dlN6eIxB4fZ+LNwR2BABB4L0czpwPWTthIIA4kSXs3BpkiVQ+O5H181qte1UCiAPZwkUQZItYDntNrge9zgROAgC3BjkWVEYrpTcD3cN760rgRAC0b1IpezG+qICGAlIIdCtTSwggp5kaokUYo0vhCEbShvAKIGtpGALIJHeHDsh44SMyaSBBMCkYm/9SAFlPSyCAGLxr/AmCXSPr4xeyre7+LYy6HUAWbjsJMo6PnGtn6QZkrXmcPagCCAS6b+bThoD08CKo9iZmEQQmsm49qNn1YFFNEwKIoVtH8MY5guC0iGP+StfW0DZUCwKlXLn+Hjfm9v69CYL9Y6zlobTC7h4KalUChTYEgCzcQ0GSDc1eGykQHgIbab3EFYJgXPbysKlf117tnw4bHzF+S+SwfSi3NLYD8WWMb+FQsOK7YWJhWQSS7eYumiI3A0NbTkLAJG9Fg+6StCLnbzpJF/91qOy6IhDoXg+2ZwLl39J9h1bQOc6fT78pX6e/kMS/0y6zrtKbgaIDIZB0JWVOWFRyraf/kx0ZtZVCYOh6kJUAmrJ2/TMmK6qG9tP/yZ6hfTLqjGJ/aYU+nEP1TIDbAcWoKQ01HESl+VYO4wWA6mMmEBACKzMzwNy7g8C6/H8L4dB+eXEOmF8PcjuwOMKD0+8KAu+n/1Xu4T3zYJwsmiEaDVc73A5YhE5/zAwJO+M1ktwz8/TaRgcsotNwpUMI9NIkzs93AMHK8j/jQSEhEGf9hbEkMwiQhLYOwHDpbG3IZXzz68HrmYB0Qmddjp8uIwgiA6AkVFRNpTcDU/602wFCIBdfoj69ripGB0C1N+L5gBQCU74QArkW/tXaDCBArrm8oxNJT0Q3QsA7cxbPFylxn6RAEtpb3ih6IhXUlA+sBLxTzGa+qaDbmNAdFUnq7uCKDab204rzam6jhq8HeTBoGMEFQ0+VgAvsK1NmOXeKoCUCTUJgUYJHmDZC8r7pkGlbsFpLKTCnKxluByIsXV0bVidvz5tMIFi5zZLeDBACvQw85OfRQYCUup4hnF5QisZJITAde1YCilELNtR0MjjbLy13nc1c8teekGppOu4tBLLQ2TsJMs83nRDOzkqfds5muoMAWYvTWxhCwDud/OeLDALkieet5PTiAgwkBADx2PVegcggQBLeM96e5wOIJlPXg9f3CSATewaDc8kUiAyCLOcDXiBA9CAEZOvjmF6RQcDzgf+noVQLEaR4JnDM+v92VJQoDjLxfACHgAjyhIBDdgecIioIsmxJLfVDYEgIBFxskU2yTGTEb2Q/jMw729dKPwQCohuMthJAJp8VkO1jKGCVyKh3WUAgevJ2xEGqIUIAzbxD+xcQlGSuH+0dQYZMDyTRwnsRGYHA9M3A9Yowk/AREnU3G7STGdUHWQzo3LP9RYvvYRKkChLZwe3AbLj3bh8NBMiC8IyU5rbK9XqQlYBnmuSZiyCQxUrrfEAKAfH8rARkAd+9VyQQZNqmorohvhICu6/KBf6Jk8rA1lPOBwgBg+ThkJgCkUBwwvkAAjtxFcLtALZITugtTi4DcbKAQApPBAKimwEeDBpk6YZDRoEAskBWhEWiGwI5FQgUoaQnkytE5pz2CkgSWduqiJ9kPOrjrH5SCEBXlO12gBAYDe0Z7WYT2EIV5KDMwp7ZMWcXp/QhLN1+fPlDCMyG9Yz2EQCQrfx/yoyZBUoInLG+wnu5GgCZy/+n4I5oilQ9M6D5ZSMrgfBr0tVAKJkULEUWgsL0pkP0QIBUPr2xXx0jBEzjnmrw1QBAFkEGoXvnA4j/4psBnglkSB0fG1cCYMfyX3I+IL0ZKHMRAj7rZNtZVgOgJP9Jrye9pRDoVRhdbbkd6Eq0dYOVAEDK3+xBudvDL7kZuNsOSGmUPSgn2r8SAKfn2d3TmxA4cRUu9HkVAHY+/Z8NZxsDRBc4ltftwOmEng1kxvZw0gidPrn87x0UItpA14PcDgizOXG3VQDgw+U5acoirjckktSCbgYIAYnkefvAp8gC15EyVzBdyi4lLuWrVAOSFyEgUe3APisAgJS4B4ZI5LJKXHkmINI+VSeVRJn0mOX/pGDC5iqxJQSE6ifpppIkE76e9O6/CVnMmqqc8RACZvFZPrA3AFj++4fcBAIMpH8grWaEr44mDGP5PyGWYlOVGF8rAUJAMUILh1JJjgH7Wf4PiGTYBL4ZKLYRAoYRWjS0FwD4wFgU4GZaQmB9DMJZ4AUAlv/rQ6925sNKYH0wtSzwAADLf61o4eMQAriGW42gckrcUYTlf6yUUYv5tRLg2zxjBXrEGrVkeJmMABiJhG8btbgTAr6B055NLREeDGP5rx0xvfHUtn9XCBQTpX/cQM89jjSigDUA+PQficK6NoTAOu1DzEwAhAjDUiNUrgeLB3eVAK9/lsa2O7klAFj+d+UP04AQCBMKX0MsAcDy3zeWyGxq14NPlQBvCJDw2PUlAOy0zTayai7cbQeKINwSxEoL1aA3rrH8jxXnUWvUDgWfKgFCYDQUPu1US7/GZJb/PvGzmEXtPOANAtwSWIRufkwCYF6z3XuoV4VP2wFWA+tTyQIALP/XxxW1wBUCrAbQcMn7WwHgtM/9k0cgbk/VrcDbdqBKwANC/2SwAAD3//5xtJhRvQoYgQCrAYtQvo+pefLL8t8/fpYzqlcBIxAobfgUsQzrz7G1AcDy3y921jOZVAGjEOAhoXV4/4yvCQCC2ydmnrOYVAEzECAIbMOtBQCW/7ZxWjW6WRUwCwGeD9ikgBYAqnUlTuXVfq//tvGAo1oqYAqAWQjUxOI+Uy/k5gG+mHoHiBYYep5xJC0FzLYB1cC3Nws9OcH9pk54vQEwYnWBxBMoRvqzja4CLjkigUB1k+8hkAfcJbhy8257toCo1QO3GcoiN8O55QgCgWIvq4L5JHAL7rxp4h4EhFi6246uOYJCgCCYC75rcOdMM2tNQMxJq31Q3J1dAwJ1ElYF73KfCIBeAvIm46dC7gAo02tCgDB4TnkCoIeD+5+fclBZfl+k5Ej57v6ygEALg7pdcHfMecK34NUAO5u0/XQ7bDOWLv6aIZYQaLOwBuxa/kkydYSWWm2KfSNjSfxgHzsFMgAiTHXoBYFeuCscuOB6SvHnqAIrAdFWhWFyPQoE0MCyPxXQUMDioLIs9vZLw07VMQgBVTk52MYK3G1l794sVRd8lSLME/8pNoTAxllL16jAiAKEwIhKbEMFNlaAENg4uHSNCowo8D9K+u/2mAUPSgAAAABJRU5ErkJggg==";
          // #endif
        },
      }, this);
    },
  },

  computed: {
    computedList() {
      return [this.code, this.avatar];
    },

    getLoagding() {
      return !this.image && !this.error;
    },
  },
};
</script>

<template>
  <view class="ko-qr-code-draw" :class="{loading: getLoagding}">
    <canvas
      v-show="!image || error"
      canvas-id="qr_code"
      style="width: 300px; height: 300px; position: absolute; z-index: 1;"
      :style="{opacity: getLoagding ? 0: 1}"
    />
    <image
      v-show="image && !error"
      :src="image"
      mode="aspectFill"
      show-menu-by-longpress="true"
      class="ko-qr-code-draw__image"
      :style="{opacity: getLoagding ? 0: 1}"
    />
    <view class="ko-qr-code-draw__loading" v-if="getLoagding">
      <uv-loading-icon :size="60" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-qr-code-draw {
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &__loading {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // #ifdef MP
  &__image {
    width: 80vw;
    height: 80vw;
    border-radius: 30rpx;
    z-index: 99;
  }

  // #endif

  // #ifdef H5
  &__image {
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    z-index: 99;
  }

  // #endif
}
</style>
