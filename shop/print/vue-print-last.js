var g = Object.defineProperty, b = Object.defineProperties;
var x = Object.getOwnPropertyDescriptors;
var w = Object.getOwnPropertySymbols;
var C = Object.prototype.hasOwnProperty, B = Object.prototype.propertyIsEnumerable;
var m = (o, e, t) => e in o ? g(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t, v = (o, e) => {
  for (var t in e || (e = {}))
    C.call(e, t) && m(o, t, e[t]);
  if (w)
    for (var t of w(e))
      B.call(e, t) && m(o, t, e[t]);
  return o;
}, y = (o, e) => b(o, x(e));
var p = (o, e, t) => m(o, typeof e != "symbol" ? e + "" : e, t);
const u = "[VuePrintLast]";
class E {
  constructor(e) {
    // html 文档标准
    p(this, "standards", {
      strict: "strict",
      loose: "loose",
      html5: "html5"
    });
    // 打印窗口的 iframe id
    p(this, "iframeId", "");
    // 预览窗口的 body
    p(this, "previewBody", null);
    // 预览窗口的 关闭按钮
    p(this, "close", null);
    // 调用次数，用于生成唯一 Id
    p(this, "counter", 0);
    // 用户设置
    p(this, "settings", {
      standard: "html5",
      zIndex: 20002,
      previewTitle: "打印预览",
      popTitle: "",
      previewPrintBtnLabel: "打印",
      preview: !1,
      // 自定义纸张大小-默认A4
      customSize: { width: "280mm", height: "297mm" },
      // 水印文字-默认空，不显示
      watermark: ""
    });
    const t = e.vue;
    this.settings = y(v(v({}, this.settings), e), {
      previewBeforeOpenCallback() {
        var s;
        (s = e.previewBeforeOpenCallback) == null || s.call(e, t);
      },
      previewOpenCallback() {
        var s;
        (s = e.previewOpenCallback) == null || s.call(e, t);
      },
      openCallback() {
        var s;
        (s = e.openCallback) == null || s.call(e, t);
      },
      closeCallback() {
        var s;
        (s = e.closeCallback) == null || s.call(e, t);
      },
      beforeOpenCallback() {
        var s;
        (s = e.beforeOpenCallback) == null || s.call(e, t);
      }
    }), this.init();
  }
  init() {
    this.counter++, this.iframeId = `printArea_${this.counter}`;
    const { el: e, url: t } = this.settings;
    if (e || t) {
      const s = e ? "" : t || "", r = this.getPrintWindow(s);
      e && this.write(r.doc), this.settings.preview ? this.previewIframeLoad() : this.print(r);
      return;
    }
    if (this.settings.asyncUrl) {
      this.settings.asyncUrl((s) => {
        const r = this.getPrintWindow(s);
        this.settings.preview ? this.previewIframeLoad() : this.print(r);
      }, this.settings.vue);
      return;
    }
    throw new Error(
      `${u}: Either "el"、"url" or "asyncUrl" parameter must be provided in the settings.`
    );
  }
  addEvent(e, t, s) {
    e && (e.addEventListener ? e.addEventListener(t, s, !1) : e.attachEvent ? e.attachEvent("on" + t, s) : e["on" + t] = s);
  }
  previewIframeLoad() {
    var s, r;
    const e = document.getElementById("vue-pirnt-last-previewBox");
    if (!e) return;
    const t = e.querySelector("iframe");
    (r = (s = this.settings).previewBeforeOpenCallback) == null || r.call(s), this.addEvent(t, "load", () => {
      var i, l;
      this.previewBoxShow(), (l = (i = this.settings).previewOpenCallback) == null || l.call(i);
    }), this.addEvent(
      e.querySelector(".previewBodyUtilPrintBtn"),
      "click",
      () => {
        var i, l, n, a, d, c, h;
        (l = (i = this.settings).beforeOpenCallback) == null || l.call(i), (a = (n = this.settings).openCallback) == null || a.call(n), (d = t == null ? void 0 : t.contentWindow) == null || d.print(), (h = (c = this.settings).closeCallback) == null || h.call(c);
      }
    );
  }
  print(e) {
    var i, l;
    const t = document.getElementById(this.iframeId) || e.f, s = t == null ? void 0 : t.contentWindow;
    if (!s) return;
    const r = () => {
      const n = setTimeout(() => {
        var a, d, c, h;
        s.focus(), (d = (a = this.settings).openCallback) == null || d.call(a), s.print(), t.remove(), (h = (c = this.settings).closeCallback) == null || h.call(c), clearTimeout(n);
      });
    };
    (l = (i = this.settings).beforeOpenCallback) == null || l.call(i), this.addEvent(t, "load", r);
  }
  /**
   * 获取打印需要隐藏的 css
   * @private
   */
  getNoPrintMediaStyle() {
    const e = this.settings.noPrintSelector;
    return e ? !Array.isArray(e) && !(typeof e == "string") ? (console.error(
      new TypeError(
        `${u}: The "noPrintSelector" must be either a string or an array of strings. Please check your settings.`
      )
    ), "") : `${(Array.isArray(e) ? e : [e]).filter((l) => l.trim()).join(",")} { display: none; }` : "";
  }
  write(e) {
    e.open(), e.write(
      `${this.docType()}<html lang='zh'>${this.getHead()}${this.getBody()}</html>`
    ), e.close();
  }
  docType() {
    if (this.settings.standard === this.standards.html5)
      return "<!DOCTYPE html>";
    const e = this.settings.standard === this.standards.loose ? " Transitional" : "", t = this.settings.standard === this.standards.loose ? "loose" : "strict";
    return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01${e}//EN" "http://www.w3.org/TR/html4/${t}.dtd">`;
  }
  /**
   * 获取媒体打印独有样式-用于设置纸张大小
   * @private
   */
  getPrintMediaStyle() {
    return `${this.settings.customSize ? `@page { size: ${this.settings.customSize.width} ${this.settings.customSize.height}; }` : ""}`;
  }
  getHead() {
    const e = (this.settings.extraHead || "").split(",").filter((n) => n.length > 0).join(""), t = Array.from(document.querySelectorAll("link")).filter((n) => n.href.includes(".css")).map(
      (n) => `<link type="text/css" rel="stylesheet" href='${n.href}'>`
    ).join(""), s = Array.from(document.styleSheets).reduce((n, a) => {
      const d = a.cssRules || a.rules;
      return d && (n += Array.from(d).reduce(
        (c, h) => c + h.cssText,
        ""
      )), n;
    }, ""), r = (this.settings.extraCss || "").split(",").filter((n) => n.trim().length > 0).map((n) => `<link type="text/css" rel="stylesheet" href='${n.trim()}'>`).join(""), i = this.getPrintMediaStyle(), l = this.getNoPrintMediaStyle();
    return `<head>
	 <title>${this.settings.popTitle}</title>
	 ${e}${t}
	 <style type="text/css">${s}${i}${l}</style>
	 ${r}
 </head>`;
  }
  /**
   * 获取打印区的 DOM
   */
  getPrintAreaDom() {
    const e = this.settings.el, t = typeof e == "string";
    if (e instanceof HTMLElement) return [e];
    if (!t)
      throw new TypeError(
        `${u}: The "el" property should be either a string (CSS selector) or an HTMLElement, but received type "${typeof e}".`
      );
    let s = Array.from(document.querySelectorAll(e));
    if (!(s != null && s.length))
      throw new Error(
        `${u}: No elements found matching the selector: "${e}".`
      );
    return s;
  }
  getBody() {
    var s;
    const e = this.getPrintAreaDom(), t = document.createElement("div");
    if (e.forEach((r) => {
      const i = r.cloneNode(!0);
      this.canvasToImgHandler(r, i), this.formDataHandler(r, i), t.appendChild(i);
    }), this.settings.watermark !== "") {
      const r = document.createElement("div");
      r.style.cssText = "position: fixed; top: 85px; left: 30px; width: 100%; height: 100%; pointer-events: none; z-index: 9999;";
      for (let i = 0; i < 3; i++)
        for (let l = 0; l < 3; l++) {
          const n = document.createElement("div");
          n.style.cssText = "position: absolute; color: rgba(0, 0, 0, 0.1); transform: rotate(-30deg); font-size: 2em;", n.style.top = `${i * 40}%`, n.style.left = `${l * 40}%`, n.textContent = (s = this.settings.watermark) != null ? s : "", r.appendChild(n);
        }
      t.appendChild(r);
    }
    return `<body>${t.innerHTML}</body>`;
  }
  /**
   * 复制 Canvas 内容到新的 Canvas 元素
   * @param originalElement
   * @param clonedElement
   * @private
   */
  canvasToImgHandler(e, t) {
    const s = e.querySelectorAll("canvas");
    t.querySelectorAll("canvas").forEach((i, l) => {
      const n = s[l], a = i.parentNode, d = n.toDataURL("image/png"), c = new Image();
      c.className = "canvasImg", c.style.display = "block", c.src = d, a == null || a.appendChild(c), i.remove();
    });
  }
  /**
   * 根据type去处理form表单
   * @param originalElement
   * @param clonedElement
   * @private
   */
  formDataHandler(e, t) {
    const s = t.querySelectorAll("input,select,textarea");
    let r = -1;
    s.forEach((i) => {
      var a;
      const l = i.value;
      switch ((a = i.getAttribute("type")) != null ? a : i.tagName.toLowerCase()) {
        case "select":
          r++;
          const d = e.querySelectorAll("select")[r];
          if (d) {
            const c = d.selectedIndex;
            i.options[c].setAttribute(
              "selected",
              "selected"
            );
          }
          break;
        case "textarea":
          i.innerHTML = l, i.setAttribute("html", l);
          break;
        case "radio":
        case "checkbox":
          i.checked && i.setAttribute("checked", "checked");
          break;
        default:
          i.value = l, i.setAttribute("value", l);
          break;
      }
    });
  }
  // 生成并返回打印窗口的 iframe 和文档对象
  getPrintWindow(e) {
    var r;
    const t = this.createIframe(e), s = t.contentDocument || ((r = t.contentWindow) == null ? void 0 : r.document);
    if (!s)
      throw new Error(
        `${u}: Unable to find the document object within the created iframe. Please ensure the iframe is correctly created and loaded.`
      );
    return { f: t, win: t.contentWindow || t, doc: s };
  }
  // 显示预览窗口
  previewBoxShow() {
    var t;
    const e = document.getElementById("vue-pirnt-last-previewBox");
    e && ((t = document.querySelector("html")) == null || t.setAttribute("style", "overflow: hidden"), e.style.display = "block");
  }
  // 隐藏预览窗口
  previewBoxHide() {
    var t, s;
    const e = document.getElementById("vue-pirnt-last-previewBox");
    e && ((t = document.querySelector("html")) == null || t.setAttribute("style", "overflow: visible;"), (s = e.querySelector("iframe")) == null || s.remove(), e.style.display = "none");
  }
  // 创建或获取打印预览的框架
  previewBox() {
    var s;
    let e = document.getElementById("vue-pirnt-last-previewBox");
    if (e)
      return (s = e.querySelector("iframe")) == null || s.remove(), {
        close: e.querySelector(".previewClose"),
        previewBody: e.querySelector(".previewBody")
      };
    e = document.createElement("div"), e.setAttribute("id", "vue-pirnt-last-previewBox"), e.setAttribute(
      "style",
      "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background: white; display: none; z-index: " + this.settings.zIndex
    );
    const t = document.createElement("div");
    return t.setAttribute("class", "previewHeader"), t.setAttribute("style", "padding: 5px 20px;"), t.innerHTML = this.settings.previewTitle || "", this.close = this.createCloseButton(), t.appendChild(this.close), e.appendChild(t), this.previewBody = this.createPreviewBody(), e.appendChild(this.previewBody), document.body.appendChild(e), { close: this.close, previewBody: this.previewBody };
  }
  // 创建iframe元素
  createIframe(e) {
    const t = document.createElement("iframe");
    if (t.id = this.iframeId, t.src = e || (/* @__PURE__ */ new Date()).getTime().toString(), t.style.display = "none", !this.settings.preview)
      document.body.appendChild(t);
    else {
      t.setAttribute("style", "border: 0px; flex: 1;");
      const { close: s, previewBody: r } = this.previewBox();
      r && r.appendChild(t), this.addEvent(s, "click", this.previewBoxHide.bind(this));
    }
    return t;
  }
  // 创建关闭按钮
  createCloseButton() {
    const e = document.createElement("div");
    e.setAttribute("class", "previewClose"), e.setAttribute(
      "style",
      "position: absolute; top: 5px; right: 20px; width: 25px; height: 20px; cursor: pointer;"
    );
    const t = document.createElement("div"), s = document.createElement("div"), r = "position: absolute; width: 3px; height: 100%; background: #040404; top: 0px; left: 50%;";
    return t.setAttribute("class", "closeBefore"), t.setAttribute(
      "style",
      `${r} transform: rotate(45deg);`
    ), s.setAttribute("class", "closeAfter"), s.setAttribute(
      "style",
      `${r} transform: rotate(-45deg);`
    ), e.appendChild(t), e.appendChild(s), e;
  }
  // 创建预览主体
  createPreviewBody() {
    const e = document.createElement("div");
    e.className = "previewBody", e.style.cssText = "display: flex; flex-direction: column; height: 100%;";
    const t = document.createElement("div");
    t.className = "previewBodyUtil", t.style.cssText = "height: 32px; background: #474747; position: relative;";
    const s = document.createElement("div");
    return s.className = "previewBodyUtilPrintBtn", s.style.cssText = "position: absolute; padding: 2px 10px; margin-top: 3px; left: 24px; font-size: 14px; color: white; cursor: pointer; background: rgba(0,0,0,.12); border: 1px solid rgba(0,0,0,.35); box-shadow: inset 0 1px 0 hsla(0,0%,100%,.05), inset 0 0 1px hsla(0,0%,100%,.15);", s.innerHTML = this.settings.previewPrintBtnLabel || "", t.appendChild(s), e.appendChild(t), e;
  }
}
const S = (o, e, t) => {
  o.addEventListener ? o.addEventListener(e, t, !1) : o.attachEvent ? o.attachEvent("on" + e, t) : o["on" + e] = t;
}, f = {
  directiveName: "print",
  // vue3 指定挂载
  mounted(o, e) {
    let t, s = {};
    S(o, "click", () => {
      if (!e.value) {
        window.print();
        return;
      }
      typeof e.value == "string" ? t = e.value : typeof e.value == "object" && (t = e.value.el, s = e.value), new E(y(v({}, s), { el: t, vue: e.instance }));
    });
  },
  // 兼容 Vue2 指令挂载
  bind(o, e, t) {
    e.instance = t.context, f.mounted(o, e);
  }
}, k = {
  install(o) {
    o.directive(f.directiveName, f);
  }
};
export {
  E as VuePrintLast,
  k as printPlugin,
  f as vPrint
};
