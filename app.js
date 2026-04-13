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
import { setupInputModal } from "./src/ui/inputModal.js";

import { setupFiles } from "./src/features/files.js";

import { getSettings } from "./src/utils/settings.js";
import { state } from "./src/state.js";
import { saveState } from "./src/utils/history.js";
import { ensureImage } from "./src/utils/image.js";

document.addEventListener("DOMContentLoaded", () => {
  // ================= 🔥 SMART DEVICE DETECTION =================
  function isTouchOnlyDevice() {
    return (
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      !window.matchMedia("(pointer: fine)").matches
    );
  }

  const mobileBlock = document.getElementById("mobileBlock");

  if (isTouchOnlyDevice()) {
    mobileBlock.classList.add("active");

    // 🔥 allow escape if user connects keyboard/mouse
    window.addEventListener(
      "mousemove",
      () => mobileBlock.classList.remove("active"),
      { once: true }
    );

    window.addEventListener(
      "keydown",
      () => mobileBlock.classList.remove("active"),
      { once: true }
    );
  }

  // ================= CORE =================
  const { canvas, ctx } = setupCanvas();

  setupGlobalEvents();
  setupCamera(canvas);

  // ================= UI =================
  setupToolbar();
  setupHelp();
  setupSettingsUI();
  setupQuickActions();
  setupTooltip();
  setupTextModal();
  setupInputModal();

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