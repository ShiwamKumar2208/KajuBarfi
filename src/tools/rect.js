import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let current = null;
let isFirstRect = true;

const DEFAULT_RECT_COLOR = "#f5d6a3"; // 🔥 kaju color

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

function isInside(el, mouse) {
  const x1 = Math.min(el.x, el.x + el.w);
  const x2 = Math.max(el.x, el.x + el.w);
  const y1 = Math.min(el.y, el.y + el.h);
  const y2 = Math.max(el.y, el.y + el.h);

  return mouse.x >= x1 && mouse.x <= x2 && mouse.y >= y1 && mouse.y <= y2;
}

export const rectTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    // 🔥 CTRL + CLICK → CHANGE COLOR
    if (e.ctrlKey) {
      for (let i = state.elements.length - 1; i >= 0; i--) {
        const el = state.elements[i];

        if (el.type === "rect" && isInside(el, mouse)) {
          const newColor = prompt(
            "Enter color (hex or name):",
            el.color || DEFAULT_RECT_COLOR,
          );

          if (newColor) {
            el.color = newColor;
            state.selectedElement = el; // 🔥 also select it
            saveState();
          }

          return;
        }
      }
    }

    // 🔥 CREATE RECT
    const color = isFirstRect ? "#f5d6a3" : randomPastel();
    isFirstRect = false;

    const rect = {
      id: state.nextId++,
      type: "rect",
      x: mouse.x,
      y: mouse.y,
      w: 0,
      h: 0,
      color,
    };

    state.elements.push(rect);

    // 🔥 AUTO SELECT
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
    }
    current = null;
  },
};
