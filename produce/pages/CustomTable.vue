<script>
// #ifdef H5

const CSS = [
  "/static/libs/LuckySheet/plugins/css/pluginsCss.css",
  "/static/libs/LuckySheet/plugins/plugins.css",
  "/static/libs/LuckySheet/css/luckysheet.css",
  "/static/libs/LuckySheet/assets/iconfont/iconfont.css",
];

const JSList = [
  "/static/libs/LuckySheet/plugins/js/plugin.js",
  "/static/libs/LuckySheet/luckysheet.umd.js",
];

// 动态添加 js
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.type = "text/javascript";
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
function loadCss(url, callback) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;

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

let TVM = null;
let TVM1 = null;

export default {
  name: "CustomTable",
  components: {},
  props: {
    value: {
      type: String,
      default: "",
    },
    readonly: Boolean,
  },
  watch: {
    value: {
      handler() {
        if (this.notUpdate) return false;
        this.setList();
      },
      immediate: true,
      deep: false,
    },
  },
  data() {
    return {
      notUpdate: false,
    };
  },
  methods: {
    getList() {
      try {
        window?.luckysheet?.exitEditMode?.();
        return JSON.stringify(window.luckysheet.getAllSheets() || []);
      } catch (e) {
        return "";
      }
    },
    setList() {
      let data = [{"name": "Sheet1", "data": []}];

      try {
        data = JSON.parse(this.value);
      } catch (e) {
      }

      if (!window?.luckysheet) {
        TVM = setTimeout(() => {
          this.setList();
        }, 500);
        return false;
      }

      TVM && clearTimeout(TVM);

      window?.luckysheet?.destroy?.();

      const opt = {
        column: 26, // 列数
        row: 30, // 行数

        showtoolbar: true, // 工具栏
        showinfobar: false, // 信息栏
        showsheetbar: false, // 底部sheet页
        sheetFormulaBar: false, // 是否显示公式栏

        showtoolbarConfig: {
          pivotTable: false,  //'数据透视表'
          image: false, // '插入图片'
          link: false, // '插入链接'
          chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
          screenshot: false, // '截图'
          protection: false, // '工作表保护'
          print: false, // '打印'
          conditionalFormat: false, // '条件格式'
        },

        cellRightClickConfig: {
          chart: false, // 图表生成
          image: false, // 插入图片
        },
      };

      const readonly = {
        allowCopy: false, // 是否允许拷贝
        showtoolbar: false, // 是否显示工具栏
        showinfobar: false, // 是否显示顶部信息栏
        showsheetbar: false, // 是否显示底部sheet页按钮
        showstatisticBar: false, // 是否显示底部计数栏
        sheetBottomConfig: false, // sheet页下方的添加行按钮和回到顶部按钮配置
        allowEdit: false, // 是否允许前台编辑
        enableAddRow: false, // 允许增加行
        enableAddCol: false, // 允许增加列
        userInfo: false, // 右上角的用户信息展示样式
        showRowBar: false, // 是否显示行号区域
        showColumnBar: false, // 是否显示列号区域
        sheetFormulaBar: false, // 是否显示公式栏
        enableAddBackTop: false,//返回头部按钮
        rowHeaderWidth: 0,//纵坐标
        columnHeaderHeight: 0,//横坐标
        showstatisticBarConfig: {
          count: false,
          view: false,
          zoom: false,
        },
        showsheetbarConfig: {
          add: false, //新增sheet
          menu: false, //sheet管理菜单
          sheet: false, //sheet页显示
        },
      };

      try {
        window?.luckysheet?.create?.({
          container: "lucky-sheet",
          data: data,

          lang: "zh", // 设定表格语言
          title: "", // 设定表格名称
          forceCalculation: true,//强制计算公式
          index: "0",
          status: "1",
          order: "0",
          hide: "0",

          ...(this.readonly ? readonly : opt),

          /*  hook: {
             updated: (data) => {
               /!* console.log(data, this.getList());

               this.notUpdate = true;
               this.$emit("change", this.getList());

               setTimeout(() => {
                 this.notUpdate = false;
               }, 800); *!/
             },
           }, */
        });
      } catch (e) {
        console.warn(e);
      }
    },
  },
  computed: {},
  created() {
    Promise.all([
      ...CSS.map(url => new Promise(resolve => loadCss(url, resolve))),
      ...JSList.map(url => new Promise(resolve => loadScript(url, resolve))),
    ])
      .then(() => {
        this.setList([{"name": "Sheet1", "data": []}]);
      });
  },
  mounted() {
  },
  beforeDestroy() {
    this.$emit("change", this.getList());
    window.luckysheet?.destroy?.();
  },
  onUnload() {
  },
};
// #endif
</script>

<template>
  <view class="ko-lucky-sheet">
    <!-- #ifdef H5 -->
    <button class="ko-basic-button__card" v-if="false" @click="getList">数据</button>
    <div id="lucky-sheet" />
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view style="font-size: 12px; color: #999; text-align: center; padding: 30px 0;">
      小程序暂不支持 xls 预览，请在电脑端查看。
    </view>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
// #ifdef H5
.ko-basic-button__card {
  position: absolute;
  z-index: 999999999;
}

.ko-lucky-sheet {
  position: relative;
  height: calc(100vh - 56px - 300px);

  #lucky-sheet {
    position: absolute;
    width: calc(100vw - 20px);
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }
}

// #endif
</style>
