import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

function isInside(el, mouse) {
  const x1 = Math.min(el.x, el.x + el.w);
  const x2 = Math.max(el.x, el.x + el.w);
  const y1 = Math.min(el.y, el.y + el.h);
  const y2 = Math.max(el.y, el.y + el.h);

  return (
    mouse.x >= x1 &&
    mouse.x <= x2 &&
    mouse.y >= y1 &&
    mouse.y <= y2
  );
}

export const textTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);

    // 🔥 Check if clicking existing text → edit
    for (let i = state.elements.length - 1; i >= 0; i--) {
      const el = state.elements[i];

      if (el.type === "text" && isInside(el, mouse)) {
        const newText = prompt("Edit text:", el.text);
        if (newText !== null) {
          el.text = newText;
          saveState();
        }
        return;
      }
    }

    // 🔥 Create new text
    const value = prompt("Enter text:");
    if (!value) return;

    const textEl = {
      id: state.nextId++,
      type: "text",
      x: mouse.x,
      y: mouse.y,
      w: 200,
      h: 30,
      text: value,
      locked: false,
      style: {
        fontSize: 24,
        fontFamily: "Arial",
        color: null,
      },
    };

    state.elements.push(textEl);
    state.selectedElement = textEl;

    saveState();
  },
};