import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let mode = null; // "drag" | "resize" | "box"
let dragStart = null;
let resizeHandle = null;

let isMouseDown = false;
const DRAG_THRESHOLD = 4;

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
    if (
      Math.abs(mouse.x - h.x) < size &&
      Math.abs(mouse.y - h.y) < size
    ) {
      return key;
    }
  }

  return null;
}

export const selectTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    dragStart = mouse;
    isMouseDown = true;
    mode = null;

    // 🔥 check elements (top first)
    for (let i = state.elements.length - 1; i >= 0; i--) {
      const el = state.elements[i];

      if (isInside(el, mouse)) {
        resizeHandle = getHandle(el, mouse);

        // ================= RESIZE =================
        if (resizeHandle && !el.locked) {
          state.selectedElement = el;
          state.selectedElements = [el];
          mode = "resize";
          return;
        }

        // ================= SELECTION =================
        state.selectedElement = el;

        if (e.shiftKey) {
          if (state.selectedElements.includes(el)) {
            state.selectedElements = state.selectedElements.filter(
              (item) => item !== el
            );
          } else {
            state.selectedElements.push(el);
          }
        } else {
          if (!state.selectedElements.includes(el)) {
            state.selectedElements = [el];
          }
        }

        return; // ⚠️ DO NOT start drag yet
      }
    }

    // ================= BOX SELECT =================
    if (!e.shiftKey) {
      state.selectedElement = null;
      state.selectedElements = [];
    }

    state.selectionBox = {
      x: mouse.x,
      y: mouse.y,
      w: 0,
      h: 0,
    };

    mode = "box";
  },

  onMouseMove(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    // ================= BOX =================
    if (mode === "box" && state.selectionBox) {
      state.selectionBox.w = mouse.x - state.selectionBox.x;
      state.selectionBox.h = mouse.y - state.selectionBox.y;
      return;
    }

    // ================= DRAG =================
    if (isMouseDown && state.selectedElements.length > 0) {
      const dx = mouse.x - dragStart.x;
      const dy = mouse.y - dragStart.y;

      // 🔥 threshold check
      if (!mode) {
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          mode = "drag";
        } else {
          return;
        }
      }

      if (mode === "drag") {
        state.selectedElements.forEach((el) => {
          if (el.locked) return;

          el.x += dx;
          el.y += dy;
        });

        dragStart = mouse;
        return;
      }
    }

    // ================= RESIZE =================
    if (mode === "resize" && state.selectedElement) {
      const el = state.selectedElement;

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

  onMouseUp(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    // ================= FINISH BOX =================
    if (mode === "box" && state.selectionBox) {
      const box = state.selectionBox;

      const x1 = Math.min(box.x, box.x + box.w);
      const x2 = Math.max(box.x, box.x + box.w);
      const y1 = Math.min(box.y, box.y + box.h);
      const y2 = Math.max(box.y, box.y + box.h);

      const newSelection = state.elements.filter((el) => {
        return (
          el.x < x2 &&
          el.x + el.w > x1 &&
          el.y < y2 &&
          el.y + el.h > y1
        );
      });

      if (e.shiftKey) {
        const set = new Set(state.selectedElements);
        newSelection.forEach((el) => set.add(el));
        state.selectedElements = Array.from(set);
      } else {
        state.selectedElements = newSelection;
      }

      state.selectedElement = state.selectedElements[0] || null;

      state.selectionBox = null;
    }

    if (mode === "drag" || mode === "resize") {
      saveState();
    }

    isMouseDown = false;
    mode = null;
    resizeHandle = null;
  },
};