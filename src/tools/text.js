import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";

const startEditing = window.startEditing;

export const textTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    const text = {
      id: state.nextId++,
      type: "text",
      x: mouse.x,
      y: mouse.y,
      text: "",
      style: {
        fontSize: 24,
        fontFamily: "Arial",
        color: "#fff",
      },
    };

    state.elements.push(text);
    state.selectedElement = text;

    // 🔥 START EDITING
    if (startEditing) startEditing(text);
  },
};