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
    if (_isEqual(type, "ATL")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1 + size}" y2="${y1}" stroke="#000" fill="none"/>
      <line x1="${x1 + size}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }
    if (_isEqual(type, "ATR")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1 + size}" stroke="#000" fill="none"/>
      <line x1="${x1}" y1="${y1 + size}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }
    if (_isEqual(type, "ABR")) {
      return `
      <line x1="${x1}" y1="${y1}" x2="${x1 - size}" y2="${y1}" stroke="#000" fill="none"/>
      <line x1="${x1 - size}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" fill="none"/>
      `;
    }
    if (_isEqual(type, "ABL")) {
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
      const [TL, TR, BR, BL] = _get(item, "original.radius") || [];
      const [ATL, ATR, ABR, ABL] = _get(item, "original.angleType") || [];

      // 获取Y坐标
      let Y = board.height - item.y;
      let X = item.x;

      const H = item.height;
      const W = item.width;

      const lines = [
        {
          x1: X,
          y1: Y - BL,
          x2: X,
          y2: Y - H + TL,
        },
        {
          x1: X + TL,
          y1: Y - H,
          x2: X + W - TR,
          y2: Y - H,
        },
        {
          x1: X + W,
          y1: Y - H + TR,
          x2: X + W,
          y2: Y - BR,
        },
        {
          x1: X + W - BR,
          y1: Y,
          x2: X + BL,
          y2: Y,
        },
      ];

      const radius = [
        {
          path: ATL
            ? this.getAngle(_get(lines, "0.x2"), _get(lines, "0.y2"), _get(lines, "1.x1"), _get(lines, "1.y1"), TL, "ATL")
            : `<path d="M ${_get(lines, "0.x2")} ${_get(lines, "0.y2")} A ${TL} ${TL} 0 0 1 ${_get(lines, "1.x1")} ${_get(lines, "1.y1")}" stroke="red" fill="none"/>`,
          show: !!TL,
        },
        {
          path: ATR ? this.getAngle(_get(lines, "1.x2"), _get(lines, "1.y2"), _get(lines, "2.x1"), _get(lines, "2.y1"), TR, "ATR")
            : `<path d="M ${_get(lines, "1.x2")} ${_get(lines, "1.y2")} A ${TR} ${TR} 0 0 1 ${_get(lines, "2.x1")} ${_get(lines, "2.y1")}" stroke="red" fill="none"/>`,
          show: !!TR,
        },
        {
          path: ABR
            ? this.getAngle(_get(lines, "2.x2"), _get(lines, "2.y2"), _get(lines, "3.x1"), _get(lines, "3.y1"), BR, "ABR")
            : `<path d="M ${_get(lines, "2.x2")} ${_get(lines, "2.y2")} A ${BR} ${BR} 0 0 1 ${_get(lines, "3.x1")} ${_get(lines, "3.y1")}" stroke="red" fill="none"/>`,
          show: !!BR,
        },
        {
          path: ABL ?
            this.getAngle(_get(lines, "3.x2"), _get(lines, "3.y2"), _get(lines, "0.x1"), _get(lines, "0.y1"), BL, "ABL")
            : `<path d="M ${_get(lines, "3.x2")} ${_get(lines, "3.y2")} A ${BL} ${BL} 0 0 1 ${_get(lines, "0.x1")} ${_get(lines, "0.y1")}" stroke="red" fill="none"/>`,
          show: !!BL,
        },
      ];

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
