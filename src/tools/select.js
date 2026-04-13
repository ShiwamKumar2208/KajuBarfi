import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let isDragging = false;
let dragStart = null;

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

export const selectTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    dragStart = mouse;
    isDragging = false;

    // 🔥 check if clicked on element
    for (let i = state.elements.length - 1; i >= 0; i--) {
      const el = state.elements[i];

      if (isInside(el, mouse)) {
        state.selectedElement = el;

        // 🔥 if already selected → keep group
        if (!state.selectedElements.includes(el)) {
          state.selectedElements = [el];
        }

        isDragging = true;
        return;
      }
    }

    // 🔥 start box select
    state.selectedElement = null;
    state.selectedElements = [];
    state.selectionBox = {
      x: mouse.x,
      y: mouse.y,
      w: 0,
      h: 0,
    };
  },

  onMouseMove(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    // ================= BOX SELECT =================
    if (state.selectionBox) {
      state.selectionBox.w = mouse.x - state.selectionBox.x;
      state.selectionBox.h = mouse.y - state.selectionBox.y;
      return;
    }

    // ================= DRAG MULTI =================
    if (isDragging && state.selectedElements.length > 0) {
      const dx = mouse.x - dragStart.x;
      const dy = mouse.y - dragStart.y;

      state.selectedElements.forEach((el) => {
        if (el.locked) return;

        el.x += dx;
        el.y += dy;
      });

      // 🔥 update reference point
      dragStart = mouse;
    }
  },

  onMouseUp() {
    // ================= FINISH BOX SELECT =================
    if (state.selectionBox) {
      const box = state.selectionBox;

      const x1 = Math.min(box.x, box.x + box.w);
      const x2 = Math.max(box.x, box.x + box.w);
      const y1 = Math.min(box.y, box.y + box.h);
      const y2 = Math.max(box.y, box.y + box.h);

      state.selectedElements = state.elements.filter((el) => {
        return (
          el.x < x2 &&
          el.x + el.w > x1 &&
          el.y < y2 &&
          el.y + el.h > y1
        );
      });

      state.selectedElement = state.selectedElements[0] || null;

      state.selectionBox = null;
      saveState();
    }

    if (isDragging) {
      saveState();
    }

    isDragging = false;
  },
};