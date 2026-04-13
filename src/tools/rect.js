import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let current = null;
let justFinished = false; // 🔥 key fix

function isInside(el, mouse) {
  const x1 = Math.min(el.x, el.x + el.w);
  const x2 = Math.max(el.x, el.x + el.w);
  const y1 = Math.min(el.y, el.y + el.h);
  const y2 = Math.max(el.y, el.y + el.h);

  return mouse.x >= x1 && mouse.x <= x2 && mouse.y >= y1 && mouse.y <= y2;
}

export const rectTool = {
  onMouseDown(e) {
    if (justFinished) {
      justFinished = false;
      return; // 🔥 ignore accidental click
    }

    const mouse = screenToWorld(e.clientX, e.clientY);

    if (e.ctrlKey) {
      for (let i = state.elements.length - 1; i >= 0; i--) {
        const el = state.elements[i];

        if (el.type === "rect" && isInside(el, mouse)) {
          el.color = state.currentColor;
          state.selectedElement = el;
          saveState();
          return;
        }
      }
    }

    const rect = {
      id: state.nextId++,
      type: "rect",
      x: mouse.x,
      y: mouse.y,
      w: 0,
      h: 0,
      color: state.currentColor || "#f5d6a3",
      locked: false,
    };

    state.elements.push(rect);
    state.selectedElement = rect;

    current = rect;
  },

  onMouseMove(e) {
    if (!current) return;

    const mouse = screenToWorld(e.clientX, e.clientY);

    current.w = mouse.x - current.x;
    current.h = mouse.y - current.y;
  },

  onMouseUp() {
    if (current) {
      saveState();
      justFinished = true; // 🔥 key fix
    }
    current = null;
  },
};