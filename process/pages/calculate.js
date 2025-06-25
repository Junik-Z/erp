import { _deepCopy, _generateUUID } from "@/utils";

// 计算矩形位置
export function repositionRectangles(rects, vessel, winWidth) {
  let placedRects = [];
  // 所有的容器
  let currentContainers = _deepCopy(vessel);
  // 排序
  rects.sort((a, b) => b.width * b.height - a.width * a.height);

  const {width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT} = currentContainers.at(-1);

  rects.forEach(rect => {
    let placed = false;
    for (let i = 0; i < currentContainers.length; i++) {
      const item = currentContainers[i];
      const [bestPosition, canFit] = findBestPosition(rect, placedRects.filter(r => r.containerId === item.__id__), item.__id__, currentContainers.at(-1));
      if (canFit) {
        placedRects.push({...rect, ...bestPosition, containerId: item.__id__});
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newContainerId = _generateUUID();
      currentContainers.push({__id__: newContainerId, width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT, fillRate: 0});

      const [bestPosition] = findBestPosition(rect, [], newContainerId, currentContainers.at(-1));

      placedRects.push({...rect, ...bestPosition, containerId: newContainerId});
    }
  });

  // 计算使用率
  currentContainers = currentContainers.map((container) => ({
    ...container,
    scale: winWidth / container.width,
    fillRate: calculateContainerFillRate(placedRects.filter(r => r.containerId === container.__id__), container),
  }));


  return {vessel: currentContainers, rects: placedRects};
}

/**
 * @description 寻找最佳位置
 */
function findBestPosition(rect, placedRects, containerId, containers) {
  const {height: CONTAINER_HEIGHT, width: CONTAINER_WIDTH} = containers || {};

  let bestX = 0;
  let bestY = 0;
  let bestRotation = 0;
  let minWastedSpace = Infinity;
  let canFit = false;

  for (let rotation of [0, 90]) {
    const [width, height] = rotation === 0 ? [rect.width, rect.height] : [rect.height, rect.width];

    for (let y = 0; y <= CONTAINER_HEIGHT - height; y += 5) {
      for (let x = 0; x <= CONTAINER_WIDTH - width; x += 5) {
        // 校验是不是有效位置
        if (isValidPosition(x, y, width, height, placedRects, containers)) {
          // 计算浪费的空间
          const wastedSpace = calculateWastedSpace(x, y, width, height, placedRects);
          if (wastedSpace < minWastedSpace) {
            // const deg = calculateRotatedOffset(x, y, width, height, rotation);

            // console.log(x, y, width, height, rotation, deg);

            bestX = x;
            bestY = y;
            bestRotation = rotation;
            minWastedSpace = wastedSpace;
            canFit = true;
          }
        }
      }
    }
  }

  return [{x: bestX, y: bestY, rotation: bestRotation}, canFit];
}

function calculateRotatedOffset(offsetX, offsetY, width, height, angle) {
  // 将角度转换为弧度
  const radian = (Math.PI / 180) * angle;

  // 计算旋转中心（通常是矩形的中心）
  const centerX = width / 2;
  const centerY = height / 2;

  // 将初始偏移量相对于旋转中心进行调整
  const relativeX = offsetX - centerX;
  const relativeY = offsetY - centerY;

  // 应用旋转矩阵公式
  const rotatedX = relativeX * Math.cos(radian) - relativeY * Math.sin(radian);
  const rotatedY = relativeX * Math.sin(radian) + relativeY * Math.cos(radian);

  // 将旋转后的坐标平移回原来的参考系
  const finalX = rotatedX + centerX;
  const finalY = rotatedY + centerY;

  return {x: finalX, y: finalY};
}


/**
 * @description 校验是不是有效的位置
 */
function isValidPosition(x, y, width, height, placedRects, containers) {
  const {height: CONTAINER_HEIGHT, width: CONTAINER_WIDTH} = containers || {};
  // 检查矩形是否在容器边界内
  if (x < 0 || y < 0 || x + width > CONTAINER_WIDTH || y + height > CONTAINER_HEIGHT) {
    return false;
  }

  // 检查是否与其他矩形重叠
  return !placedRects.some(placedRect => {
    const [placedWidth, placedHeight] = placedRect.rotation === 0
      ? [placedRect.width, placedRect.height]
      : [placedRect.height, placedRect.width];

    return x < placedRect.x + placedWidth &&
      x + width > placedRect.x &&
      y < placedRect.y + placedHeight &&
      y + height > placedRect.y;
  });
}

// 计算浪费的空间
function calculateWastedSpace(x, y, width, height, placedRects) {
  const right = Math.max(...placedRects.map(r => r.x + (r.rotation === 0 ? r.width : r.height)), x + width);
  const bottom = Math.max(...placedRects.map(r => r.y + (r.rotation === 0 ? r.height : r.width)), y + height);
  return right * bottom - placedRects.reduce((sum, r) => sum + r.width * r.height, 0) - width * height;
}

function calculateContainerFillRate(rects, container) {
  const totalArea = container.width * container.height;
  const filledArea = rects.reduce((sum, rect) => sum + rect.width * rect.height, 0);
  return filledArea / totalArea * 100;
}

export const getRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

export function setAdaptiveTextColor(bgColor) {

  if (!bgColor) return "#000";

  // 提取背景颜色的 RGB 值
  const [r, g, b] = bgColor?.match(/\d+/g)?.map?.(Number);

  // 计算亮度 (YIQ公式)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 根据亮度设置文字颜色
  return brightness > 128 ? "#000" : "#fff"; // 明亮背景用深色文字，暗背景用浅色文字
}

// 获取包含的坐标
export function calculateCoveredCoordinatesByRow(x_start, x_end, y_start, y_end) {
  const coveredCoordinates = [];
  for (let x = x_start; x < x_end; x++) {
    for (let y = y_start; y < y_end; y++) {
      coveredCoordinates.push([x, y]);
    }
  }
  return coveredCoordinates;
}
