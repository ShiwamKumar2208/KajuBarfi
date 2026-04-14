import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let current = null;
let start = null;
let isDragging = false;
let justFinished = false;

const palette = [
  "#f5d6a3", "#ffd6e0", "#d6f5e3", "#d6e0ff",
  "#fff0d6", "#e0d6ff", "#d6fff5"
];

let lastColor = null;

function randomPastel() {
  let color;
  do {
    color = palette[Math.floor(Math.random() * palette.length)];
  } while (color === lastColor);

  lastColor = color;
  return color;
}

const DRAG_THRESHOLD = 3;

function isInside(el, mouse) {
  const x1 = Math.min(el.x, el.x + el.w);
  const x2 = Math.max(el.x, el.x + el.w);
  const y1 = Math.min(el.y, el.y + el.h);
  const y2 = Math.max(el.y, el.y + el.h);

  return mouse.x >= x1 && mouse.x <= x2 && mouse.y >= y1 && mouse.y <= y2;
}

export const rectTool = {
  onMouseDown(e) {
    if (justFinished && e.buttons === 0) {
      justFinished = false;
      return;
    }
    justFinished = false;

    const mouse = screenToWorld(e.clientX, e.clientY);

    // 🔥 CTRL + CLICK → apply current color
    if (e.ctrlKey) {
      for (let i = state.elements.length - 1; i >= 0; i--) {
        const el = state.elements[i];

        if (el.type === "rect" && isInside(el, mouse)) {
          el.color = state.currentColor || "#f5d6a3";
          state.selectedElement = el;
          saveState();
          return;
        }
      }
    }

    start = mouse;
    isDragging = false;
    current = null;
  },

  onMouseMove(e) {
    if (!start) return;

    const mouse = screenToWorld(e.clientX, e.clientY);

    const dx = Math.abs(mouse.x - start.x);
    const dy = Math.abs(mouse.y - start.y);

    // 🔥 wait until real drag
    if (!isDragging && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
      return;
    }

    // 🔥 first drag → create rect
    if (!isDragging) {
      isDragging = true;

      current = {
        id: state.nextId++,
        type: "rect",
        x: start.x,
        y: start.y,
        w: 0,
        h: 0,
        color: state.currentColor || randomPastel(),
        locked: false,
      };

      state.elements.push(current);
      state.selectedElement = current;
    }

    current.w = mouse.x - start.x;
    current.h = mouse.y - start.y;
  },

  onMouseUp() {
    if (isDragging && current) {
      saveState();
      justFinished = true;
    }

    start = null;
    current = null;
    isDragging = false;
  },
};
