import { state } from "../state.js";
import { undo, redo, saveState } from "../utils/history.js";
import { updateToolbar } from "../utils/ui.js";

export function setupKeyboard() {
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    // ================= ESC =================
    if (key === "escape") {
      state.currentTool = "select";
      updateToolbar(state);
      return;
    }

    // ================= CTRL SHORTCUTS =================
    if (e.ctrlKey) {
      // 🔥 PREVENT DEFAULT FOR MOST
      if (
        ["z", "y", "s", "o", "e", "i"].includes(key) ||
        key.startsWith("arrow")
      ) {
        e.preventDefault();
      }

      // 🔥 UNDO / REDO
      if (key === "z") return undo();
      if (key === "y") return redo();

      // 🔥 SAVE
      if (key === "s") {
        document.querySelector('[data-action="save"]')?.click();
        return;
      }

      // 🔥 LOAD (OPEN)
      if (key === "o") {
        document.querySelector('[data-action="load"]')?.click();
        return;
      }

      // 🔥 EXPORT
      if (key === "e") {
        document.querySelector('[data-action="export"]')?.click();
        return;
      }

      // 🔥 IMAGE URL
      if (key === "i") {
        document.querySelector('[data-action="image-url"]')?.click();
        return;
      }

      // 🔥 Z-INDEX
      if (key === "]" && state.selectedElement) {
        state.elements = state.elements.filter(
          (el) => el !== state.selectedElement
        );
        state.elements.push(state.selectedElement);
        saveState();
        return;
      }

      if (key === "[" && state.selectedElement) {
        state.elements = state.elements.filter(
          (el) => el !== state.selectedElement
        );
        state.elements.unshift(state.selectedElement);
        saveState();
        return;
      }

      // 🔥 MOVE ELEMENT (Ctrl + Arrow)
      if (state.selectedElement) {
        const step = e.shiftKey ? 20 : 5;
        let moved = false;

        if (key === "arrowup") {
          state.selectedElement.y -= step;
          moved = true;
        }

        if (key === "arrowdown") {
          state.selectedElement.y += step;
          moved = true;
        }

        if (key === "arrowleft") {
          state.selectedElement.x -= step;
          moved = true;
        }

        if (key === "arrowright") {
          state.selectedElement.x += step;
          moved = true;
        }

        if (moved) {
          saveState();
          return;
        }
      }
    }

    // ================= TOOL SWITCH (NO CTRL) =================
    if (!e.ctrlKey) {
      if (key === "v") state.currentTool = "select";
      if (key === "r") state.currentTool = "rect";
      if (key === "s") state.currentTool = "sketch"; // safe now
      if (key === "t") state.currentTool = "text";
      if (key === "e") state.currentTool = "eraser";

      updateToolbar(state);
    }

    // ================= DELETE =================
    if (key === "delete" || key === "backspace") {
      if (state.selectedElement) {
        state.elements = state.elements.filter(
          (el) => el !== state.selectedElement
        );
        state.selectedElement = null;
        saveState();
      }
    }
  });
}