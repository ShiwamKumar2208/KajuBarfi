import { state } from "../state.js";
import { updateToolbar } from "../utils/ui.js";
import { undo, redo } from "../utils/history.js";
import { toggleSketchColor, getSettings } from "../utils/settings.js";

const sketchColorBtn = document.getElementById("sketchColorToggle");

function updateSketchColorUI() {
  const { sketchColorEnabled } = getSettings();
  sketchColorBtn?.classList.toggle("active", sketchColorEnabled);
}

sketchColorBtn?.addEventListener("click", () => {
  toggleSketchColor();
  updateSketchColorUI();
});

updateSketchColorUI();

const colorBtn = document.getElementById("colorBtn");
const colorPicker = document.getElementById("colorPicker");
const colorPreview = document.getElementById("colorPreview");

// 🔥 default color
state.currentColor = state.currentColor || "#f5d6a3";
colorPreview.style.background = state.currentColor;

// 🔥 open picker
colorBtn?.addEventListener("click", () => {
  colorPicker.value = state.currentColor;
  colorPicker.click();
});

// 🔥 when color picked
colorPicker?.addEventListener("input", () => {
  state.currentColor = colorPicker.value;
  colorPreview.style.background = state.currentColor;

  // 🔥 apply ONLY if rect selected
  if (state.selectedElement?.type === "rect") {
    state.selectedElement.color = state.currentColor;
  }
});

export function setupToolbar() {
  // 🔥 TOOL BUTTONS
  document.querySelectorAll("#toolbar button[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentTool = btn.dataset.tool;
      updateToolbar(state);
    });
  });

  document.querySelectorAll(".color").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentColor = btn.dataset.color;

      // 🔥 update active UI
      document
        .querySelectorAll(".color")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
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
