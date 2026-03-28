export function updateToolbar(state) {
  document.querySelectorAll("#toolbar button[data-tool]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === state.currentTool);
  });
}