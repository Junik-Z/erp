import XLSX from "../libs/xlsx.full.min";

export function getXlsxHtml(data) {
  let workbook = XLSX.read(new Uint8Array(data), {type: "array", cellStyles: true});
  let sheetName = workbook.SheetNames[0];
  let sheet = workbook.Sheets[sheetName];

  let cellData = XLSX.utils.sheet_to_json(sheet, {header: 1});

  const merges = sheet["!merges"] || [];

  console.log(merges);

  let htmlTable = "<table>";
  for (let row = 0; row < cellData.length; row++) {

    htmlTable += "<tr>";
    for (let col = 0; col < cellData[row].length; col++) {
      let cellValue = cellData[row][col];
      let cellRef = XLSX.utils.encode_cell({r: row, c: col});
      let cell = sheet[cellRef];
      let cellStyle = cell ? cell.s : {};
      let cellStyleAttr = "style=\"" + getCellStyle(cellStyle || {}) + "\"";
      let mergeAttr = getMergeAttributes(sheet, row, col);
      let comment = getCellComment(cell);

      let cellHtml = "<td class=\"cell\" " + cellStyleAttr + " " + mergeAttr + "\" title=\"" + comment + "\">" + cellValue + "</td>";

      htmlTable += cellHtml;
    }
    htmlTable += "</tr>";
  }
  htmlTable += "</table>";
  return htmlTable;
}

function getCellStyle(cellStyle) {
  let styleAttr = "";

  if (cellStyle.font) {
    let font = cellStyle.font;
    if (font.bold) styleAttr += "font-weight:bold;";
    if (font.italic) styleAttr += "font-style:italic;";
    if (font.underline) styleAttr += "text-decoration:underline;";
    if (font.strike) styleAttr += "text-decoration:line-through;";
    if (font.color) styleAttr += "color:" + font.color.rgb + ";";
    if (font.name) styleAttr += "font-family:" + font.name + ";";
  }
  if (cellStyle.alignment) {
    let alignment = cellStyle.alignment;
    if (alignment.horizontal) styleAttr += "text-align:" + alignment.horizontal + ";";
    if (alignment.vertical) styleAttr += "vertical-align:" + alignment.vertical + ";";
  }
  if (cellStyle.fill) {
    let fill = cellStyle.fill;
    if (fill.patternType === "solid" && fill.fgColor) {
      styleAttr += "background-color:" + fill.fgColor.rgb + ";";
    }
  }
  return styleAttr;
}

function getMergeAttributes(sheet, row, col) {
  let mergeCells = sheet["!merges"] || [];
  for (let i = 0; i < mergeCells.length; i++) {

    console.log(XLSX.utils.decode_range?.(mergeCells[i]));
    /* let mergeRange = XLSX.utils.decode_range?.(mergeCells[i]);

    if (mergeRange && row >= mergeRange.s.r && row <= mergeRange.e.r && col >= mergeRange.s.c && col <= mergeRange.e.c) {
      return "rowspan=\"" + (mergeRange.e.r - mergeRange.s.r + 1) + "\" colspan=\"" + (mergeRange.e.c - mergeRange.s.c + 1) + "\"";
    } */
  }
  return "";
}

function getCellComment(cell) {
  if (cell && cell.c) {
    let comment = cell.c[0].t;
    return comment;
  }
  return "";
}
