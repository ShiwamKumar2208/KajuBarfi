import { state } from "../state.js";
import { updateToolbar } from "../utils/ui.js";

export function setupToolbar() {
  document.querySelectorAll("#toolbar button[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentTool = btn.dataset.tool;
      updateToolbar(state);
    });
  });

  updateToolbar(state);
}