import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let isDragging = false;
let dragOffset = { x: 0, y: 0 };

let isResizing = false;
let resizeHandle = null;

function getBounds(el) {
  return {
    x1: Math.min(el.x, el.x + el.w),
    x2: Math.max(el.x, el.x + el.w),
    y1: Math.min(el.y, el.y + el.h),
    y2: Math.max(el.y, el.y + el.h),
  };
}

function isInside(el, mouse) {
  const { x1, x2, y1, y2 } = getBounds(el);
  return mouse.x >= x1 && mouse.x <= x2 && mouse.y >= y1 && mouse.y <= y2;
}

function getHandle(el, mouse) {
  const size = 10;
  const { x1, y1, x2, y2 } = getBounds(el);

  const handles = {
    tl: { x: x1, y: y1 },
    tr: { x: x2, y: y1 },
    bl: { x: x1, y: y2 },
    br: { x: x2, y: y2 },
  };

  for (let key in handles) {
    const h = handles[key];
    if (Math.abs(mouse.x - h.x) < size && Math.abs(mouse.y - h.y) < size) {
      return key;
    }
  }

  return null;
}

export const selectTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    state.selectedElement = null;
    window.updateQuickActions?.();

    for (let i = state.elements.length - 1; i >= 0; i--) {
      const el = state.elements[i];

      if (isInside(el, mouse)) {
        state.selectedElement = el;
        window.updateQuickActions?.();

        // 🔥 LOCK CHECK (block interaction)
        if (el.locked) {
          return; // selectable but not draggable/resizable
        }

        resizeHandle = getHandle(el, mouse);

        if (resizeHandle) {
          isResizing = true;
          isDragging = false;
          return;
        }

        isDragging = true;
        dragOffset.x = mouse.x - el.x;
        dragOffset.y = mouse.y - el.y;

        return;
      }
    }
  },

  onMouseMove(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);
    const el = state.selectedElement;
    if (!el || el.locked) return; // 🔥 block movement

    // 🔥 DRAG
    if (isDragging) {
      el.x = mouse.x - dragOffset.x;
      el.y = mouse.y - dragOffset.y;
    }

    // 🔥 RESIZE
    if (isResizing) {
      if (resizeHandle === "br") {
        el.w = mouse.x - el.x;
        el.h = mouse.y - el.y;
      }

      if (resizeHandle === "tr") {
        el.w = mouse.x - el.x;
        el.h = el.y + el.h - mouse.y;
        el.y = mouse.y;
      }

      if (resizeHandle === "bl") {
        el.w = el.x + el.w - mouse.x;
        el.h = mouse.y - el.y;
        el.x = mouse.x;
      }

      if (resizeHandle === "tl") {
        el.w = el.x + el.w - mouse.x;
        el.h = el.y + el.h - mouse.y;
        el.x = mouse.x;
        el.y = mouse.y;
      }
    }
  },

  onMouseUp() {
    const changed = isDragging || isResizing;

    isDragging = false;
    isResizing = false;
    resizeHandle = null;

    if (changed) {
      saveState();
    }
  },
};