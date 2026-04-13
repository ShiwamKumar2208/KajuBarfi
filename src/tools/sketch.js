import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";
import { eraserTool } from "./eraser.js";
import { getSettings } from "../utils/settings.js";

let currentStroke = null;

const { sketchColorEnabled } = getSettings();

export const sketchTool = {
  onMouseDown(e) {
    // 🔥 CTRL → erase mode
    if (e.ctrlKey) { 
      eraserTool.onMouseDown(e);
      return;
    }

    const mouse = screenToWorld(e.clientX, e.clientY);

    currentStroke = {
      id: state.nextId++,
      type: "sketch",
      points: [mouse],
      color: sketchColorEnabled ? state.currentColor : null,
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
      eraserTool.onMouseUp(e);
      return;
    }

    if (currentStroke && currentStroke.points.length > 1) {
      saveState();
    }

    currentStroke = null;
  },
};