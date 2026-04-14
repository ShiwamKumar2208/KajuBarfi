import { state } from "../state.js";
import { updateToolbar } from "../utils/ui.js";
import { undo, redo } from "../utils/history.js";

export function setupToolbar() {
  // 🔥 TOOL BUTTONS
  document.querySelectorAll("#toolbar button[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentTool = btn.dataset.tool;
      updateToolbar(state);
    });
  });

  // 🔥 ONLY handle missing actions (undo/redo)
  const undoBtn = document.querySelector('[data-action="undo"]');
  const redoBtn = document.querySelector('[data-action="redo"]');

  undoBtn?.addEventListener("click", () => {
    undo();
    window.updateQuickActions?.(); // keep UI in sync
  });

  redoBtn?.addEventListener("click", () => {
    redo();
    window.updateQuickActions?.();
  });

  updateToolbar(state);
}