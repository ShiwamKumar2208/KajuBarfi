import { state } from "../state.js";
import { tools } from "../tools/index.js";

export function setupCamera(canvas) {
  let isPanning = false;
  let lastMouse = { x: 0, y: 0 };
  let spacePressed = false;

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      spacePressed = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") spacePressed = false;
  });

  canvas.addEventListener("mousedown", (e) => {
    if (spacePressed || e.button === 1) {
      isPanning = true;
      lastMouse = { x: e.clientX, y: e.clientY };
      return;
    }

    tools[state.currentTool]?.onMouseDown?.(e);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isPanning) {
      const dx = (e.clientX - lastMouse.x) / state.camera.zoom;
      const dy = (e.clientY - lastMouse.y) / state.camera.zoom;

      state.camera.x -= dx;
      state.camera.y -= dy;

      lastMouse = { x: e.clientX, y: e.clientY };
      return;
    }

    tools[state.currentTool]?.onMouseMove?.(e);
  });

  canvas.addEventListener("mouseup", (e) => {
    isPanning = false;
    tools[state.currentTool]?.onMouseUp?.(e);
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoomFactor = 1.1;

    const worldX = e.clientX / state.camera.zoom + state.camera.x;
    const worldY = e.clientY / state.camera.zoom + state.camera.y;

    if (e.deltaY < 0) state.camera.zoom *= zoomFactor;
    else state.camera.zoom /= zoomFactor;

    state.camera.zoom = Math.min(Math.max(state.camera.zoom, 0.1), 5);

    state.camera.x = worldX - e.clientX / state.camera.zoom;
    state.camera.y = worldY - e.clientY / state.camera.zoom;
  });
}