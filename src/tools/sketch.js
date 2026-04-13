import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";
import { eraserTool } from "./eraser.js";

let currentStroke = null;

export const sketchTool = {
  onMouseDown(e) {
    // 🔥 CTRL → erase mode
    if (e.ctrlKey) {
      document.body.classList.add("hide-cursor");
      eraserTool.onMouseDown(e);
      return;
    }

    const mouse = screenToWorld(e.clientX, e.clientY);

    currentStroke = {
      id: state.nextId++,
      type: "sketch",
      points: [mouse],
      color: null,
      width: 2,
    };

    state.elements.push(currentStroke);
  },

  onMouseMove(e) {
    // 🔥 CTRL → erase mode
    if (e.ctrlKey) {
      eraserTool.onMouseMove(e);
      return;
    }

    if (!currentStroke) return;

    const mouse = screenToWorld(e.clientX, e.clientY);
    currentStroke.points.push(mouse);
  },

  onMouseUp(e) {
    // 🔥 CTRL → erase mode
    if (e.ctrlKey) {
      document.body.classList.remove("hide-cursor");
      eraserTool.onMouseUp(e);
      return;
    }

    if (currentStroke && currentStroke.points.length > 1) {
      saveState();
    }

    currentStroke = null;
  },
};