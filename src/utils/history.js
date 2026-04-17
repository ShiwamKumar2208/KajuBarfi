import { state } from "../state.js";
import { reviveElements } from "./image.js";

// 🔥 CLEAN CLONE (remove img before saving)
function clone(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (key === "img") return undefined;
      return value;
    }),
  );
}

function isSame(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function saveState() {
  const snapshot = {
    elements: clone(state.elements),
    camera: clone(state.camera),
  };

  const last = state.history[state.history.length - 1];

  if (last && isSame(last, snapshot)) return;

  state.history.splice(state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex++;
}

// 🔥 APPLY REVIVE ANIMATION
function applyReviveAnimation(elements) {
  elements.forEach((el) => {
    el.reviving = true;
    el.deleting = false; // just in case

    el.opacity = 0;

    // 🔥 slight initial shrink so it grows nicely
    const scale = 0.92;
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;

    el.w *= scale;
    el.h *= scale;

    el.x = cx - el.w / 2;
    el.y = cy - el.h / 2;
  });
}

export function undo() {
  if (state.historyIndex <= 0) return;

  state.historyIndex--;

  const snapshot = state.history[state.historyIndex];

  state.elements.length = 0;
  state.elements.push(...clone(snapshot.elements));

  Object.assign(state.camera, clone(snapshot.camera));

  reviveElements(state.elements);

  // 🔥 THIS IS THE KEY
  applyReviveAnimation(state.elements);
}

export function redo() {
  if (state.historyIndex >= state.history.length - 1) return;

  state.historyIndex++;

  const snapshot = state.history[state.historyIndex];

  state.elements.length = 0;
  state.elements.push(...clone(snapshot.elements));

  Object.assign(state.camera, clone(snapshot.camera));

  reviveElements(state.elements);

  // 🔥 SAME HERE
  applyReviveAnimation(state.elements);
}