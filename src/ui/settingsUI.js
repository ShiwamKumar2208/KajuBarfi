import {
  getSettings,
  toggleTheme,
  toggleGrid,
  toggleTrail,
  applyTheme,
} from "../utils/settings.js";
import { state } from "../state.js";

export function setupSettingsUI() {
  const themeBtn = document.getElementById("themeToggle");
  const gridBtn = document.getElementById("gridToggle");
  const trailBtn = document.getElementById("trailToggle");

  function update() {
    const { theme, grid, trail } = getSettings();

    themeBtn.textContent = theme === "dark" ? "🌙" : "🌞";
    gridBtn.textContent = grid === "square" ? "🟧" : "🔶";
    trailBtn.classList.toggle("active", trail);

    applyTheme();
  }

  themeBtn.onclick = () => {
    toggleTheme();
    update();
  };

  gridBtn.onclick = () => {
    toggleGrid();
    update();
  };

  trailBtn.onclick = () => {
    toggleTrail();
    state.trailEnabled = getSettings().trail;
    update();
  };

  update();
}