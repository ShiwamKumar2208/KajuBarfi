import { state } from "./src/state.js";
import { draw } from "./src/renderer/draw.js";
import { tools } from "./src/tools/index.js";
import { setupKeyboard } from "./src/input/keyboard.js";
import { exportPNG } from "./src/utils/export.js";
import { saveFile } from "./src/utils/file.js";
import { updateToolbar } from "./src/utils/ui.js";
import { saveState, undo, redo } from "./src/utils/history.js";
import {
  getSettings,
  toggleTheme,
  toggleGrid,
  applyTheme,
} from "./src/utils/settings.js";
import { ensureImage } from "./src/utils/image.js";

window.addEventListener("mousemove", (e) => {
  if (!state.trailEnabled) return;

  state.trail.push({
    x: e.clientX,
    y: e.clientY,
    life: 1,
  });

  if (state.trail.length > 80) state.trail.shift();
});

// ================= QUICK ACTIONS =================

const qa = document.getElementById("quickActions");
const qaDelete = document.getElementById("qaDelete");
const qaDuplicate = document.getElementById("qaDuplicate");
const qaLock = document.getElementById("qaLock");

function updateQuickActions() {
  const el = state.selectedElement;

  if (!el) {
    qa.classList.remove("active");
    return;
  }

  qa.classList.add("active");

  const zoom = state.camera.zoom;

  const x = (el.x - state.camera.x) * zoom;
  const y = (el.y - state.camera.y) * zoom;

  qa.style.left = x + (el.w || 0) * zoom / 2 + "px";
  qa.style.top = y - 40 + "px";
  qa.style.transform = "translateX(-50%)";

  qaLock.textContent = el.locked ? "🔓" : "🔒";
}

window.updateQuickActions = updateQuickActions;

// ================= QUICK ACTION BUTTONS =================

qaDelete.onclick = () => {
  if (!state.selectedElement) return;

  state.elements = state.elements.filter(
    (el) => el !== state.selectedElement
  );

  state.selectedElement = null;

  saveState();
  updateQuickActions();
};

qaDuplicate.onclick = () => {
  const el = state.selectedElement;
  if (!el) return;

  const copy = JSON.parse(JSON.stringify(el));

  copy.id = state.nextId++;
  copy.x += 20;
  copy.y += 20;

  if (copy.type === "image") {
    copy.img = null;
    ensureImage(copy);
  }

  state.elements.push(copy);
  state.selectedElement = copy;

  saveState();
  updateQuickActions();
};

qaLock.onclick = () => {
  const el = state.selectedElement;
  if (!el) return;

  el.locked = !el.locked;

  saveState();
  updateQuickActions();
};

// ================= SETTINGS =================

const themeBtn = document.getElementById("themeToggle");
const gridBtn = document.getElementById("gridToggle");

function updateSettingsUI() {
  const { theme, grid } = getSettings();

  if (themeBtn) {
    themeBtn.textContent = theme === "dark" ? "🌙" : "🌞";
  }

  if (gridBtn) {
    gridBtn.textContent = grid === "square" ? "🟧" : "🔶";
  }

  applyTheme();
}

themeBtn?.addEventListener("click", () => {
  toggleTheme();
  updateSettingsUI();
});

gridBtn?.addEventListener("click", () => {
  toggleGrid();
  updateSettingsUI();
});

// ================= HELP =================

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

// ================= TOOLTIP =================

const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

document.querySelectorAll("#toolbar button").forEach((btn) => {
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

// ================= CANVAS =================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("mousedown", () => canvas.focus());

// ================= TOOLBAR =================

document.querySelectorAll("#toolbar button[data-tool]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.currentTool = btn.dataset.tool;
    updateToolbar(state);
  });
});

updateToolbar(state);

// ================= ACTION BUTTONS =================

document.querySelector('[data-action="undo"]')?.addEventListener("click", undo);
document.querySelector('[data-action="redo"]')?.addEventListener("click", redo);

