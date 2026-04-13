export function setupTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  document.querySelectorAll("#toolbar button, .quick-actions button").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      const text = btn.getAttribute("ttip");
      if (!text) return;

      tooltip.textContent = text;
      tooltip.style.opacity = 1;
    });

    btn.addEventListener("mousemove", (e) => {
      tooltip.style.left = e.clientX + 10 + "px";
      tooltip.style.top = e.clientY + 10 + "px";
    });

    btn.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });
  });
}