import { state } from "../state.js";

export function screenToWorld(x, y) {
  return {
    x: x / state.camera.zoom + state.camera.x,
    y: y / state.camera.zoom + state.camera.y,
  };
}