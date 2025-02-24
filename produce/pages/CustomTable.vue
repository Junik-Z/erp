<script>
import { _deepCopy, _get, _omit, _pick, _reverse, xlsxCellStyle } from "@/utils";
import mixins from "@/mixins/mixins";

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

function findLastTrueIndex(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i] || {};

    const isV = "v" in (item || {}) || "v" in (_get(item, "ct.s.0") || {});

    if (isV) {
      return i; // 返回最后一个为真的值的下标
    }
  }
  return -1; // 如果没有找到，返回 -1
}

// 获取数据
function getDataList(list) {
  let bList = _deepCopy(list || []);

  const cList = _reverse(_deepCopy(bList));

  let endRowIndex = cList?.findIndex(item => {
    return item.some((cell) => {
      return "v" in (cell || {}) || "v" in (_get(cell, "ct.s.0") || {});
    });
  });

  if (endRowIndex > -1) {
    endRowIndex = (list.length - endRowIndex);
  } else {
    endRowIndex = 0;
  }

  bList = bList?.slice(0, endRowIndex);

  const maxCellIndex = Math.max(...bList.map(v => findLastTrueIndex(v)));

  return bList.map(item => item.slice(0, maxCellIndex + 1).map(v => v || ""));

  /* return list.flatMap(item => {
    if (item.every(_isEmpty)) {
      return [];
    } else {
      return [item.filter(v => !_isEmpty(v))];
    }
  }); */
}

const systemInfo = uni.getSystemInfoSync();

const MaxColumn = Math.ceil((systemInfo.windowWidth - 40) / 76);
const MaxRow = Math.ceil((systemInfo.windowHeight * 0.7) / 24);

// 默认配置
const defaultOptions = {
  column: MaxColumn, // 列数
  row: MaxRow, // 行数

  showtoolbar: false, // 工具栏
  showinfobar: false, // 信息栏
  showsheetbar: false, // 底部sheet页
  sheetFormulaBar: false, // 是否显示公式栏


  showtoolbarConfig: {
    undoRedo: true, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
    paintFormat: true, //格式刷
    currencyFormat: true, //货币格式
    percentageFormat: true, //百分比格式
    numberDecrease: true, // '减少小数位数'
    numberIncrease: true, // '增加小数位数
    moreFormats: true, // '更多格式'
    font: true, // '字体'
    fontSize: true, // '字号大小'
    bold: true, // '粗体 (Ctrl+B)'
    italic: true, // '斜体 (Ctrl+I)'
    strikethrough: true, // '删除线 (Alt+Shift+5)'
    underline: true, // '下划线 (Alt+Shift+6)'
    textColor: true, // '文本颜色'
    fillColor: true, // '单元格颜色'
    mergeCell: true, // '合并单元格'
    horizontalAlignMode: true, // '水平对齐方式'
    verticalAlignMode: true, // '垂直对齐方式'
    textWrapMode: true, // '换行方式'
    function: true, // '公式'
    sortAndFilter: true, // '排序和筛选'
    dataVerification: true, // '数据验证'
    splitColumn: true, // '分列'


    border: false, // '边框'
    textRotateMode: false, // '文本旋转方式'
    postil: false, //'批注'

    frozenMode: false, // '冻结方式'

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
    // copy: false, // 复制
    // copyAs: false, // 复制为

    chart: false, // 图表生成
    image: false, // 插入图片
  },

  enableAddBackTop: false, // 允许回到顶部
  enableAddRow: false, // 允许添加行
  addRowCount: 10, // 配置新增行处默认新增的行数目
};