document.querySelector('[data-action="save"]')?.addEventListener("click", () => {
  const name = prompt("File name:", "board.kj");
  if (!name) return;
  saveFile(name);
});

document.querySelector('[data-action="export"]')?.addEventListener("click", () => {
  const name = prompt("File name:", "kaju.png");
  if (!name) return;
  exportPNG(canvas, name);
});

document.querySelector('[data-action="load"]')?.addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

// ================= IMAGE URL =================

document.querySelector('[data-action="image-url"]')?.addEventListener("click", () => {
  const url = prompt("Enter image URL:");
  if (!url) return;

  const img = new Image();
  img.src = url;

  img.onload = () => {
    const el = {
      id: state.nextId++,
      type: "image",
      x: state.camera.x,
      y: state.camera.y,
      w: img.width / 2,
      h: img.height / 2,
      src: url,
      locked: false,
    };

    state.elements.push(el);
    state.selectedElement = el;

    updateQuickActions();
    saveState();
  };
});

// ================= DRAG & DROP =================

canvas.addEventListener("dragover", (e) => e.preventDefault());

canvas.addEventListener("drop", (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();

    img.onload = () => {
      const el = {
        id: state.nextId++,
        type: "image",
        x: state.camera.x,
        y: state.camera.y,
        w: img.width / 2,
        h: img.height / 2,
        src: event.target.result,
        locked: false,
      };

      state.elements.push(el);
      state.selectedElement = el;

      updateQuickActions();
      saveState();
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// ================= FILE LOAD (FIXED) =================

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);

      state.elements.length = 0;

      data.elements.forEach((el) => {
        if (el.locked === undefined) el.locked = false;

        if (el.type === "image") {
          el.img = null;
          ensureImage(el);
        }

        state.elements.push(el);
      });

      Object.assign(state.camera, data.camera || {});

      state.selectedElement = null;

      updateQuickActions();
      saveState();

    } catch {
      alert("Invalid file!");
    }
  };

  reader.readAsText(file);
});

const trailBtn = document.getElementById("trailToggle");

trailBtn?.addEventListener("click", () => {
  state.trailEnabled = !state.trailEnabled;
  trailBtn.classList.toggle("active", state.trailEnabled);
});

// ================= PANNING =================

let isPanning = false;
let lastMouse = { x: 0, y: 0 };
let spacePressed = false;

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    spacePressed = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") spacePressed = false;
});

// ================= MOUSE =================

canvas.addEventListener("mousedown", (e) => {
  if (spacePressed || e.button === 1) {
    isPanning = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    return;
  }

  tools[state.currentTool]?.onMouseDown?.(e);
});

canvas.addEventListener("mousemove", (e) => {
  if (isPanning) {
    const dx = (e.clientX - lastMouse.x) / state.camera.zoom;
    const dy = (e.clientY - lastMouse.y) / state.camera.zoom;

    state.camera.x -= dx;
    state.camera.y -= dy;

    lastMouse = { x: e.clientX, y: e.clientY };
    return;
  }

  tools[state.currentTool]?.onMouseMove?.(e);
});

window.addEventListener("mouseup", () => {
  isPanning = false;
  tools[state.currentTool]?.onMouseUp?.();
});

// ================= ZOOM =================

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomFactor = 1.1;

  const worldX = e.clientX / state.camera.zoom + state.camera.x;
  const worldY = e.clientY / state.camera.zoom + state.camera.y;

  if (e.deltaY < 0) state.camera.zoom *= zoomFactor;
  else state.camera.zoom /= zoomFactor;

  state.camera.zoom = Math.min(Math.max(state.camera.zoom, 0.1), 5);

  state.camera.x = worldX - e.clientX / state.camera.zoom;
  state.camera.y = worldY - e.clientY / state.camera.zoom;
});

// ================= RESIZE =================

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ================= INIT =================

applyTheme();
updateSettingsUI();

setupKeyboard();
saveState();

draw(ctx, canvas);