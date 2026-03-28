import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

export const eraserTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    state.elements = state.elements.filter((el) => {
      return !(
        mouse.x >= el.x &&
        mouse.x <= el.x + el.w &&
        mouse.y >= el.y &&
        mouse.y <= el.y + el.h
      );
    });
    saveState();
  },
};