// 只读配置
const readonlyOptions = {
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

// #endif

export default {
  name: "CustomTable",
  components: {},
  mixins: [mixins],
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
        // #ifdef H5
        this.setList();
        // #endif

        // #ifdef MP
        this.node = _get(this.getTableList(), "0");

        console.log(this.node);
        // #endif
      },
      immediate: true,
      deep: false,
    },
  },
  data() {
    return {
      notUpdate: false,

      node: {},
    };
  },
  methods: {
    getTableList() {
      if (this.value) {
        try {
          const D = JSON.parse(this.value);
          const C = _get(D, "0.data");
          const I = _get(D, "0");
          let newData = [];

          // #ifdef H5
          // 列数量
          const cellLength = _get(C, "0.length");
          // 行数量
          const rowsLength = _get(C, "length");

          // 最大行数
          const maxRowLength = (defaultOptions.row >= (rowsLength || 0) ? defaultOptions.row : rowsLength);
          // 最大列数
          const maxCellLength = (defaultOptions.column >= (cellLength || 0) ? defaultOptions.column : cellLength);

          for (let i = 0; i < maxRowLength; i++) {
            const row = C[i] || [];
            let cells = [];

            for (let j = 0; j < maxCellLength; j++) {
              cells.push(row[j] || null);
            }

            newData.push(cells);
          }
          // #endif

          // #ifdef MP
          newData = C;
          // #endif

          return [{...{...I, config: _omit(I.config, ["borderInfo"])}, data: _deepCopy(newData)}];
        } catch (e) {
          console.log(e);
          return [{"name": "Sheet1", "data": []}];
        }
      } else {
        return [{"name": "Sheet1", "data": []}];
      }
    },

    // #ifdef H5
    getList() {
      try {
        window?.luckysheet?.exitEditMode?.();

        const list = (window.luckysheet.getAllSheets() || []).map(item => {
          const node = _pick(item, [
            "name",
            "data",
            "config",
          ]);

          console.log("获取要保存的数据信息", getDataList(node.data));

          return {
            ...node,
            data: getDataList(node.data),
          };
        });

        return JSON.stringify(list);
      } catch (e) {
        console.log("【获取要保存的数据信息出错】=> ", e);
        return "";
      }
    },
    setList() {
      const data = this.getTableList();

      if (!window.luckysheet) {
        TVM = setTimeout(() => {
          this.setList();
        }, 800);
        return false;
      }

      TVM && clearTimeout(TVM);

      window.luckysheet && window.luckysheet?.destroy?.();

      try {
        window.luckysheet && window.luckysheet.create({
          container: "lucky-sheet",
          data: _deepCopy(data),
          lang: "zh", // 设定表格语言
          title: "", // 设定表格名称

          forceCalculation: true,//强制计算公式
          defaultRowHeight: 24,

          ...(this.readonly ? readonlyOptions : defaultOptions),

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
    // 数据
    getTest() {
      console.log(this.getList());
    },
    // #endif

    uninstall() {
      // #ifdef H5
      window.luckysheet && window.luckysheet.destroy();
      console.log("销毁了吗");
      window.luckysheet = null;
      // #endif
    },
  },
  computed: {
    getGridTemplateColumnsStyle() {
      const cell = _get(this.node, "data.0") || [];
      const columnlen = _get(this.node, "config.columnlen") || {};

      const col = cell.map((v, index) => {
        if (columnlen?.[index]) {
          return columnlen[index] + "px";
        } else {
          return "72px";
        }
      });

      return {
        "--ko-basic-table-grid-col": col.join(" "),
      };
    },

    // 获取表格项
    getTdStyle() {
      return (node, rIndex, cIndex, isChild) => {
        return xlsxCellStyle(node, rIndex, cIndex, _get(this.node, "config"), isChild);
      };
    },
  },
  created() {
    // #ifdef H5
    if (!window.luckysheet) {
      Promise.all([
        ...CSS.map(url => new Promise(resolve => loadCss(url, resolve))),
        ...JSList.map(url => new Promise(resolve => loadScript(url, resolve))),
      ])
        .then(() => {
          this.setList();
        });
    }
    // #endif
  },
  mounted() {
  },
  beforeDestroy() {
    // #ifdef H5
    this.$emit("change", this.getList());
    this.uninstall();
    // #endif
  },
  onUnload() {
  },
};
</script>

<template>
  <view class="ko-lucky-sheet">
    <!-- #ifdef H5 -->
    <!--<button class="ko-basic-button__card" @click="getTest">数据</button>-->
    <div id="lucky-sheet" />
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="ko-lucky-sheet__table">
      <scroll-view
        scroll-y="true"
        scroll-x="true"
        :style="[getGridTemplateColumnsStyle]"
      >
        <view>
          <view class="ko-basic-table">
            <block v-for="(row, index) of node.data" :key="index">
              <view
                class="ko-basic-table__cell"
                :class="[`ko-basic-table__cell--${index}`]"
                v-for="(cell, cIndex) of row"
                :style="[getTdStyle(cell || {}, index, cIndex, false)]"
                :key="cIndex"
              >
                <block v-if="GET_FUNC(cell, 'ct.s')">
                  <text
                    :style="[getTdStyle(ci || {}, index, cIndex, true)]"
                    v-for="(ci, ciIndex) of GET_FUNC(cell, 'ct.s')"
                    :key="ciIndex"
                  >
                    {{ GET_FUNC(ci || {}, "v") || "" }}
                  </text>
                </block>
                <block v-else>
                  {{ GET_FUNC(cell || {}, "v") || "" }}
                </block>
              </view>
            </block>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="isEmpty(node.data)" style="font-size: 12px; color: #999; text-align: center; padding: 20px 0;">
      定制表格，请在电脑端{{ readonly ? "查看" : "编辑" }}。
    </view>
    <!-- #endif -->
  </view>
</template>

<style lang="scss">
.ko-lucky-sheet {
  // #ifdef H5
  /deep/ #luckysheet-copy-content {
    padding-left: 0 !important;
  }

  .ko-basic-button__card {
    position: absolute;
    z-index: 999999999;
  }


  position: relative;
  height: calc(100vh - 26vh);

  #lucky-sheet {
    position: absolute;
    width: calc(100vw - 20px);
    max-width: 100vw;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  // #endif

  // #ifdef MP
  &__table {
    $border-color: #e9e9eb;

    .ko-basic-table {
      border-top: none;

      &__cell {
        display: flex;
        border-bottom: 1px solid $border-color;
        border-right: 1px solid $border-color;

        &--0 {
          border-top: 1px solid $border-color;
        }
      }
    }
  }

  // #endif
}
</style>
