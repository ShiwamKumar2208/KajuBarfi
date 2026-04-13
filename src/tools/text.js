import { state } from "../state.js";
import { screenToWorld } from "../utils/camera.js";

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

    // 🔥 edit existing
    for (let i = state.elements.length - 1; i >= 0; i--) {
      const el = state.elements[i];

      if (el.type === "text" && isInside(el, mouse)) {
        window.openTextModal({
          mode: "edit",
          element: el
        });
        return;
      }
    }

    // 🔥 create new
    window.openTextModal({
      mode: "create",
      position: mouse
    });
  },
};