export function setupHelp() {
  const helpModal = document.getElementById("helpModal");

  document.getElementById("helpBtn")?.addEventListener("click", () => {
    helpModal.classList.remove("hidden");
  });

  document.getElementById("closeHelp")?.addEventListener("click", () => {
    helpModal.classList.add("hidden");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      helpModal.classList.add("hidden");
    }
  });
}