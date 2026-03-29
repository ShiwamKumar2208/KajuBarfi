import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let currentStroke = null;

export const sketchTool = {
  onMouseDown(e) {
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
    if (!currentStroke) return;

    const mouse = screenToWorld(e.clientX, e.clientY);
    currentStroke.points.push(mouse);
  },

  onMouseUp() {
    if (currentStroke && currentStroke.points.length > 1) {
      saveState();
    }
    currentStroke = null;
  },
};
