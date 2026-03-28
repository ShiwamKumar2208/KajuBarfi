import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { randomColor } from "../utils/helpers.js";
import { saveState } from "../utils/history.js";

let current = null;

export const rectTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    const rect = {
      id: state.nextId++,
      type: "rect",
      x: mouse.x,
      y: mouse.y,
      w: 0,
      h: 0,
      color: randomColor(),
    };

    state.elements.push(rect);
    current = rect;
  },

  onMouseUp() {
    current = null;
    if (current) {
      saveState();
    }
  },

  onMouseMove(e) {
    if (!current) return;

    const mouse = screenToWorld(e.clientX, e.clientY);

    current.w = mouse.x - current.x;
    current.h = mouse.y - current.y;
  },
};