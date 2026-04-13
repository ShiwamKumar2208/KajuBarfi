import { draw } from "./src/renderer/draw.js";
import { setupKeyboard } from "./src/input/keyboard.js";

import { setupCanvas } from "./src/core/canvas.js";
import { setupGlobalEvents } from "./src/core/events.js";
import { setupCamera } from "./src/core/cameraControls.js";

import { setupToolbar } from "./src/ui/toolbar.js";
import { setupHelp } from "./src/ui/help.js";
import { setupSettingsUI } from "./src/ui/settingsUI.js";
import { setupQuickActions } from "./src/ui/quickActions.js";
import { setupTooltip } from "./src/ui/tooltip.js";
import { setupTextModal } from "./src/ui/textModal.js";

import { setupFiles } from "./src/features/files.js";

import { getSettings } from "./src/utils/settings.js";
import { state } from "./src/state.js";
import { saveState } from "./src/utils/history.js";
import { ensureImage } from "./src/utils/image.js";

document.addEventListener("DOMContentLoaded", () => {
  const { canvas, ctx } = setupCanvas();

  // ================= CORE =================
  setupGlobalEvents();
  setupCamera(canvas);

  // ================= UI =================
  setupToolbar();
  setupHelp();
  setupSettingsUI();
  setupQuickActions();
  setupTooltip();
  setupTextModal();

  // ================= SETTINGS =================
  const settings = getSettings();
  state.trailEnabled = settings.trail;

  // ================= FEATURES =================
  setupFiles(canvas);
  setupKeyboard();

  // ================= INIT =================
  state.elements.forEach((el) => {
    if (el.type === "image") ensureImage(el);
  });

  saveState();

  // ================= RENDER =================
  draw(ctx, canvas);
});