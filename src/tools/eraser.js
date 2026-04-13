import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";
import { saveState } from "../utils/history.js";

let isDragging = false;

// 🔥 distance helper
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// 🔥 split stroke by circular erase
function eraseStroke(points, mouse, radius) {
  const segments = [];
  let current = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (dist(p, mouse) < radius) {
      if (current.length > 1) segments.push(current);
      current = [];
    } else {
      current.push(p);
    }
  }

  if (current.length > 1) segments.push(current);

  return segments;
}

// 🔥 core erase logic
function eraseAt(mouse) {
  const radius = state.eraserRadius / state.camera.zoom;
  const newElements = [];

  state.elements.forEach((el) => {
    if (el.type === "sketch") {
      const parts = eraseStroke(el.points, mouse, radius);

      parts.forEach((pts) => {
        newElements.push({
          ...el,
          id: state.nextId++,
          points: pts,
        });
      });
    } else {
      const hit =
        mouse.x >= el.x &&
        mouse.x <= el.x + el.w &&
        mouse.y >= el.y &&
        mouse.y <= el.y + el.h;

      if (!hit) newElements.push(el);
    }
  });

  state.elements = newElements;
}

export const eraserTool = {
  onMouseDown(e) {
    const mouse = screenToWorld(e.clientX, e.clientY);
 
    if (state.selectedElements.length > 0) {
      const clickedSelected = state.selectedElements.some((el) => {
        return (
          mouse.x >= el.x &&
          mouse.x <= el.x + el.w &&
          mouse.y >= el.y &&
          mouse.y <= el.y + el.h
        );
      });

      // 🔥 only delete if you actually clicked ON selection
      if (clickedSelected) {
        state.elements = state.elements.filter(
          (el) => !state.selectedElements.includes(el),
        );

        state.selectedElements = [];
        saveState();
      }

      return; // 🔥 stop here either way
    }

    isDragging = true;
    state.isErasing = true; 

    eraseAt(mouse);
  },

  onMouseMove(e) {
    if (!isDragging) return;

    const mouse = screenToWorld(e.clientX, e.clientY);
    eraseAt(mouse);
  },

  onMouseUp() {
    if (!isDragging) return;

    isDragging = false;
    state.isErasing = false; 

    saveState(); // 🔥 single history entry
  },
};
