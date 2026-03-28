import { state } from "../state.js";
import { undo, redo, saveState } from "../utils/history.js";
import { updateToolbar } from "../utils/ui.js";

export function setupKeyboard() {
  window.addEventListener("keydown", (e) => {
    // 🔥 ESC → RESET TO SELECT
    if (e.key === "Escape") {
      state.currentTool = "select";
      updateToolbar(state);
      return;
    }

    // 🔥 TOOL SWITCH
    if (!e.ctrlKey) {
      if (e.key === "v") state.currentTool = "select";
      if (e.key === "r") state.currentTool = "rect";
      if (e.key === "s") state.currentTool = "sketch";
      if (e.key === "t") state.currentTool = "text";
      if (e.key === "e") state.currentTool = "eraser";

      updateToolbar(state);
    }

    // 🔥 DELETE
    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedElement) {
        state.elements = state.elements.filter(
          (el) => el !== state.selectedElement
        );
        state.selectedElement = null;
        saveState();
      }
    }

    // 🔥 UNDO
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    }

    // 🔥 REDO
    if (e.ctrlKey && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    }

    // 🔥 ZOOM
    if (e.ctrlKey && e.key === "=") {
      state.camera.zoom *= 1.1;
    }

    if (e.ctrlKey && e.key === "-") {
      state.camera.zoom /= 1.1;
    }
  });
}