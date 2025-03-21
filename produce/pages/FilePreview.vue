<script>
// #ifdef H5
import { renderAsync } from "./libs/docx-preview";
import XLSX from "./libs/xlsx.full.min";


import { loadCss, loadScript } from "@/utils/index.js";

loadScript(
  "https://cdn.bootcdn.net/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  () => {
    // 配置 Worker 路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.bootcdn.net/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    console.log(pdfjsLib);
  },
);

loadCss("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css");

export default {
  name: "FilePreview",
  mounted() {
    this.getList();

    const fileInput = document.querySelector("#files");

    fileInput.addEventListener("change", ev => {
      this.previewPdf(fileInput.files[0]);
    });

    // console.log(pdfjsLib);

  },
  methods: {
    getList() {
      /* fetch("./托手掌柜功能定制开发合同.docx")
        .then(response => response.blob())
        .then(blob => {
          this.onPreview(blob);
        }); */
      /* fetch("./001.xlsx")
        .then(response => response.blob())
        .then(blob => {
          this.onPreviewXlsx(blob);
        }); */
    },

    handleFileUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // 二进制数据处理
        const data = e.target.result;
        this.onPreviewXlsx(data);
      };
      reader.readAsArrayBuffer(file);
    },

    onPreviewXlsx(data) {

      let workbook = XLSX.read(new Uint8Array(data), {type: "array"});

      let sheetName = workbook.SheetNames[0];
      let sheet = workbook.Sheets[sheetName];

      let cellData = XLSX.utils.sheet_to_json(sheet, {header: 1, cellStyles: true});


      console.log(cellData);

      /*
      const workbook = XLSX.read(data, {type: "array", cellStyles: true});

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];


      // 提取合并单元格信息
      const merges = worksheet["!merges"] || [];
      // 提取单元格样式（如背景色、字体等）
      const cellStyles = {};
      Object.keys(worksheet).forEach(key => {
        if (key.startsWith("!")) return;
        cellStyles[key] = worksheet[key].s;
      });


      let html = "<table class=\"excel-preview\">";

      // 处理合并单元格
      merges.forEach(merge => {
        const {s: {r: rowStart, c: colStart}, e: {r: rowEnd, c: colEnd}} = merge;
        html += `<tr><td colspan="${colEnd - colStart + 1}" rowspan="${rowEnd - rowStart + 1}">${worksheet[XLSX.utils.encode_cell({
          r: rowStart,
          c: colStart,
        })]?.v}</td></tr>`;
      });

      // 遍历非合并单元格并应用样式
      Object.keys(cellStyles).forEach(cellKey => {
        const {r, c} = XLSX.utils.decode_cell(cellKey);
        const style = cellStyles[cellKey];

        console.log(style);

        html += `<td
style="background-color: ${style.fill?.fgColor?.rgb || "transparent"};
                         border: 1px solid #ddd;
                         text-align: ${style.alignment?.horizontal || "left"}"
                         >
               ${worksheet[cellKey]?.v}
            </td>`;
      });


      // 转换为 JSON 数据（带表头）
      // const html = XLSX.utils.sheet_to_html(worksheet, {header: 1});
 */

      /*    const htmlTable = getXlsxHtml(data);
         this.$refs.DRef.innerHTML = html
         console.log(html, merges); */
    },
    onPreview(blob) {
      // const b =await preprocessTiff(blob);
      renderAsync(blob, this.$refs.DRef)
        .then(res => {
          console.log(res);
        });
    },

    previewPdf(file) {
      const reader = new FileReader();
      reader.onload = async function () {
        const buffer = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({scale: 1.5});

        const canvas = document.getElementById("pdf-canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({canvasContext: ctx, viewport}).promise;
      };
      reader.readAsArrayBuffer(file);
    },
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div>
    <Input id="files" type="file" accept=".xls, .xlsx, .pdf" />
    <div ref="DRef" class="ko-file-preview"></div>
    <Canvas id="pdf-canvas" />
  </div>
  <!-- #endif -->
</template>

<style scoped lang="scss">
// #ifdef H5
// #endif
</style>
