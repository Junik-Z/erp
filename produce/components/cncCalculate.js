// #ifdef H5
import { _flattenDeep, _get, _isEqual } from "@/utils";

export class CncCalculate {
  constructor() {
  }

  // 获取SVG
  getSvg(form) {
    // 刀距
    this.drillWidth = form.drillWidth;
    // 封边宽度
    this.edgeWidth = form.edgeWidth;
    // 计算结果
    this.boardRecord = this.getRecord(form);

    return this.renderSvg();
  }

  // 获取所有的记录配置
  getRecord(form) {
    const record = form.boardRecord;
    const iList = _get(form, "boards.0.items");

    return record.map(parent => {
      parent.items = parent.items.map(item => {
        const original = iList.find((v) => _isEqual(v.rid, item.rid));
        return {
          ...item,
          original,
        };
      });

      return parent;
    });
  }

  // 绘制SVG
  renderSvg() {
    const list = this.boardRecord;
    return list.map(item => {
      const items = this.getLine(item.items, item);
      const node = _get(item, "items.0.original");
      return {
        name: `${node.color || ""}_${item.width - (this.drillWidth || 0)}_${item.height - (this.drillWidth || 0)}_${node.weight}`,
        svgContent: `<svg  width="${item.width}" height="${item.height}" xmlns="http://www.w3.org/2000/svg">${items}</svg>`,
      };
    });
  }

  // 获取直角参数
  getAngle(x1, y1, x2, y2, size, type) {
    if (_isEqual(type, "T1")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1 + size}" y2="${y1}" stroke="#000" fill="none"/>
      <line x1="${x1 + size}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }
    if (_isEqual(type, "T2")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1 + size}" stroke="#000" fill="none"/>
      <line x1="${x1}" y1="${y1 + size}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }
    if (_isEqual(type, "T3")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1 - size}" y2="${y1}" stroke="#000" fill="none"/>
      <line x1="${x1 - size}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }
    if (_isEqual(type, "T4")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1 - size}" stroke="#000" fill="none"/>
      <line x1="${x1}" y1="${y1 - size}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }

    return ``;
  }

  // 绘制所有的线条
  getLine(list, board) {
    const path = list.map(item => {

      // 圆角类型
      const [T1, T2, T3, T4] = _get(item, "original.angleType") || [];
      // 圆角大小
      const [R1, R2, R3, R4] = _get(item, "original.radius") || [];
      // 长短角样式
      const [S1, S2, S3, S4] = _get(item, "original.straight") || [];


      // 获取Y坐标
      let Y = board.height - item.y;
      let X = item.x;

      const H = item.height;
      const W = item.width;

      // 左下角开始
      const lines = [
        {
          x1: X,
          // 左下的位置 如果是直角 Y - 第4个角度的高度
          y1: Y - (T4 ? S4?.[1] || 0 : (R4 || 0)),
          x2: X,
          y2: Y - H + (T1 ? S1?.[1] || 0 : R1),
        },
        {
          x1: X + (T1 ? S1?.[0] || 0 : R1),
          y1: Y - H,
          x2: X + W - (T2 ? S2?.[0] || 0 : R2),
          y2: Y - H,
        },
        {
          x1: X + W,
          y1: Y - H + (T2 ? S2?.[1] || 0 : R2),
          x2: X + W,
          y2: Y - (T3 ? S3?.[1] || 0 : R3),
        },
        {
          x1: X + W - (T3 ? S3?.[0] || 0 : R3),
          y1: Y,
          x2: X + (T4 ? S4?.[0] || 0 : R4),
          y2: Y,
        },
      ];
      
      // 绘制圆角
      const radius = [
        {
          path: T1
            ? this.getAngle(_get(lines, "0.x2"), _get(lines, "0.y2"), _get(lines, "1.x1"), _get(lines, "1.y1"), S1?.[0] || 0, "T1")
            : `<path d="M ${_get(lines, "0.x2")} ${_get(lines, "0.y2")} A ${R1} ${R1} 0 0 1 ${_get(lines, "1.x1")} ${_get(lines, "1.y1")}" stroke="red" fill="none"/>`,
          show: !!(R1 || S1?.[0] || S1?.[1]),
        },
        {
          path: T2 ? this.getAngle(_get(lines, "1.x2"), _get(lines, "1.y2"), _get(lines, "2.x1"), _get(lines, "2.y1"), S2?.[1] || 0, "T2")
            : `<path d="M ${_get(lines, "1.x2")} ${_get(lines, "1.y2")} A ${R2} ${R2} 0 0 1 ${_get(lines, "2.x1")} ${_get(lines, "2.y1")}" stroke="red" fill="none"/>`,
          show: !!(R2 || S2?.[0] || S2?.[1]),
        },
        {
          path: T3
            ? this.getAngle(_get(lines, "2.x2"), _get(lines, "2.y2"), _get(lines, "3.x1"), _get(lines, "3.y1"), S3?.[0] || 0, "T3")
            : `<path d="M ${_get(lines, "2.x2")} ${_get(lines, "2.y2")} A ${R3} ${R3} 0 0 1 ${_get(lines, "3.x1")} ${_get(lines, "3.y1")}" stroke="red" fill="none"/>`,
          show: !!(R3 || S3?.[0] || S3?.[1]),
        },
        {
          path: T4 ?
            this.getAngle(_get(lines, "3.x2"), _get(lines, "3.y2"), _get(lines, "0.x1"), _get(lines, "0.y1"), S4?.[1] || 0, "T4")
            : `<path d="M ${_get(lines, "3.x2")} ${_get(lines, "3.y2")} A ${R4} ${R4} 0 0 1 ${_get(lines, "0.x1")} ${_get(lines, "0.y1")}" stroke="red" fill="none"/>`,
          show: !!(R4 || S4?.[0] || S4?.[1]),
        },
      ];

      // 绘制线条
      const p = lines.map((child, index) => {
        const L = [`<line x1="${child.x1}" y1="${child.y1}" x2="${child.x2}" y2="${child.y2}" stroke="#000" fill="none"/>`];

        const is = radius[index];
        if (is.show) {
          L.push(is.path);
        }
        return L;
      });

      return [
        `<g>${_flattenDeep(p).join("\n")}</g>`,
      ];
    });

    return _flattenDeep(path).join("\n");
  }
}

// #endif
