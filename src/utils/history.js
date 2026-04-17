import { state } from "../state.js";
import { reviveElements } from "./image.js";

// 🔥 CLEAN CLONE (remove img before saving)
function clone(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (key === "img") return undefined; // ❌ remove image object
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

  if (last && isSame(last, snapshot)) return; // 🚫 skip duplicate

  state.history.splice(state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex++;
}

export function undo() {
  if (state.historyIndex <= 0) return;

  state.historyIndex--;

  const snapshot = state.history[state.historyIndex];

  state.elements.length = 0;
  state.elements.push(...clone(snapshot.elements));

  Object.assign(state.camera, clone(snapshot.camera));

  reviveElements(state.elements); // 🔥 restore images
}

export function redo() {
  if (state.historyIndex >= state.history.length - 1) return;

  state.historyIndex++;

  const snapshot = state.history[state.historyIndex];

  state.elements.length = 0;
  state.elements.push(...clone(snapshot.elements));

  Object.assign(state.camera, clone(snapshot.camera));

  reviveElements(state.elements); // 🔥 restore images
}
