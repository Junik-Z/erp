// #ifdef H5
export function getDPI() {
  if (window.screen.deviceXDPI !== undefined) {
    return window.screen.deviceXDPI;
  } else {
    const tmpNode = document.createElement("DIV");
    tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
    document.body.appendChild(tmpNode);
    const dpi = tmpNode.offsetWidth;
    tmpNode.parentNode.removeChild(tmpNode);
    return dpi;
  }
}

export function pxToCm(px, dpi = getDPI()) {
  return (px * 2.54) / dpi;
}

export function cmToPx(cm, dpi = getDPI()) {
  return Math.floor(cm * dpi / 2.54);
}


export function pointToPx(point) {
  return `${point * (getDPI() / 72)}px`
}

// #endif
