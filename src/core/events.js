import { state } from "../state.js";

export function setupGlobalEvents() {
  window.addEventListener("mousemove", (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;

    if (!state.trailEnabled) return;

    state.trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (state.trail.length > 80) state.trail.shift();
  });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) return;

    if (e.key.toLowerCase() === "z" || e.key === "Alt") {
      state.magnifierEnabled = true;
      document.body.classList.add("hide-cursor");
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key.toLowerCase() === "z" || e.key === "Alt") {
      state.magnifierEnabled = false;
      document.body.classList.remove("hide-cursor");
    }
  });

  window.addEventListener("blur", () => {
    state.magnifierEnabled = false;
    document.body.classList.remove("hide-cursor");
  });
}